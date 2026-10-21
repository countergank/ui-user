import type { Location } from "react-router-dom";

/**
 * One login URL builder for the three callers (guard, boundary, expiry bridge), encoded
 * exactly once: the login screen decodes with `URLSearchParams` and re-validates through
 * `safe-redirect.ts` (COU-323).
 */
export function loginDestination(location: Pick<Location, "pathname" | "search" | "hash">): string {
  const destination = `${location.pathname}${location.search}${location.hash}`;

  return `/login?redirect=${encodeURIComponent(destination)}`;
}
