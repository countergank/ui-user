import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function FinalCta() {
  const { t } = useTranslation("landing");

  return (
    <section className="w-full bg-muted py-[60px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-4 px-6 text-center sm:px-8 lg:px-16">
        <h2 className="font-display text-3xl font-bold tracking-tight">{t("cta.heading")}</h2>
        <p className="max-w-prose text-muted-foreground">{t("cta.lead")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/login">{t("nav.signIn")}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/about">{t("nav.about")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
