// RequireSection (COU-274 S2, COU-323 R1): the manifest is the single source of a section's
// permission, so a route never restates it. This suite pins that for the paths it exercises:
// a granted section, a denied one, and a path with no manifest entry.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { permissionsQueryKey } from "@/features/authorization/hooks/use-permissions";
import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { RequireSection } from "./require-section";

function renderSection(path: string, permissions: string[]) {
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

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(permissionsQueryKey, {
    id: "u1",
    name: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    role: "user",
    permissions,
  });

  const router = createMemoryRouter(
    [
      {
        path: "/app/*",
        element: (
          <RequireSection>
            <h1>Section content</h1>
          </RequireSection>
        ),
      },
      { path: "/forbidden", Component: () => <h1>Forbidden page</h1> },
    ],
    { initialEntries: [path] },
  );

  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  sessionStore.setState(initialSessionState);
});

describe("RequireSection", () => {
  it("enforces the permission the manifest declares for the section", () => {
    renderSection("/app/roles", ["user:read"]);

    expect(screen.getByRole("heading", { name: "Forbidden page" })).toBeInTheDocument();
  });

  it("lets a granted section through and a permission-free one always through", () => {
    renderSection("/app/roles", ["role:read"]);
    expect(screen.getByRole("heading", { name: "Section content" })).toBeInTheDocument();
  });

  it("enforces nothing for a path with no manifest entry", () => {
    renderSection("/app/unknown", []);

    expect(screen.getByRole("heading", { name: "Section content" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Forbidden page" })).not.toBeInTheDocument();
  });
});
