import { useTranslation } from "react-i18next";

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

interface CloseAllUserSessionsDialogProps {
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * @param pending - whether the logout-all request is in flight; the confirm button
 * disables and relabels itself so a double click cannot double-post.
 * @returns The `AlertDialog` confirmation for closing every session of the user from the
 * admin detail.
 */
export function CloseAllUserSessionsDialog({
  open,
  pending,
  onOpenChange,
  onConfirm,
}: CloseAllUserSessionsDialogProps) {
  const { t } = useTranslation("users");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("detail.sessions.confirm.closeAll.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("detail.sessions.confirm.closeAll.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={pending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t("detail.sessions.actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {pending
              ? t("detail.sessions.actions.revoking")
              : t("detail.sessions.confirm.closeAll.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
