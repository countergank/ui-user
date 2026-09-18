# Proposal: COU-251 — Zustand Client-State Integration

## Intent

Add Zustand v5 as the **canonical client/UI state solution** for the frontend template. Today, client state is scattered across per-component `useState`/`useReducer`+Context with no shared pattern. ADR-3 ("Local + server state; no global store") explicitly rejected a global store, but this creates inconsistency across future countergank apps. This change registers Zustand for cross-component UI state while preserving TanStack Query for server data.

## Scope

### In Scope

- `zustand` v5 added as a runtime dependency
- `src/stores/use-ui-store.ts`: typed store with `sidebarOpen`, `theme`, and actions (`toggleSidebar`, `setTheme`); selectors defined outside the store; bound `useUiStore` hook
- Unit test: set/get/action verification (`src/stores/use-ui-store.test.ts`)
- One component integration test consuming the store via the bound hook
- `src/test/setup.ts`: afterEach zustand reset to prevent test pollution
- Documentation updates:
  - `docs/component-patterns.md`: new state-management policy section (client=Zustand, server=TanStack Query)
  - `docs/folder-structure.md`: add `src/stores/` to tree and directory purposes
  - `README.md`: add Zustand to stack line
- ADR-10 in `docs/adr.md` supersedes/evolves ADR-3

### Out of Scope

- Refactoring existing `useState`/`useReducer` hooks (route-announcer, app-shell, use-greeting)
- Zustand middleware (persist, devtools, immer)
- Server-state migration or TanStack Query changes
- Doppler secrets management
- Any rendering or routing changes

## Non-Goals

- Migrate every existing hook to Zustand — existing local-UI-state hooks remain valid for truly local state
- Provide a "recommended store for every feature" — this change establishes the pattern, not a full library

## Capabilities

### New Capabilities

- `client-state-management`: Zustand store conventions, typed store pattern, selectors, bound hooks, test reset strategy

### Modified Capabilities

- None (no existing spec covers state management)

## Approach

Minimal additive integration. Use a **UI store** as the canonical example: `sidebarOpen` + `theme` with toggle/set actions. Typed via `createStore` (vanilla) + `useStore(store, selector)` bound-hook pattern per Zustand v5 TS guide. Selectors defined as standalone functions outside the store for testability and tree-shaking. Consume in a lightweight demo component (e.g. toolbar/theme toggle) — **not** app-shell — to prove cross-component usage without touching production shell state.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add `zustand` runtime dep |
| `src/stores/use-ui-store.ts` | New | Canonical typed store |
| `src/stores/use-ui-store.test.ts` | New | Unit test |
| `src/components/theme-toggle.tsx` | New | Demo consumer component |
| `src/components/theme-toggle.test.tsx` | New | Integration test |
| `src/test/setup.ts` | Modified | afterEach zustand reset |
| `docs/adr.md` | Modified | ADR-10 superseding ADR-3 |
| `docs/component-patterns.md` | Modified | State-management policy section |
| `docs/folder-structure.md` | Modified | `src/stores/` entry |
| `README.md` | Modified | Zustand in stack line |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| ADR-3 reversal seen as regression | Low | Explicit ADR-10 with rationale; additive scope; no hook migration |
| Test state pollution | Medium | afterEach reset in `src/test/setup.ts`; pattern documented |
| 80% coverage gate regression | Low | New store + component tests are simple; high coverage by default |
| Zustand v5 API drift | Low | Pin v5; follow official TS guide patterns |

## Rollback Plan

Remove `zustand` from `package.json`, delete `src/stores/`, `src/components/theme-toggle.tsx` and its test, revert `src/test/setup.ts` changes, restore ADR-3 wording in `docs/adr.md`. All changes are additive — no existing code is modified.

## Dependencies

- Zustand v5 (npm, actively maintained)

## Success Criteria

- [ ] `zustand` in `package.json` as runtime dep
- [ ] Canonical typed store in `src/stores/` using Zustand API
- [ ] Store unit test passing (set/get/actions)
- [ ] `pnpm test` passes with store test
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build` all pass
- [ ] Client-state vs server-state policy documented in `docs/`
- [ ] ADR-10 registered in `docs/adr.md` superseding ADR-3
