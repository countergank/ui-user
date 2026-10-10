import { QueryClient } from "@tanstack/react-query";

/**
 * Shared TanStack Query client (ADR-3 / STACK-5).
 * Configured for the template defaults: retries with exponential backoff,
 * GC and stale time tuned for a data-refetching SPA.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});
