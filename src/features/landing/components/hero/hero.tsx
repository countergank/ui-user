import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { ProductPreview } from "./product-preview";

const HERO_CHIPS = ["jwt", "rbac", "audit"] as const;

export function LandingHero() {
  const { t } = useTranslation("landing");

  return (
    <section id="producto" className="w-full bg-background py-[84px]">
      <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-16 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
        <div className="flex flex-col items-start gap-6">
          <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
            {t("hero.eyebrow")}
          </p>
          <h1 className="max-w-xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
            {t("hero.headline")}
          </h1>
          <p className="max-w-prose text-lg text-muted-foreground">{t("hero.lead")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link to="/login">{t("nav.signIn")}</Link>
            </Button>
            <a
              href="#capacidades"
              className="inline-flex h-9 items-center text-sm font-medium underline-offset-4 hover:underline"
            >
              {t("hero.ctaCapabilities")}
            </a>
          </div>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {HERO_CHIPS.map((chip) => (
              <li key={chip} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check aria-hidden="true" className="size-3 shrink-0 text-success" />
                {t(`hero.chips.${chip}`)}
              </li>
            ))}
          </ul>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
