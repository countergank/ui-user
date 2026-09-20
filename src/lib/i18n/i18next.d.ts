import type { I18nResources, defaultNamespace } from "./resources";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNamespace;
    resources: I18nResources;
  }
}
