import { useEffect } from "react";
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
import { selectSessionUser, useSession } from "@/lib/session/session-store";

import { useToggleUserActive } from "../hooks/use-toggle-user-active";
import type { UserDTO } from "../types";

interface ActiveConfirmDialogProps {
  user: UserDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param user - the targeted user, or `null` while nothing is targeted; the confirm button and
 * the dialog copy follow `user.isActive` (S5).
 * @returns The explicit `AlertDialog` confirmation for the active toggle (S2, S4, S7). Opening it
 * on the session's own active account is refused with a clear message and never reaches the API
 * (S3, S8); confirming PATCHes the toggle endpoint, toasts the result and closes (S9).
 */
export function ActiveConfirmDialog({ user, open, onOpenChange }: ActiveConfirmDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const sessionUser = useSession(selectSessionUser);
  const toggle = useToggleUserActive();
  const blocksSelf = user !== null && user.id === sessionUser?.id && user.isActive;

  useEffect(() => {
    if (open && blocksSelf) {
      toast.error(t("active.selfBlocked"));
      onOpenChange(false);
    }
  }, [open, blocksSelf, onOpenChange, t]);

  const confirm = () => {
    if (user === null || blocksSelf) {
      return;
    }

    toggle.mutate(
      { id: user.id },
      {
        onSuccess: () => {
          toast.success(t("active.success"));
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
          <AlertDialogTitle>{t("active.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {user === null
              ? null
              : t("active.confirmBody", { name: `${user.name} ${user.lastName}` })}
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
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {user?.isActive ? t("active.deactivate") : t("active.activate")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
