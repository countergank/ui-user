import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";

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
import { selectSessionUser, sessionStore, useSession } from "@/lib/session/session-store";

import { useDeleteUser } from "../hooks/use-delete-user";
import { USERS_QUERY_KEY } from "../hooks/use-users";
import type { UserDTO } from "../types";

interface DeleteUserDialogProps {
  user: UserDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (id: string) => void;
}

/**
 * @param user - the targeted user, or `null` while nothing is targeted; the strong confirmation
 * accepts the user's `email` or `userName`, trimmed and case-insensitive (53 S1).
 * @param onDeleted - fires with the deleted id after a successful DELETE; the detail uses it to
 * return to the list. It never fires when the deleted user is the session's own account: that
 * path ends the session locally instead (53 S3).
 * @returns The destructive `AlertDialog` for user deletion (53 S1). The confirm button stays
 * disabled until the typed text matches, DELETEs the endpoint once, toasts the API's already
 * translated message and closes; 403 and 404 surface their own copy, and a 404 also invalidates
 * the users list because the target may already be gone elsewhere (53 S4). Deleting the
 * session's own user clears the session and redirects to /login (53 S3); callers gate the
 * entry points on the session account (53 S2).
 */
export function DeleteUserDialog({ user, open, onOpenChange, onDeleted }: DeleteUserDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionUser = useSession(selectSessionUser);
  const remove = useDeleteUser();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmation("");
      setError(null);
    }
  }, [open]);

  const matches = (value: string): boolean => {
    if (user === null) {
      return false;
    }

    const typed = value.trim().toLowerCase();

    return typed === user.email.toLowerCase() || typed === user.userName.toLowerCase();
  };

  const close = () => {
    setConfirmation("");
    setError(null);
    onOpenChange(false);
  };

  const confirm = () => {
    if (user === null || remove.isPending) {
      return;
    }

    remove.mutate(
      { id: user.id },
      {
        onSuccess: (response) => {
          toast.success(response.message !== "" ? response.message : t("delete.success"));
          if (user.id === sessionUser?.id) {
            sessionStore.getState().clearSession();
            queryClient.clear();
            void navigate("/login", { replace: true });
            onOpenChange(false);
            return;
          }
          onDeleted?.(user.id);
          close();
        },
        onError: (mutationError) => {
          if (mutationError instanceof AppError && mutationError.status === 404) {
            setError(t("delete.errors.notFound"));
            void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
            return;
          }
          if (mutationError instanceof AppError && mutationError.status === 403) {
            setError(t("delete.errors.forbidden"));
            return;
          }
          toast.error(tCommon("error.genericMessage"));
        },
      },
    );
  };

  return (
    <AlertDialog open={open && user !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {user === null
              ? null
              : t("delete.confirmBody", { name: `${user.name} ${user.lastName}` })}
          </AlertDialogDescription>
          {user === null ? null : (
            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <Button
                type="button"
                variant="ghost"
                className="h-auto justify-start gap-1 p-0 text-sm font-medium text-foreground underline decoration-dotted underline-offset-4"
                aria-label={t("delete.useEmail")}
                title={t("delete.useEmail")}
                onClick={() => {
                  setConfirmation(user.email);
                }}
              >
                {user.email}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-auto justify-start gap-1 p-0 text-sm font-medium text-foreground underline decoration-dotted underline-offset-4"
                aria-label={t("delete.useUserName")}
                title={t("delete.useUserName")}
                onClick={() => {
                  setConfirmation(user.userName);
                }}
              >
                {user.userName}
              </Button>
              <p className="text-xs text-muted-foreground">{t("delete.clickHint")}</p>
            </div>
          )}
        </AlertDialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="delete-user-confirmation">{t("delete.confirmPhrase")}</Label>
          <Input
            id="delete-user-confirmation"
            type="text"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              setError(null);
            }}
            aria-invalid={error !== null}
          />
          {error === null ? null : (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              close();
            }}
          >
            {t("edit.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={remove.isPending || !matches(confirmation)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {t("delete.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
