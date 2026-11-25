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

import { AppError } from "@/lib/errors";
import { useResetUserPassword } from "../hooks/use-reset-user-password";
import type { UserDTO } from "../types";

interface ResetPasswordConfirmDialogProps {
  user: UserDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param user - the targeted user, or `null` while nothing is targeted; the copy interpolates
 * the user's full name.
 * @returns The explicit `AlertDialog` confirmation for the administrative password reset
 * (127 S1). Confirming POSTs the reset endpoint, toasts the API's already translated message
 * and closes (127 S1, S5).
 */
export function ResetPasswordConfirmDialog({
  user,
  open,
  onOpenChange,
}: ResetPasswordConfirmDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const resetPassword = useResetUserPassword();

  const confirm = () => {
    if (user === null || resetPassword.isPending) {
      return;
    }

    resetPassword.mutate(
      { id: user.id },
      {
        onSuccess: (response) => {
          toast.success(response.message !== "" ? response.message : t("resetPassword.success"));
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error instanceof AppError ? error.message : tCommon("error.genericMessage"));
        },
      },
    );
  };

  return (
    <AlertDialog open={open && user !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("resetPassword.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {user === null
              ? null
              : t("resetPassword.confirmBody", { name: `${user.name} ${user.lastName}` })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t("edit.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={resetPassword.isPending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {t("resetPassword.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
