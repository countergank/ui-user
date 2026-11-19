import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ActiveSessionDTO } from "@/features/sessions/types";

import { useRevokeUserSession } from "../hooks/use-user-sessions";

interface RevokeUserSessionDialogProps {
  userId: string;
  session: ActiveSessionDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param userId - the user whose session is targeted; it travels percent-encoded in the
 * admin path.
 * @param session - the targeted session, or `null` while nothing is targeted.
 * @returns The `AlertDialog` confirmation for revoking one of the user's sessions from the
 * admin detail; confirming DELETEs it, toasts and closes on success only, while a failure
 * keeps the dialog open and announces the error inside it.
 */
export function RevokeUserSessionDialog({
  userId,
  session,
  open,
  onOpenChange,
}: RevokeUserSessionDialogProps) {
  const { t } = useTranslation("users");
  const revoke = useRevokeUserSession();
  const [error, setError] = useState(false);

  const changeOpen = (next: boolean) => {
    if (!next) {
      setError(false);
    }
    onOpenChange(next);
  };

  const confirm = () => {
    if (session === null || revoke.isPending) {
      return;
    }

    setError(false);
    revoke.mutate(
      { id: userId, sessionId: session.id },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast.success(t("detail.sessions.success.revoked"));
        },
        onError: () => {
          setError(true);
          toast.error(t("detail.sessions.errors.revokeFailure"));
        },
      },
    );
  };

  return (
    <AlertDialog open={open && session !== null} onOpenChange={changeOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("detail.sessions.confirm.revoke.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("detail.sessions.confirm.revoke.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-left text-sm text-destructive">
            {t("detail.sessions.errors.revokeFailure")}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={revoke.isPending}
            onClick={() => {
              changeOpen(false);
            }}
          >
            {t("detail.sessions.actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={revoke.isPending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {revoke.isPending
              ? t("detail.sessions.actions.revoking")
              : t("detail.sessions.confirm.revoke.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
