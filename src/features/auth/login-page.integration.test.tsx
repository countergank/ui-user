import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MemoryRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";
import { expectNoAuthoredInlineStyles } from "@/test/inline-styles";

import { LoginPage } from "./login-page";

const tAuth = i18n.getFixedT(null, "auth");
const tCommon = i18n.getFixedT(null, "common");

const LOGIN_URL = "https://test.invalid/auth/login";
const CHALLENGE_URL = "https://test.invalid/auth/2fa/challenge";

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

function apiFailure(status: number, code: string) {
  return HttpResponse.json({ statusCode: status, code, message: code }, { status });
}

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

function renderPage(entry = "/login") {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function submitCredentials() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(tAuth("login.fields.email")), "user@example.com");
  await user.type(screen.getByLabelText(tAuth("login.fields.password")), "secret");
  await user.click(screen.getByRole("button", { name: tAuth("login.submit") }));
}

describe("login page — MSW", () => {
  it("starts the session on valid credentials", async () => {
    let received: unknown = null;
    server.use(
      http.post(LOGIN_URL, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json(AUTH);
      }),
    );

    renderPage();
    await submitCredentials();

    await waitFor(() => {
      expect(sessionStore.getState().status).toBe("authenticated");
    });
    expect(received).toEqual({ email: "user@example.com", password: "secret" });
    expect(sessionStore.getState().user).toEqual(AUTH.user);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows invalid credentials under the form and focuses the alert", async () => {
    server.use(http.post(LOGIN_URL, () => apiFailure(401, "UA-AUTH-002")));

    renderPage();
    await submitCredentials();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(tAuth("login.errors.invalidCredentials"));
    expect(alert).toHaveFocus();
    expect(screen.getByLabelText(tAuth("login.fields.email"))).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    expect(screen.getByLabelText(tAuth("login.fields.password"))).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  it("shows the locked-account message on 423", async () => {
    server.use(http.post(LOGIN_URL, () => apiFailure(423, "UA-AUTH-003")));

    renderPage();
    await submitCredentials();

    expect(await screen.findByRole("alert")).toHaveTextContent(tAuth("login.errors.locked"));
  });

  it("shows the rate-limit message and disables the submit on 429", async () => {
    server.use(http.post(LOGIN_URL, () => apiFailure(429, "HTTP_ERROR")));

    renderPage();
    await submitCredentials();

    expect(await screen.findByRole("alert")).toHaveTextContent(tAuth("login.errors.rateLimited"));
    expect(screen.getByRole("button", { name: tAuth("login.submit") })).toBeDisabled();
  });

  it("describes the fields with their own errors, with no axe violations", async () => {
    server.use(http.post(LOGIN_URL, () => apiFailure(401, "UA-AUTH-002")));

    const { container } = renderPage();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: tAuth("login.submit") }));

    const email = screen.getByLabelText(tAuth("login.fields.email"));
    const message = await screen.findByText(tAuth("login.errors.emailRequired"));
    expect(email.getAttribute("aria-describedby")).toContain(message.id);
    expect(email).toHaveFocus();

    expectNoAuthoredInlineStyles(container);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in the error state either", async () => {
    server.use(http.post(LOGIN_URL, () => apiFailure(401, "UA-AUTH-002")));

    const { container } = renderPage();
    await submitCredentials();
    await screen.findByRole("alert");

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("login page — two-factor challenge", () => {
  function pendingChallenge() {
    return HttpResponse.json({ twoFactorRequired: true, challengeToken: "tok-1" });
  }

  async function submitChallengeCode(code = "482913") {
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(tAuth("challenge.fields.code")), code);
    await user.click(screen.getByRole("button", { name: tAuth("challenge.submit") }));
  }

  it("completes the session through the challenge step", async () => {
    let received: unknown = null;
    server.use(
      http.post(LOGIN_URL, () => pendingChallenge()),
      http.post(CHALLENGE_URL, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json(AUTH);
      }),
    );

    renderPage();
    await submitCredentials();

    expect(sessionStore.getState().status).toBe("anonymous");
    await submitChallengeCode("482913");

    await waitFor(() => {
      expect(sessionStore.getState().status).toBe("authenticated");
    });
    expect(received).toEqual({ challengeToken: "tok-1", code: "482913" });
    expect(sessionStore.getState().user).toEqual(AUTH.user);
  });

  it("shows the invalid-code message and keeps the input enabled for a retry", async () => {
    server.use(
      http.post(LOGIN_URL, () => pendingChallenge()),
      http.post(CHALLENGE_URL, () => apiFailure(401, "UA-AUTH-013")),
    );

    renderPage();
    await submitCredentials();
    await submitChallengeCode("000000");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(tCommon("error.ua.UA-AUTH-013"));
    expect(screen.getByLabelText(tAuth("challenge.fields.code"))).toBeEnabled();
    expect(screen.getByRole("button", { name: tAuth("challenge.submit") })).toBeEnabled();
    expect(sessionStore.getState().status).toBe("anonymous");
  });

  it("returns to the login screen with the re-authentication notice on UA-AUTH-014", async () => {
    server.use(
      http.post(LOGIN_URL, () => pendingChallenge()),
      http.post(CHALLENGE_URL, () => apiFailure(401, "UA-AUTH-014")),
    );

    renderPage();
    await submitCredentials();
    await submitChallengeCode("000000");

    expect(await screen.findByText(tAuth("challenge.expiredNotice"))).toBeInTheDocument();
    expect(screen.getByLabelText(tAuth("login.fields.email"))).toBeInTheDocument();
    expect(screen.queryByLabelText(tAuth("challenge.fields.code"))).not.toBeInTheDocument();
    expect(sessionStore.getState().status).toBe("anonymous");
  });
});
