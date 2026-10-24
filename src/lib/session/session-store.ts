import { z } from "zod";
import { useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export const SESSION_STORAGE_KEY = "countergank.ui.session";

export const SESSION_STORAGE_VERSION = 1;

export interface SessionUser {
  id: string;
  email: string;
  userName: string;
  name: string;
  lastName: string;
}

export type SessionStatus = "anonymous" | "authenticated" | "expired";

export interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface SessionActions {
  startSession: (auth: { user: SessionUser; accessToken: string; refreshToken: string }) => void;
  rotateTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  markExpired: () => void;
  clearSession: () => void;
}

export type SessionStore = SessionState & SessionActions;

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
 * @param persisted - the stored payload, written by this build or an older one.
 * @param version - the persisted shape version.
 * @returns The validated session state, or `undefined` when the payload cannot be trusted
 * (written by a newer client, or failing the shape check) so the caller discards it.
 */
export function migratePersistedSession(
  persisted: unknown,
  version: number,
): SessionState | undefined {
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
