import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { cn } from "@/lib/utils";

import type { UserDTO } from "../types";
import { initialsOf } from "./format";

interface DetailHeaderProps {
  user: UserDTO;
}

export function DetailHeader({ user }: DetailHeaderProps) {
  const { t } = useTranslation("users");
  const editPath = `/app/users/${encodeURIComponent(user.id)}/edit`;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar size="lg" className="h-14 w-14">
            <AvatarFallback className="bg-primary font-mono text-base font-bold text-primary-foreground">
              {initialsOf(user.name, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-2xl font-bold">
                {user.name} {user.lastName}
              </p>
              <span className="rounded-sm bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
                {user.role}
              </span>
              <span
                className={cn(
                  "rounded-sm px-2 py-0.5 font-mono text-xs",
                  user.isActive
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive",
                )}
              >
                {t(user.isActive ? "detail.status.active" : "detail.status.inactive")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              @{user.userName} · {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Can permission={PERMISSIONS.userUpdate}>
            <Button
              asChild
              size="sm"
              className="h-8 bg-panel px-3 text-panel-foreground hover:bg-panel-border"
            >
              <Link to={editPath}>{t("detail.actions.edit")}</Link>
            </Button>
          </Can>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label={t("detail.actions.more")}
            title={`${t("detail.actions.more")} · ${t("detail.pending")}`}
            disabled
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[26px] font-bold leading-tight">{t("detail.title")}</h1>
        <p className="text-xs text-muted-foreground">{t("detail.subtitle")}</p>
      </div>
    </section>
  );
}
