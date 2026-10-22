import { type Permission, hasPermission } from "../permissions";
import { usePermissions } from "./use-permissions";

/**
 * Permission predicate for components (COU-275, T3 / S1): a thin read of
 * {@link usePermissions} through {@link hasPermission}, so no component re-implements the
 * wildcard rule. Predicts the server's answer; it does not replace it (ADR-13).
 */
export function useCan(permission: Permission): boolean {
  const { permissions } = usePermissions();

  return hasPermission(permissions, permission);
}
