import { type AppLanguage, languages } from "./resources";

/**
 * Language preference persistence (COU-310, T9 / S12): same shape as the theme preference
 * in `src/lib/theme/theme.ts` — a namespaced key, a read that fails closed when storage is
 * blocked, and a write that never throws; the i18n instance reads it at creation.
 */
export const LANGUAGE_STORAGE_KEY = "countergank.ui.language";

export function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === "string" && (languages as readonly string[]).includes(value);
}

/** The stored preference, or `null` when there is none (or it is not a language we ship). */
export function readStoredLanguage(): AppLanguage | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return isAppLanguage(stored) ? stored : null;
  } catch {
    // Storage blocked (private mode, disabled cookies): the caller falls back to the default.
    return null;
  }
}

export function writeStoredLanguage(language: AppLanguage): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Losing the preference is acceptable; breaking the switch is not.
  }
}

/** Keep `<html lang>` truthful: assistive technology and axe both read it. */
export function applyDocumentLanguage(language: string): void {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}
