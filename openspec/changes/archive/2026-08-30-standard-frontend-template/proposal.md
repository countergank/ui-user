# Proposal — standard-frontend-template

## Intent

Create **countergank/frontend-standard-project** as the organization's STANDARD FRONTEND
TEMPLATE (mold/base). It will define and expose the canonical technologies, tools,
architecture, and conventions that every future countergank frontend application reuses as
its starting point, so that new apps are consistent, accessible, well-tested, and cheap to
maintain.

This change is the **planning** deliverables (proposal, spec, design, tasks). Execution
happens incrementally, one Linear ticket per fundamental part, in dependency order.

## Stack (decided)

| Area | Decision | Rationale |
| --- | --- | --- |
| Language | TypeScript 5 (strict) | Org standard; the react-frontend skill mandates `strict` always. |
| UI framework | React 19 | Aligned with the org's published `react-frontend` skill and the fullstack-playbook. |
| Build tooling | Vite | Dev server + bundler per skill; fast HMR, path aliases, env variables. |
| Styling | Tailwind CSS + shadcn/ui | shadcn/ui built on Radix UI + CSS variables + CVA. Tailwind is the styling base. Chosen to ship accessible, composable components. |
| State (server) | TanStack Query | Robust server-state/data-fetching layer. |
| State (global) | React hooks + Context (minimal) | Local state first; no heavy global store by default. |
| Routing | React Router | Standard SPA routing (matched to Vite SPA model). |
| Testing (unit) | Vitest | Skill-aligned test runner. |
| Testing (component) | Testing Library + User Event | Role-based, accessible queries. |
| Testing (E2E) | Playwright | Full-browser E2E. |
| Testing (a11y) | axe (via Testing Library) | WCAG 2.2 automated checks per the skill. |
| Lint/Format | Biome + ESLint (a11y) | Biome for speed and consistency; ESLint for a11y/React specific rules per skill asset. |
| CI/CD | GitHub Actions | Lint, typecheck, unit+integration, coverage gates, E2E; preview deploys. |
| Package manager | pnpm | Fast, strict, org-friendly workspace-aware. |
| Commit conventions | Conventional commits + commitlint + husky | Mirrors backend standard (commitlint.config.ts). |

> Note: the react-frontend skill's CSS guidance assumes CSS Modules / modern CSS. Because we
> adopt Tailwind + shadcn/ui, the applicability of the skill's `css-responsive` rules is
> preserved (mobile-first, layout, breakpoints) while the implementation medium becomes
> Tailwind utilities + shadcn primitives. This is a documented, deliberate deviation.

## Architecture (to be detailed in design)

- **Screaming/feature-based folder structure** (`src/features/<domain>/`), not flat layers.
- **Atomic design** applied via shadcn/ui components (ui/presentation vs. feature-specific).
- **Container/presentational** split where it reduces coupling.
- **Error handling**: typed error instances, error boundaries at route level, consistent
  async/data-fetching error handling via TanStack Query.
- Accessibility (WCAG 2.2) baked in from the start (semantic HTML, focus, labels, landmarks,
  keyboard, reduced motion) per the skill's 87 rules.

## Standards (to be detailed in design/tasks)

- Folder structure, naming conventions (components, hooks, files, tests colocated).
- Conventional commits + work-unit commits; PR review policy; branch naming (mirrors
  github-conventions skill).
- `.vscode/`, `.editorconfig`, `.nvmrc`, `biome.json`, `tsconfig.json` strict.
- `docs/` folder + agent-readable standards (AGENTS.md / registry) + README.
- CI/CD pipeline + coverage thresholds.

## Fundamental parts → Linear tickets

Tickets are created in Linear (project named exactly `frontend-standard-project`, all
assigned to **Leandro Cepeda**), one per fundamental part, ordered by dependency. Each
ticket references its SDD phase and associated artifacts.

1. **Skills configuration** (HIGH, runs first): integrate countergank skills into the
   project (`npx skills add countergank/skills`), especially `react-frontend`; leave the
   skill registry/config ready (`.atl/skill-registry.md` + agent config) so all later work
   is governed by those skills. → SDD: part of explore/propose; first execution unit.
2. **Stack setup**: scaffold the Vite + React 19 + TS strict + Tailwind/shadcn + Vitest +
   ESLint/Biome project skeleton, tooling config, tsconfig aliases, .nvmrc, .editorconfig,
   .vscode. → SDD: apply of stack-design slice.
3. **Architecture**: feature-based structure, container/presentational + atomic via shadcn,
   error handling, base layout/shell, a11y scaffolding. → SDD: design+apply.
4. **Testing**: unit + integration + a11y (axe) + E2E (Playwright) + coverage thresholds +
   TDD workflow. → SDD: tasks+apply.
5. **CI/CD**: GitHub Actions (lint/typecheck/unit+integration/coverage/E2E) + preview.
   → SDD: tasks+apply.
6. **Tooling & repo hygiene**: conventional commits, husky + commitlint, Makefile,
   Dockerfile, skills-lock, README, docs/. → SDD: tasks+apply.
7. **Documentation**: `docs/` standards + agent standards + README, documenting how future
   apps consume the template. → SDD: tasks+apply + archive merge.

## Non-goals (this change)

- NO application-specific product features. The repo ships a template/skeleton and standards,
  not a business app.
- NO full-stack/SSR (no Next.js). SPA-first per decision.
- No external global state library beyond TanStack Query + React built-ins.

## Risks

- **shadcn/Tailwind vs skill's CSS-Modules rules**: the react-frontend skill's css rules
  assume plain CSS; we deliberately adopt Tailwind + shadcn. Mitigation: preserve the skill's
  responsive/a11y intent while documenting the styling-medium deviation.
- **Skill hasn't been added to the repo yet**: react-frontend must be installed in ticket #1
  before stack work; keep a manual copy of the skill's key constraints in the repo until then.
- **Scope size**: full plan is large; mitigated by strict ticket-per-part ordering and the
  400-line review budget (chained PRs if a part overflows).
- **Template "empty-ness" vs. immediacy**: the value is long-term consistency, not a working
  demo today; keep the skeleton minimal but real.
