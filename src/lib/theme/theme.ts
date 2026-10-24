export const THEME_STORAGE_KEY = "countergank.ui.theme";

export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export type ThemePreference = "system" | "light" | "dark";

export type ResolvedTheme = "light" | "dark";

export const THEME_CYCLE: readonly ThemePreference[] = ["light", "dark", "system"];

const DEFAULT_PREFERENCE: ThemePreference = "system";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

/**
 * @returns The persisted preference, or `"system"` when storage is absent, corrupt or unreadable.
 */
export function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : DEFAULT_PREFERENCE;
  } catch {
    return DEFAULT_PREFERENCE;
  }
}

/**
 * @param preference - `"system"`, `"light"` or `"dark"`, persisted as a bare string.
 * @returns void; a failed write is swallowed because the in-memory store already holds the choice.
 */
export function writeStoredPreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    // eslint-disable-next-line no-empty -- storage is a cache, not a source of truth.
  } catch {}
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

export function nextPreference(current: ThemePreference): ThemePreference {
  const index = THEME_CYCLE.indexOf(current);

  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

/**
 * @returns Whether the OS currently asks for a dark scheme; an unavailable or throwing
 * `matchMedia` counts as light.
 */
export function systemPrefersDark(): boolean {
  try {
    if (typeof window.matchMedia !== "function") {
      return false;
    }

    return window.matchMedia(DARK_MEDIA_QUERY).matches;
  } catch {
    return false;
  }
}

/**
 * @param resolved - `"light"` or `"dark"`; `system` must be resolved before calling.
 * @returns void; toggles the `dark` class on `<html>` and declares the matching `color-scheme`.
 */
export function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}
