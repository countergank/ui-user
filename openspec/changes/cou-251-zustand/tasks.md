# Tasks: COU-251 — Zustand Client-State Integration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250–320 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | zustand dep + canonical store + unit test | PR 1 | `pnpm test src/stores/use-ui-store.test.ts` | N/A — pure unit, no UI runtime | remove dep + delete `src/stores/` |
| 2 | demo ThemeToggle + component test | PR 1 | `pnpm test src/features/home/components/theme-toggle.test.tsx` | `pnpm dev` manual check — component not routed | delete component + test |
| 3 | test isolation reset | PR 1 | `pnpm test` (full suite) | N/A — assertion-only | revert `src/test/setup.ts` |
| 4 | docs + ADR-10 | PR 1 | `make ci` | N/A — docs only | revert `docs/`, `README.md` |

## Phase 1: Dependency + Store (TDD)

- [x] 1.1 `pnpm add zustand@^5` — runtime `dependencies` (CSM-1); `pnpm install` clean, no peer conflicts
- [x] 1.2 RED: `src/stores/use-ui-store.test.ts` — initial state (`sidebarOpen=false`, `theme` defined), `toggleSidebar` flips, `setTheme` updates, `toggleTheme` flips, selector slices via `getState()` (CSM-4)
- [x] 1.3 GREEN: `src/stores/use-ui-store.ts` — vanilla `createStore` + exported `initialState` + `uiStore` + `selectSidebarOpen`/`selectTheme` + bound `useUiStore`; no middleware imports (CSM-2, CSM-3, CSM-11)

## Phase 2: Demo Consumer (TDD)

- [x] 2.1 RED: `src/features/home/components/theme-toggle.test.tsx` — renders current theme, `userEvent.click` toggles real store state, `aria-pressed`/`aria-label` flip, axe no violations (CSM-5)
- [x] 2.2 GREEN: `src/features/home/components/theme-toggle.tsx` — accessible `Button` via `useUiStore(selectTheme)` + `toggleTheme`; path per design (not app-shell) (CSM-5)

## Phase 3: Test Isolation

- [x] 3.1 `src/test/setup.ts` — add `resetAllStores()` calling `uiStore.setState(uiInitialState, true)` (replace=true) inside existing `afterEach`; document the register-your-store convention (CSM-6)
- [x] 3.2 Guard: in `use-ui-store.test.ts` add a test mutating `sidebarOpen=true`, assert next test starts from `initialState` (proves no leak after global reset) (CSM-6)

## Phase 4: Docs + ADR-10

- [x] 4.1 `docs/component-patterns.md` — "State management policy" section: Zustand = client/UI cross-component, TanStack Query = server/cache, `useState`/`useReducer` local hooks remain valid, no forced migration (CSM-7)
- [x] 4.2 `docs/folder-structure.md` — add `src/stores/` to tree + purposes table (CSM-8)
- [x] 4.3 `README.md` — add Zustand to stack line (CSM-8)
- [x] 4.4 `docs/adr.md` — ADR-10 (Zustand = client state, supersedes ADR-3; cite ADR-3 text "no global store by default"); annotate ADR-3 "evolved by ADR-10"; add summary-table rows (CSM-9)

## Phase 5: Verification

- [x] 5.1 `make ci` — lint, typecheck, test, build all green (CSM-10)
- [x] 5.2 `pnpm test:coverage` ≥ 80% all thresholds; both new tests discovered by vitest include
- [x] 5.3 Mark all tasks `[x]`; confirm total changed lines within 400-line review budget