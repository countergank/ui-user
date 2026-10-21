import { useQuery } from "@tanstack/react-query";

import { selectSessionStatus, useSession } from "@/lib/session/session-store";

import { fetchMe } from "../api";

/** One profile per session: the console asks `/auth/me` once and every gate reads it. */
export const permissionsQueryKey = ["auth", "me"] as const;

export interface PermissionsResult {
  /** The role name the API returned (`admin`, `user`, `viewer`, or a custom one). */
  role: string | null;
  /** The **effective** permissions, already resolved by the server; never built here. */
  permissions: string[];
  /** True while the profile is still being fetched for an authenticated session. */
  isLoading: boolean;
  /**
   * True when the profile request failed (COU-323): a failure proves nothing about the grant,
   * so a guard must report it as an error instead of answering "denied".
   */
  isError: boolean;
  /** Retry the profile request, for the error state of a guard. */
  refetch: () => void;
}

/**
 * Role and effective permissions of the current session (COU-275 T2/S1). An anonymous visitor
 * asks nothing and a failed read yields none: failing closed keeps the UI from offering what the
 * server would reject, without ever deciding permissions here (ADR-13).
 */
export function usePermissions(): PermissionsResult {
  const status = useSession(selectSessionStatus);
  const authenticated = status === "authenticated";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: permissionsQueryKey,
    queryFn: fetchMe,
    enabled: authenticated,
  });

  return {
    role: authenticated ? (data?.role ?? null) : null,
    permissions: authenticated ? (data?.permissions ?? []) : [],
    isLoading: authenticated && isLoading,
    isError: authenticated && isError,
    refetch: () => {
      void refetch();
    },
  };
}
