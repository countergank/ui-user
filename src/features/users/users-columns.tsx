import type { DataTableColumn } from "@/components/data-list/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { LockOpen, Pencil, Power, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { UserDTO } from "./types";

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
      key: "name",
      header: t("list.columns.name"),
      cell: (user) => `${user.name} ${user.lastName}`,
      sortKey: "name",
    },
    { key: "email", header: t("list.columns.email"), cell: (user) => user.email, sortKey: "email" },
    {
      key: "userName",
      header: t("list.columns.userName"),
      cell: (user) => user.userName,
      sortKey: "userName",
    },
    {
      key: "role",
      header: t("list.columns.role"),
      cell: (user) => <Badge variant="secondary">{user.role}</Badge>,
      sortKey: "role",
    },
    {
      key: "status",
      header: t("list.columns.status"),
      cell: (user) => (
        <Badge variant={user.isActive ? "default" : "outline"}>
          {t(user.isActive ? "list.status.active" : "list.status.inactive")}
        </Badge>
      ),
      sortKey: "isActive",
    },
    {
      key: "createdAt",
      header: t("list.columns.createdAt"),
      cell: (user) => dateFormatter(i18n.language).format(new Date(user.createdAt)),
      sortKey: "createdAt",
    },
    {
      key: "actions",
      header: t("list.columns.actions"),
      align: "right",
      cell: (user) => (
        <div className="flex justify-end gap-1">
          <Can permission={PERMISSIONS.userUpdate}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("list.actions.edit")}
              title={`${t("list.actions.edit")} · ${tCommon("ui.list.pending")}`}
              disabled
            >
              <Pencil aria-hidden="true" />
            </Button>
            {user.isActive ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
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
