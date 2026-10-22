// Global Vitest setup (TEST-2, vitest-003): jest-dom + axe matchers, Testing Library
// cleanup, a controllable `window.matchMedia` stub, DOM/storage hygiene between tests.
import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";
import { initialState as uiInitialState, uiStore } from "@/stores/use-ui-store";

// Register vitest-axe's `toHaveNoViolations` matcher (TEST-3)
expect.extend(axeMatchers);

// --- window.matchMedia stub -------------------------------------------------
// jsdom ships no `matchMedia`, so theme tests cannot exercise it without a stub.
// Intentionally not frozen: tests drive it via `matchMediaStub` (setDark/emitChange).

/** The only query the theme layer cares about, kept in sync with `src/lib/theme/theme.ts`. */
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

type MediaQueryListener = (event: MediaQueryListEvent) => void;

interface StubMediaQueryList {
  media: string;
  readonly matches: boolean;
  onchange: MediaQueryListener | null;
  addEventListener: (type: string, listener: MediaQueryListener) => void;
  removeEventListener: (type: string, listener: MediaQueryListener) => void;
}

export interface MatchMediaStub {
  install: () => void;
  /** Simulate an engine without `matchMedia` (jsdom's default state). */
  restore: () => void;
  /** Simulate an OS scheme change: flip the match state and fire `change`. */
  setDark: (dark: boolean) => void;
  /** Fire `change` without changing the match state. */
  emitChange: () => void;
  listenerCount: () => number;
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
  // CSM-6: every Zustand store in src/stores/ exports an `initialState`; register its
  // reset here so tests never leak state. Merge, not replace=true: initialState holds
  // only state fields, so a replace would drop the store's actions.
  uiStore.setState(uiInitialState);
  // COU-273: the session store persists to localStorage; reset both sides so a test
  // never inherits a token from the previous one.
  sessionStore.setState(initialSessionState);
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

// --- jsdom shims for Radix surfaces -----------------------------------------
// nwsapi cannot evaluate `:popover-open` / `:modal` at all (~50M recursions, ~20s hang), so
// answering "no" is the truthful stub. ScrollArea needs a `ResizeObserver` jsdom lacks.
type NativeMatches = (this: Element, selector: string) => boolean;

const UNSUPPORTED_TOP_LAYER_SELECTORS = new Set([":popover-open", ":modal"]);
const nativeMatches: NativeMatches = Reflect.get(Element.prototype, "matches");

class ResizeObserverStub {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

beforeAll(() => {
  Element.prototype.matches = function matchesWithoutTopLayer(this: Element, selector: string) {
    if (UNSUPPORTED_TOP_LAYER_SELECTORS.has(selector)) {
      return false;
    }

    return nativeMatches.call(this, selector);
  };

  if (typeof globalThis.ResizeObserver === "undefined") {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  }
});

afterAll(() => {
  Element.prototype.matches = nativeMatches;
  vi.unstubAllGlobals();
});
