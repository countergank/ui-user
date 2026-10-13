import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { type ThemePreference, nextPreference } from "@/lib/theme/theme";
import { selectTheme, useUiStore } from "@/stores/use-ui-store";

/**
 * The icon that stands for each preference — `Sun` for `light`, `Moon` for
 * `dark`, `Monitor` for `system`.
 *
 * The icon reflects the stored **preference**, never the resolved theme: with
 * `system` selected the monitor stays on screen even while the OS asks for dark,
 * so the user can tell `system` is still active rather than guessing why the
 * page went dark.
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
 * Single-button theme control (COU-270).
 *
 * One compact ghost icon button that **cycles** through the three preferences in
 * {@link THEME_CYCLE} order (`light → dark → system → light`), replacing the
 * three-segment control rejected on review. Cycling matters: a plain sun/moon
 * toggle would leave `system` (follow the OS) unreachable from the UI after the
 * first click, which would make the live `matchMedia` subscription in
 * `theme-sync.ts` dead code.
 *
 * The value is held in Zustand, not local state, so both the icon and the label
 * follow any external writer (the pre-paint hydration in `startThemeSync()`
 * included).
 *
 * Accessibility: the accessible name describes the **action** the click will
 * take — `Switch to Dark`, not `Dark`. With no room for a visible label the
 * `title` carries the same string for mouse users. Because the cycle order is
 * fixed, the announced action also determines the current state unambiguously
 * (`Dark` ⇒ currently `light`, `System` ⇒ currently `dark`, `Light` ⇒ currently
 * `system`). The icon is `aria-hidden` so it cannot pollute that name.
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
