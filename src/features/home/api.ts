import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AppError } from "@/lib/errors";

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
}

interface FeatureHighlightCopyKeys {
  id: string;
  titleKey:
    | "home.highlights.items.shell.title"
    | "home.highlights.items.data.title"
    | "home.highlights.items.routing.title";
  descriptionKey:
    | "home.highlights.items.shell.description"
    | "home.highlights.items.data.description"
    | "home.highlights.items.routing.description";
}

/**
 * Typed mock data source for the sample feature.
 *
 * In a real application this module would call an HTTP client defined in
 * `src/lib/api-client` instead of returning a static payload. The shape and
 * query pattern (typed, parallel, TanStack Query) stay the same.
 */
const MOCK_HIGHLIGHTS: FeatureHighlightCopyKeys[] = [
  {
    id: "feature-shell",
    titleKey: "home.highlights.items.shell.title",
    descriptionKey: "home.highlights.items.shell.description",
  },
  {
    id: "feature-data",
    titleKey: "home.highlights.items.data.title",
    descriptionKey: "home.highlights.items.data.description",
  },
  {
    id: "feature-routing",
    titleKey: "home.highlights.items.routing.title",
    descriptionKey: "home.highlights.items.routing.description",
  },
];

const HIGHLIGHTS_QUERY_KEY = ["home", "highlights"] as const;

function fetchHighlights(errorMessage: string): Promise<FeatureHighlightCopyKeys[]> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (typeof window !== "undefined" && window.location.hash === "#fail") {
        reject(new AppError(errorMessage, { code: "HIGHLIGHTS_UNAVAILABLE" }));
        return;
      }
      resolve(MOCK_HIGHLIGHTS);
    }, 200);
  });
}

export function useHighlights(enabled = true) {
  const { i18n, t } = useTranslation();
  const query = useQuery({
    queryKey: [...HIGHLIGHTS_QUERY_KEY, i18n.resolvedLanguage],
    queryFn: () => fetchHighlights(t("home.error.demoFailure")),
    enabled,
  });

  const data = useMemo(
    () =>
      query.data?.map((feature) => ({
        id: feature.id,
        title: t(feature.titleKey),
        description: t(feature.descriptionKey),
      })) ?? [],
    [query.data, t],
  );

  return { ...query, data };
}
