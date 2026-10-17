import { queryClient } from "@/lib/query-client";

import { DEFAULT_EXPIRY_SKEW_MS } from "./jwt";
import { type SessionUser, sessionStore } from "./session-store";

/** What `POST /auth/login` and `POST /auth/refresh` return (api-user `AuthResponse`). */
export interface AuthResponse {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

/** The two auth calls the manager needs; injected so tests never touch the network. */
export interface SessionApi {
  refresh: (refreshToken: string) => Promise<AuthResponse>;
  logout: (refreshToken: string) => Promise<void>;
}

export interface SessionManagerDeps {
  api: SessionApi;
  now?: () => number;
  /** Fired once when a refresh fails and the session is marked expired. */
  onExpired?: () => void;
  /** Query cache to empty on logout; defaults to the shared client. */
  queryCache?: { clear: () => void };
  setTimer?: (handler: () => void, delayMs: number) => TimerHandle;
  clearTimer?: (handle: TimerHandle) => void;
}

type TimerHandle = ReturnType<typeof setTimeout>;

export interface SessionManager {
  /**
   * Renew the session once, sharing one in-flight promise across every caller
   * (S5: N concurrent 401s, one refresh). Resolves true when the session is usable.
   */
  refreshSession: () => Promise<boolean>;
  /** 401 hook for the HTTP client: delegate, then let it retry once on true. */
  handleUnauthorized: () => Promise<boolean>;
  /** Refresh proactively `DEFAULT_EXPIRY_SKEW_MS` before the access token expires (S3). */
  scheduleProactiveRefresh: (expiresAt: number) => void;
  cancelProactiveRefresh: () => void;
  /**
   * Local-first logout (S6): the store, the persisted session and the query cache are
   * cleared before the network is touched, and a failed revocation never blocks it.
   */
  logout: () => Promise<void>;
}

export function createSessionManager(deps: SessionManagerDeps): SessionManager {
  const now = deps.now ?? Date.now;
  const setTimer = deps.setTimer ?? ((handler, delayMs) => setTimeout(handler, delayMs));
  const clearTimer =
    deps.clearTimer ??
    ((handle) => {
      clearTimeout(handle);
    });
  const queryCache = deps.queryCache ?? queryClient;

  let inFlight: Promise<boolean> | null = null;
  let scheduled: TimerHandle | null = null;

  const cancelProactiveRefresh = (): void => {
    if (scheduled !== null) {
      clearTimer(scheduled);
      scheduled = null;
    }
  };

  const refreshSession = (): Promise<boolean> => {
    if (inFlight !== null) {
      return inFlight;
    }

    const refreshToken = sessionStore.getState().refreshToken;
    if (refreshToken === null) {
      return Promise.resolve(false);
    }

    inFlight = (async (): Promise<boolean> => {
      try {
        const auth = await deps.api.refresh(refreshToken);
        sessionStore.getState().rotateTokens({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
        });

        return true;
      } catch {
        // Fail closed: no tokens survive a failed refresh, and the app learns why.
        sessionStore.getState().markExpired();
        deps.onExpired?.();

        return false;
      } finally {
        inFlight = null;
      }
    })();

    return inFlight;
  };

  const scheduleProactiveRefresh = (expiresAt: number): void => {
    cancelProactiveRefresh();

    const delay = Math.max(0, expiresAt - now() - DEFAULT_EXPIRY_SKEW_MS);
    scheduled = setTimer(() => {
      scheduled = null;
      void refreshSession();
    }, delay);
  };

  const logout = async (): Promise<void> => {
    const refreshToken = sessionStore.getState().refreshToken;

    cancelProactiveRefresh();
    sessionStore.getState().clearSession();
    queryCache.clear();

    if (refreshToken === null) {
      return;
    }

    // Best effort: the user is already logged out locally, so a dead network or a
    // revoked token must not turn logout into an error the UI has to explain.
    await deps.api.logout(refreshToken).catch(() => undefined);
  };

  return {
    refreshSession,
    handleUnauthorized: refreshSession,
    scheduleProactiveRefresh,
    cancelProactiveRefresh,
    logout,
  };
}
