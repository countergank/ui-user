import type { ReactNode } from "react";

import { useCan } from "../hooks/use-can";
import type { Permission } from "../permissions";

interface CanProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, fallback = null, children }: CanProps): ReactNode {
  const allowed = useCan(permission);

  return allowed ? children : fallback;
}
