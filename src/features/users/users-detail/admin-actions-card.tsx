import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { selectSessionUser, useSession } from "@/lib/session/session-store";

import { ActiveConfirmDialog } from "../components/active-confirm-dialog";
import { ChangeEmailDialog } from "../components/change-email-dialog";
import { DeleteUserDialog } from "../components/delete-user-dialog";
import { ResendVerificationConfirmDialog } from "../components/resend-verification-confirm-dialog";
import { ResetPasswordConfirmDialog } from "../components/reset-password-confirm-dialog";
import { UnlockConfirmDialog } from "../components/unlock-confirm-dialog";
import type { UserDTO } from "../types";
import { isLocked } from "../users-columns";
import { SectionCard } from "./detail-section";

interface AdminActionsCardProps {
  user: UserDTO;
}

/**
 * @param user - the loaded detail user; the active toggle row reflects `user.isActive` and opens
 * the shared `AlertDialog` confirmation (COU-293 S1, S5), the unlock row appears only while the
 * account is locked and opens its own confirmation (54 S1, S2), the reset-password row opens its
 * own confirmation (127 S1), the resend-verification row opens its own confirmation (127 S2),
 * the change-email row opens the email-change dialog (127 S3), and the delete row appears only
 * with the userDelete permission and opens the strong-confirmation delete dialog (53 S1, S7),
 * disabled on the session's own account (53 S2).
 */
export function AdminActionsCard({ user }: AdminActionsCardProps) {
  const { t } = useTranslation("users");
  const navigate = useNavigate();
  const sessionUser = useSession(selectSessionUser);
  const [confirming, setConfirming] = useState(false);
  const [confirmingUnlock, setConfirmingUnlock] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingResend, setConfirmingResend] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const blocksSelf = user.id === sessionUser?.id;

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
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between rounded-none border-b border-panel-border"
          onClick={() => {
            setConfirmingReset(true);
          }}
        >
          {t("detail.adminActions.resetPassword")}
          <span className="font-mono text-[10px] text-panel-subtle">POST</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={user.emailVerified}
          title={
            user.emailVerified ? t("detail.adminActions.resendVerificationDisabled") : undefined
          }
          className="w-full justify-between rounded-none border-b border-panel-border"
          onClick={() => {
            setConfirmingResend(true);
          }}
        >
          {t("detail.adminActions.resendVerification")}
          <span className="font-mono text-[10px] text-panel-subtle">POST</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between rounded-none border-b border-panel-border"
          onClick={() => {
            setChangingEmail(true);
          }}
        >
          {t("detail.adminActions.changeEmail")}
          <span className="font-mono text-[10px] text-panel-subtle">POST</span>
        </Button>
        <Can permission={PERMISSIONS.userDelete}>
          <Button
            type="button"
            variant="ghost"
            disabled={blocksSelf}
            title={blocksSelf ? t("delete.selfBlocked") : undefined}
            className="w-full justify-between rounded-none border-b border-panel-border text-destructive"
            onClick={() => {
              setDeleting(true);
            }}
          >
            {t("detail.adminActions.delete")}
            <span className="font-mono text-[10px] text-panel-subtle">DELETE</span>
          </Button>
        </Can>
      </div>
      <ActiveConfirmDialog user={user} open={confirming} onOpenChange={setConfirming} />
      <UnlockConfirmDialog user={user} open={confirmingUnlock} onOpenChange={setConfirmingUnlock} />
      <ResetPasswordConfirmDialog
        user={user}
        open={confirmingReset}
        onOpenChange={setConfirmingReset}
      />
      <ResendVerificationConfirmDialog
        user={user}
        open={confirmingResend}
        onOpenChange={setConfirmingResend}
      />
      <ChangeEmailDialog user={user} open={changingEmail} onOpenChange={setChangingEmail} />
      <DeleteUserDialog
        user={user}
        open={deleting}
        onOpenChange={setDeleting}
        onDeleted={() => {
          void navigate("/app/users", { replace: true });
        }}
      />
    </SectionCard>
  );
}
