// Route guards through the real router (COU-274, T6, T7 / S4, S5, S8).
//
// The four combinations the ticket asks for, asserted on the production route tree: same
// router, same console shell, same guards. A guard that only works in a synthetic harness
// would pass a component test and still let a deep link through here.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { router } from "./index";

const tConsole = i18n.getFixedT(null, "console");

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

function renderApp(initialPath: string, permissions: string[] | null = null) {
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

  const memoryRouter = createMemoryRouter(router.routes, { initialEntries: [initialPath] });

  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={memoryRouter} />
    </QueryClientProvider>,
  );

  return memoryRouter;
}

beforeEach(() => {
  sessionStore.setState(initialSessionState);
});

describe("route guards", () => {
  it("without a session, a protected deep link lands on login and keeps the destination", async () => {
    const memoryRouter = renderApp("/app/users?page=2");

    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe("/login");
    expect(memoryRouter.state.location.search).toBe("?redirect=%2Fapp%2Fusers%3Fpage%3D2");
  });

  it("without a session, the console landing page also requires login", async () => {
    const memoryRouter = renderApp("/app");

    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe("/login");
    expect(memoryRouter.state.location.search).toBe("?redirect=%2Fapp");
  });

  it("with a session and the permission, the section renders inside the console shell", async () => {
    startSession();
    const memoryRouter = renderApp("/app/users", ["user:read"]);

    expect(
      await screen.findByRole("heading", { level: 1, name: tConsole("placeholder.title") }),
    ).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe("/app/users");
    expect(screen.getByRole("navigation", { name: tConsole("nav.label") })).toBeInTheDocument();
  });

  it("with a session but without the permission, the section is /forbidden, not a 404", async () => {
    startSession();
    const memoryRouter = renderApp("/app/users", ["role:read"]);

    expect(
      await screen.findByRole("heading", { level: 1, name: tConsole("forbidden.title") }),
    ).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe("/forbidden");
  });
});
