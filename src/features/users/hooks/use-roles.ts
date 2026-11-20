import { useQuery } from "@tanstack/react-query";

import { FALLBACK_ROLES, fetchRoles } from "../roles";

export const ROLES_QUERY_KEY = ["roles"] as const;

/**
 * @returns The role catalog query plus `roles`: the names from `GET /roles`, or the typed
 * fallback while the catalog loads or after it fails, so the filters and the forms stay
 * usable when the endpoint is down.
 */
export function useRolesCatalog() {
  const query = useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: fetchRoles,
  });

  return {
    ...query,
    roles: query.data ?? [...FALLBACK_ROLES],
  };
}
