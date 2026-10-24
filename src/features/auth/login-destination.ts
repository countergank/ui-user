import type { Location } from "react-router-dom";

export function loginDestination(location: Pick<Location, "pathname" | "search" | "hash">): string {
  const destination = `${location.pathname}${location.search}${location.hash}`;

  return `/login?redirect=${encodeURIComponent(destination)}`;
}
