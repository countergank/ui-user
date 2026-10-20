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
}

/**
 * Role and effective permissions of the current session (COU-275, T2 / S1).
 *
 * Three deliberate choices:
 * - An **anonymous** visitor asks nothing: the public surface must not call the API
 *   (COU-310, S7), so the query is gated on the session status instead of firing and
 *   failing.
 * - A **failed or pending** profile yields no permissions. Failing closed keeps a
 *   half-loaded console from offering an action the server will reject; the sections
 *   appear as soon as the profile arrives.
 * - The server stays the authority (ADR-13): the UI never decides what the user may
 *   read or write, it only avoids rendering what is already forbidden.
 */
export function usePermissions(): PermissionsResult {
  const status = useSession(selectSessionStatus);
  const authenticated = status === "authenticated";

  const { data, isLoading } = useQuery({
    queryKey: permissionsQueryKey,
    queryFn: fetchMe,
    enabled: authenticated,
  });

  return {
    role: authenticated ? (data?.role ?? null) : null,
    permissions: authenticated ? (data?.permissions ?? []) : [],
    isLoading: authenticated && isLoading,
  };
}
