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

import { useRevokeSession } from "./hooks/use-sessions";
import type { ActiveSessionDTO } from "./types";

interface RevokeSessionDialogProps {
  session: ActiveSessionDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param session - the targeted session, or `null` while nothing is targeted.
 * @returns The `AlertDialog` confirmation for revoking one of the user's other sessions;
 * confirming DELETEs it, toasts and closes (S3). The current session has no revoke
 * action, so this dialog only ever targets other sessions.
 */
export function RevokeSessionDialog({ session, open, onOpenChange }: RevokeSessionDialogProps) {
  const { t } = useTranslation("sessions");
  const revoke = useRevokeSession();

  const confirm = () => {
    if (session === null || revoke.isPending) {
      return;
    }

    revoke.mutate(session.id, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(t("success.revoked"));
      },
      onError: () => {
        toast.error(t("errors.revokeFailure"));
      },
    });
  };

  return (
    <AlertDialog open={open && session !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirm.revoke.title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("confirm.revoke.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={revoke.isPending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t("actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={revoke.isPending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {revoke.isPending ? t("actions.revoking") : t("confirm.revoke.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
