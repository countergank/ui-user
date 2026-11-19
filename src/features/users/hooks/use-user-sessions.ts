import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchUserSessions, logoutAllUserSessions, revokeUserSession } from "../api";
import { userQueryKey } from "./use-user";

export function userSessionsQueryKey(id: string) {
  return [...userQueryKey(id), "sessions"] as const;
}

/**
 * @param id - the user id whose sessions the admin detail shows.
 * @param enabled - whether the caller holds `session:read`; the query stays idle without
 * it, so an unauthorized admin never triggers the request.
 * @returns The admin sessions query for one user, validated against `ActiveSessionDTO` by
 * the fetcher; the single retry is pinned here so the error state of the card is never
 * delayed beyond the app-wide client default.
 */
export function useUserSessions(id: string, enabled: boolean) {
  return useQuery({
    queryKey: userSessionsQueryKey(id),
    queryFn: () => fetchUserSessions(id),
    enabled,
    retry: 1,
  });
}

/**
 * @returns The revoke-one-session mutation; success invalidates the user's admin sessions
 * list so the revoked row disappears.
 */
export function useRevokeUserSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sessionId }: { id: string; sessionId: string }) =>
      revokeUserSession(id, sessionId),
    onSuccess: (_response, { id }) => {
      void queryClient.invalidateQueries({ queryKey: userSessionsQueryKey(id) });
    },
  });
}

/**
 * @returns The logout-all mutation; success invalidates the user detail, whose key prefixes
 * the sessions key, so both the fields and the sessions list refetch.
 */
export function useLogoutAllUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => logoutAllUserSessions(id),
    onSuccess: (_response, { id }) => {
      void queryClient.invalidateQueries({ queryKey: userQueryKey(id) });
    },
  });
}
