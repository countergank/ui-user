import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";

import { usePermissions } from "./use-permissions";

const ME_URL = "https://test.invalid/auth/me";

const USER_PROFILE = {
  id: "u1",
  name: "Ada",
  lastName: "Lovelace",
  email: "user@example.com",
  role: "user",
  permissions: ["user:read", "user:update"],
};

let meRequests = 0;

const server = setupServer(
  http.get(ME_URL, () => {
    meRequests += 1;
    return HttpResponse.json(USER_PROFILE);
  }),
);

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
  meRequests = 0;
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

function Probe() {
  const { role, permissions, isLoading } = usePermissions();

  return <p>{isLoading ? "loading" : `${role ?? "none"}:${permissions.join(",") || "none"}`}</p>;
}

function renderProbe() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={client}>
      <Probe />
    </QueryClientProvider>,
  );
}

function startSession() {
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
}

describe("usePermissions", () => {
  it("reads the role and the effective permissions of the session", async () => {
    startSession();
    renderProbe();

    await waitFor(() => {
      expect(screen.getByText("user:user:read,user:update")).toBeInTheDocument();
    });
  });

  it("does not ask the API without a session", async () => {
    renderProbe();

    await waitFor(() => {
      expect(screen.getByText("none:none")).toBeInTheDocument();
    });
    expect(meRequests).toBe(0);
  });
});
