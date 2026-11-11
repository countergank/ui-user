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

import { useUnlockUser } from "../hooks/use-unlock-user";
import type { UserDTO } from "../types";

interface UnlockConfirmDialogProps {
  user: UserDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param user - the targeted user, or `null` while nothing is targeted; the copy interpolates the
 * user's full name (S2). Callers gate the action on `user:unlock` and on the lock state.
 * @returns The explicit `AlertDialog` confirmation for the account unlock (S2, S7). Confirming
 * PATCHes the unlock endpoint, toasts the API's already translated message and closes (S1, S5).
 */
export function UnlockConfirmDialog({ user, open, onOpenChange }: UnlockConfirmDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const unlock = useUnlockUser();

  const confirm = () => {
    if (user === null || unlock.isPending) {
      return;
    }

    unlock.mutate(
      { id: user.id },
      {
        onSuccess: (response) => {
          toast.success(response.message !== "" ? response.message : t("unlock.success"));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(tCommon("error.genericMessage"));
        },
      },
    );
  };

  return (
    <AlertDialog open={open && user !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("unlock.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {user === null
              ? null
              : t("unlock.confirmBody", { name: `${user.name} ${user.lastName}` })}
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
            disabled={unlock.isPending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {t("unlock.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
