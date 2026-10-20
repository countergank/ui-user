import { PERMISSIONS, type Permission, hasPermission } from "@/features/authorization/permissions";

/**
 * The console's navigation manifest (COU-275, T4 / S3, S10).
 *
 * One declarative list, not a component that decides: the sections and the permission
 * each one needs live here, so adding a section (COU-278 onwards) is one entry and the
 * filter never learns a new case. The `to` targets are ADR-13's console routes.
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
   * Permission the section needs. Omitted means "any signed-in user": the summary is
   * the console's landing page and must never be unreachable.
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
 * The items a grant list authorizes, in manifest order.
 *
 * Pure and cheap: the same `hasPermission` the rest of the console uses, so a section
 * cannot appear here through a different rule than the one guarding its actions.
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
