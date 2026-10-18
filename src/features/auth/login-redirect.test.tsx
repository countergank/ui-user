// Redirect after a successful login (COU-281, T5 / S1, S5).
//
// The form is rendered inside real routes so the assertion is about navigation, not about
// a mocked hook: after the session starts, the app must land on the requested destination
// or on the default view when the request was missing or hostile.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { LoginForm } from "./login-form";

const tAuth = i18n.getFixedT(null, "auth");

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

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

/** Renders wherever the router landed, so a navigation is observable. */
function LocationProbe() {
  const location = useLocation();

  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

function renderLogin(entry: string) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function submitValidCredentials() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(tAuth("login.fields.email")), "user@example.com");
  await user.type(screen.getByLabelText(tAuth("login.fields.password")), "secret");
  await user.click(screen.getByRole("button", { name: tAuth("login.submit") }));
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

describe("login redirect", () => {
  it("returns to the requested internal destination", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, AUTH));
    renderLogin(`/login?redirect=${encodeURIComponent("/users?page=2")}`);

    await submitValidCredentials();

    expect(await screen.findByTestId("location")).toHaveTextContent("/users?page=2");
  });

  it("lands on the default view when no destination was requested", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, AUTH));
    renderLogin("/login");

    await submitValidCredentials();

    expect(await screen.findByTestId("location")).toHaveTextContent("/");
  });

  it("never follows a hostile destination", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, AUTH));
    renderLogin(`/login?redirect=${encodeURIComponent("https://evil.example/steal")}`);

    await submitValidCredentials();

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/$/);
    });
  });

  it("stays on the login page after a failed attempt", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(401, { statusCode: 401, code: "UA-AUTH-002", message: "nope" }),
    );
    renderLogin("/login?redirect=%2Fusers");

    await submitValidCredentials();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      tAuth("login.errors.invalidCredentials"),
    );
    expect(screen.getByRole("button", { name: tAuth("login.submit") })).toBeInTheDocument();
  });
});
