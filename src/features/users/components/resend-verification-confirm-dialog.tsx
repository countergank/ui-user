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
import { useResendUserVerification } from "../hooks/use-resend-user-verification";
import type { UserDTO } from "../types";

interface ResendVerificationConfirmDialogProps {
  user: UserDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param user - the targeted user, or `null` while nothing is targeted; the copy interpolates
 * the user's full name and destination email.
 * @returns The explicit `AlertDialog` confirmation for re-sending the verification email
 * (127 S2). Confirming POSTs the resend endpoint, toasts the API's already translated message
 * and closes (127 S2, S5).
 */
export function ResendVerificationConfirmDialog({
  user,
  open,
  onOpenChange,
}: ResendVerificationConfirmDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const resendVerification = useResendUserVerification();

  const confirm = () => {
    if (user === null || resendVerification.isPending) {
      return;
    }

    resendVerification.mutate(
      { id: user.id },
      {
        onSuccess: (response) => {
          toast.success(
            response.message !== "" ? response.message : t("resendVerification.success"),
          );
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
          <AlertDialogTitle>{t("resendVerification.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {user === null
              ? null
              : t("resendVerification.confirmBody", {
                  name: `${user.name} ${user.lastName}`,
                  email: user.email,
                })}
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
            disabled={resendVerification.isPending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {t("resendVerification.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
