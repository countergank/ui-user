import { queryClient } from "@/lib/query-client";

import { DEFAULT_EXPIRY_SKEW_MS } from "./jwt";
import { type SessionUser, sessionStore } from "./session-store";

export interface AuthResponse {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface SessionApi {
  refresh: (refreshToken: string) => Promise<AuthResponse>;
  logout: (refreshToken: string) => Promise<void>;
}

export interface SessionManagerDeps {
  api: SessionApi;
  now?: () => number;
  onExpired?: () => void;
  queryCache?: { clear: () => void };
  setTimer?: (handler: () => void, delayMs: number) => TimerHandle;
  clearTimer?: (handle: TimerHandle) => void;
}

type TimerHandle = ReturnType<typeof setTimeout>;

export interface SessionManager {
  refreshSession: () => Promise<boolean>;
  handleUnauthorized: () => Promise<boolean>;
  scheduleProactiveRefresh: (expiresAt: number) => void;
  cancelProactiveRefresh: () => void;
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
  let generation = 0;

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

    const startedAt = generation;

    inFlight = (async (): Promise<boolean> => {
      try {
        const auth = await deps.api.refresh(refreshToken);

        if (startedAt !== generation) {
          return false;
        }

        sessionStore.getState().rotateTokens({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
        });

        return true;
      } catch {
        if (startedAt !== generation) {
          return false;
        }

        sessionStore.getState().markExpired();
        deps.onExpired?.();

        return false;
      } finally {
        if (startedAt === generation) {
          inFlight = null;
        }
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

    generation += 1;
    inFlight = null;
    cancelProactiveRefresh();
    sessionStore.getState().clearSession();
    queryCache.clear();

    if (refreshToken === null) {
      return;
    }

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
