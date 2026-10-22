// Theme primitives (COU-270).
//
// `index.html` inlines an equivalent pre-paint script (it cannot import this
// module); keep the storage key, the preference vocabulary and the media query
// in sync with it (`theme.test.ts` guards the drift).

/** `localStorage` key holding the user's theme preference. */
export const THEME_STORAGE_KEY = "countergank.ui.theme";

/** The media query that reports the OS color-scheme preference. */
export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

/** What the user chose: follow the OS, or pin one of the two themes. */
export type ThemePreference = "system" | "light" | "dark";

/** What the DOM actually renders. `system` is always resolved before use. */
export type ResolvedTheme = "light" | "dark";

/**
 * One-button cycle order: `light → dark → system`, wrapping back to `light`.
 * `light` leads because `system` is the default, so the first activation pins
 * `light`.
 */
export const THEME_CYCLE: readonly ThemePreference[] = ["light", "dark", "system"];

const DEFAULT_PREFERENCE: ThemePreference = "system";

/**
 * Is this stored value a theme preference we understand? Deliberately narrow:
 * anything that is not exactly one of the three literals is treated as corrupt.
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

/**
 * Read the persisted preference. Absent, corrupt, or unreadable storage all
 * resolve to `"system"` — a broken `localStorage` (Safari private mode, blocked
 * cookies, disabled storage) must never throw, let alone break the app.
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
 * Persist the preference as a bare string (`"system"`, `"light"`, `"dark"`).
 * Best-effort: a failed write (quota, disabled storage) is swallowed because the
 * in-memory store already holds the user's choice for this session.
 */
export function writeStoredPreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Intentionally ignored: storage is a cache, not a source of truth.
  }
}

/** Pure resolution: `system` defers to the OS, an explicit choice wins. */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

/** Wraps from the end of {@link THEME_CYCLE} back to its start (`system` → `light`). */
export function nextPreference(current: ThemePreference): ThemePreference {
  const index = THEME_CYCLE.indexOf(current);

  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

/**
 * Does the OS currently ask for a dark scheme? Unavailable `matchMedia` (and a
 * throwing one) is treated as "no preference", i.e. light.
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
 * The single DOM side effect: toggle the `dark` class Tailwind's `darkMode:
 * ["class"]` keys off, and declare the matching `color-scheme` so the browser
 * paints native UI (scrollbars, form controls, canvas) to match.
 */
export function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}
