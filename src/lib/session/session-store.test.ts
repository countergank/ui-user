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

  it("updates the session user name without touching the email or the tokens", () => {
    sessionStore.getState().startSession(AUTH);

    sessionStore.getState().updateSessionUser({ name: "Grace", lastName: "Hopper" });

    const state = sessionStore.getState();
    expect(state.user?.name).toBe("Grace");
    expect(state.user?.lastName).toBe("Hopper");
    expect(state.user?.id).toBe("u1");
    expect(state.user?.email).toBe("user@example.com");
    expect(state.accessToken).toBe("access-1");
    expect(state.refreshToken).toBe("refresh-1");
  });

  it("persists the updated session user", () => {
    sessionStore.getState().startSession(AUTH);

    sessionStore.getState().updateSessionUser({ name: "Grace", lastName: "Hopper" });

    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw === null) {
      throw new Error("the session was not persisted");
    }

    const persisted = JSON.parse(raw) as { state: { user: { name: string } } };
    expect(persisted.state.user.name).toBe("Grace");
  });

  it("leaves an anonymous session untouched when the profile updates", () => {
    expect(sessionStore.getState().status).toBe("anonymous");

    sessionStore.getState().updateSessionUser({ name: "Grace", lastName: "Hopper" });

    const state = sessionStore.getState();
    expect(state.status).toBe("anonymous");
    expect(state.user).toBeNull();
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

  it("updates the session user avatar URL without touching the tokens", () => {
    sessionStore.getState().startSession(AUTH);

    sessionStore.getState().updateSessionUser({ avatarUrl: "https://cdn.example/avatar.png" });

    const state = sessionStore.getState();
    expect(state.user?.avatarUrl).toBe("https://cdn.example/avatar.png");
    expect(state.user?.name).toBe("Ada");
    expect(state.accessToken).toBe("access-1");
  });

  it("keeps a persisted payload that carries an avatar URL", () => {
    const migrated = migratePersistedSession(
      { ...AUTH, user: { ...AUTH.user, avatarUrl: "https://cdn.example/avatar.png" } },
      1,
    );

    expect(migrated?.user?.avatarUrl).toBe("https://cdn.example/avatar.png");
  });

  it("can clear the session avatar back to null", () => {
    sessionStore.getState().startSession(AUTH);

    sessionStore.getState().updateSessionUser({ avatarUrl: "https://cdn.example/avatar.png" });
    sessionStore.getState().updateSessionUser({ avatarUrl: null });

    expect(sessionStore.getState().user?.avatarUrl).toBeNull();
  });
});
