import { type AppLanguage, languages } from "./resources";

export const LANGUAGE_STORAGE_KEY = "countergank.ui.language";

export function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === "string" && (languages as readonly string[]).includes(value);
}

export function readStoredLanguage(): AppLanguage | null {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return isAppLanguage(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeStoredLanguage(language: AppLanguage): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    // eslint-disable-next-line no-empty -- losing the stored preference is acceptable; breaking the language switch is not.
  } catch {}
}

export function applyDocumentLanguage(language: string): void {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
}
