import { useMemo } from "react";

/**
 * Extracted reusable logic for the home feature (comp-003 / ARCH-3).
 * Container components consume this hook instead of inlining derived state.
 */
export function useGreeting(now: Date = new Date()) {
  return useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [now]);
}
