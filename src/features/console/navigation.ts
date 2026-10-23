import { PERMISSIONS, type Permission, hasPermission } from "@/features/authorization/permissions";

export type ConsoleNavLabelKey =
  | "nav.summary"
  | "nav.users"
  | "nav.roles"
  | "nav.permissions"
  | "nav.audit"
  | "nav.settings";

export interface ConsoleNavItem {
  to: string;
  labelKey: ConsoleNavLabelKey;
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
 * @returns The entry whose path matches `pathname`, longest match first; the first entry
 * matches only exactly.
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

export function visibleNavItems(
  items: readonly ConsoleNavItem[],
  granted: readonly string[],
): ConsoleNavItem[] {
  return items.filter(
    (item) =>
      item.requiredPermission === undefined || hasPermission(granted, item.requiredPermission),
  );
}
