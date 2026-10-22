import { type HttpClient, createHttpClient } from "@/lib/http";
import type { StoreApi } from "zustand/vanilla";

import { decodeAccessToken } from "./jwt";
import { createSessionApi } from "./session-api";
import { type SessionManager, createSessionManager } from "./session-manager";
import { type SessionStore, sessionStore } from "./session-store";

/**
 * Session composition root (COU-281, T2): the only place where the client learns about a
 * session. The client cannot import the manager (that would close the cycle at module
 * load), so the 401 hook reaches it lazily, at the moment a 401 actually arrives.
 */

export interface SessionRuntime {
  /** Shared client every feature request goes through. */
  httpClient: HttpClient;
  sessionManager: SessionManager;
}

/**
 * Builds one wired runtime. `fetchImpl` is injectable so the wiring is provable without
 * the network; production calls it with no argument and gets the global `fetch`.
 */
export function createSessionRuntime(fetchImpl?: typeof fetch): SessionRuntime {
  const httpClient = createHttpClient({
    fetchImpl,
    getAccessToken: () => sessionStore.getState().accessToken,
    // Delegated, never retried twice: the client owns the single retry after a renew.
    onUnauthorized: () => sessionManager.handleUnauthorized(),
  });

  const sessionManager = createSessionManager({
    api: createSessionApi(httpClient),
  });

  return { httpClient, sessionManager };
}

/**
 * The app's single session runtime. Features import `httpClient` from here. `fetch` is
 * delegated instead of captured so the singleton honours a late replacement (MSW
 * interceptor in tests, a polyfill) instead of freezing the global at module load.
 */
export const { httpClient, sessionManager } = createSessionRuntime((input, init) =>
  fetch(input, init),
);

/**
 * Keeps the proactive refresh (COU-273 S3) alive: something has to schedule it after a
 * login and re-schedule it after every rotation, and the store is the only source that
 * knows when the token changed. Returns its unsubscribe for tests and for symmetry.
 */
export function startProactiveRefresh(
  manager: SessionManager,
  store: Pick<StoreApi<SessionStore>, "subscribe" | "getState"> = sessionStore,
): () => void {
  // A reload with a persisted session hydrates the store before this wiring exists: the
  // token is already there and no change event will follow, so schedule the refresh now.
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

/** Schedule (or cancel) the refresh for one access token, or for no session at all. */
function scheduleFor(manager: SessionManager, accessToken: string | null): void {
  const expiresAt =
    accessToken === null ? null : (decodeAccessToken(accessToken)?.expiresAt ?? null);

  if (expiresAt === null) {
    // No readable expiry means there is nothing to schedule — and a cleared session must
    // not leave a timer that would refresh a token that no longer exists.
    manager.cancelProactiveRefresh();
    return;
  }

  manager.scheduleProactiveRefresh(expiresAt);
}
