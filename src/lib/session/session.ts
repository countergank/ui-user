import { type HttpClient, createHttpClient } from "@/lib/http";
import type { StoreApi } from "zustand/vanilla";

import { decodeAccessToken } from "./jwt";
import { createSessionApi } from "./session-api";
import { type SessionManager, createSessionManager } from "./session-manager";
import { type SessionStore, sessionStore } from "./session-store";

export interface SessionRuntime {
  httpClient: HttpClient;
  sessionManager: SessionManager;
}

/**
 * @param fetchImpl - injectable so the wiring is provable without the network; production
 * calls it with no argument and gets the global `fetch`.
 * @returns One wired runtime with the HTTP client and the session manager.
 */
export function createSessionRuntime(fetchImpl?: typeof fetch): SessionRuntime {
  const httpClient = createHttpClient({
    fetchImpl,
    getAccessToken: () => sessionStore.getState().accessToken,
    onUnauthorized: () => sessionManager.handleUnauthorized(),
  });

  const sessionManager = createSessionManager({
    api: createSessionApi(httpClient),
  });

  return { httpClient, sessionManager };
}

export const { httpClient, sessionManager } = createSessionRuntime((input, init) =>
  fetch(input, init),
);

/**
 * @param manager - session manager whose proactive refresh is kept alive.
 * @param store - source of access-token changes; defaults to the shared session store.
 * @returns an unsubscribe function that detaches the store subscription.
 */
export function startProactiveRefresh(
  manager: SessionManager,
  store: Pick<StoreApi<SessionStore>, "subscribe" | "getState"> = sessionStore,
): () => void {
  const hydratedToken = store.getState().accessToken;
  const hydratedExpiry =
    hydratedToken === null ? null : (decodeAccessToken(hydratedToken)?.expiresAt ?? null);

  if (hydratedExpiry !== null) {
    manager.scheduleProactiveRefresh(hydratedExpiry);
  }

  return store.subscribe((state, previous) => {
    if (state.accessToken === previous.accessToken) {
      return;
    }

    scheduleFor(manager, state.accessToken);
  });
}

function scheduleFor(manager: SessionManager, accessToken: string | null): void {
  const expiresAt =
    accessToken === null ? null : (decodeAccessToken(accessToken)?.expiresAt ?? null);

  if (expiresAt === null) {
    manager.cancelProactiveRefresh();
    return;
  }

  manager.scheduleProactiveRefresh(expiresAt);
}
