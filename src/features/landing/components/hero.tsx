import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import { ProductPreview } from "./product-preview";

const HERO_CHIPS = ["jwt", "rbac", "audit"] as const;

export function LandingHero() {
  const { t } = useTranslation("landing");

  return (
    <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div className="flex flex-col items-start gap-6">
        <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
          {t("hero.eyebrow")}
        </p>
        <h1 className="max-w-xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
          {t("hero.headline")}
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground">{t("hero.lead")}</p>
        <Button asChild>
          <a href="#capacidades">{t("hero.ctaCapabilities")}</a>
        </Button>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {HERO_CHIPS.map((chip) => (
            <li key={chip} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden="true" className="size-2.5 rounded-full border border-success" />
              {t(`hero.chips.${chip}`)}
            </li>
          ))}
        </ul>
      </div>
      <ProductPreview />
    </section>
  );
}
