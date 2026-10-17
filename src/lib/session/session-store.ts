import { z } from "zod";
import { useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

/** Namespaced storage key: this app's session, never a generic `session`. */
export const SESSION_STORAGE_KEY = "countergank.ui.session";

/** Bumped whenever the persisted shape changes; `migratePersistedSession` gates on it. */
export const SESSION_STORAGE_VERSION = 1;

export interface SessionUser {
  id: string;
  email: string;
  userName: string;
  name: string;
  lastName: string;
}

/** `expired` is a real state: authenticated once, but the refresh failed. */
export type SessionStatus = "anonymous" | "authenticated" | "expired";

export interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface SessionActions {
  /** Login succeeded: keep the user the API returned and both tokens. */
  startSession: (auth: { user: SessionUser; accessToken: string; refreshToken: string }) => void;
  /** A refresh rotates the pair; the user stays the same. */
  rotateTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  /** The refresh failed: no tokens survive, but the UI knows why the session ended. */
  markExpired: () => void;
  /** Local logout: empty state, no persisted session left behind. */
  clearSession: () => void;
}

export type SessionStore = SessionState & SessionActions;

// Deliberately a literal, not a storage read: import-time side effects leak across tests.
export const initialSessionState: SessionState = {
  status: "anonymous",
  user: null,
  accessToken: null,
  refreshToken: null,
};

const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  userName: z.string(),
  name: z.string(),
  lastName: z.string(),
});

const persistedSessionSchema = z.object({
  user: sessionUserSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

/**
 * Gate for a persisted payload written by an older (or corrupted) client. A shape we
 * cannot prove is not trusted: the session is discarded and the user logs in again,
 * which is the safe direction for credentials.
 */
export function migratePersistedSession(
  persisted: unknown,
  version: number,
): SessionState | undefined {
  // A payload from a newer client than this build cannot be validated here.
  if (version > SESSION_STORAGE_VERSION) {
    return undefined;
  }

  const parsed = persistedSessionSchema.safeParse(persisted);

  if (!parsed.success) {
    return undefined;
  }

  return { status: "authenticated", ...parsed.data };
}

export const sessionStore = createStore<SessionStore>()(
  persist<SessionStore, [], [], SessionState>(
    (set) => ({
      ...initialSessionState,
      startSession: ({ user, accessToken, refreshToken }) => {
        set({ status: "authenticated", user, accessToken, refreshToken });
      },
      rotateTokens: ({ accessToken, refreshToken }) => {
        set({ accessToken, refreshToken });
      },
      markExpired: () => {
        set({ status: "expired", user: null, accessToken: null, refreshToken: null });
      },
      clearSession: () => {
        set({ ...initialSessionState });
        // Remove the key entirely instead of persisting `null` tokens.
        sessionStore.persist.clearStorage();
      },
    }),
    {
      name: SESSION_STORAGE_KEY,
      version: SESSION_STORAGE_VERSION,
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        status: state.status,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      migrate: (persisted, version) =>
        migratePersistedSession(persisted, version) ?? initialSessionState,
    },
  ),
);

export const selectSessionStatus = (state: SessionStore): SessionStatus => state.status;
export const selectAccessToken = (state: SessionStore): string | null => state.accessToken;
export const selectRefreshToken = (state: SessionStore): string | null => state.refreshToken;
export const selectSessionUser = (state: SessionStore): SessionUser | null => state.user;

export const useSession = <T>(selector: (state: SessionStore) => T): T =>
  useStore(sessionStore, selector);
