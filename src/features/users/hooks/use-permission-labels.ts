import { useQuery } from "@tanstack/react-query";

import { fetchPermissionLabels } from "../permissions";

export const PERMISSION_LABELS_QUERY_KEY = ["permission-labels"] as const;

/**
 * @param enabled - whether the caller holds `permission:read`; the query stays idle without
 * it, so an unauthorized admin never triggers the catalog request.
 * @returns The permission-label query plus `labels`: the descriptions from `GET /permissions`,
 * or an empty map while the catalog loads or after it fails, so the detail falls back to the
 * raw permission codes instead of breaking.
 */
export function usePermissionLabels(enabled: boolean) {
  const query = useQuery({
    queryKey: PERMISSION_LABELS_QUERY_KEY,
    queryFn: fetchPermissionLabels,
    enabled,
  });

  return {
    ...query,
    labels: query.data ?? {},
  };
}
