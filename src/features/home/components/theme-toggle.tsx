import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { selectTheme, useUiStore } from "@/stores/use-ui-store";

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useUiStore(selectTheme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  // The accessible name describes the action (the theme being switched to);
  // the visible label names the current theme. Both are resource-driven (COU-253).
  const targetTheme = t(isDark ? "home.theme.light" : "home.theme.dark");
  const currentTheme = t(isDark ? "home.theme.dark" : "home.theme.light");

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={t("home.theme.switchTo", { theme: targetTheme })}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      {t("home.theme.current", { theme: currentTheme })}
    </Button>
  );
}
