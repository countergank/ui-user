import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ActiveConfirmDialog } from "../components/active-confirm-dialog";
import type { UserDTO } from "../types";
import { SectionCard } from "./detail-section";

interface AdminActionsCardProps {
  user: UserDTO;
}

const PENDING_ACTIONS = [
  { key: "unlock", verb: "PATCH", destructive: false },
  { key: "resetPassword", verb: "POST", destructive: false },
  { key: "resendVerification", verb: "POST", destructive: false },
  { key: "changeEmail", verb: "POST", destructive: false },
  { key: "delete", verb: "DELETE", destructive: true },
] as const;

/**
 * @param user - the loaded detail user; the active toggle row reflects `user.isActive` and opens
 * the shared `AlertDialog` confirmation (COU-293 S1, S5), while the actions without an endpoint
 * stay disabled placeholders.
 */
export function AdminActionsCard({ user }: AdminActionsCardProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  return (
    <SectionCard title={t("detail.adminActions.title")}>
      <div className="flex flex-col">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between rounded-none border-b border-panel-border"
          onClick={() => {
            setConfirming(true);
          }}
        >
          {user.isActive ? t("detail.adminActions.deactivate") : t("active.activate")}
          <span className="font-mono text-[10px] text-panel-subtle">PATCH</span>
        </Button>
        {PENDING_ACTIONS.map((action) => (
          <Button
            key={action.key}
            type="button"
            variant="ghost"
            disabled
            title={`${t(`detail.adminActions.${action.key}`)} · ${tCommon("ui.list.pending")}`}
            className={cn(
              "w-full justify-between rounded-none border-b border-panel-border",
              action.destructive && "text-destructive",
            )}
          >
            {t(`detail.adminActions.${action.key}`)}
            <span className="font-mono text-[10px] text-panel-subtle">{action.verb}</span>
          </Button>
        ))}
      </div>
      <ActiveConfirmDialog user={user} open={confirming} onOpenChange={setConfirming} />
    </SectionCard>
  );
}
