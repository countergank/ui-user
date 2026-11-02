import { afterEach, describe, expect, it, vi } from "vitest";

import { createI18nInstance, defaultLanguage, defaultNamespace, i18n } from "./index";
import { LANGUAGE_STORAGE_KEY } from "./language";

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

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
    const unsupportedLanguage = "de";
    const instance = createI18nInstance({ lng: unsupportedLanguage });

    expect(instance.isInitialized).toBe(true);
    expect(instance.resolvedLanguage).toBe(defaultLanguage);
    expect(instance.t("meta.productName")).toBe("Countergank User");
  });

  it("adopts the browser language when no preference is stored", () => {
    vi.stubGlobal("navigator", { language: "es-AR" });

    const instance = createI18nInstance();

    expect(instance.language).toBe("es");
  });

  it("keeps English for an unsupported browser language", () => {
    vi.stubGlobal("navigator", { language: "de-DE" });

    const instance = createI18nInstance();

    expect(instance.language).toBe(defaultLanguage);
  });

  it("prefers the stored preference over the browser language", () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, "pt");
    vi.stubGlobal("navigator", { language: "es-AR" });

    const instance = createI18nInstance();

    expect(instance.language).toBe("pt");
  });
});
