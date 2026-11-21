import { useTranslation } from "react-i18next";

import { WILDCARD_PERMISSION } from "@/features/authorization/permissions";

import { usePermissionLabels } from "../hooks/use-permission-labels";
import type { UserDTO } from "../types";
import { SectionCard } from "./detail-section";

interface PermissionsCardProps {
  user: UserDTO;
}

/**
 * @returns The effective permissions of the user, resolved by `GET /admin/users/:id` and shown
 * with the readable labels from `GET /permissions`; while the catalog is missing, the raw
 * permission codes render instead. Wildcards render as their meaning, never as a bare `*`.
 */
export function PermissionsCard({ user }: PermissionsCardProps) {
  const { t } = useTranslation("users");
  const { labels } = usePermissionLabels();
  const permissions = user.permissions ?? [];
  const hasFullWildcard = permissions.includes(WILDCARD_PERMISSION);

  function labelFor(name: string): string {
    if (name.endsWith(`:${WILDCARD_PERMISSION}`)) {
      return t("detail.permissions.resourceWildcard", { resource: name.split(":")[0] });
    }
    return labels[name] || name;
  }

  return (
    <SectionCard
      title={t("detail.permissions.title")}
      meta={t("detail.permissions.count", { count: permissions.length })}
    >
      {permissions.length === 0 ? (
        <p className="text-sm text-panel-subtle">{t("detail.permissions.empty")}</p>
      ) : hasFullWildcard ? (
        <ul className="flex flex-col">
          <li
            title={WILDCARD_PERMISSION}
            className="border-b border-panel-border py-3 text-sm font-medium text-panel-foreground last:border-b-0"
          >
            {t("detail.permissions.all")}
          </li>
        </ul>
      ) : (
        <ul className="flex flex-col">
          {permissions.map((name) => (
            <li
              key={name}
              title={name}
              className="border-b border-panel-border py-3 text-sm font-medium text-panel-foreground last:border-b-0"
            >
              {labelFor(name)}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
