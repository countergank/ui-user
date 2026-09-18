import { describe, expect, it } from "vitest";

import { initialState, selectSidebarOpen, selectTheme, uiStore } from "./use-ui-store";

describe("uiStore (vanilla)", () => {
  it("has correct initial state", () => {
    const state = uiStore.getState();
    expect(selectSidebarOpen(state)).toBe(false);
    expect(selectTheme(state)).toBe("light");
  });

  it("toggleSidebar flips sidebarOpen", () => {
    expect(selectSidebarOpen(uiStore.getState())).toBe(false);
    uiStore.getState().toggleSidebar();
    expect(selectSidebarOpen(uiStore.getState())).toBe(true);
    uiStore.getState().toggleSidebar();
    expect(selectSidebarOpen(uiStore.getState())).toBe(false);
  });

  it("setTheme updates theme", () => {
    uiStore.getState().setTheme("dark");
    expect(selectTheme(uiStore.getState())).toBe("dark");
    uiStore.getState().setTheme("light");
    expect(selectTheme(uiStore.getState())).toBe("light");
  });

  it("toggleTheme flips between light and dark", () => {
    expect(selectTheme(uiStore.getState())).toBe("light");
    uiStore.getState().toggleTheme();
    expect(selectTheme(uiStore.getState())).toBe("dark");
    uiStore.getState().toggleTheme();
    expect(selectTheme(uiStore.getState())).toBe("light");
  });

  it("selectSidebarOpen returns a boolean slice", () => {
    const state = uiStore.getState();
    expect(typeof selectSidebarOpen(state)).toBe("boolean");
  });

  it("selectTheme returns a valid theme slice", () => {
    const state = uiStore.getState();
    expect(["light", "dark"]).toContain(selectTheme(state));
  });

  it("dirty state is reset by the global afterEach (CSM-6)", () => {
    uiStore.getState().toggleSidebar();
    expect(selectSidebarOpen(uiStore.getState())).toBe(true);
  });
});

describe("uiStore isolation via global reset", () => {
  it("starts from initialState after the previous test mutated state", () => {
    expect(selectSidebarOpen(uiStore.getState())).toBe(false);
    expect(selectTheme(uiStore.getState())).toBe("light");
    expect(typeof uiStore.getState().toggleSidebar).toBe("function");
  });

  it("reset preserves the actions so the store stays usable", () => {
    expect(initialState).toEqual({ sidebarOpen: false, theme: "light" });
    uiStore.getState().setTheme("dark");
    expect(selectTheme(uiStore.getState())).toBe("dark");
  });
});
