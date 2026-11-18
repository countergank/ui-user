import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchSessions, logoutAll, revokeSession } from "../api";

export const SESSIONS_QUERY_KEY = ["account", "sessions"] as const;

/**
 * @returns The active-sessions query for the signed-in user.
 */
export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: fetchSessions,
  });
}

/**
 * @returns The revoke-one-session mutation; success invalidates the sessions list so
 * the revoked row disappears. Revoking the current session signs the user out.
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}

/**
 * @returns The logout-all mutation; the caller owns the local sign-out because the
 * backend only invalidates refresh tokens and the sessions list is no longer readable
 * once the session is gone.
 */
export function useLogoutAll() {
  return useMutation({
    mutationFn: () => logoutAll(),
  });
}
