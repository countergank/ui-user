import { useTranslation } from "react-i18next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { USER_ROLES } from "./types";

const ALL_ROLES = "__all__";

const PAGE_SIZES = [5, 10, 20, 50] as const;

interface UsersToolbarProps {
  role: string | undefined;
  onRoleChange: (role: string | null) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

/**
 * Renders the list toolbar from the artboard: a role selector on the left and the current page
 * over the page size on the right.
 *
 * @param role - the role filter in the URL, or undefined for every role.
 * @param onRoleChange - applies a role filter, or clears it with null.
 * @param page - the current page, shown next to the page size.
 * @param limit - the page size.
 * @returns The toolbar row.
 */
export function UsersToolbar({ role, onRoleChange, limit, onLimitChange }: UsersToolbarProps) {
  const { t } = useTranslation("users");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Select
          value={role ?? ALL_ROLES}
          onValueChange={(value) => {
            onRoleChange(value === ALL_ROLES ? null : value);
          }}
        >
          <SelectTrigger
            id="users-role-filter"
            className="w-40 bg-canvas"
            aria-label={t("list.filters.role")}
          >
            <SelectValue placeholder={t("list.filters.roles")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>{t("list.filters.roles")}</SelectItem>
            {USER_ROLES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={String(limit)}
          onValueChange={(value) => {
            onLimitChange(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-28 bg-canvas px-2" aria-label={t("list.pageSize")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / {t("list.pageShort")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
