# Exploration — standard-frontend-template

Date: 2026-08-29
Status: completed

## Goal
Plan the countergank STANDARD FRONTEND TEMPLATE repository: technologies, tools,
architecture, and conventions to be reused as the mold/base for all future countergank
frontend applications. This change captures the full plan (proposal → spec → design → tasks).
Execution happens incrementally, one Linear ticket per fundamental part.

## Explored context

### 1. countergank/skills repository
- Skill packaging: `npx skills add countergank/skills` discovers `skills/` and installs to the
  agent's skill directory. Skills follow the Vercel `react-best-practices` pattern:
  `SKILL.md` (trigger-first, ~300-450 tokens) + `rules/<category>/p<0-3>-*.md` + `assets/`.
- The **`react-frontend`** skill is published there (v1.0.0, author countergank):
  - Stack it encodes: **React 19, TypeScript 5, Vite, Vitest + Testing Library**.
  - 87 WCAG 2.2-compliant rules across 10 categories (react, typescript, accessibility,
    vite, vitest, css-responsive, performance, composition, bundle-loading, ux-design-tokens).
  - Key constraints: TS `strict` always; semantic HTML over ARIA; server by default / client
    only for interactivity; mobile-first responsive; parallel data fetching; Suspense
    boundaries; dynamic imports per route; measurable coverage thresholds; error instances
    (not strings); reader/guardrail: no non-null assertions, no `dangerouslySetInnerHTML`.
  - Ships config assets: `eslint.config.js`, `vite.config.ts`, `vitest.config.ts`,
    `RouteAnnouncer.tsx`.
- Note: README's "Available Skills" table only lists `nestjs-backend`, but `react-frontend`
  is present under `skills/` — the table is stale; the skill is installable.

### 2. fullstack-playbook (countergank educational reference)
- Confirms the org's frontend stack direction: React as UI framework, Vite as bundler/dev
  server, Vitest as test runner, SPA-first, accessibility (axe DevTools + Lighthouse ≥ 90),
  modern CSS (mobile-first, Flexbox/Grid, custom props), TypeScript.
- Frontend core learning order: semantic HTML → modern CSS → JS ES6+ → TS → DOM → a11y → Web APIs.

### 3. backend-nosql-standard-project (sibling "standard template" reference)
The org's backend template gives the repository-conventions mold the frontend should mirror:
- `.atl/skill-registry.md` (skill registry, gentle-ai generated)
- `openspec/` (SDD artifacts; archived changes with proposal/spec/design/tasks/apply/verify/archive)
- `.github/` (CI workflows), `.husky/` (git hooks), `.vscode/` (editor config)
- `biome.json` (Biome lint/format), `commitlint.config.ts` (conventional commits)
- `Makefile`, `Dockerfile`, `.nvmrc`, `skills-lock.json` (pinned skills)
- `src/` + `test/` separation
- `.env`, `.env.example`, `.env.test` (env management)

## Constraints and non-goals
- This SESSION is plan-only. No stack scaffolding until the plan is approved and Linear
  tickets are created.
- Stack execution happens incrementally, ticket by ticket.
