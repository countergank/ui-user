import {
  KeyRound,
  Languages,
  Mail,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const CAPABILITIES = [
  { key: "rbac", icon: ShieldCheck },
  { key: "audit", icon: ScrollText },
  { key: "sessions", icon: KeyRound },
  { key: "email", icon: Mail },
  { key: "i18n", icon: Languages },
  { key: "params", icon: SlidersHorizontal },
] as const;

export function Capabilities() {
  const { t } = useTranslation("landing");

  return (
    <section id="capacidades" className="w-full bg-[hsl(var(--surface-raised))] py-[76px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-6 sm:px-8 lg:px-16">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            {t("capabilities.eyebrow")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {t("capabilities.heading")}
          </h2>
          <p className="max-w-prose text-muted-foreground">{t("capabilities.lead")}</p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="flex flex-col gap-2.5 rounded-[14px] border bg-background p-[22px]"
            >
              <span
                aria-hidden="true"
                className="flex size-[38px] items-center justify-center rounded-[10px] bg-[hsl(var(--primary-soft))]"
              >
                <Icon className="size-[18px] text-primary" />
              </span>
              <h3 className="font-semibold tracking-tight">
                {t(`capabilities.items.${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t(`capabilities.items.${key}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
