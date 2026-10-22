import { PERMISSIONS, type Permission, hasPermission } from "@/features/authorization/permissions";

/**
 * The console's navigation manifest (COU-275, T4 / S3, S10). One declarative list, not a
 * component that decides: the sections and the permission each one needs live here, so
 * adding a section is one entry and the filter never learns a new case. ADR-13 routes.
 */

/** The `console.nav.*` leaves this manifest may point at. */
export type ConsoleNavLabelKey =
  | "nav.summary"
  | "nav.users"
  | "nav.roles"
  | "nav.permissions"
  | "nav.audit"
  | "nav.settings";

export interface ConsoleNavItem {
  /** Route the section lives at. */
  to: string;
  /** i18n leaf in the `console` namespace. */
  labelKey: ConsoleNavLabelKey;
  /**
   * Permission the section needs. Omitted means any signed-in user: the summary is the
   * console's landing page and must never be unreachable.
   */
  requiredPermission?: Permission;
}

export const CONSOLE_NAV: readonly ConsoleNavItem[] = [
  { to: "/app", labelKey: "nav.summary" },
  { to: "/app/users", labelKey: "nav.users", requiredPermission: PERMISSIONS.userRead },
  { to: "/app/roles", labelKey: "nav.roles", requiredPermission: PERMISSIONS.roleRead },
  {
    to: "/app/permissions",
    labelKey: "nav.permissions",
    requiredPermission: PERMISSIONS.permissionRead,
  },
  { to: "/app/audit", labelKey: "nav.audit", requiredPermission: PERMISSIONS.auditRead },
  {
    to: "/app/settings",
    labelKey: "nav.settings",
    requiredPermission: PERMISSIONS.parameterRead,
  },
];

/**
 * The manifest entry a path belongs to (COU-278, T2 / S1, S7). Longest match first, so
 * `/app/users/42` keeps its section's breadcrumb. The first entry is the landing page by
 * manifest convention and matches only exactly: as a prefix it would claim every console path.
 */
export function activeNavItem(
  items: readonly ConsoleNavItem[],
  pathname: string,
): ConsoleNavItem | undefined {
  const [root, ...sections] = items;

  if (pathname === root.to) {
    return root;
  }

  return sections
    .filter((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

/**
 * The items a grant list authorizes, in manifest order. Pure; uses the same
 * `hasPermission` as the rest of the console, so a section cannot appear here under a
 * different rule than the one guarding its actions.
 */
export function visibleNavItems(
  items: readonly ConsoleNavItem[],
  granted: readonly string[],
): ConsoleNavItem[] {
  return items.filter(
    (item) =>
      item.requiredPermission === undefined || hasPermission(granted, item.requiredPermission),
  );
}
