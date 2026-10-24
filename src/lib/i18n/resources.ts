import {
  type AuthTranslationTree,
  type ConsoleTranslationTree,
  type LandingTranslationTree,
  type TranslationTree,
  type UsersTranslationTree,
  en,
} from "./locales/en";
import { es } from "./locales/es";
import { pt } from "./locales/pt";

export const defaultLanguage = "en";

export const languages = ["en", "es", "pt"] as const;
export type AppLanguage = (typeof languages)[number];

export const defaultNamespace = "common";
export const namespaces = [defaultNamespace, "auth", "landing", "console", "users"] as const;
export type AppNamespace = (typeof namespaces)[number];

const bundles = { en, es, pt } satisfies Record<
  AppLanguage,
  {
    common: TranslationTree;
    auth: AuthTranslationTree;
    landing: LandingTranslationTree;
    console: ConsoleTranslationTree;
    users: UsersTranslationTree;
  }
>;

export const resources = bundles;

export type I18nResources = (typeof resources)[typeof defaultLanguage];
