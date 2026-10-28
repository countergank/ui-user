import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { userQueryKey } from "@/features/users/hooks/use-user";
import { i18n } from "@/lib/i18n";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { router } from "./index";

const tConsole = i18n.getFixedT(null, "console");
const tUsers = i18n.getFixedT(null, "users");

const USER = {
  id: "u1",
  name: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  userName: "ada",
  role: "user",
  createdAt: "2024-06-01T10:00:00.000Z",
  updatedAt: "2024-06-01T10:00:00.000Z",
  isActive: true,
  lockedUntil: null,
  failedLoginAttempts: 0,
};

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

function renderApp(initialPath: string, permissions: string[] | null = null, user: unknown = null) {
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

  if (user !== null) {
    client.setQueryData(userQueryKey("u1"), user);
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
    const memoryRouter = renderApp("/app/roles", ["role:read"]);

    expect(
      await screen.findByRole("heading", { level: 1, name: tConsole("placeholder.title") }),
    ).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe("/app/roles");
    expect(screen.getByRole("navigation", { name: tConsole("nav.label") })).toBeInTheDocument();
  });

  it("keeps the current route when the session expires in flight (COU-323)", async () => {
    startSession();
    const memoryRouter = renderApp("/app/roles", ["role:read"]);

    expect(
      await screen.findByRole("heading", { level: 1, name: tConsole("placeholder.title") }),
    ).toBeInTheDocument();

    act(() => {
      sessionStore.getState().markExpired();
    });

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe("/login");
    });
    expect(memoryRouter.state.location.search).toBe("?redirect=%2Fapp%2Froles");
  });

  it("with a session but without the permission, the section is /forbidden, not a 404", async () => {
    startSession();
    const memoryRouter = renderApp("/app/users", ["role:read"]);

    expect(
      await screen.findByRole("heading", { level: 1, name: tConsole("forbidden.title") }),
    ).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe("/forbidden");
  });

  it("with only user:read, the edit route is /forbidden and the form never renders (COU-292)", async () => {
    startSession();
    const memoryRouter = renderApp("/app/users/u1/edit", ["user:read"], USER);

    expect(
      await screen.findByRole("heading", { level: 1, name: tConsole("forbidden.title") }),
    ).toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe("/forbidden");
    expect(screen.queryByLabelText(tUsers("edit.fields.name"))).not.toBeInTheDocument();
  });

  it("with user:read and user:update, the edit form renders (COU-292)", async () => {
    startSession();
    const memoryRouter = renderApp("/app/users/u1/edit", ["user:read", "user:update"], USER);

    expect(await screen.findByLabelText(tUsers("edit.fields.name"))).toHaveValue("Ada");
    expect(memoryRouter.state.location.pathname).toBe("/app/users/u1/edit");
  });

  it("with the wildcard permission, the edit form renders (COU-292)", async () => {
    startSession();
    const memoryRouter = renderApp("/app/users/u1/edit", ["*"], USER);

    expect(await screen.findByLabelText(tUsers("edit.fields.name"))).toHaveValue("Ada");
    expect(memoryRouter.state.location.pathname).toBe("/app/users/u1/edit");
  });
});
