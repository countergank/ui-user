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
 * Conditional rendering by permission (COU-275, T3 / S5): blunt usage, so the gate cannot
 * drift from the server the way a boolean prop spread across components would. `fallback`
 * defaults to nothing — a denied action usually has no stand-in. Presentation, not protection.
 */
export function Can({ permission, fallback = null, children }: CanProps): ReactNode {
  const allowed = useCan(permission);

  return allowed ? children : fallback;
}
