import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { type ThemePreference, nextPreference } from "@/lib/theme/theme";
import { selectTheme, useUiStore } from "@/stores/use-ui-store";

const THEME_ICONS: Record<ThemePreference, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const THEME_MODE_KEYS: Record<
  ThemePreference,
  "shell.theme.light" | "shell.theme.dark" | "shell.theme.system"
> = {
  light: "shell.theme.light",
  dark: "shell.theme.dark",
  system: "shell.theme.system",
};

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const preference = useUiStore(selectTheme);
  const setTheme = useUiStore((state) => state.setTheme);

  const Icon = THEME_ICONS[preference];
  const next = nextPreference(preference);
  const actionLabel = t("shell.theme.switchTo", { mode: t(THEME_MODE_KEYS[next]) });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="text-muted-foreground"
      aria-label={actionLabel}
      title={actionLabel}
      onClick={() => {
        setTheme(next);
      }}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
