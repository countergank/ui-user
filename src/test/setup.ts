// src/test/setup.ts
// Global Vitest setup (TEST-2, vitest-003):
// - jest-dom matchers (toBeVisible, toBeInTheDocument, ...)
// - axe matchers (toHaveNoViolations) + axe types
// - Testing Library cleanup after each test (auto-cleanup when globals are on)
import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
import { afterEach, expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

import { initialState as uiInitialState, uiStore } from "@/stores/use-ui-store";

// Register vitest-axe's `toHaveNoViolations` matcher (TEST-3)
expect.extend(axeMatchers);

function resetAllStores() {
  // Convention (CSM-6): every Zustand store in src/stores/ exports an
  // `initialState`; register its reset here so tests never leak state.
  // Merge (not replace=true): initialState holds only state fields, so a
  // replace would drop the store's actions.
  uiStore.setState(uiInitialState);
}

// Explicit cleanup policy: unmount React trees between tests.
// @testing-library/react also auto-cleans via afterEach when Vitest globals are
// enabled; this explicit call keeps the policy visible and independent of globals.
afterEach(() => {
  document.body.innerHTML = "";
  resetAllStores();
});

// jsdom does not implement canvas. axe-core probes canvas during the
// color-contrast check, which would otherwise print "Not implemented" noise.
// Provide a minimal 2D context stub (no pixel data, just text metrics).
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() => ({
    measureText: () => ({ width: 0 }),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}
