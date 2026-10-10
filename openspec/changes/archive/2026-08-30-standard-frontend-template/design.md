# Design — standard-frontend-template

## Overview

This design defines the concrete architecture and technical approach for the standard
frontend template, mapped to the spec requirements and the Linear ticket breakdown. The
template is both a working skeleton and a documented standard.

## Architecture decisions (ADR)

### ADR-1: Feature-based (screaming) source layout
- **Context**: Future apps should be navigable by business capability, not by layer.
- **Decision**: `src/features/<feature>/` groups a capability's components, hooks, domain
  logic. Cross-cutting layers: `src/components/` (shared presentational), `src/components/ui/`
  (shadcn primitives), `src/hooks/`, `src/lib/` (utils, query client, api), `src/routes/`.
- **Consequences**: Fits the container/presentational pattern; avoids scattered files;
  aligns with ARCH-1.

### ADR-2: Shadcn/ui + Tailwind + Radix for components
- **Context**: Need accessible, composable, themeable primitives without vendoring a heavy
  UI kit at runtime.
- **Decision**: Tailwind CSS base + shadcn/ui (Radix UI + CSS variables + CVA). Design
  tokens as CSS variables; `darkMode: class`.
- **Deviation note**: the react-frontend skill's `css-responsive` rules are kept in intent
  (mobile-first, breakpoints, fluid type, touch targets) but implemented in the Tailwind
  medium. Documented in `docs/` (DOC-1/2).

### ADR-3: State model
- **Local + server state**: `useState`/`useReducer` + Context for local/UI state;
  TanStack Query for all server data (caching, invalidation, retries, error handling).
- **No global store by default** (ARCH, STACK-6).

### ADR-4: Routing & code splitting
- React Router with `createBrowserRouter`. Route-level lazy loading via `React.lazy` +
  `dynamic import`. Suspense boundaries per route (ARCH-5, bundle-001).

### ADR-5: Error handling
- Typed `Error` subclasses (domain errors); route-level `ErrorBoundary`;
  TanStack Query error states + retry; consistent `<ErrorView>`/skeleton pattern (ARCH-4).

### ADR-6: Accessibility-first shell
- App shell with `<header>`/`<nav>`/`<main>`/`<footer>` landmarks, skip link,
  `RouteAnnouncer` (from the react-frontend skill asset), focus management, reduced-motion
  handling, and `lang` on `<html>` (ARCH-6, STACK-9).

## Folder structure (target)

```
/
├─ .github/workflows/        # CI/CD (CI-1..3)
├─ .husky/                   # git hooks (TOOL-1)
├─ .vscode/                  # workspace settings (TOOL-1)
├─ docs/                     # standards & ADRs (DOC-1..3)
├─ e2e/                      # Playwright specs (TEST-4)
├─ src/
│  ├─ components/
│  │  └─ ui/                 # shadcn primitives (ARCH-2)
│  ├─ features/
│  │  └─ <feature>/
│  │     ├─ <Component>.tsx  (+ .test.tsx colocated)
│  │     ├─ hooks/           # custom hooks (+ tests)
│  │     └─ api.ts           # TanStack Query hooks/queries
│  ├─ hooks/                 # shared hooks
│  ├─ lib/                   # query client, utils, api client
│  ├─ routes/                # route components (lazy)
│  ├─ styles/                # global css, tokens
│  └─ main.tsx / app.tsx     # entry + shell
├─ .editorconfig
├─ .nvmrc
├─ biome.json
├─ commitlint.config.ts
├─ Makefile
├─ Dockerfile
├─ .env.example / .env.test
├─ package.json              # pnpm
└─ openspec/ + .atl/         # SDD + skill registry (SKILL-2)
```

## Testing architecture (TEST-1..5)

- **Unit/integration (Vitest)**: colocated `.test.ts(x)`; Testing Library + `userEvent`;
  role-based queries; axe a11y assertions; `@vitejs/plugin-react` + jsdom env;
  coverage thresholds in `vitest.config.ts`.
- **E2E (Playwright)**: `e2e/` specs, critical journeys + keyboard + reduced-motion.
- Commands: `pnpm test`, `pnpm test:e2e`, `pnpm test:coverage`.

## CI/CD (CI-1..3)

GitHub Actions `ci.yml`: pnpm install → lint → typecheck → test+coverage → build → e2e → preview.

## Skills governance (SKILL-1..3)

Ticket #1 runs `npx skills add countergank/skills`, registers `react-frontend` in
`skills-lock.json` + `.atl/skill-registry.md`, and records the Tailwind/shadcn deviation in
agent config so all later tickets apply the skill rules within the declared styling medium.
