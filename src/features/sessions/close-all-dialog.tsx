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

interface CloseAllDialogProps {
  open: boolean;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * @param pending - whether the logout-all request is in flight; the confirm button
 * disables and relabels itself so a double click cannot double-post (S4).
 * @returns The `AlertDialog` confirmation for signing out every device.
 */
export function CloseAllDialog({ open, pending, onOpenChange, onConfirm }: CloseAllDialogProps) {
  const { t } = useTranslation("sessions");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirm.closeAll.title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("confirm.closeAll.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={pending}
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t("actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {pending ? t("actions.revoking") : t("confirm.closeAll.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
