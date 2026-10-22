import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { type ThemePreference, nextPreference } from "@/lib/theme/theme";
import { selectTheme, useUiStore } from "@/stores/use-ui-store";

/**
 * The icon that stands for each preference — `Sun` for `light`, `Moon` for
 * `dark`, `Monitor` for `system`. It reflects the stored **preference**, never the
 * resolved theme, so `system` stays visible even while the OS asks for dark.
 */
const THEME_ICONS: Record<ThemePreference, LucideIcon> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/** The `shell.theme.*` leaf that names one preference, for the action label. */
const THEME_MODE_KEYS: Record<
  ThemePreference,
  "shell.theme.light" | "shell.theme.dark" | "shell.theme.system"
> = {
  light: "shell.theme.light",
  dark: "shell.theme.dark",
  system: "shell.theme.system",
};

/**
 * Single-button theme control (COU-270): cycles {@link THEME_CYCLE} so `system` (follow
 * the OS) stays reachable; the value lives in Zustand so icon and label follow any
 * external writer. The accessible name names the **action** (`Switch to Dark`).
 */
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
