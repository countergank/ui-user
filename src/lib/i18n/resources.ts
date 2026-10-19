import {
  type AuthTranslationTree,
  type LandingTranslationTree,
  type TranslationTree,
  en,
} from "./locales/en";
import { es } from "./locales/es";
import { pt } from "./locales/pt";

export const defaultLanguage = "en";

export const languages = ["en", "es", "pt"] as const;
export type AppLanguage = (typeof languages)[number];

export const defaultNamespace = "common";
export const namespaces = [defaultNamespace, "auth", "landing"] as const;
export type AppNamespace = (typeof namespaces)[number];

/**
 * Composed language bundles. `satisfies` keeps the exported type precise while forcing
 * every declared language to ship a complete `TranslationTree`.
 */
const bundles = { en, es, pt } satisfies Record<
  AppLanguage,
  { common: TranslationTree; auth: AuthTranslationTree; landing: LandingTranslationTree }
>;

export const resources = bundles;

export type I18nResources = (typeof resources)[typeof defaultLanguage];
