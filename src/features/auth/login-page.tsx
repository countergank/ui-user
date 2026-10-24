import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { LoginForm } from "./login-form";

export function LoginPage() {
  const { t } = useTranslation("auth");

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-2xl font-semibold leading-none tracking-tight">{t("login.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
