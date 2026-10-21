// RequireAuth (COU-274, T1 / S1, S6).
//
// The rule is about what a deep link does before authentication, so the assertion is on the
// destination the guard builds: the full path it was asked for, query and hash included,
// encoded into `?redirect=` so the login screen can return there (the round trip itself is
// pinned by `login-redirect.test.tsx`).
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { RequireAuth } from "./require-auth";

function LocationProbe() {
  const location = useLocation();

  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
}

function renderGuard(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: "/app/*",
        element: (
          <RequireAuth>
            <h1>Console content</h1>
          </RequireAuth>
        ),
      },
      { path: "/login", Component: LocationProbe },
    ],
    { initialEntries: [initialPath] },
  );

  render(<RouterProvider router={router} />);

  return router;
}

function startSession() {
  sessionStore.getState().startSession({
    user: {
      id: "u1",
      email: "ada@example.com",
      userName: "ada",
      name: "Ada",
      lastName: "Lovelace",
    },
    accessToken: "access-1",
    refreshToken: "refresh-1",
  });
}

beforeEach(() => {
  sessionStore.setState(initialSessionState);
});

describe("RequireAuth", () => {
  it("renders the protected content for an authenticated session", () => {
    startSession();
    renderGuard("/app/users");

    expect(screen.getByRole("heading", { name: "Console content" })).toBeInTheDocument();
  });

  it("sends an anonymous visitor to login with the full destination in the query", () => {
    renderGuard("/app/users?page=2");

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/login?redirect=%2Fapp%2Fusers%3Fpage%3D2",
    );
  });

  it("sends an expired session to login too, without rendering the content", () => {
    sessionStore.getState().markExpired();

    renderGuard("/app");

    expect(screen.getByTestId("location")).toHaveTextContent("/login?redirect=%2Fapp");
    expect(screen.queryByRole("heading", { name: "Console content" })).toBeNull();
  });
});
