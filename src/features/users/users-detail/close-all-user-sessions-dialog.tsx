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
  error: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * @param pending - whether the logout-all request is in flight; the confirm button
 * disables and relabels itself so a double click cannot double-post.
 * @param error - whether the logout-all request failed; the dialog stays open and announces
 * the failure inside it instead of closing with nothing but a toast.
 * @returns The `AlertDialog` confirmation for closing every session of the user from the
 * admin detail.
 */
export function CloseAllUserSessionsDialog({
  open,
  pending,
  error,
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
        {error ? (
          <p role="alert" className="text-left text-sm text-destructive">
            {t("detail.sessions.errors.closeAllFailure")}
          </p>
        ) : null}
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
