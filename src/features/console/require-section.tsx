import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { RequirePermission } from "@/features/authorization/components/require-permission";

import { CONSOLE_NAV, activeNavItem } from "./navigation";

interface RequireSectionProps {
  children: ReactNode;
}

export function RequireSection({ children }: RequireSectionProps) {
  const { pathname } = useLocation();
  const required = activeNavItem(CONSOLE_NAV, pathname)?.requiredPermission;

  if (required === undefined) {
    return <>{children}</>;
  }

  return <RequirePermission permission={required}>{children}</RequirePermission>;
}
