import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MailX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { confirmEmailChange } from "./api";

/**
 * @returns The mutation that applies the pending email change; the token travels in the
 * email link, so failure here means the change cannot complete from this device.
 */
function useConfirmEmailChange() {
  return useMutation({
    mutationFn: (token: string) => confirmEmailChange(token),
  });
}

/**
 * @returns The final step of the email change flow, opened from the email link:
 * confirms the change with the URL token on mount, without a session (the backend
 * signs out every session once the change applies), and renders the success or the
 * invalid-link state.
 */
export function ConfirmEmailPage() {
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const confirmMutation = useConfirmEmailChange();
  const confirmEmail = confirmMutation.mutate;
  const [settled, setSettled] = useState(false);
  const firedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (token === null || settled || firedForToken.current === token || confirmMutation.isPending) {
      return;
    }

    firedForToken.current = token;
    confirmEmail(token, {
      onSettled: () => {
        setSettled(true);
      },
    });
  }, [token, settled, confirmEmail, confirmMutation.isPending]);

  if (token === null || confirmMutation.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-[460px]">
          <CardHeader className="items-center text-center">
            <MailX aria-hidden="true" className="size-10 text-muted-foreground" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("emailChange.invalidTokenTitle")}
            </h1>
            <p role="alert" className="text-sm text-muted-foreground">
              {t("emailChange.errors.invalidToken")}
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">{t("emailChange.goToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (confirmMutation.isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-[460px]">
          <CardHeader className="items-center text-center">
            <CheckCircle2 aria-hidden="true" className="size-10 text-green-600" />
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("emailChange.title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("emailChange.success")}</p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">{t("emailChange.goToLogin")}</Link>
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
            {t("emailChange.title")}
          </h1>
        </CardHeader>
      </Card>
    </main>
  );
}
