import { useQuery } from "@tanstack/react-query";

import { AppError } from "@/lib/errors";

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
}

/**
 * Typed mock data source for the sample feature.
 *
 * In a real application this module would call an HTTP client defined in
 * `src/lib/api-client` instead of returning a static payload. The shape and
 * query pattern (typed, parallel, TanStack Query) stay the same.
 */
const MOCK_HIGHLIGHTS: FeatureHighlight[] = [
  {
    id: "feature-shell",
    title: "Accessible shell",
    description:
      "Landmarks, skip link, route announcer, and focus management baked into the layout.",
  },
  {
    id: "feature-data",
    title: "Server state",
    description: "TanStack Query wired through a QueryClientProvider with typed hooks and errors.",
  },
  {
    id: "feature-routing",
    title: "Lazy routes",
    description: "React Router with per-route code splitting and Suspense boundaries.",
  },
];

const HIGHLIGHTS_QUERY_KEY = ["home", "highlights"] as const;

function fetchHighlights(): Promise<FeatureHighlight[]> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (typeof window !== "undefined" && window.location.hash === "#fail") {
        reject(new AppError("Demo failure", { code: "HIGHLIGHTS_UNAVAILABLE" }));
        return;
      }
      resolve(MOCK_HIGHLIGHTS);
    }, 200);
  });
}

export function useHighlights(enabled = true) {
  return useQuery({
    queryKey: HIGHLIGHTS_QUERY_KEY,
    queryFn: fetchHighlights,
    enabled,
  });
}
