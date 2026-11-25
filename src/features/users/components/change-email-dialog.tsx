import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AppError } from "@/lib/errors";
import { useCancelUserEmailChange } from "../hooks/use-cancel-user-email-change";
import { useRequestUserEmailChange } from "../hooks/use-request-user-email-change";
import type { UserDTO } from "../types";

const EMAIL_SHAPE = z.string().email();

interface ChangeEmailDialogProps {
  user: UserDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param user - the targeted user, or `null` while nothing is targeted; when
 * `user.hasPendingEmailChange` is true the dialog also offers the pending-request cancel
 * action.
 * @returns The `AlertDialog` for the admin-requested email change (127 S3). Confirming POSTs
 * the typed address — validated as non-empty and well-formed before anything is sent — toasts
 * the API's already translated message and closes; the cancel action DELETEs the pending
 * request (127 S3, S5).
 */
export function ChangeEmailDialog({ user, open, onOpenChange }: ChangeEmailDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const requestChange = useRequestUserEmailChange();
  const cancelChange = useCancelUserEmailChange();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setEmail("");
    setError(null);
    onOpenChange(false);
  };

  const validate = (value: string): string | null => {
    const trimmed = value.trim();

    if (trimmed === "") {
      return t("changeEmail.fieldRequired");
    }
    if (!EMAIL_SHAPE.safeParse(trimmed).success) {
      return t("changeEmail.emailInvalid");
    }

    return null;
  };

  const confirm = () => {
    if (user === null || requestChange.isPending) {
      return;
    }

    const trimmed = email.trim();
    const validationError = validate(trimmed);
    setError(validationError);
    if (validationError !== null) {
      return;
    }

    requestChange.mutate(
      { id: user.id, email: trimmed },
      {
        onSuccess: (response) => {
          toast.success(response.message !== "" ? response.message : t("changeEmail.success"));
          close();
        },
        onError: (error) => {
          toast.error(error instanceof AppError ? error.message : tCommon("error.genericMessage"));
        },
      },
    );
  };

  const cancelPending = () => {
    if (user === null || cancelChange.isPending) {
      return;
    }

    cancelChange.mutate(
      { id: user.id },
      {
        onSuccess: (response) => {
          toast.success(
            response.message !== "" ? response.message : t("changeEmail.cancelSuccess"),
          );
          close();
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
          <AlertDialogTitle>{t("changeEmail.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {user === null ? null : t("changeEmail.confirmBody", { email: user.email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="change-email-input">{t("changeEmail.label")}</Label>
          <Input
            id="change-email-input"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            aria-invalid={error !== null}
          />
          {error === null ? null : (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        {user?.hasPendingEmailChange === true ? (
          <div className="rounded-md border border-panel-border p-3">
            <p className="text-sm font-medium">{t("changeEmail.pendingTitle")}</p>
            <p className="text-sm text-panel-subtle">{t("changeEmail.pendingBody")}</p>
            <Button
              type="button"
              variant="ghost"
              disabled={cancelChange.isPending}
              className="mt-2 text-destructive"
              onClick={() => {
                cancelPending();
              }}
            >
              {t("changeEmail.cancelPending")}
            </Button>
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              close();
            }}
          >
            {t("edit.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={requestChange.isPending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {t("changeEmail.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
