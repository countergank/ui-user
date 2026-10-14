// Tests for `startThemeSync()` — the imperative bridge between the persisted
// preference, the OS color scheme, and the DOM. No React involved: the sync reads
// `uiStore` directly (that is the contract the composition root relies on).
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { selectTheme, uiStore } from "@/stores/use-ui-store";
import { matchMediaStub } from "@/test/setup";

import { THEME_STORAGE_KEY } from "./theme";
import { startThemeSync } from "./theme-sync";

let stopThemeSync: (() => void) | undefined;

function start(): void {
  stopThemeSync = startThemeSync();
}

function htmlHasDarkClass(): boolean {
  return document.documentElement.classList.contains("dark");
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  stopThemeSync?.();
  stopThemeSync = undefined;
});

describe("startThemeSync hydration", () => {
  it("hydrates a stored dark preference into the store and the DOM", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    start();

    expect(selectTheme(uiStore.getState())).toBe("dark");
    expect(htmlHasDarkClass()).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("hydrates a stored light preference into the store and the DOM", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    start();

    expect(selectTheme(uiStore.getState())).toBe("light");
    expect(htmlHasDarkClass()).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it('defaults to "system" on a first visit with a light OS', () => {
    start();

    expect(selectTheme(uiStore.getState())).toBe("system");
    expect(htmlHasDarkClass()).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it('respects a "system" preference against a dark OS', () => {
    matchMediaStub.setDark(true);

    start();

    expect(selectTheme(uiStore.getState())).toBe("system");
    expect(htmlHasDarkClass()).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("still hydrates and applies when matchMedia is unavailable", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    matchMediaStub.restore();

    try {
      start();

      expect(selectTheme(uiStore.getState())).toBe("dark");
      expect(htmlHasDarkClass()).toBe(true);
    } finally {
      matchMediaStub.install();
    }
  });
});

describe("startThemeSync store subscription", () => {
  it("re-applies the theme when setTheme changes the preference", () => {
    start();

    uiStore.getState().setTheme("dark");
    expect(htmlHasDarkClass()).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");

    uiStore.getState().setTheme("light");
    expect(htmlHasDarkClass()).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("persists the preference set through the store", () => {
    start();

    uiStore.getState().setTheme("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it('resolves a switch back to "system" against the current OS scheme', () => {
    matchMediaStub.setDark(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    start();
    expect(htmlHasDarkClass()).toBe(false);

    uiStore.getState().setTheme("system");
    expect(htmlHasDarkClass()).toBe(true);
  });
});

describe("startThemeSync OS subscription", () => {
  it('follows a live OS change while the preference is "system"', () => {
    start();
    expect(htmlHasDarkClass()).toBe(false);

    matchMediaStub.setDark(true);
    expect(htmlHasDarkClass()).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");

    matchMediaStub.setDark(false);
    expect(htmlHasDarkClass()).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it('ignores an OS change to dark when the preference is pinned to "light"', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    start();
    matchMediaStub.setDark(true);

    expect(htmlHasDarkClass()).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it('ignores an OS change to light when the preference is pinned to "dark"', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    start();
    matchMediaStub.setDark(false);

    expect(htmlHasDarkClass()).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});

describe("startThemeSync teardown", () => {
  it("removes the OS listener so no DOM mutation happens after unsubscribe", () => {
    start();
    expect(matchMediaStub.listenerCount()).toBe(1);

    stopThemeSync?.();
    stopThemeSync = undefined;
    expect(matchMediaStub.listenerCount()).toBe(0);

    matchMediaStub.setDark(true);
    expect(htmlHasDarkClass()).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("removes the store listener so later setTheme calls stop touching the DOM", () => {
    start();
    stopThemeSync?.();
    stopThemeSync = undefined;

    uiStore.getState().setTheme("dark");

    expect(selectTheme(uiStore.getState())).toBe("dark");
    expect(htmlHasDarkClass()).toBe(false);
  });

  it("is safe to call the unsubscribe function twice", () => {
    start();
    const stop = stopThemeSync;

    expect(() => {
      stop?.();
      stop?.();
    }).not.toThrow();
    expect(matchMediaStub.listenerCount()).toBe(0);
  });
});
