// Unit tests for the session store (COU-273, T2).
//
// The store is the authoritative client-side session: tokens plus the user the API
// returned at login. Persistence must be namespaced and versioned (S7), and a payload
// that no longer matches the schema must be discarded rather than trusted.
import { beforeEach, describe, expect, it } from "vitest";

import {
  SESSION_STORAGE_KEY,
  SESSION_STORAGE_VERSION,
  initialSessionState,
  migratePersistedSession,
  sessionStore,
} from "./session-store";

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

beforeEach(() => {
  window.localStorage.clear();
  sessionStore.setState(initialSessionState);
});

describe("session store", () => {
  it("starts anonymous, with no tokens and no user", () => {
    const state = sessionStore.getState();

    expect(state.status).toBe("anonymous");
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it("persists the session under a namespaced key with an explicit version", () => {
    sessionStore.getState().startSession(AUTH);

    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw === null) {
      throw new Error("the session was not persisted");
    }

    const persisted = JSON.parse(raw) as { state: { accessToken: string }; version: number };
    expect(SESSION_STORAGE_KEY).toBe("countergank.ui.session");
    expect(persisted.version).toBe(SESSION_STORAGE_VERSION);
    expect(persisted.state.accessToken).toBe("access-1");
  });

  it("exposes the session as authenticated after a login", () => {
    sessionStore.getState().startSession(AUTH);

    const state = sessionStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user?.id).toBe("u1");
    expect(state.accessToken).toBe("access-1");
  });

  it("replaces both tokens when a refresh rotates them", () => {
    sessionStore.getState().startSession(AUTH);
    sessionStore.getState().rotateTokens({
      accessToken: "access-2",
      refreshToken: "refresh-2",
    });

    const state = sessionStore.getState();
    expect(state.accessToken).toBe("access-2");
    expect(state.refreshToken).toBe("refresh-2");
    expect(state.user?.id).toBe("u1");
  });

  it("clears state and leaves no tokens in storage on logout", () => {
    sessionStore.getState().startSession(AUTH);
    sessionStore.getState().clearSession();

    const state = sessionStore.getState();
    expect(state.status).toBe("anonymous");
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();

    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    expect(raw?.includes("access-1")).not.toBe(true);
    expect(raw?.includes("refresh-1")).not.toBe(true);
  });

  it("marks the session expired without keeping the tokens", () => {
    sessionStore.getState().startSession(AUTH);
    sessionStore.getState().markExpired();

    const state = sessionStore.getState();
    expect(state.status).toBe("expired");
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it("keeps a persisted payload that matches the schema", () => {
    const migrated = migratePersistedSession(AUTH, 1);

    expect(migrated?.status).toBe("authenticated");
    expect(migrated?.accessToken).toBe("access-1");
  });

  it("discards a payload written by a newer client version", () => {
    expect(migratePersistedSession(AUTH, SESSION_STORAGE_VERSION + 1)).toBeUndefined();
  });

  it("discards a persisted payload that no longer matches the schema", () => {
    expect(migratePersistedSession({ accessToken: 42, refreshToken: null }, 0)).toBeUndefined();
    expect(migratePersistedSession({}, 0)).toBeUndefined();
    expect(migratePersistedSession(null, 3)).toBeUndefined();
  });
});
