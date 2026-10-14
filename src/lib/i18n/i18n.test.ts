import { describe, expect, it } from "vitest";

import { createI18nInstance, defaultLanguage, defaultNamespace, i18n } from "./index";

describe("i18n foundation", () => {
  it("initializes the app instance with bundled English resources", () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe(defaultLanguage);
    expect(i18n.options.defaultNS).toBe(defaultNamespace);
    expect(i18n.t("sample.initialized")).toBe("Internationalization is ready.");
    expect(i18n.t("shell.skipLink")).toBe("Skip to main content");
    expect(i18n.t("shell.routeAnnouncer.loaded", { title: "About" })).toBe("About page loaded");
  });

  it("falls back to English resources for unsupported requested languages", () => {
    // "es" is a supported language, so it cannot prove fallback behavior anymore.
    const unsupportedLanguage = "de";
    const instance = createI18nInstance({ lng: unsupportedLanguage });

    expect(instance.isInitialized).toBe(true);
    expect(instance.resolvedLanguage).toBe(defaultLanguage);
    expect(instance.t("meta.productName")).toBe("Countergank User");
  });
});
