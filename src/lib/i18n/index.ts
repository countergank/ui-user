import i18next, { type i18n as I18nInstance, type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

import { defaultLanguage, defaultNamespace, languages, namespaces, resources } from "./resources";

const baseOptions = {
  resources,
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: languages,
  ns: namespaces,
  defaultNS: defaultNamespace,
  fallbackNS: defaultNamespace,
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
} satisfies InitOptions;

export function createI18nInstance(options: InitOptions = {}): I18nInstance {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next);
  void instance.init({
    ...baseOptions,
    ...options,
  });

  return instance;
}

export const i18n = createI18nInstance();

export { defaultLanguage, defaultNamespace, languages, namespaces, resources } from "./resources";
export type { AppLanguage, AppNamespace, I18nResources } from "./resources";
