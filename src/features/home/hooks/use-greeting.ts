import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Extracted reusable logic for the home feature (comp-003 / ARCH-3).
 * Container components consume this hook instead of inlining derived state.
 * The time-based greeting is resource-driven (COU-253): the hook returns the
 * translated greeting for the current hour from the i18n resources.
 */
export function useGreeting(now: Date = new Date()) {
  const { t } = useTranslation();

  return useMemo(() => {
    const hour = now.getHours();
    if (hour < 12) return t("home.greeting.morning");
    if (hour < 18) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  }, [now, t]);
}
