import { beforeEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "@/lib/theme/theme";

import { initialState, selectSidebarOpen, selectTheme, uiStore } from "./use-ui-store";

describe("uiStore (vanilla)", () => {
  beforeEach(() => {
    // The store persists the theme preference, so each test starts from clean storage.
    window.localStorage.clear();
  });

  it("has correct initial state", () => {
    const state = uiStore.getState();
    expect(selectSidebarOpen(state)).toBe(false);
    expect(selectTheme(state)).toBe("system");
  });

  it("toggleSidebar flips sidebarOpen", () => {
    expect(selectSidebarOpen(uiStore.getState())).toBe(false);
    uiStore.getState().toggleSidebar();
    expect(selectSidebarOpen(uiStore.getState())).toBe(true);
    uiStore.getState().toggleSidebar();
    expect(selectSidebarOpen(uiStore.getState())).toBe(false);
  });

  it("setTheme updates theme across all three preferences", () => {
    uiStore.getState().setTheme("dark");
    expect(selectTheme(uiStore.getState())).toBe("dark");
    uiStore.getState().setTheme("light");
    expect(selectTheme(uiStore.getState())).toBe("light");
    uiStore.getState().setTheme("system");
    expect(selectTheme(uiStore.getState())).toBe("system");
  });

  it("setTheme persists the bare preference under the shared storage key", () => {
    uiStore.getState().setTheme("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    uiStore.getState().setTheme("system");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });

  it("does not hydrate from storage on its own (that is startThemeSync's job)", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    uiStore.setState(initialState);

    expect(selectTheme(uiStore.getState())).toBe("system");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("has no toggleTheme action (a three-state preference cannot be toggled)", () => {
    expect("toggleTheme" in uiStore.getState()).toBe(false);
  });

  it("selectSidebarOpen returns a boolean slice", () => {
    const state = uiStore.getState();
    expect(typeof selectSidebarOpen(state)).toBe("boolean");
  });

  it("selectTheme returns a valid theme preference", () => {
    const state = uiStore.getState();
    expect(["system", "light", "dark"]).toContain(selectTheme(state));
  });

  it("dirty state is reset by the global afterEach (CSM-6)", () => {
    uiStore.getState().toggleSidebar();
    expect(selectSidebarOpen(uiStore.getState())).toBe(true);
  });
});

describe("uiStore isolation via global reset", () => {
  it("starts from initialState after the previous test mutated state", () => {
    expect(selectSidebarOpen(uiStore.getState())).toBe(false);
    expect(selectTheme(uiStore.getState())).toBe("system");
    expect(typeof uiStore.getState().toggleSidebar).toBe("function");
  });

  it("reset preserves the actions so the store stays usable", () => {
    expect(initialState).toEqual({ sidebarOpen: false, theme: "system" });
    uiStore.getState().setTheme("dark");
    expect(selectTheme(uiStore.getState())).toBe("dark");
  });
});
