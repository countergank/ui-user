/**
 * Permission vocabulary and the grant rule (COU-275 T1/S7/S9). It predicts `api-user`'s guard
 * (`src/auth/guards/permissions.guard.ts:44-53`) and takes every name from its seeded catalog
 * (`api-user/src/rbac/services/permission.service.ts:12`), never inventing one. ADR-13.
 */

/** Grants every permission; the `admin` role holds exactly this. */
export const WILDCARD_PERMISSION = "*";

/** A permission name in the API's `<resource>:<action>` shape. */
export type Permission = string;

/**
 * The permission names this console refers to — only the ones the UI actually names: an
 * unused constant is a claim about a contract nobody checks.
 */
export const PERMISSIONS = {
  userRead: "user:read",
  userCreate: "user:create",
  userUpdate: "user:update",
  roleRead: "role:read",
  permissionRead: "permission:read",
  auditRead: "audit:read",
  parameterRead: "parameter:read",
} as const;

/** The resource half of a `<resource>:<action>` permission. */
function resourceOf(permission: Permission): string {
  return permission.split(":")[0] ?? permission;
}

/**
 * Does this grant list authorize `required`? Pure and total: an empty list grants nothing
 * and an unknown shape never matches. The wildcards are checked before the exact name
 * because they are the broader answer, the same short-circuit the guard uses.
 */
export function hasPermission(granted: readonly string[], required: Permission): boolean {
  if (granted.includes(WILDCARD_PERMISSION)) {
    return true;
  }

  if (granted.includes(required)) {
    return true;
  }

  return granted.includes(`${resourceOf(required)}:${WILDCARD_PERMISSION}`);
}
