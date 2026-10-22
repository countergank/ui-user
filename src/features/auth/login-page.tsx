import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { LoginForm } from "./login-form";

/**
 * Login page shell (COU-281, T3): the only screen rendered outside `AppShell` — a login
 * gate has no product navigation — so it brings its own `<main>` landmark, with copy from
 * the `auth` namespace (S4) and the centered `max-w-sm` card the design asks for (S3).
 */
export function LoginPage() {
  const { t } = useTranslation("auth");

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          {/* A real `h1`: the page is a separate document from the shell, so it needs its
              own top-level heading rather than the shell's route title. */}
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
