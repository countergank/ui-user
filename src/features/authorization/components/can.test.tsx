// `<Can>` suite (COU-275, T3 / S5).
//
// Write actions are the case this component exists for: the button is either rendered or
// it is not, and the fallback is the caller's business, not the gate's.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { permissionsQueryKey } from "../hooks/use-permissions";
import { Can } from "./can";

function renderCan(permissions: string[], fallback?: React.ReactNode) {
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
  });

  return render(
    <QueryClientProvider client={client}>
      <Can permission="user:create" fallback={fallback}>
        <button type="button">Create user</button>
      </Can>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

describe("Can", () => {
  it("renders the guarded action when the permission is present", () => {
    renderCan(["user:create"]);

    expect(screen.getByRole("button", { name: "Create user" })).toBeInTheDocument();
  });

  it("renders the fallback when the permission is absent", () => {
    renderCan(["user:read"], <p>You cannot create users.</p>);

    expect(screen.queryByRole("button", { name: "Create user" })).not.toBeInTheDocument();
    expect(screen.getByText("You cannot create users.")).toBeInTheDocument();
  });

  it("renders nothing when denied without a fallback", () => {
    const { container } = renderCan(["user:read"]);

    expect(container).toBeEmptyDOMElement();
  });
});
