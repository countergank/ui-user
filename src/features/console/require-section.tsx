import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { RequirePermission } from "@/features/authorization/components/require-permission";

import { CONSOLE_NAV, activeNavItem } from "./navigation";

interface RequireSectionProps {
  children: ReactNode;
}

/**
 * Section gate for the console (COU-274, T4 / S2).
 *
 * The manifest already knows which permission each section needs — that is what filters the
 * sidebar — so the route does not restate it. One lookup, one rule: a section cannot be
 * hidden from the navigation and still reachable by URL, and adding a section later is one
 * manifest entry rather than a second declaration that can drift.
 *
 * Paths with no manifest entry have no permission to enforce and fall through; the session
 * gate upstream has already answered the authentication question.
 */
export function RequireSection({ children }: RequireSectionProps) {
  const { pathname } = useLocation();
  const required = activeNavItem(CONSOLE_NAV, pathname)?.requiredPermission;

  if (required === undefined) {
    return <>{children}</>;
  }

  return <RequirePermission permission={required}>{children}</RequirePermission>;
}
