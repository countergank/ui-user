# Design: COU-251 — Zustand Client-State Integration

## Technical Approach

Register Zustand v5 as the canonical client/UI state solution on the minimal additive path:
one typed UI store (`src/stores/use-ui-store.ts`), one demo consumer component, tests with
store-reset isolation, and doc/ADR updates. Uses Zustand's vanilla `createStore` +
`useStore(store, selector)` bound-hook pattern per the v5 TS guide. Server data remains on
TanStack Query; true local state stays on `useState`/`useReducer` (no forced migration,
middleware, or existing-hook refactor). Maps to CSM-1..CSM-11.

## Architecture Decisions

### Decision: Vanilla `createStore` + bound hook (v5 pattern)
| Option | Tradeoff | Decision |
|--------|----------|----------|
| `create<T>()(...)` (vanilla) + `useStore` | v5 TS-recommended; store testable outside React; hook is a thin binding | **Adopt** |
| `create<T>()(...)` (react) only | Couples logic to React; SSG/selector reuse harder | Reject |
| Return `useUiStore` as whole-store hook | Reselect on every state change; more re-renders | Reject (selectors minimize renders) |

### Decision: External standalone selectors
| Option | Tradeoff | Decision |
|--------|----------|----------|
| Module-level `selectTheme`/`selectSidebarOpen` | Stable refs, tree-shaking, testable as pure fns | **Adopt** |
| Inline `(s) => s.theme` in each consumer | Duplicated, no stable ref | Reject |

### Decision: Test isolation — exported `initialState` + reset in setup.ts
| Option | Tradeoff | Decision |
|--------|----------|----------|
| Export `initialState`; `uiStore.setState(initialState, true)` in `afterEach` | Simplest for a single store; full control (replace=true) | **Adopt** |
| `__mocks__/zustand.ts` auto-mock machinery | Heavy; hides real store behavior | Reject for a single store |

### Decision: Demo consumer location
| Option | Tradeoff | Decision |
|--------|----------|----------|
| `src/features/home/components/theme-toggle.tsx` | Matches feature-grouping + colocation convention (ADR-1); stays out of app-shell | **Adopt** (deviates from spec CSM-5 literal path `src/components/…`, intent preserved) |
| `src/components/theme-toggle.tsx` | Spec literal path; but `src/components/` is for cross-feature shared presentational | Reject |

### Decision: `toggleTheme` action
Spec CSM-2 names only `toggleSidebar`/`setTheme`; the design adds `toggleTheme` as a natural
complement (pure derive from current state via `get()`) consumed by the demo. Additive, no
conflict with specs/ADR.

## Data Flow

```
ThemeToggle (feature comp) ──useStore(uiStore, selectTheme)──▶ uiStore (vanilla createStore)
        │  onClick ──toggleTheme()──▶ (set)                        │ getState()
        └───────────────────────────────▶ re-render on slice change
Greeting/other comps ⇄ useStore(uiStore, selectX)  (cross-component shared UI state)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `zustand` under `dependencies` (`^5`) |
| `src/stores/use-ui-store.ts` | Create | Canonical typed store + `initialState` + selectors + bound hook |
| `src/stores/use-ui-store.test.ts` | Create | Unit tests: initial, setTheme, toggleTheme, toggleSidebar, selectors |
| `src/features/home/components/theme-toggle.tsx` | Create | Demo consumer (reads theme, toggles, accessible) |
| `src/features/home/components/theme-toggle.test.tsx` | Create | Component/integration tests via real store hook |
| `src/test/setup.ts` | Modify | afterEach reset of zustand stores |
| `docs/component-patterns.md` | Modify | "State management policy" section |
| `docs/folder-structure.md` | Modify | Add `src/stores/` to tree + purposes |
| `README.md` | Modify | Add Zustand to stack line |
| `docs/adr.md` | Modify | ADR-10 (supersedes ADR-3) + ADR-3 cross-ref |

## Interfaces / Contracts

```ts
// src/stores/use-ui-store.ts
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

export interface UiState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
}
export interface UiActions {
  toggleSidebar: () => void;
  setTheme: (theme: UiState["theme"]) => void;
  toggleTheme: () => void;
}
export type UiStore = UiState & UiActions;

export const initialState: UiState = { sidebarOpen: false, theme: "light" };

export const uiStore = createStore<UiStore>()((set, get) => ({
  ...initialState,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
}));

// External selectors (CSM-3): standalone, stable refs, tree-shakable
export const selectSidebarOpen = (s: UiStore): boolean => s.sidebarOpen;
export const selectTheme = (s: UiStore): "light" | "dark" => s.theme;

// Bound hook (CSM-2): useStore(uiStore, selector)
export const useUiStore = <T>(selector: (state: UiStore) => T): T =>
  useStore(uiStore, selector);
```

```tsx
// src/features/home/components/theme-toggle.tsx
import { Button } from "@/components/ui/button";
import { selectTheme, useUiStore } from "@/stores/use-ui-store";

export function ThemeToggle() {
  const theme = useUiStore(selectTheme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const isDark = theme === "dark";
  return (
    <Button
      type="button"
      variant="outline"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      {isDark ? "Dark" : "Light"} theme
    </Button>
  );
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Store init/actions/selectors (`src/stores/use-ui-store.test.ts`) | `getState()`/actions directly; `beforeEach` reset; selector slice asserts |
| Component | Demo consumer re-render on store change (`src/features/home/components/theme-toggle.test.tsx`) | render + `userEvent.click`; assert `aria-pressed`/label flip; init `state` mutation path; axe |
| Isolation | No state leak across tests | `src/test/setup.ts` afterEach calls a `resetAllStores()` helper (replace=true) |

Vitest include `src/**/*.{test,spec}.{ts,tsx}` auto-discovers both new tests; coverage 80/80/80/80
gate satisfied by simple store+component assertions. Not in coverage `exclude`, so both files
count toward the floor.

```ts
// src/test/setup.ts — add (CLI: search for existing afterEach import)
import { uiStore, initialState as uiInitialState } from "@/stores/use-ui-store";

function resetAllStores() {
  // Convention (CSM-6): each store exports initialState; register its reset here.
  uiStore.setState(uiInitialState, true);
}

afterEach(() => {
  document.body.innerHTML = "";
  resetAllStores();
});
```

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or
process-integration boundary. Pure additive in-repo UI store + component + docs.

## Migration / Rollout

No migration required. All changes additive; existing `useState`/`useReducer` hooks
untouched (CSM-11). Rollback: remove dep, delete `src/stores/` + theme-toggle files, revert
`setup.ts`, restore ADR-3 wording (proposal §Rollback Plan).

## Open Questions

- [ ] None blocking. Minor: whether ADR-3's "no global store by default" phrasing is kept and
      annotated "evolved by ADR-10" (recommended) vs removed outright (recommendation: annotate).
