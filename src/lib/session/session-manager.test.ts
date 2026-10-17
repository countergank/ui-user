// Unit tests for the session manager (COU-273, T4).
//
// The coordinator owns the two refresh paths the ticket asks for: proactive (before the
// token dies, S3) and reactive (after a 401), both funnelled through ONE in-flight
// promise so N concurrent 401s produce a single refresh (S5).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSessionManager } from "./session-manager";
import { SESSION_STORAGE_KEY, initialSessionState, sessionStore } from "./session-store";

const AUTH = {
  user: {
    id: "u1",
    email: "user@example.com",
    userName: "user",
    name: "Ada",
    lastName: "Lovelace",
  },
  accessToken: "access-1",
  refreshToken: "refresh-1",
};

function makeApi(
  overrides: Partial<{ refresh: () => Promise<typeof AUTH>; logout: () => Promise<void> }> = {},
) {
  return {
    refresh: vi.fn(
      overrides.refresh ??
        (() => Promise.resolve({ ...AUTH, accessToken: "access-2", refreshToken: "refresh-2" })),
    ),
    logout: vi.fn(overrides.logout ?? (() => Promise.resolve())),
  };
}

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
  sessionStore.getState().startSession(AUTH);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("session manager — logout", () => {
  it("clears the store, the persisted session and the query cache, then revokes remotely", async () => {
    const api = makeApi();
    const queryCache = { clear: vi.fn() };
    const manager = createSessionManager({ api, queryCache });

    await manager.logout();

    expect(sessionStore.getState().status).toBe("anonymous");
    expect(sessionStore.getState().refreshToken).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    expect(queryCache.clear).toHaveBeenCalledTimes(1);
    expect(api.logout).toHaveBeenCalledWith("refresh-1");
  });

  it("logs out locally even when the remote revocation fails", async () => {
    const api = makeApi({ logout: () => Promise.reject(new Error("offline")) });
    const queryCache = { clear: vi.fn() };
    const manager = createSessionManager({ api, queryCache });

    await expect(manager.logout()).resolves.toBeUndefined();

    expect(sessionStore.getState().status).toBe("anonymous");
    expect(queryCache.clear).toHaveBeenCalledTimes(1);
  });

  it("does not call the API when there was no session", async () => {
    sessionStore.getState().clearSession();
    const api = makeApi();
    const manager = createSessionManager({ api, queryCache: { clear: vi.fn() } });

    await manager.logout();

    expect(api.logout).not.toHaveBeenCalled();
  });

  it("discards a refresh that settles after logout instead of resurrecting the session", async () => {
    const holder: { resolve?: (value: typeof AUTH) => void } = {};
    const pending = new Promise<typeof AUTH>((resolve) => {
      holder.resolve = resolve;
    });
    const api = {
      refresh: vi.fn(() => pending),
      logout: vi.fn(() => Promise.resolve()),
    };
    const manager = createSessionManager({ api, queryCache: { clear: vi.fn() } });

    const inFlight = manager.refreshSession();
    await manager.logout();

    holder.resolve?.({ ...AUTH, accessToken: "access-9", refreshToken: "refresh-9" });
    await inFlight;

    expect(sessionStore.getState().status).toBe("anonymous");
    expect(sessionStore.getState().refreshToken).toBeNull();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("does not flip a logged-out session to expired when the in-flight refresh fails", async () => {
    const holder: { reject?: (error: Error) => void } = {};
    const pending = new Promise<never>((_resolve, reject) => {
      holder.reject = reject;
    });
    const onExpired = vi.fn();
    const api = {
      refresh: vi.fn(() => pending),
      logout: vi.fn(() => Promise.resolve()),
    };
    const manager = createSessionManager({ api, onExpired, queryCache: { clear: vi.fn() } });

    const inFlight = manager.refreshSession();
    await manager.logout();

    holder.reject?.(new Error("UA-AUTH-009"));
    await inFlight;

    expect(sessionStore.getState().status).toBe("anonymous");
    expect(onExpired).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it("cancels a scheduled proactive refresh so logout is final", async () => {
    vi.useFakeTimers();
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);
    const api = makeApi();
    const manager = createSessionManager({
      api,
      now: () => Date.now(),
      queryCache: { clear: vi.fn() },
    });

    manager.scheduleProactiveRefresh(now + 60_000);
    await manager.logout();
    await vi.advanceTimersByTimeAsync(120_000);

    expect(api.refresh).not.toHaveBeenCalled();
  });
});

describe("session manager — refresh", () => {
  it("funnels N concurrent 401s into a single refresh and rotates the stored pair", async () => {
    const api = makeApi();
    const manager = createSessionManager({ api });

    const results = await Promise.all(
      Array.from({ length: 5 }, () => manager.handleUnauthorized()),
    );

    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(api.refresh).toHaveBeenCalledWith("refresh-1");
    expect(results).toEqual([true, true, true, true, true]);
    expect(sessionStore.getState().accessToken).toBe("access-2");
    expect(sessionStore.getState().refreshToken).toBe("refresh-2");
  });

  it("marks the session expired and reports failure when the refresh fails", async () => {
    const onExpired = vi.fn();
    const api = makeApi({
      refresh: () => Promise.reject(new Error("UA-AUTH-009")),
    });
    const manager = createSessionManager({ api, onExpired });

    const renewed = await manager.handleUnauthorized();

    expect(renewed).toBe(false);
    expect(sessionStore.getState().status).toBe("expired");
    expect(sessionStore.getState().refreshToken).toBeNull();
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("clears the in-flight promise so a later 401 starts a new refresh", async () => {
    const api = makeApi();
    const manager = createSessionManager({ api });

    await manager.handleUnauthorized();
    await manager.handleUnauthorized();

    expect(api.refresh).toHaveBeenCalledTimes(2);
  });

  it("does not call the API when there is no session at all", async () => {
    sessionStore.getState().clearSession();
    const api = makeApi();
    const manager = createSessionManager({ api });

    expect(await manager.handleUnauthorized()).toBe(false);
    expect(api.refresh).not.toHaveBeenCalled();
  });

  it("refreshes ahead of expiry, at the safety margin, exactly once", async () => {
    vi.useFakeTimers();
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);
    const api = makeApi();
    const manager = createSessionManager({ api, now: () => Date.now() });
    const expiresAt = now + 60_000;

    manager.scheduleProactiveRefresh(expiresAt);
    await vi.advanceTimersByTimeAsync(44_000);
    expect(api.refresh).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2_000);
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });

  it("cancels a scheduled refresh, so a logout does not resurrect the session", async () => {
    vi.useFakeTimers();
    const now = 1_700_000_000_000;
    vi.setSystemTime(now);
    const api = makeApi();
    const manager = createSessionManager({ api, now: () => Date.now() });

    manager.scheduleProactiveRefresh(now + 60_000);
    manager.cancelProactiveRefresh();
    await vi.advanceTimersByTimeAsync(120_000);

    expect(api.refresh).not.toHaveBeenCalled();
  });
});
