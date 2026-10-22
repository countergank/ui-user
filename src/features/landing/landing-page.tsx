import { useTranslation } from "react-i18next";

import { FeatureGrid } from "./components/feature-grid";
import { LandingHero } from "./components/hero";
import { Quickstart } from "./components/quickstart";
import { StackBadges } from "./components/stack-badges";

/**
 * Informational home of the project (COU-310, T10 / ADR-13). Static content on purpose:
 * a public surface never calls the API (S7); every string comes from the `landing`
 * namespace (S5), every colour is a token utility (S8), and the section order is deliberate.
 */
export function LandingPage() {
  const { t } = useTranslation("landing");

  return (
    // One centered column instead of prose stranded on the left of a wide container: the
    // page reads as a designed document, not as text that ran out of width.
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-16">
      <LandingHero />

      <div className="grid gap-10 sm:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">{t("what.title")}</h2>
          <p className="text-muted-foreground">{t("what.body")}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">{t("service.title")}</h2>
          <p className="text-muted-foreground">{t("service.body")}</p>
        </section>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">{t("features.title")}</h2>
        <FeatureGrid />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{t("quickstart.title")}</h2>
        <Quickstart />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{t("stack.title")}</h2>
        <StackBadges />
      </section>
    </div>
  );
}
