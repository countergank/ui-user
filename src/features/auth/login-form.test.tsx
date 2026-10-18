// Login form behavior (COU-281, T4 / S6-S10).
//
// These tests cover what the form itself decides: field validation with accessible
// errors, the pending state that prevents a double submit, and the four API failures the
// ticket enumerates rendered UNDER the form rather than inside a field. The MSW-driven
// component suite (S11) arrives in T6; here `fetch` is stubbed directly, which works
// because the session runtime resolves `fetch` per request instead of capturing it.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { LoginForm } from "./login-form";

const tAuth = i18n.getFixedT(null, "auth");
const tCommon = i18n.getFixedT(null, "common");

const AUTH = {
  user: {
    id: "u1",
    email: "user@example.com",
    userName: "user",
    name: "Ada",
    lastName: "Lovelace",
  },
  accessToken: "access-1",
  refreshToken: "refresh-1",
};

const fetchMock = vi.fn();

/** Minimal `Response` double: the client reads `ok`, `status`, `text()` and nothing else. */
function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

function apiFailure(status: number, code: string): Response {
  return jsonResponse(status, { statusCode: status, code, message: code });
}

function renderForm() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function fillAndSubmit(email = "user@example.com", password = "secret") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(tAuth("login.fields.email")), email);
  await user.type(screen.getByLabelText(tAuth("login.fields.password")), password);
  await user.click(screen.getByRole("button", { name: tAuth("login.submit") }));

  return user;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("login form — fields", () => {
  it("associates a label with each input", () => {
    renderForm();

    const email = screen.getByLabelText(tAuth("login.fields.email"));
    const password = screen.getByLabelText(tAuth("login.fields.password"));

    expect(email).toHaveAttribute("type", "email");
    expect(password).toHaveAttribute("type", "password");
  });

  it("describes an empty field with its own error and focuses it", async () => {
    renderForm();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: tAuth("login.submit") }));

    const message = await screen.findByText(tAuth("login.errors.emailRequired"));
    const email = screen.getByLabelText(tAuth("login.fields.email"));

    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email.getAttribute("aria-describedby")).toContain(message.id);
    expect(email).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("login form — pending state", () => {
  it("disables the submit with a spinner while the request is in flight", async () => {
    fetchMock.mockImplementation(() => new Promise(() => undefined));
    renderForm();

    const userEventInstance = userEvent.setup();
    await userEventInstance.type(
      screen.getByLabelText(tAuth("login.fields.email")),
      "user@example.com",
    );
    await userEventInstance.type(screen.getByLabelText(tAuth("login.fields.password")), "secret");

    const button = screen.getByRole("button", { name: tAuth("login.submit") });
    await userEventInstance.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector("svg.animate-spin")).not.toBeNull();
  });
});

describe("login form — API failures", () => {
  it("shows invalid credentials under the form, not in a field", async () => {
    fetchMock.mockResolvedValue(apiFailure(401, "UA-AUTH-002"));
    renderForm();

    await fillAndSubmit();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(tAuth("login.errors.invalidCredentials"));
    expect(alert).toHaveFocus();
    expect(screen.getByLabelText(tAuth("login.fields.email"))).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText(tAuth("login.fields.password"))).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it.each([
    [423, "UA-AUTH-003", "login.errors.locked"],
    [401, "UA-AUTH-004", "login.errors.inactive"],
  ] as const)("maps %i %s to its own message", async (status, code, key) => {
    fetchMock.mockResolvedValue(apiFailure(status, code));
    renderForm();

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(tAuth(key));
  });

  it("shows the rate-limit message and disables the submit on 429", async () => {
    fetchMock.mockResolvedValue(apiFailure(429, "HTTP_ERROR"));
    renderForm();

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(tAuth("login.errors.rateLimited"));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: tAuth("login.submit") })).toBeDisabled();
    });
  });

  it("falls back to the generic message for a failure the ticket does not enumerate", async () => {
    fetchMock.mockResolvedValue(apiFailure(500, "HTTP_ERROR"));
    renderForm();

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(tCommon("error.genericMessage"));
  });
});

describe("login form — success", () => {
  it("stores the session the API returned", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, AUTH));
    renderForm();

    await fillAndSubmit();

    await waitFor(() => {
      expect(sessionStore.getState().status).toBe("authenticated");
    });
    expect(sessionStore.getState().user).toEqual(AUTH.user);
    expect(sessionStore.getState().accessToken).toBe("access-1");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("posts the credentials to /auth/login", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, AUTH));
    renderForm();

    await fillAndSubmit("user@example.com", "secret");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/auth/login");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "user@example.com",
      password: "secret",
    });
  });
});
