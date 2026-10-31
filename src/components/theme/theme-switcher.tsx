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

const MODES: readonly ThemePreference[] = ["system", "light", "dark"];

interface ThemeSwitcherProps {
  variant?: "toggle" | "segmented";
}

/**
 * @param variant - `toggle` cycles through the three modes in a single button; `segmented`
 * renders the three modes side by side, which is how the console topbar shows them.
 */
export function ThemeSwitcher({ variant = "toggle" }: ThemeSwitcherProps = {}) {
  const { t } = useTranslation();
  const preference = useUiStore(selectTheme);
  const setTheme = useUiStore((state) => state.setTheme);

  if (variant === "segmented") {
    return (
      <fieldset
        aria-label={t("shell.theme.group")}
        className="flex h-9 items-center gap-0.5 rounded-md border border-input bg-muted p-0.5"
      >
        {MODES.map((mode) => {
          const Icon = THEME_ICONS[mode];
          const isActive = preference === mode;

          return (
            <button
              key={mode}
              type="button"
              aria-label={t(THEME_MODE_KEYS[mode])}
              aria-pressed={isActive}
              title={t(THEME_MODE_KEYS[mode])}
              onClick={() => {
                setTheme(mode);
              }}
              className={`flex h-7 w-7 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </button>
          );
        })}
      </fieldset>
    );
  }

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
