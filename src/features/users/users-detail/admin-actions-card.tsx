import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { cn } from "@/lib/utils";

import { ActiveConfirmDialog } from "../components/active-confirm-dialog";
import { UnlockConfirmDialog } from "../components/unlock-confirm-dialog";
import type { UserDTO } from "../types";
import { isLocked } from "../users-columns";
import { SectionCard } from "./detail-section";

interface AdminActionsCardProps {
  user: UserDTO;
}

const PENDING_ACTIONS = [
  { key: "resetPassword", verb: "POST", destructive: false },
  { key: "resendVerification", verb: "POST", destructive: false },
  { key: "changeEmail", verb: "POST", destructive: false },
  { key: "delete", verb: "DELETE", destructive: true },
] as const;

/**
 * @param user - the loaded detail user; the active toggle row reflects `user.isActive` and opens
 * the shared `AlertDialog` confirmation (COU-293 S1, S5), the unlock row appears only while the
 * account is locked and opens its own confirmation (54 S1, S2), and the actions without an
 * endpoint stay disabled placeholders.
 */
export function AdminActionsCard({ user }: AdminActionsCardProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [confirmingUnlock, setConfirmingUnlock] = useState(false);

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
        {isLocked(user) ? (
          <Can permission={PERMISSIONS.userUnlock}>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between rounded-none border-b border-panel-border"
              onClick={() => {
                setConfirmingUnlock(true);
              }}
            >
              {t("detail.adminActions.unlock")}
              <span className="font-mono text-[10px] text-panel-subtle">PATCH</span>
            </Button>
          </Can>
        ) : null}
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
      <UnlockConfirmDialog user={user} open={confirmingUnlock} onOpenChange={setConfirmingUnlock} />
    </SectionCard>
  );
}
