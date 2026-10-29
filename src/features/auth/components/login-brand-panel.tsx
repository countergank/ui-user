import { useTranslation } from "react-i18next";

import { Check } from "lucide-react";

const BULLET_KEYS = ["rbac", "audit", "revocation", "templates"] as const;

export function LoginBrandPanel() {
  const { t } = useTranslation("auth");

  return (
    <aside
      aria-label={t("login.brand.eyebrow")}
      className="hidden flex-col justify-between gap-10 bg-sidebar p-8 text-sidebar-foreground lg:flex lg:p-16"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-sidebar-highlight">
          {t("login.brand.eyebrow")}
        </p>
        <p className="flex items-center gap-2 rounded-full bg-sidebar-accent px-2.5 py-1 font-mono text-xs text-sidebar-foreground">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
          {t("login.brand.status")}
        </p>
      </div>
      <div className="flex flex-col gap-6">
        <p className="font-display text-3xl font-bold leading-tight text-sidebar-foreground xl:text-4xl">
          {t("login.brand.headline")}
        </p>
        <p className="text-sm leading-6 text-sidebar-subtle">{t("login.brand.lead")}</p>
        <ul className="flex flex-col gap-3">
          {BULLET_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2.5 text-sm text-sidebar-muted">
              <span
                aria-hidden="true"
                className="flex h-5 w-5 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-highlight"
              >
                <Check className="h-3 w-3" />
              </span>
              {t(`login.brand.bullets.${key}`)}
            </li>
          ))}
        </ul>
      </div>
      <p className="flex items-center gap-2.5 border-t border-sidebar-border pt-5 font-mono text-xs text-sidebar-faint">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
        {t("login.brand.services")}
      </p>
    </aside>
  );
}
