import { useTranslation } from "react-i18next";

import { ErrorView } from "@/components/error/error-view";
import { env, envMode } from "@/lib/env";
import { useHighlights } from "./api";
import { AppEnvBadge } from "./components/env-badge";
import { FeatureCards } from "./components/feature-cards";
import { Hero } from "./components/hero";
import { useGreeting } from "./hooks/use-greeting";

/**
 * Container for the home feature (ARCH-3): wires data fetching (TanStack Query)
 * and derived logic (hook) into the presentational components. Also demonstrates
 * the typed env gateway (ADR-11): `env`/`envMode` are imported here (the container
 * owns runtime env access) and passed down to the pure `AppEnvBadge`.
 */
export function HomePage() {
  const { t } = useTranslation();
  const greeting = useGreeting();
  const { data, isPending, isError, error, refetch } = useHighlights();

  if (isPending) {
    return (
      <p aria-busy="true" className="text-muted-foreground">
        {t("home.loading")}
      </p>
    );
  }

  if (isError) {
    return (
      <ErrorView
        title={t("home.error.highlightsUnavailable")}
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Hero title={t("home.hero.title", { greeting })} subtitle={t("home.hero.subtitle")} />
      <AppEnvBadge mode={envMode} apiBaseUrl={env.apiBaseUrl} />
      <FeatureCards features={data} />
    </div>
  );
}
