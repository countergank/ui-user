import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { ForgotPasswordForm } from "./forgot-password-form";

export function ForgotPasswordPage() {
  const { t } = useTranslation("auth");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-[460px]">
        <CardHeader>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("forgot.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("forgot.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
