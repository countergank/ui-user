import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { LoginBrandPanel } from "./components/login-brand-panel";
import { LoginForm } from "./login-form";

export function LoginPage() {
  const { t } = useTranslation("auth");

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[43%_57%]">
      <div className="flex flex-col p-6 sm:p-10 lg:p-16">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground"
          >
            CG
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
            Countergank
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center py-12">
          <h1 className="font-display text-3xl font-bold tracking-tight">{t("login.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("login.subtitle")}</p>
          <div className="mt-8 max-w-[460px]">
            <LoginForm />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>{t("login.footer.copyright", { year: 2026 })}</span>
          <Link to="/" className="underline-offset-4 hover:underline">
            {t("login.footer.backToSite")}
          </Link>
        </div>
      </div>
      <LoginBrandPanel />
    </main>
  );
}
