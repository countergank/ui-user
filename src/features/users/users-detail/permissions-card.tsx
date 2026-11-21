import { useTranslation } from "react-i18next";

import { useCan } from "@/features/authorization/hooks/use-can";
import { PERMISSIONS, WILDCARD_PERMISSION } from "@/features/authorization/permissions";

import { usePermissionLabels } from "../hooks/use-permission-labels";
import type { UserDTO } from "../types";
import { SectionCard } from "./detail-section";

interface PermissionsCardProps {
  user: UserDTO;
}

/**
 * @returns The effective permissions of the user, resolved by `GET /admin/users/:id` and shown
 * with the readable labels from `GET /permissions`; while the catalog is missing, the raw
 * permission codes render instead. Wildcards render as their meaning, never as a bare `*`,
 * and the catalog is only requested by `permission:read` holders.
 */
export function PermissionsCard({ user }: PermissionsCardProps) {
  const { t } = useTranslation("users");
  const canReadCatalog = useCan(PERMISSIONS.permissionRead);
  const { labels } = usePermissionLabels(canReadCatalog);
  const permissions = user.permissions ?? [];
  const hasFullWildcard = permissions.includes(WILDCARD_PERMISSION);

  function labelFor(name: string): string {
    if (name === WILDCARD_PERMISSION) {
      return t("detail.permissions.all");
    }
    if (name.endsWith(`:${WILDCARD_PERMISSION}`)) {
      return t("detail.permissions.resourceWildcard", { resource: name.split(":")[0] });
    }
    return labels[name] || name;
  }

  const meta = hasFullWildcard
    ? undefined
    : t("detail.permissions.count", { count: permissions.length });
  const rowClassName =
    "border-b border-panel-border py-3 text-sm font-medium text-panel-foreground last:border-b-0";

  return (
    <SectionCard title={t("detail.permissions.title")} meta={meta}>
      {permissions.length === 0 ? (
        <p className="text-sm text-panel-subtle">{t("detail.permissions.empty")}</p>
      ) : (
        <ul className="flex flex-col">
          {(hasFullWildcard ? [WILDCARD_PERMISSION] : permissions).map((name) => (
            <li key={name} title={name} className={rowClassName}>
              {labelFor(name)}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
