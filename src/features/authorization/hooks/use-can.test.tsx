import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { useCan } from "./use-can";
import { permissionsQueryKey } from "./use-permissions";

function Probe({ permission }: { permission: string }) {
  return <p>{useCan(permission) ? "allowed" : "denied"}</p>;
}

function renderCan(permission: string, permissions: string[]) {
  sessionStore.getState().startSession({
    user: {
      id: "u1",
      email: "user@example.com",
      userName: "user",
      name: "Ada",
      lastName: "Lovelace",
    },
    accessToken: "access-1",
    refreshToken: "refresh-1",
  });

  const client = new QueryClient();
  client.setQueryData(permissionsQueryKey, {
    id: "u1",
    name: "Ada",
    lastName: "Lovelace",
    email: "user@example.com",
    role: "user",
    permissions,
  } satisfies Record<string, unknown>);

  return render(
    <QueryClientProvider client={client}>
      <Probe permission={permission} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

describe("useCan", () => {
  it("allows a permission the user holds", () => {
    renderCan("user:read", ["user:read", "user:update"]);

    expect(screen.getByText("allowed")).toBeInTheDocument();
  });

  it("denies a permission the user does not hold", () => {
    renderCan("role:read", ["user:read"]);

    expect(screen.getByText("denied")).toBeInTheDocument();
  });

  it("allows everything to the wildcard", () => {
    renderCan("audit:read", ["*"]);

    expect(screen.getByText("allowed")).toBeInTheDocument();
  });
});
