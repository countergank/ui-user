import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AppLogo } from "@/components/branding/app-logo";
import { Button } from "@/components/ui/button";
import { docsUrl, repositoryUrl } from "@/lib/links";

/**
 * Landing hero (COU-310, T10 / S13). Answers, before a visitor scrolls: what is this
 * (heading and subtitle), who makes it (the mark), where to get it (the two calls to
 * action). No banner image, by decision — the copy carries the page.
 */
export function LandingHero() {
  const { t } = useTranslation("landing");

  return (
    <section className="overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/60 to-background px-6 py-12 sm:px-10 sm:py-16">
      <div className="flex flex-col items-start gap-6">
        <AppLogo className="h-14" />
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-prose text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <a href={repositoryUrl} rel="noreferrer" target="_blank">
              {t("hero.ctaRepository")}
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={docsUrl} rel="noreferrer" target="_blank">
              <BookOpen aria-hidden="true" />
              {t("hero.ctaDocs")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
