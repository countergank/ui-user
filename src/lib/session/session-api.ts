import type { HttpClient } from "@/lib/http";

import type { AuthResponse, SessionApi } from "./session-manager";

/**
 * @param client - the HTTP client the adapter's auth calls go through.
 * @returns The refresh and logout endpoints wired to `/auth/refresh` and `/auth/logout`.
 */
export function createSessionApi(client: Pick<HttpClient, "request">): SessionApi {
  return {
    refresh: (refreshToken) =>
      client.request<AuthResponse>("/auth/refresh", {
        method: "POST",
        body: { refreshToken },
      }),
    logout: async (refreshToken) => {
      await client.request<unknown>("/auth/logout", {
        method: "POST",
        body: { refreshToken },
      });
    },
  };
}
