# client-state-management Specification

## Purpose

Canonical Zustand client-state pattern. Typed stores, selectors, bound hooks, test isolation, and docs policy (Zustand = client, TanStack Query = server). Supersedes ADR-3.

## Requirements

### CSM-1 — Zustand runtime dependency

`zustand` v5 MUST appear under `dependencies` (not `devDependencies`) in `package.json`, pinned to a specific major range.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Runtime dep present | `package.json` | `dependencies` inspected | `zustand` listed, not in `devDependencies` |
| Install clean | dep added | `pnpm install` | no peer-conflict errors |

### CSM-2 — Canonical typed store

`src/stores/use-ui-store.ts` SHALL use Zustand's vanilla `createStore` API. State: `sidebarOpen` (boolean), `theme` (string). Actions: `toggleSidebar`, `setTheme`. Exports bound `useUiStore` hook via `useStore(store, selector)`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Bound hook exported | file exists | module imported | `useUiStore` callable; type has all fields |

### CSM-3 — External selectors

Selectors SHALL be standalone exported functions outside the store. Minimum: `selectSidebarOpen`, `selectTheme`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Selector importable | store file | consumer imports selector | pure function returning state slice |

### CSM-4 — Store unit test

`src/stores/use-ui-store.test.ts` SHALL verify initial state, action mutations (`toggleSidebar` flips, `setTheme` updates), and selector correctness.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Initial state | test | `getState()` | `sidebarOpen=false`, `theme` defined |
| Actions mutate | test | `toggleSidebar()` / `setTheme(v)` | state reflects changes |

### CSM-5 — Demo consumer + integration test

A demo component (`src/components/theme-toggle.tsx`) SHALL consume the store via the bound hook. Integration test (`src/components/theme-toggle.test.tsx`) SHALL verify re-render on store change.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Renders store state | component | render | displays current `theme` |
| Re-render on action | test | dispatch `setTheme` | component re-renders with new value |

### CSM-6 — Test isolation via store reset

`src/test/setup.ts` SHALL include `afterEach` resetting all Zustand stores to initial state.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| No state leak | test A sets `sidebarOpen=true` | test B runs | `sidebarOpen=false` in B |

### CSM-7 — Documentation: client vs server state

`docs/component-patterns.md` SHALL include a state-management section: Zustand = client/UI cross-component; TanStack Query = server/cache; `useState`/`useReducer` local hooks remain valid, no forced migration.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Policy section exists | `component-patterns.md` | read | section names both solutions |
| No force-migration | policy section | read | explicitly states local hooks remain valid |

### CSM-8 — Folder structure + README

`docs/folder-structure.md` SHALL list `src/stores/` with purpose. `README.md` SHALL include Zustand in the stack line.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Stores in tree | `folder-structure.md` | read | `src/stores/` present with description |
| Stack updated | `README.md` | read | Zustand listed |

### CSM-9 — ADR-10 supersedes ADR-3

`docs/adr.md` SHALL contain ADR-10 registering Zustand as client-state, explicitly superseding ADR-3. ADR-3 updated to reference ADR-10.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| ADR-10 present | `adr.md` | read | ADR-10 states supersession of ADR-3 |
| ADR-3 cross-ref | `adr.md` | read | ADR-3 references ADR-10 |

### CSM-10 — CI gates green

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` SHALL all pass after the change.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Full gate | change applied | `make ci` | lint, typecheck, test, build pass |

### CSM-11 — No middleware / no force-migration

SHALL NOT use Zustand middleware (persist, devtools, immer). Existing `useState`/`useReducer` hooks SHALL NOT be modified.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| No middleware | `use-ui-store.ts` | read | no `persist`/`devtools`/`immer` import |
| Hooks untouched | existing hooks | diff | source unchanged |
