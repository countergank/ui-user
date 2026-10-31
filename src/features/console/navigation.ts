import { PERMISSIONS, type Permission, hasPermission } from "@/features/authorization/permissions";

export type ConsoleNavLabelKey =
  | "nav.home"
  | "nav.users"
  | "nav.roles"
  | "nav.sessions"
  | "nav.audit"
  | "nav.emailTemplates"
  | "nav.deliveries"
  | "nav.parameters"
  | "nav.i18n";

export type ConsoleNavGroup = "management" | "system";

export interface ConsoleNavItem {
  to: string;
  labelKey: ConsoleNavLabelKey;
  group: ConsoleNavGroup;
  requiredPermission?: Permission;
  /** False when the screen exists only in the design, so the item renders disabled. */
  implemented?: boolean;
}

export const CONSOLE_NAV: readonly ConsoleNavItem[] = [
  { to: "/app", labelKey: "nav.home", group: "management" },
  {
    to: "/app/users",
    labelKey: "nav.users",
    group: "management",
    requiredPermission: PERMISSIONS.userRead,
  },
  {
    to: "/app/roles",
    labelKey: "nav.roles",
    group: "management",
    requiredPermission: PERMISSIONS.roleRead,
  },
  {
    to: "/app/sessions",
    labelKey: "nav.sessions",
    group: "management",
    implemented: false,
  },
  {
    to: "/app/audit",
    labelKey: "nav.audit",
    group: "management",
    requiredPermission: PERMISSIONS.auditRead,
  },
  {
    to: "/app/settings/email-templates",
    labelKey: "nav.emailTemplates",
    group: "system",
    implemented: false,
  },
  {
    to: "/app/settings/deliveries",
    labelKey: "nav.deliveries",
    group: "system",
    implemented: false,
  },
  {
    to: "/app/settings",
    labelKey: "nav.parameters",
    group: "system",
    requiredPermission: PERMISSIONS.parameterRead,
  },
  {
    to: "/app/settings/i18n",
    labelKey: "nav.i18n",
    group: "system",
    implemented: false,
  },
];

/**
 * @returns The entry whose path matches `pathname`, longest match first; the first entry
 * matches only exactly.
 */
export function activeNavItem(
  items: readonly ConsoleNavItem[],
  rawPathname: string,
): ConsoleNavItem | undefined {
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/+$/, "") : rawPathname;
  const exact = items.find((item) => item.to === pathname);

  if (exact !== undefined) {
    return exact;
  }

  const leaves = items.filter(
    (item) => !items.some((other) => other !== item && other.to.startsWith(`${item.to}/`)),
  );

  return leaves
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
