import { beforeEach, describe, expect, it, vi } from "vitest";

import { initialState, selectSidebarOpen, uiStore } from "@/stores/use-ui-store";

import { SIDEBAR_STORAGE_KEY, readStoredSidebarOpen, writeStoredSidebarOpen } from "./sidebar";
import { hydrateSidebarState } from "./sidebar-sync";

beforeEach(() => {
  window.localStorage.clear();
  uiStore.setState(initialState);
});

describe("readStoredSidebarOpen", () => {
  it("defaults to expanded when nothing was stored", () => {
    expect(readStoredSidebarOpen()).toBe(true);
  });

  it("reads the two literals the shell writes", () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
    expect(readStoredSidebarOpen()).toBe(false);

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "true");
    expect(readStoredSidebarOpen()).toBe(true);
  });

  it.each(["", "0", "yes", "TRUE", "collapsed"])(
    "treats the corrupt value %s as the default",
    (value) => {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, value);
      expect(readStoredSidebarOpen()).toBe(true);
    },
  );

  it("returns the default when storage throws", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });

    expect(readStoredSidebarOpen()).toBe(true);
    getItem.mockRestore();
  });
});

describe("writeStoredSidebarOpen", () => {
  it("stores the bare literal under the shared key", () => {
    writeStoredSidebarOpen(false);
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("false");

    writeStoredSidebarOpen(true);
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("true");
  });

  it("swallows a failing write, because storage is a cache", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() => {
      writeStoredSidebarOpen(false);
    }).not.toThrow();
    setItem.mockRestore();
  });
});

describe("hydrateSidebarState", () => {
  it("applies the stored choice to the store", () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
    uiStore.setState({ ...initialState, sidebarOpen: true });

    hydrateSidebarState();

    expect(selectSidebarOpen(uiStore.getState())).toBe(false);
  });

  it("keeps the default when nothing was stored", () => {
    hydrateSidebarState();

    expect(selectSidebarOpen(uiStore.getState())).toBe(true);
  });
});
