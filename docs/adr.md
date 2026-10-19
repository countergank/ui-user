# Architecture Decision Records

> Why: every app built from this template inherits these decisions. Each ADR records the
> context, the decision, and the trade-offs so future teams extend them instead of
> relitigating them. Source of truth: `openspec/changes/standard-frontend-template/design.md`.

## Stack baseline

The decisions below assume this stack, pinned in `package.json`, `.nvmrc`, and the tool
configs at the repo root:

| Layer | Choice |
|-------|--------|
| Runtime | Node `>=22`, pnpm `9.15.9` |
| Bundler | Vite 6 |
| UI | React 19 + TypeScript 5 (strict) |
| Styling | Tailwind 3 + shadcn/ui (Radix UI + CVA + CSS variables) |
| Server state | TanStack Query 5 |
| Client/UI state | Zustand 5 (`src/stores/`, see ADR-10) |
| Routing | React Router 7 (`createBrowserRouter`) |
| Linting | Biome + ESLint (jsx-a11y strict) |
| Testing | Vitest 3 + Testing Library + vitest-axe + Playwright |

## ADR summary

| ID | Decision |
|----|----------|
| ADR-1 | Feature-based (screaming) source layout |
| ADR-2 | shadcn/ui + Tailwind + Radix for components |
| ADR-3 | Local + server state; no global store — **evolved by ADR-10** |
| ADR-4 | React Router data router + per-route code splitting |
| ADR-5 | Typed error model + route error boundary |
| ADR-6 | Accessibility-first app shell |
| ADR-7 | Vitest + Testing Library + axe + Playwright testing stack |
| ADR-8 | Tooling gate + single final PR delivery |
| ADR-9 | CI-gated merge acceptance + branch protection |
| ADR-10 | Zustand for client/UI state |
| ADR-11 | Typed, fail-fast env handling via Doppler/Vite |
| ADR-12 | Supported languages `en|es|pt` + mandatory key parity |

## ADR-1: Feature-based (screaming) source layout

**Context**: Future apps should be navigable by business capability, not by layer.

**Decision**: `src/features/<feature>/` groups a capability's components, hooks, and domain
logic (`api.ts`). Cross-cutting layers: `src/components/` (shared presentational),
`src/components/ui/` (shadcn primitives), `src/hooks/`, `src/lib/` (utils, query client,
errors), `src/routes/` (lazy route modules).

**Consequences**: Fits the container/presentational pattern; avoids scattered files; a new
capability means adding one folder. See [folder-structure.md](folder-structure.md) for the
full tree.

**Example**: the `auth` feature at `src/features/auth/` owns `login-page.tsx` and
`login-form.tsx` (containers), `hooks/use-login.ts`, the pure `login-schema.ts` and
`login-errors.ts`, and `api.ts`. The `landing` feature follows the same shape.

## ADR-2: shadcn/ui + Tailwind + Radix for components

**Context**: Need accessible, composable, themeable primitives without vendoring a heavy UI
kit at runtime.

**Decision**: Tailwind CSS base + shadcn/ui (Radix UI + CSS variables + CVA). Design tokens
are CSS variables; `darkMode: class`. Primitive source lives in `src/components/ui/`.

**Deviation note**: the countergank `react-frontend` skill's `css-responsive` rules are kept
in intent (mobile-first, breakpoints, fluid type, touch targets) but implemented in the
Tailwind medium rather than hand-written media queries.

**Consequences**: primitives are owned and themeable via CSS variables
(`src/styles/tokens.css`), and they inherit Radix's focus/keyboard/ARIA behavior for free.

## ADR-3: Local + server state; no global store

> **Status**: evolved by [ADR-10](#adr-10-zustand-for-clientui-state) — cross-component client/UI
> state now uses Zustand. Server-state guidance below is unchanged.

**Context**: SPAs have UI state and server data; an unneeded global store adds complexity.

**Decision**: `useState`/`useReducer` + Context for local/UI state; TanStack Query for all
server data (caching, invalidation, retries, error handling). **No global store by default.**

**Consequences**: server state is cached and resilient; a new feature adds a typed query
hook in `features/<feature>/api.ts` instead of wiring a store. The "no global store" blanket
applies to *unneeded* stores — when UI state genuinely spans components, prefer the Zustand
pattern in ADR-10 over hand-rolled Context.

## ADR-4: Routing & code splitting

**Context**: SPAs grow beyond an initial bundle; shipping everything up front hurts first load.

**Decision**: React Router `createBrowserRouter` data router with route-level `lazy` modules
(dynamic import) and a Suspense boundary per route inside the shell.

**Consequences**: `src/routes/*-route.tsx` modules load on demand; the shell wraps routed
content in `<Suspense>` with an `aria-busy` fallback. See `src/routes/index.tsx` and
`src/app-shell.tsx`.

## ADR-5: Typed error model + route error boundary

**Context**: Thrown raw strings (`throw "boom"`) and unchecked values crash `Error`-aware
code paths; the app needs one consistent error story.

**Decision**: Typed `Error` subclasses in `src/lib/errors.ts` (`AppError`, `DataFetchError`,
`RouteError`) with optional `code`/`status`; a route-level `RouteErrorBoundary` wired to the
router `errorElement`; TanStack Query error states render the accessible `ErrorView`.

**Consequences**: every error is an `Error` instance, `instanceof` works, and UI surfaces a
consistent title/message/retry. See [error-handling.md](error-handling.md).

## ADR-6: Accessibility-first shell

**Context**: Navigation and content changes must be perceivable and operable by keyboard and
screen reader users (WCAG 2.2 AA baseline).

**Decision**: Shell with `<header>`/`<nav>`/`<main>`/`<footer>` landmarks, a skip link as the
first focusable element, a `RouteAnnouncer` live region, focus management on client-side
navigation, `lang="en"` on `<html>`, and `prefers-reduced-motion` handling.

**Consequences**: accessible by default; enforced in CI via ESLint a11y, `vitest-axe`, and
Playwright keyboard/axe journeys. See [accessibility.md](accessibility.md).

## ADR-7: Testing stack

**Context**: Quality gates must run fast and stay meaningful; no manual QA ritual.

**Decision**: Vitest (jsdom) for unit + component tests with Testing Library + `userEvent`,
`vitest-axe` for a11y assertions, Playwright for critical e2e journeys. Coverage thresholds
80/80/80/80 enforced by `vitest.config.ts`.

**Consequences**: `pnpm test` + `pnpm test:e2e` are the CI quality gate; tests colocate with
the code they verify. See [testing.md](testing.md).

## ADR-8: Tooling gate + single final PR delivery

**Context**: The template evolves in controlled increments; reviewers deserve small, coherent
work units and future apps need one atomic "mold" to consume.

**Decision**: Conventional Commits enforced by commitlint + husky (`.husky/commit-msg`). The
Makefile mirrors pnpm scripts for backend-standard parity. Delivery is a single final PR
(maintainer-approved `size:exception` on `chore/stack-setup`) accumulated phase by phase;
no commits go to `develop`/`staging`/`main` directly.

**Consequences**: every commit is a reviewable work unit; `make ci` gates the pipeline locally
and the GitHub Actions workflow in `.github/workflows/ci.yml` enforces the same steps in CI;
consumers get one coherent template snapshot.

## ADR-9: CI-gated merge acceptance + branch protection

**Context**: Historically, the CI pipeline in `.github/workflows/ci.yml` produced checks but
branch protection had an empty `required_status_checks.contexts` list ("pending CI" item), so a
PR could merge without CI or commitlint ever passing. Commits with `Co-Authored-By` or
AI-attribution trailers were not rejected by commitlint's conventional config.

**Decision**: Establish CI-gated merge acceptance on `develop`, `staging`, and `main`, ADR-9
(MA-1..MA-5):

- **Required status checks** `required_status_checks.contexts = ["quality-gates", "e2e",
  "commitlint"]` with `strict: false` on all three branches. Job keys equal their display
  names so the required-check context strings are unambiguous. `preview` is **not** required
  (artifact-only, non-deterministic).
- **Review rules** on all three: `required_approving_review_count = 1`, `dismiss_stale_reviews
  = true`, `require_last_push_approval = true`. `develop` keeps the `leandrojaviercepeda`
  review-bypass for solo self-merge; `staging`/`main` have no bypass.
- **Enforcement** `enforce_admins = true` on all three so rules apply to admins; required
  checks cannot be overridden by review bypass. The residual manual GitHub Settings UI
  override is an accepted, documented backdoor (`.github/BRANCH-PROTECTION.md`, MA-4).
- **Commitlint gate** a PR-only `commitlint` job validates `base.sha → head.sha` with
  `--first-parent`; a custom `no-co-authored-by` commitlint rule (severity 2) rejects
  `Co-Authored-By` / `Co-authored-by` and AI-attribution trailers, shared by the local husky
  hook and CI.

**Consequences**: merges into environment branches are blocked until all three checks pass and
a review approves; AI-attribution trailers are rejected both locally and in CI (repo is source
of truth); the admin backdoor is auditable. Requires CI-first rollout — land the `commitlint`
job and config green on `develop` before flipping required checks (design Decision 3).

## ADR-10: Zustand for client/UI state

**Context**: ADR-3's "no global store by default" covered the template's early needs, but
cross-component UI state (theme, sidebar, dialogs) accumulated Context boilerplate and
re-render management that a purpose-built client store solves more simply. State split into
two established camps: server data on TanStack Query, UI state in local hooks — nothing clean
for UI state shared across unrelated components.

**Decision**: Zustand v5 is the canonical client/UI state store, registered under
`dependencies`. Stores live in `src/stores/` following the v5 TypeScript pattern
(`src/stores/use-ui-store.ts`): a vanilla `createStore` (testable outside React), exported
`initialState`, standalone external selectors (`selectTheme`, `selectSidebarOpen`), and a
bound hook (`useUiStore`) via `useStore(store, selector)`. Consumers subscribe through
selectors so re-renders stay scoped to their slice. **This supersedes ADR-3's "no global
store by default" line for cross-component UI state.** Server data remains exclusively on
TanStack Query; component-local state stays on `useState`/`useReducer`. No Zustand
middleware (persist, devtools, immer). Test isolation resets each store's `initialState` in
`src/test/setup.ts`.

**Consequences**: shared UI state has one typed, tested home with minimal re-renders; stores
are unit-testable without React. Costs: a third state tool to learn (Query vs store vs local
hook — the boundary is documented in [component-patterns.md](component-patterns.md)), and
teams must resist dragging server cache into the store. Cherry-picking Zustand for
`useState`-sized local state is actively discouraged (CSM-11).

## ADR-11: Typed, fail-fast env handling via Doppler/Vite

**Context**: the template documented the `VITE_` prefix convention (`.env.example`, README) but
did not consume env vars in code, and `src/vite-env.d.ts` only referenced `vite/client` — no
typing for `ImportMetaEnv`. Secrets were also manual. This left every future app without a
single typed gateway, so a missing variable would silently surface as a runtime-only bug (e.g.
`undefined` reaching an API call).

**Decision**: secrets and config come from **Doppler** (project `frontend-standard-project`,
configs `dev`/`dev_personal`/`stg`/`prd`) and are injected at build time via `doppler run`
(`make dev`/`make build`). Vite bakes `VITE_*` into the bundle, so env is **build-time
immutable** — the environment is derived from `import.meta.env.MODE`, never duplicated as an
extra variable (ADR-11). All typed reads go through a single module
`src/lib/env.ts` that exports `env`, `envMode`, `isDev`/`isStaging`/`isProd`, and pure,
testable `resolveMode`/`requireEnv`/`resolveEnv`. A missing required `VITE_*` throws an
`AppError` with code `ENV_MISSING` **at import** (fail-fast), never later. `ImportMetaEnv` in
`src/vite-env.d.ts` is the single typed source of truth, kept in sync with `.env.example` and
Doppler. `src/test/setup` and `.env.test` keep a stable placeholder (`https://test.invalid`) so
tests stay deterministic and never hit a real host.

**Consequences**: a loud, typed startup error for misconfiguration instead of a silent
runtime 404; one gateway that is trivially unit-testable; env files stay out of the repo
(`.env*` gitignored). Costs: because VITE vars are baked at build time, the running nginx
container cannot override them — changing an env requires a rebuild for the target mode, and
the Docker build stage must receive the env (see `Makefile`/compose). Teams must keep
`ImportMetaEnv`, `.env.example`, and Doppler in sync manually.

## ADR-12: Supported languages and mandatory key parity

**Context**: the console is user-facing copy in three product languages — English, Spanish,
and Brazilian Portuguese. The sibling API (`countergank/api-user`) already localizes its
error messages per `Accept-Language`, so a UI that ships only one language injects untranslated
text into an otherwise localized product. Before COU-270 the app declared
`languages = [defaultLanguage] as const`, i.e. **only `en` existed**: a key added to English
had no Spanish or Portuguese counterpart and nothing detected the gap. i18next silently falls
back to the raw key, so the failure surfaced as a literal `home.greeting.morning` in the UI,
never as a build error.

**Decision**: `en`, `es`, and `pt` are the supported languages, with mandatory key parity.

- **Source of truth**: `languages = ["en", "es", "pt"]` in `src/lib/i18n/resources.ts`.
- `defaultLanguage = "en"` and `fallbackLng = "en"` (`src/lib/i18n/index.ts`). English is the
  reference every other bundle mirrors.
- Every user-visible string **MUST** exist in all three bundles
  (`src/lib/i18n/locales/{en,es,pt}.ts`). Parity is mandatory and non-negotiable.
- **Types enforce it**: `es` and `pt` are typed `{ common: TranslationTree }` where
  `TranslationTree = typeof en.common`. A key present in English and missing in Spanish or
  Portuguese is a **TypeScript compile error** naming the key. `en.ts` therefore must **not**
  use `as const` (which would literalize every value and make no other language satisfiable).
  `bundles` uses `satisfies Record<AppLanguage, { common: TranslationTree }>`.
- **The test enforces what types cannot** (`src/lib/i18n/parity.test.ts`): exactly the declared
  languages with no duplicates; a bundle per declared language; key parity with English **in
  both directions** (no missing and no extra keys); identical `{{...}}` interpolation tokens
  per key; and no empty/whitespace-only translations.
- **`pt` is pt-BR**, matching the API's Portuguese wording (`Usuário`/`Solicitação`), not
  pt-PT (`Utilizador`/`Pedido`).

**Consequences**: adding a language is a three-place change — a new bundle, `languages`, and
the parity test's expected set. A missing key fails the build (type error) *and* the test; an
extra key, drifted interpolation token, or blank value fails the test. The cost is that the
three bundles must be updated together; a string cannot be added to English alone.

**Example**: adding `common.home.hero.cta` to `en.ts` but not to `es.ts` fails twice —
`pnpm typecheck` reports `Property 'cta' is missing in type ...` and
`pnpm test -- src/lib/i18n/parity.test.ts` reports the missing key path.

## ADR-13: Public informational surfaces + gated management console

**Context**: COU-281 delivered the `/login` screen and the session runtime, but the app still
has no route guard (U05, declared out of scope in COU-273 and COU-281), so an anonymous visitor
lands on `/` and can browse every route. That is not a design statement: the template's home,
`about` and shell were demo content, and nobody had decided what is public and what is not. The
project's stated purpose settles it: an **open-source dashboard for managing a
`countergank/api-user` deployment**, with an informational home that explains what the project
is and what service it provides, and a management console behind authentication. It is not a
commercial product, so there is no CMS, no blog and no growth funnel to justify a marketing
stack. The decision has to come before the routes are written, because it fixes the router
shape, the post-login destination and where the shell lives.

Two sources of evidence shape the decision. OWASP ASVS 5.0 **V8.3.1** requires authorization to
be enforced "at a trusted service layer" and forbids relying on "controls that an untrusted
consumer could manipulate, such as client-side JavaScript": a route guard is UX, and `api-user`
stays the authority. And the architectural pattern of comparable products is two surfaces on one
deployable — `supabase.com/` is the public home while `/dashboard` is the gated product.

**Decision**: the app has **two surfaces, one repository, one deployable**.

- **Public surface** — no console shell, own layout, no session required:
  - `/` — informational home: what the project is, the service it provides, feature list,
    quickstart (`docker compose up`), stack, and links to repository, docs and license.
  - `/about` — kept public, the project/organization page.
  - `/login` — the gate delivered by COU-281, unchanged in placement.
- **Console surface** — everything under `/app/*`, gated by session:
  - `/app` (summary), `/app/users`, `/app/roles`, `/app/permissions`, `/app/audit`,
    `/app/settings`.
  - `AppShell` becomes the **console layout only**: navigation, skip link, route announcer,
    focus management, session-expiry bridge and footer belong to the authenticated area, not to
    the public pages. Route-level layout split, not a conditional inside one component.
- **Post-login destination is `/app`.** `DEFAULT_REDIRECT` in
  `src/features/auth/safe-redirect.ts` changes from `/` to `/app`; the allowlist itself
  (same-origin absolute path, no protocol-relative form, no backslash, no control characters)
  stays as shipped.
- **Authorization stays server-side.** `/app/*` is gated for UX and deep-link preservation; every
  request is still authorized by `api-user` (ASVS V8.3.1). The UI never decides what a user may
  read or write.
- **Session is validated at boot.** A persisted session is confirmed with `GET /auth/me` before
  the console trusts it, and the proactive refresh is (re)scheduled for the hydrated token — today
  it is only scheduled on a token *change*, so a reload with a live session skips it.
- **The informational home is static content.** No live API data on public pages: a public endpoint
  returning aggregate product numbers would be new attack surface and is not needed to explain the
  project. Strings live in i18n bundles with mandatory `en`/`es`/`pt` parity (ADR-12).
- **No prerender or SSR in this decision.** Because the project is not commercial, SEO is not a
  driver; if it becomes one, prerendering the public routes is an isolated later change and does
  not require revisiting the surface split.

**Consequences**: the router gains a second top-level layout, so `src/routes/routes.test.tsx`
asserts the public/console split instead of the current single-shell tree; a guard test pins that
an anonymous or expired session lands on `/login?redirect=…` and returns afterwards; the landing
gets its own tests (structure, copy from resources, axe). Existing deep links to the template's
`/` change meaning — the template home is retired and `about` moves out of the shell — which is
acceptable while the project has no users. Costs: one more layout to keep accessible, and the
`/app` prefix must be woven into navigation, redirects and tests. Benefits: the public surface is
independently cacheable and shareable, the console is unambiguously private, and a future move to
two deployables (static marketing + SPA console) is an infrastructure change rather than a rewrite.

## Adding a new ADR

Append a numbered ADR with the same **Context → Decision → Consequences** shape. Keep it
short, reference real files, and pair it with a test where a decision is testable.