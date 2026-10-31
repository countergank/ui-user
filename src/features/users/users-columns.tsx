import type { DataTableColumn } from "@/components/data-list/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { Eye, LockOpen, Pencil, Power, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const upper = (label: string): string => label.toUpperCase();
import { Link } from "react-router-dom";

import type { UserDTO } from "./types";
import { avatarToneOf, initialsOf } from "./users-detail/format";

export function isLocked(user: UserDTO): boolean {
  return user.lockedUntil !== null && new Date(user.lockedUntil).getTime() > Date.now();
}

const dateFormatter = (language: string) =>
  new Intl.DateTimeFormat(language, { dateStyle: "medium" });

export function useUsersColumns(): DataTableColumn<UserDTO>[] {
  const { t, i18n } = useTranslation("users");
  const { t: tCommon } = useTranslation();

  return [
    {
      key: "user",
      header: upper(t("list.columns.user")),
      cell: (user) => (
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarToneOf()}`}
          >
            {initialsOf(user.name, user.lastName)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {user.name} {user.lastName}
            </span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </span>
        </div>
      ),
      sortKey: "name",
    },
    {
      key: "role",
      header: upper(t("list.columns.role")),
      cell: (user) => <Badge variant="secondary">{user.role}</Badge>,
      sortKey: "role",
    },
    {
      key: "status",
      header: upper(t("list.columns.status")),
      cell: (user) => {
        const locked = isLocked(user);
        const tone = locked
          ? "text-destructive"
          : user.isActive
            ? "text-success"
            : "text-muted-foreground";
        const label = locked
          ? t("list.status.blocked")
          : t(user.isActive ? "list.status.active" : "list.status.inactive");

        return (
          <span className={`inline-flex items-center gap-1.5 text-sm ${tone}`}>
            <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-current" />
            {label}
          </span>
        );
      },
      sortKey: "isActive",
    },
    {
      key: "verification",
      header: upper(t("list.columns.verification")),
      cell: () => "—",
    },
    {
      key: "createdAt",
      header: upper(t("list.columns.createdAt")),
      cell: (user) => dateFormatter(i18n.language).format(new Date(user.createdAt)),
      sortKey: "createdAt",
    },
    {
      key: "actions",
      header: upper(t("list.columns.actions")),
      align: "right",
      cell: (user) => (
        <div className="flex justify-end gap-1">
          <Can permission={PERMISSIONS.userRead}>
            <Button asChild variant="ghost" size="icon">
              <Link
                to={`/app/users/${encodeURIComponent(user.id)}`}
                aria-label={t("list.actions.view")}
                title={t("list.actions.view")}
              >
                <Eye aria-hidden="true" />
              </Link>
            </Button>
          </Can>
          <Can permission={PERMISSIONS.userUpdate}>
            <Button asChild variant="ghost" size="icon">
              <Link
                to={`/app/users/${encodeURIComponent(user.id)}/edit`}
                aria-label={t("list.actions.edit")}
                title={t("list.actions.edit")}
              >
                <Pencil aria-hidden="true" />
              </Link>
            </Button>
            {user.isActive ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="bg-canvas"
                aria-label={t("list.actions.deactivate")}
                title={`${t("list.actions.deactivate")} · ${tCommon("ui.list.pending")}`}
                disabled
              >
                <Power aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="bg-canvas"
                aria-label={t("list.actions.activate")}
                title={`${t("list.actions.activate")} · ${tCommon("ui.list.pending")}`}
                disabled
              >
                <Power aria-hidden="true" />
              </Button>
            )}
            {isLocked(user) ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="bg-canvas"
                aria-label={t("list.actions.unlock")}
                title={`${t("list.actions.unlock")} · ${tCommon("ui.list.pending")}`}
                disabled
              >
                <LockOpen aria-hidden="true" />
              </Button>
            ) : null}
          </Can>
          <Can permission={PERMISSIONS.userDelete}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bg-canvas"
              aria-label={t("list.actions.delete")}
              title={`${t("list.actions.delete")} · ${tCommon("ui.list.pending")}`}
              disabled
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];
}
