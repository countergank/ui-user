// Tests for the session composition root (COU-281, T2): pins the three wires that make
// the manager and the HTTP client one runtime, because a wrong wire here is invisible
// until production returns 401s.
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";

import { createSessionRuntime, startProactiveRefresh } from "./session";
import { initialSessionState, sessionStore } from "./session-store";

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

const ROTATED = { ...AUTH, accessToken: "access-2", refreshToken: "refresh-2" };

/** A `Response` double: the client reads `ok`, `status`, `text()` and nothing else. */
function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

function fetchSequence(...answers: Response[]) {
  return vi.fn(() => {
    const next = answers.shift();
    if (next === undefined) {
      throw new Error("the stub ran out of responses");
    }
    return Promise.resolve(next);
  }) as unknown as typeof fetch & { mock: { calls: unknown[][] } };
}

function headersOf(call: unknown[]): Headers {
  return new Headers((call[1] as RequestInit).headers);
}

/** A JWT-shaped token whose only meaningful claim is `exp` (seconds, per the JWT spec). */
function tokenExpiringAt(expiresAtMs: number): string {
  const payload = btoa(JSON.stringify({ sub: "u1", exp: Math.floor(expiresAtMs / 1000) }));

  return `header.${payload}.signature`;
}

function fakeManager() {
  return {
    refreshSession: vi.fn(() => Promise.resolve(true)),
    handleUnauthorized: vi.fn(() => Promise.resolve(true)),
    scheduleProactiveRefresh: vi.fn(),
    cancelProactiveRefresh: vi.fn(),
    logout: vi.fn(() => Promise.resolve()),
  };
}

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

describe("session composition root", () => {
  it("authenticates every request with the token the store holds", async () => {
    sessionStore.getState().startSession(AUTH);
    const fetchImpl = fetchSequence(response(200, { id: "u1" }));
    const { httpClient } = createSessionRuntime(fetchImpl);

    await httpClient.request("/auth/me");

    expect(fetchImpl.mock.calls).toHaveLength(1);
    expect(headersOf(fetchImpl.mock.calls[0])).toBeDefined();
    expect(headersOf(fetchImpl.mock.calls[0]).get("authorization")).toBe("Bearer access-1");
  });

  it("sends no Bearer header when there is no session", async () => {
    const fetchImpl = fetchSequence(response(200, { id: "u1" }));
    const { httpClient } = createSessionRuntime(fetchImpl);

    await httpClient.request("/auth/me");

    expect(headersOf(fetchImpl.mock.calls[0]).get("authorization")).toBeNull();
  });

  it("refreshes once on 401 and retries with the rotated token", async () => {
    sessionStore.getState().startSession(AUTH);
    const fetchImpl = fetchSequence(
      response(401, { statusCode: 401, code: "UA-AUTH-009", message: "expired" }),
      response(200, ROTATED),
      response(200, { id: "u1" }),
    );
    const { httpClient } = createSessionRuntime(fetchImpl);

    await expect(httpClient.request("/auth/me")).resolves.toEqual({ id: "u1" });

    expect(fetchImpl.mock.calls.map((call) => (call[0] as string).split("/auth/")[1])).toEqual([
      "me",
      "refresh",
      "me",
    ]);
    expect(sessionStore.getState().accessToken).toBe("access-2");
    expect(sessionStore.getState().refreshToken).toBe("refresh-2");
    expect(headersOf(fetchImpl.mock.calls[2]).get("authorization")).toBe("Bearer access-2");
  });

  it("surfaces the API error when there is no session left to refresh", async () => {
    const fetchImpl = fetchSequence(
      response(401, { statusCode: 401, code: "UA-AUTH-009", message: "no session" }),
    );
    const { httpClient } = createSessionRuntime(fetchImpl);

    const error = await httpClient.request("/auth/me").catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe("UA-AUTH-009");
    expect(fetchImpl.mock.calls).toHaveLength(1);
  });
});

describe("proactive refresh wiring", () => {
  const EXPIRES_AT = 1_800_000_000_000;

  it("schedules a refresh from the expiry the store just received", () => {
    const manager = fakeManager();
    const unsubscribe = startProactiveRefresh(manager, sessionStore);

    sessionStore.getState().startSession({
      ...AUTH,
      accessToken: tokenExpiringAt(EXPIRES_AT),
    });

    expect(manager.scheduleProactiveRefresh).toHaveBeenCalledWith(EXPIRES_AT);

    unsubscribe();
  });

  it("cancels the scheduled refresh when the session is cleared", () => {
    const manager = fakeManager();
    const unsubscribe = startProactiveRefresh(manager, sessionStore);

    sessionStore.getState().startSession({
      ...AUTH,
      accessToken: tokenExpiringAt(EXPIRES_AT),
    });
    manager.scheduleProactiveRefresh.mockClear();

    sessionStore.getState().clearSession();

    expect(manager.cancelProactiveRefresh).toHaveBeenCalledTimes(1);
    expect(manager.scheduleProactiveRefresh).not.toHaveBeenCalled();

    unsubscribe();
  });

  it("schedules the session that was already in the store before the wiring ran", () => {
    // A reload with a persisted session: zustand hydrates the store during creation, so by
    // the time this wiring runs the token is already there and no change event will follow.
    sessionStore.getState().startSession({
      ...AUTH,
      accessToken: tokenExpiringAt(EXPIRES_AT),
    });
    const manager = fakeManager();

    const unsubscribe = startProactiveRefresh(manager, sessionStore);

    expect(manager.scheduleProactiveRefresh).toHaveBeenCalledExactlyOnceWith(EXPIRES_AT);

    unsubscribe();
  });

  it("ignores a state change that keeps the same token", () => {
    const manager = fakeManager();
    const unsubscribe = startProactiveRefresh(manager, sessionStore);
    const token = tokenExpiringAt(EXPIRES_AT);

    sessionStore.getState().startSession({ ...AUTH, accessToken: token });
    sessionStore.getState().rotateTokens({ accessToken: token, refreshToken: "refresh-3" });

    expect(manager.scheduleProactiveRefresh).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
