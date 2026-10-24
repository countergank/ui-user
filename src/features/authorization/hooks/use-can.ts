import { type Permission, hasPermission } from "../permissions";
import { usePermissions } from "./use-permissions";

export function useCan(permission: Permission): boolean {
  const { permissions } = usePermissions();

  return hasPermission(permissions, permission);
}
