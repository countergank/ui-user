import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { RequirePermission } from "./require-permission";

function LocationProbe() {
  const location = useLocation();

  return <h1>{`Forbidden page at ${location.pathname}`}</h1>;
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

function renderGuard(options: { permissions?: string[] | null; pending?: boolean | "fail" } = {}) {
  const { permissions = [], pending = false } = options;

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  if (permissions !== null) {
    client.setQueryData(permissionsQueryKey, {
      id: "u1",
      name: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      role: "user",
      permissions,
    });
  }

  if (pending === "fail") {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  } else if (pending) {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => undefined)),
    );
  }

  const router = createMemoryRouter(
    [
      {
        path: "/app/users",
        element: (
          <RequirePermission permission="user:read">
            <h1>Users section</h1>
          </RequirePermission>
        ),
      },
      { path: "/forbidden", Component: LocationProbe },
    ],
    { initialEntries: ["/app/users"] },
  );

  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return router;
}

beforeEach(() => {
  sessionStore.setState(initialSessionState);
  startSession();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RequirePermission", () => {
  it("renders the section when the session holds the permission", () => {
    renderGuard({ permissions: ["user:read"] });

    expect(screen.getByRole("heading", { name: "Users section" })).toBeInTheDocument();
  });

  it("sends a session without the permission to /forbidden instead of a 404", () => {
    renderGuard({ permissions: ["role:read"] });

    expect(
      screen.getByRole("heading", { name: "Forbidden page at /forbidden" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Users section" })).toBeNull();
  });

  it("accepts the wildcard grant", () => {
    renderGuard({ permissions: ["*"] });

    expect(screen.getByRole("heading", { name: "Users section" })).toBeInTheDocument();
  });

  it("reports a failed profile request as an error, not as a denial (COU-323)", async () => {
    renderGuard({ permissions: null, pending: "fail" });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(i18n.t("error.dataFetchTitle"));
    expect(alert).toHaveTextContent(i18n.t("error.retry"));
    expect(screen.queryByRole("heading", { name: "Forbidden page at /forbidden" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Users section" })).toBeNull();
  });

  it("renders neither the content nor a verdict while the profile is loading", () => {
    renderGuard({ permissions: null, pending: true });

    expect(screen.queryByRole("heading", { name: "Users section" })).toBeNull();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });
});
