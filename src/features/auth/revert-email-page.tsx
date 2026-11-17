import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, MailX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AppError } from "@/lib/errors";

import { revertEmailChange } from "./api";

function isRevertWindowExpired(error: unknown): boolean {
  return error instanceof AppError && error.status === 410 && error.code === "UA-AUTH-011";
}

/**
 * @returns The mutation that rolls back the confirmed email change; the token travels in
 * the notice that reaches the previous inbox, so failure here means the change cannot be
 * reverted from this device.
 */
function useRevertEmailChange() {
  return useMutation({
    mutationFn: (token: string) => revertEmailChange(token),
  });
}

/**
 * @returns The public revert screen opened from the "Revert the change" button in the
 * notice that reaches the previous inbox: reverts the email change with the URL token
 * on mount, without a session, and renders the success, the window-expired (410
 * UA-AUTH-011) or the invalid-token state.
 */
export function RevertEmailPage() {
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const revertMutation = useRevertEmailChange();
  const revertEmail = revertMutation.mutate;
  const [settled, setSettled] = useState(false);
  const firedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (token === null || settled || firedForToken.current === token || revertMutation.isPending) {
      return;
    }

    firedForToken.current = token;
    revertEmail(token, {
      onSettled: () => {
        setSettled(true);
      },
    });
  }, [token, settled, revertEmail, revertMutation.isPending]);

  if (token === null || revertMutation.isError) {
    const windowExpired = isRevertWindowExpired(revertMutation.error);

    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-[460px]">
          <CardHeader className="items-center text-center">
            {windowExpired ? (
              <Clock aria-hidden="true" className="size-10 text-muted-foreground" />
            ) : (
              <MailX aria-hidden="true" className="size-10 text-muted-foreground" />
            )}
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {windowExpired
                ? t("emailRevert.windowExpiredTitle")
                : t("emailRevert.invalidTokenTitle")}
            </h1>
            <p role="alert" className="text-sm text-muted-foreground">
              {windowExpired
                ? t("emailRevert.errors.windowExpired")
                : t("emailRevert.errors.invalidToken")}
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">{t("emailRevert.goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (revertMutation.isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-[460px]">
          <CardHeader className="items-center text-center">
            <CheckCircle2 aria-hidden="true" className="size-10 text-green-600" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("emailRevert.title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("emailRevert.success")}</p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">{t("emailRevert.goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-[460px]">
        <CardHeader className="items-center text-center">
          <Loader2 aria-hidden="true" className="size-10 animate-spin text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {t("emailRevert.title")}
          </h1>
        </CardHeader>
      </Card>
    </main>
  );
}
