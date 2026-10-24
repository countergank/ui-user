import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

import { initialSessionState, sessionStore } from "@/lib/session/session-store";
import { initialState as uiInitialState, uiStore } from "@/stores/use-ui-store";

expect.extend(axeMatchers);

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
  restore: () => void;
  setDark: (dark: boolean) => void;
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

export { matchMediaStub };

function resetAllStores() {
  uiStore.setState(uiInitialState);
  sessionStore.setState(initialSessionState);
}

function resetThemeDom() {
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
}

beforeEach(() => {
  matchMediaStub.install();
});

afterEach(() => {
  document.body.innerHTML = "";
  resetAllStores();
  resetThemeDom();
  matchMediaStub.reset();
  window.localStorage.clear();
});

if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() => ({
    measureText: () => ({ width: 0 }),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}

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
