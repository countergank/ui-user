import type { HttpClient } from "@/lib/http";

import type { AuthResponse, SessionApi } from "./session-manager";

/**
 * The session adapter between the manager and the network (COU-281, T2).
 *
 * `createSessionManager` deliberately takes its two auth calls injected, so the manager
 * never knows a URL. This module owns the opposite half: which endpoints exist, what they
 * receive and what they return. Keeping it separate is what lets the manager's tests run
 * without HTTP and this adapter's tests run without a manager.
 */
export function createSessionApi(client: Pick<HttpClient, "request">): SessionApi {
  return {
    refresh: (refreshToken) =>
      client.request<AuthResponse>("/auth/refresh", {
        method: "POST",
        body: { refreshToken },
      }),
    logout: async (refreshToken) => {
      // The contract answers `{ message }`; the manager only needs the revocation to
      // have happened, so the payload is discarded here instead of leaking upward.
      await client.request<unknown>("/auth/logout", {
        method: "POST",
        body: { refreshToken },
      });
    },
  };
}
