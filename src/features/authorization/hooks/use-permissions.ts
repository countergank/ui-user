import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { selectSessionStatus, sessionStore, useSession } from "@/lib/session/session-store";

import { fetchMe } from "../api";

export const permissionsQueryKey = ["auth", "me"] as const;

export interface PermissionsResult {
  role: string | null;
  permissions: string[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function usePermissions(): PermissionsResult {
  const status = useSession(selectSessionStatus);
  const authenticated = status === "authenticated";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: permissionsQueryKey,
    queryFn: fetchMe,
    enabled: authenticated,
  });

  const avatarUrl = data?.avatarUrl;

  useEffect(() => {
    if (avatarUrl === undefined) {
      return;
    }
    const current = sessionStore.getState().user;
    if (current !== null && current.avatarUrl !== avatarUrl) {
      sessionStore.getState().updateSessionUser({ avatarUrl });
    }
  }, [avatarUrl]);

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
