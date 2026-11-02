import { afterEach, describe, expect, it, vi } from "vitest";

import { detectBrowserLanguage } from "./language";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("detectBrowserLanguage", () => {
  it.each([
    ["es-AR", "es"],
    ["es", "es"],
    ["pt-BR", "pt"],
    ["en-US", "en"],
    ["en", "en"],
    ["de-DE", null],
    ["fr", null],
  ])("maps %s to %s", (navigatorLanguage, expected) => {
    vi.stubGlobal("navigator", { language: navigatorLanguage });

    expect(detectBrowserLanguage()).toBe(expected);
  });

  it("returns null when navigator is unavailable", () => {
    vi.stubGlobal("navigator", undefined);

    expect(detectBrowserLanguage()).toBeNull();
  });

  it("returns null when navigator.language is not a string", () => {
    vi.stubGlobal("navigator", { language: 42 });

    expect(detectBrowserLanguage()).toBeNull();
  });
});
