export const WILDCARD_PERMISSION = "*";

export type Permission = string;

export const PERMISSIONS = {
  userRead: "user:read",
  userCreate: "user:create",
  userUpdate: "user:update",
  userDelete: "user:delete",
  roleRead: "role:read",
  permissionRead: "permission:read",
  auditRead: "audit:read",
  parameterRead: "parameter:read",
} as const;

function resourceOf(permission: Permission): string {
  return permission.split(":")[0] ?? permission;
}

export function hasPermission(granted: readonly string[], required: Permission): boolean {
  if (granted.includes(WILDCARD_PERMISSION)) {
    return true;
  }

  if (granted.includes(required)) {
    return true;
  }

  return granted.includes(`${resourceOf(required)}:${WILDCARD_PERMISSION}`);
}
