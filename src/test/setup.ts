// src/test/setup.ts
// Global Vitest setup (TEST-2, vitest-003):
// - jest-dom matchers (toBeVisible, toBeInTheDocument, ...)
// - axe matchers (toHaveNoViolations) + axe types
// - Testing Library cleanup after each test (auto-cleanup when globals are on)
// - a controllable `window.matchMedia` stub (jsdom does not implement it)
// - DOM/storage hygiene so a theme test never leaks the `dark` class or a stored key
import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import { afterEach, beforeEach, expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

import { initialState as uiInitialState, uiStore } from "@/stores/use-ui-store";

// Register vitest-axe's `toHaveNoViolations` matcher (TEST-3)
expect.extend(axeMatchers);

// --- window.matchMedia stub -------------------------------------------------
// jsdom ships no `window.matchMedia`, so `systemPrefersDark()` and the OS-change
// subscription in `startThemeSync()` cannot be exercised without a stub. It is
// intentionally NOT a frozen global: tests drive it through `matchMediaStub`
// (simulate dark/light, fire `change`, assert listeners were removed).

/** The only query the theme layer cares about, kept in sync with `src/lib/theme/theme.ts`. */
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

type MediaQueryListener = (event: MediaQueryListEvent) => void;

/** Shape of the fake `MediaQueryList` handed out by the stub. */
interface StubMediaQueryList {
  media: string;
  readonly matches: boolean;
  onchange: MediaQueryListener | null;
  addEventListener: (type: string, listener: MediaQueryListener) => void;
  removeEventListener: (type: string, listener: MediaQueryListener) => void;
}

export interface MatchMediaStub {
  /** Install the stub as `window.matchMedia` (idempotent). */
  install: () => void;
  /** Simulate an engine without `matchMedia` (jsdom's default state). */
  restore: () => void;
  /** Simulate an OS scheme change: flip the match state and fire `change`. */
  setDark: (dark: boolean) => void;
  /** Fire `change` without changing the match state. */
  emitChange: () => void;
  /** How many `change` listeners are currently registered (leak detector). */
  listenerCount: () => number;
  /** Drop listeners and reset the match state to light. */
  reset: () => void;
}

const changeListeners = new Set<MediaQueryListener>();

function createMatchMediaStub(): MatchMediaStub {
  let prefersDark = false;

  const createMediaQueryList = (query: string): MediaQueryList => {
    const list: StubMediaQueryList = {
      media: query,
      get matches() {
        return query === DARK_MEDIA_QUERY && prefersDark;
      },
      onchange: null,
      addEventListener: (type, listener) => {
        if (type === "change") changeListeners.add(listener);
      },
      removeEventListener: (type, listener) => {
        if (type === "change") changeListeners.delete(listener);
      },
    };

    return list as unknown as MediaQueryList;
  };

  const notify = (): void => {
    const event = {
      matches: prefersDark,
      media: DARK_MEDIA_QUERY,
    } as unknown as MediaQueryListEvent;

    for (const listener of [...changeListeners]) {
      listener(event);
    }
  };

  return {
    install: () => {
      window.matchMedia = createMediaQueryList;
    },
    restore: () => {
      // jsdom ships no `matchMedia`: clearing the stub reproduces an engine that
      // does not implement it at all (`typeof window.matchMedia !== "function"`).
      (window as { matchMedia?: unknown }).matchMedia = undefined;
    },
    setDark: (dark) => {
      prefersDark = dark;
      notify();
    },
    emitChange: notify,
    listenerCount: () => changeListeners.size,
    reset: () => {
      prefersDark = false;
      changeListeners.clear();
    },
  };
}

const matchMediaStub: MatchMediaStub = createMatchMediaStub();

/** Controllable `window.matchMedia`. Import it in tests to simulate the OS scheme. */
export { matchMediaStub };

function resetAllStores() {
  // Convention (CSM-6): every Zustand store in src/stores/ exports an
  // `initialState`; register its reset here so tests never leak state.
  // Merge (not replace=true): initialState holds only state fields, so a
  // replace would drop the store's actions.
  uiStore.setState(uiInitialState);
}

function resetThemeDom() {
  // `applyTheme()` mutates <html>; undo it so a test never inherits a dark page.
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
}

beforeEach(() => {
  // Re-install for any test that removed the stub to simulate an unsupported browser.
  matchMediaStub.install();
});

// Explicit cleanup policy: unmount React trees between tests.
// @testing-library/react also auto-cleans via afterEach when Vitest globals are
// enabled; this explicit call keeps the policy visible and independent of globals.
afterEach(() => {
  document.body.innerHTML = "";
  resetAllStores();
  resetThemeDom();
  matchMediaStub.reset();
  window.localStorage.clear();
});

// jsdom does not implement canvas. axe-core probes canvas during the
// color-contrast check, which would otherwise print "Not implemented" noise.
// Provide a minimal 2D context stub (no pixel data, just text metrics).
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() => ({
    measureText: () => ({ width: 0 }),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}
