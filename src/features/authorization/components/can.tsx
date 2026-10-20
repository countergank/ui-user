import type { ReactNode } from "react";

import { useCan } from "../hooks/use-can";
import type { Permission } from "../permissions";

interface CanProps {
  /** The permission the wrapped UI needs. */
  permission: Permission;
  /** Rendered instead of the children when the permission is absent. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditional rendering by permission (COU-275, T3 / S5).
 *
 * Usage is intentionally blunt — `<Can permission="user:create"><CreateButton /></Can>` —
 * because the alternative (a boolean prop spread across components) is what ends up
 * drifting from the server. `fallback` defaults to nothing: a denied action usually has
 * no stand-in, and inventing a disabled button would advertise a capability the user does
 * not have.
 *
 * This is presentation, not protection: `api-user` still authorizes every request
 * (ADR-13), which is why an unexpected 403 has its own view ({@link ForbiddenView}).
 */
export function Can({ permission, fallback = null, children }: CanProps): ReactNode {
  const allowed = useCan(permission);

  return allowed ? children : fallback;
}
