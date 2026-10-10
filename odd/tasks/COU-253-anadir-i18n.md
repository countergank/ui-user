# COU-253 — Add i18n to ui-user

Linear: https://linear.app/countergank/issue/COU-253/anadir-i18n-en-ui-user
Branch: `feat/COU-253-anadir-i18n`
Status: in progress

## Reconcile (resume 2026-09-20)

- TDD: strict (source: `docs/testing.md`), runner: `pnpm test` (Vitest).
- RDD: off (default) — ordinary checks; no native review lifecycle.
- Engram mirror: restored at topic `odd/COU-253-anadir-i18n/tasks` (was missing from the Pi session).
- Gap: Tasks 1–2 verified but not committed; ODD requires a work-unit commit per task on the feature branch (pending authorization).
- Gap closure (2026-10-10): `useGreeting` no longer hardcodes English greeting literals — the hook returns `t("home.greeting.*")` resource copy and `use-greeting.test.tsx` was rewritten resource-driven (`i18n.t(...)` convention). Affected tests 16/16, full suite 75/75, `pnpm typecheck` + `pnpm lint` green.

## Delivery (decided 2026-09-20)

- Strategy: `ask-on-risk` → resolved **chained PRs** (authored lines ~500 > 400).
- Chain strategy: **stacked-to-main** (PRs to `develop` in order).
- Slice boundaries:
  - **PR 1 → develop**: Tasks 1–2 (foundation + shell/router chrome) — work-unit commit(s): `feat(i18n): add typed i18next foundation`, `feat(i18n): migrate shell and router chrome copy`.
  - **PR 2 → develop**: Tasks 3–4 (home/about + shared controls/errors) — work-unit commit(s): `feat(i18n): migrate home/about feature copy`, `feat(i18n): migrate shared controls and error copy`.
- Skills resolved by registry before PR planning: `work-unit-commits`, `chained-pr`.
- **PRs opened 2026-09-20 (no merge — repo policy / human decision):**
  - PR 1 → https://github.com/countergank/ui-user/pull/3 (feat/COU-253-anadir-i18n-foundation → develop; 394 lines; commits: `c6ce209` foundation, `03ee442` shell chrome).
  - PR 2 → https://github.com/countergank/ui-user/pull/4 (feat/COU-253-anadir-i18n → develop; own delta ~277 after PR1 lands; commits: `06b0903` home/about, `07aac3d` controls/errors; `fixes COU-253`).
  - Linear COU-253 comment added with both PRs (`293a33a1-1c3a-4433-8895-695d327f777f`).
- Each commit boundary verified green (2/2, 8/8, 18/18, 20/20 affected tests).

## Goal

Integrate an i18n foundation into the React/Vite UI so visible application copy is separated from components, defaults to English, and can be extended to additional locales without rewriting UI code.

## Non-goals

- Do not translate API-owned dynamic content unless it is currently local mock copy.
- Do not add a persistent language selector unless a product decision explicitly adds it.
- Do not refactor routing or app architecture beyond what i18n initialization requires.

## Acceptance criteria

- [x] The application initializes i18n in a typed, Vite-compatible way. (verified: `src/lib/i18n/index.ts` + `main.tsx` init, `CustomTypeOptions` typed keys)
- [x] Main visible UI copy is read from translation resources instead of component literals. (verified: grep-swept, no JSX text literals / hardcoded aria-labels remain; API-owned dynamic content and `errors.ts` fallback intentionally untyped by non-goals)
- [x] The structure supports adding new languages without editing UI components. (verified: `resources.ts` namespaced `en.*`, key-based lookups)
- [x] Tests cover i18n initialization and updated rendered copy behavior. (verified: `i18n.test.ts` + resource-driven assertions across shell/home/about/controls/errors)
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass or limitations are documented. (verified: `make ci` passed; documented limitation: local e2e is CI-only)

## Tasks

- [x] Task 1 — Install and initialize i18n foundation.
  - Add `i18next` and `react-i18next`.
  - Create `src/lib/i18n/` resources and initialization.
  - Import initialization before React render.
  - Add focused tests for default/fallback behavior.
  - Evidence: `pnpm test -- src/lib/i18n/i18n.test.ts` passed; `pnpm typecheck` passed; `pnpm lint` passed; `pnpm test -- src/main.test.tsx` passed with existing React act/HydrateFallback stderr warnings.

- [x] Task 2 — Migrate shell and router chrome copy.
  - Move nav, skip link, route titles, announcer, loading, footer copy to translations.
  - Update shell tests and e2e expectations as needed.
  - Evidence: `pnpm vitest run src/app-shell.test.tsx src/lib/i18n/i18n.test.ts` passed; `pnpm typecheck` passed.

- [x] Task 3 — Migrate home/about feature copy.
  - Move home, about, and local mock highlight copy to translations.
    - DONE: `about-route.tsx` migrated to `useTranslation()` (`about.heading|title|description`); home-page/feature-cards/api mock already resource-driven in inherited tree; tests rewritten to be resource-driven (`i18n.t(...)` init convention from app-shell.test.tsx); fixed `useHighlights` typing (`?? []`); `useHighlights` now keys query by `i18n.resolvedLanguage`.
  - Update feature/component tests.
    - DONE: `home-page.test.tsx`, `feature-cards.test.tsx`, `routes.test.tsx` now assert via `i18n.t()` (7 baseline failures fixed → RED→GREEN); `hero.test.tsx` untouched (pure presentational).
  - Evidence: `pnpm vitest run` (6 affected files) → 6 files passed, 21 tests passed; full suite 75 passed; `pnpm typecheck` passed (after `?? []` fix); `pnpm lint` passed (after safe biome fixes inherited from Tasks 1–2); `pnpm build` passed. Orchestrator spot-check re-ran the 6-file suite → 21 passed. RDD-off assess: risk medium (package.json config change), 259 tracked lines changed, review_due=under_budget.
  - Evidence (gap closure 2026-10-10): `use-greeting.ts` uses `t("home.greeting.morning|afternoon|evening")` (keys already present in `resources.ts`); `use-greeting.test.tsx` resource-driven; 4 affected suites 16/16, full suite 75/75, typecheck + lint green.

- [x] Task 4 — Migrate shared controls and error copy.
  - Move theme toggle, env badge labels, error view, and route boundary copy to translations.
    - DONE: `theme-toggle` → `home.theme.switchTo|current` (interpolated); `env-badge` → pre-existing `home.environment.*` keys; `error-view` → `error.retry`; `route-error-boundary` → `error.genericTitle|genericMessage|statusTitle|routeFallbackMessage|dataFetchTitle`; `route-announcer` verified already prop-driven (no edit); `home-page.test.tsx` "Try again" now `i18n.t("error.retry")`.
  - Preserve accessible names and axe expectations.
    - DONE: role-based queries and axe assertions preserved; tests follow module-scope `import { i18n }` convention.
  - Evidence: `pnpm vitest run` (9 affected files) → 9 files passed, 31 tests passed (8 RED observed first across 4 files); full suite 75 passed; `pnpm typecheck` passed (after annotating `let title/message: string` — `useTranslation().t` literal-type gotcha); `pnpm lint` passed (one biome formatter fix). Orchestrator spot-check re-ran → 31 passed. Assess after Task 4: risk medium, 391 tracked lines changed (~500 authored incl. untracked i18n) → EXCEEDS ~400 delivery budget → ask-on-risk pending user decision.
  - Remaining literals intentionally untouched (non-goals): `src/lib/errors.ts` fallback string, HTTP statusText/thrown messages, main.tsx invariant.

- [x] Task 5 — Verify and prepare review handoff.
  - Run lint, typecheck, tests, and build.
    - DONE (orchestrator ran `make ci` on 2026-09-20): lint ✅, typecheck ✅, test:coverage ✅ (src/lib/i18n 100% stmts/branch/fn, floor 80%), build ✅ (142 modules, vite 3.34s). e2e NOT run locally — CI-only gate (playwright not installed locally); documented limitation, same as template default.
  - Document skipped/failed checks.
    - DONE: only documented limitation = local e2e; pre-existing act/HydrateFallback stderr warning unchanged from Task 1.
  - Prepare conventional commit evidence when authorized.
    - Prepared (see Delivery section): PR1 commits `feat(i18n): add typed i18next foundation` + `feat(i18n): migrate shell and router chrome copy`; PR2 commits `feat(i18n): migrate home/about feature copy` + `feat(i18n): migrate shared controls and error copy`. Commits pending user authorization.
  - Evidence: `make ci` passed end-to-end.

## Exploration notes

Read-only exploration identified these likely edit surfaces:

- `package.json`, `pnpm-lock.yaml`
- `src/main.tsx`
- `src/lib/i18n/**`
- `src/app-shell.tsx`
- `src/routes/about-route.tsx`
- `src/features/home/**`
- `src/components/error/**`
- affected colocated tests and `e2e/critical-journeys.spec.ts`

Recommended library: `i18next` + `react-i18next`.
