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
  const greeting = useGreeting();
  const { data, isPending, isError, error, refetch } = useHighlights();

  if (isPending) {
    return (
      <p aria-busy="true" className="text-muted-foreground">
        Loading highlights…
      </p>
    );
  }

  if (isError) {
    return (
      <ErrorView
        title="Could not load template highlights"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Hero
        title={`${greeting}! This is the standard frontend template`}
        subtitle="A screaming, feature-based React 19 architecture with an accessible shell, server state, and typed error handling."
      />
      <AppEnvBadge mode={envMode} apiBaseUrl={env.apiBaseUrl} />
      <FeatureCards features={data} />
    </div>
  );
}
