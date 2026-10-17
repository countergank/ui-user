// Component tests for the expiry bridge (COU-273, T6 / AC2).
import { act, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { SessionExpiryBridge } from "./session-expiry-bridge";

function renderBridge() {
  const router = createMemoryRouter(
    [
      { path: "/", element: <SessionExpiryBridge /> },
      { path: "/login", element: <h1>Login page</h1> },
    ],
    { initialEntries: ["/"] },
  );

  return { router, ...render(<RouterProvider router={router} />) };
}

afterEach(() => {
  sessionStore.setState(initialSessionState);
});

describe("SessionExpiryBridge", () => {
  it("renders nothing of its own", () => {
    const { container } = renderBridge();

    expect(container).toBeEmptyDOMElement();
  });

  it("sends an expired session to the login page", async () => {
    const { router } = renderBridge();

    act(() => {
      sessionStore.getState().markExpired();
    });

    expect(await screen.findByRole("heading", { name: "Login page" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
  });

  it("stays put while the session is anonymous", () => {
    const { router } = renderBridge();

    expect(router.state.location.pathname).toBe("/");
    expect(screen.queryByRole("heading", { name: "Login page" })).not.toBeInTheDocument();
  });
});
