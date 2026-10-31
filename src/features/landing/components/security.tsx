import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const SECURITY_ITEMS = [
  { key: "jwt", icon: ShieldCheck },
  { key: "lockout", icon: Lock },
  { key: "emailChange", icon: Mail },
] as const;

export function Security() {
  const { t } = useTranslation("landing");

  return (
    <section
      id="seguridad"
      className="w-full bg-[hsl(var(--surface-row-alt))] py-[60px] text-foreground"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-6 sm:px-8 lg:px-16">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            {t("security.eyebrow")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {t("security.heading")}
          </h2>
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {SECURITY_ITEMS.map(({ key, icon: Icon }) => (
            <li key={key} className="flex flex-col gap-2 rounded-xl border bg-muted p-5">
              <Icon className="size-4 text-foreground" aria-hidden="true" />
              <h3 className="font-semibold tracking-tight text-foreground">
                {t(`security.items.${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`security.items.${key}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
