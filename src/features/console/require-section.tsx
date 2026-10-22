import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { RequirePermission } from "@/features/authorization/components/require-permission";

import { CONSOLE_NAV, activeNavItem } from "./navigation";

interface RequireSectionProps {
  children: ReactNode;
}

/**
 * Section gate for the console (COU-274, T4 / S2): the manifest already knows each
 * section's permission, so the route does not restate it. A path with no manifest entry
 * falls through — safe only because the session gate upstream answered authentication.
 */
export function RequireSection({ children }: RequireSectionProps) {
  const { pathname } = useLocation();
  const required = activeNavItem(CONSOLE_NAV, pathname)?.requiredPermission;

  if (required === undefined) {
    return <>{children}</>;
  }

  return <RequirePermission permission={required}>{children}</RequirePermission>;
}
