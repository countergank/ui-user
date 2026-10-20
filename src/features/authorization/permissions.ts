/**
 * Permission vocabulary and the grant rule (COU-275, T1 / S7, S9).
 *
 * The API is the authority (ADR-13): this module only predicts what the server will
 * answer, so the console can hide an action instead of offering one that fails. The
 * prediction has to use the same rule as `api-user`'s guard
 * (`src/auth/guards/permissions.guard.ts:44-53`): an exact match, the global wildcard
 * `*`, or a resource wildcard such as `user:*`. Anything narrower would hide a section
 * the server authorizes; anything wider would offer an action that comes back 403.
 *
 * Names come from the API's seeded catalog (`api-user/src/rbac/services/permission.service.ts:12`),
 * never invented here; the subsets live in `api-user/src/rbac/services/role.service.ts:19-40`.
 */

/** Grants every permission; the `admin` role holds exactly this. */
export const WILDCARD_PERMISSION = "*";

/** A permission name in the API's `<resource>:<action>` shape. */
export type Permission = string;

/**
 * The permission names this console refers to. Only the ones the UI actually names are
 * listed: an unused constant is a claim about a contract nobody checks.
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
 * Does this grant list authorize `required`?
 *
 * Pure and total: an empty list grants nothing, an unknown shape simply never matches,
 * and the wildcards are checked before the exact name because they are the broader
 * answer (the guard short-circuits on `*` the same way).
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
