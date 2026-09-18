# AGENTS.md — UI User

This repository is a countergank frontend application: the user management UI for
`countergank/api-user`. It was bootstrapped from the countergank **standard frontend mold**
(`countergank/frontend-standard-project`) and inherits its governance. AI agents and human
contributors are governed by the same rules below.

## Read first

- `.atl/skill-registry.md` — index of installed skills; load the matching `SKILL.md` before
  working in that area.
- `skills-lock.json` — pinned skill versions and hashes (the registry's source of truth).
- `docs/` — the standards library: `adr.md`, `folder-structure.md`, `component-patterns.md`,
  `error-handling.md`, `accessibility.md`, `testing.md`, `release-process.md`.
- `openspec/` — the SDD plan artifacts (spec, design, tasks, verify-report) for this change.

## Non-negotiable rules

1. **Conventional Commits** — enforced by commitlint + husky (`.husky/commit-msg`). Use
   `feat | fix | docs | chore | test | ci | refactor` with a scope (e.g. `feat(project)`).
   No `Co-Authored-By` or AI-attribution trailers.
2. **Branch flow** — `feature/*` → `develop` → `release/x.y.z` → `staging` → `main`; hotfixes
   `hotfix/*` → `main` → backmerge `develop`. Feature PRs always target `develop`.
   See `.github/FLOW.md`.
3. **PRs** — merging to `develop` / `staging` / `main` requires the CI gate
   (`quality-gates` + `e2e` + `commitlint`) and at least 1 approving review on all three
   branches; stale reviews are dismissed, force-push is blocked, and the admin Settings
   backdoor is documented. See `.github/BRANCH-PROTECTION.md` and ADR-9 (`docs/adr.md`).
4. **Planning** — work is planned in Linear tickets and executed via SDD phases in `openspec/`;
   consult the `linear-tickets` skill for ticket conventions.
5. **No direct pushes** to `develop` / `staging` / `main` — every change lands via a PR
   that satisfies the CI gate (`quality-gates` + `e2e` + `commitlint`) and review.

## Skills mapping (authoritative at `.atl/skill-registry.md`)

| Work area | Skill |
|-----------|-------|
| React / TypeScript / Vite / styling / a11y / tests | `.agents/skills/react-frontend/SKILL.md` |
| Commits, PRs, branches, changelogs | `.agents/skills/github-conventions/SKILL.md` |
| Environment branches, releases, hotfixes | `.agents/skills/git-environment-flow/SKILL.md` |
| Linear ticket creation and linking | `.agents/skills/linear-tickets/SKILL.md` |

## Stack (change only with an ADR in `docs/adr.md`)

Node `>=22` · pnpm `9.15.9` · Vite 6 · React 19 · TypeScript (strict) · Tailwind + shadcn/ui ·
TanStack Query 5 · React Router 7 · Biome + ESLint · Vitest + Testing Library + Playwright.

## Commands

```bash
pnpm install        # or: make install
pnpm dev            # or: make dev    (http://localhost:3000)
pnpm test           # or: make test
pnpm test:coverage  # or: make test-coverage
pnpm test:e2e       # or: make test-e2e   (pnpm exec playwright install chromium first)
pnpm lint           # Biome + ESLint
pnpm typecheck      # strict TS
pnpm build          # type-check + bundle to dist/
make ci             # full local gate: lint + typecheck + test:coverage + build
```

## Standards this template enforces

- Components: container/presentational, feature grouping, shadcn primitives,
  role-based test queries — `docs/component-patterns.md`.
- Errors: typed `Error` subclasses, route boundary, retryable error UI — `docs/error-handling.md`.
- Accessibility: WCAG 2.2 AA baseline enforced by lint + axe + Playwright — `docs/accessibility.md`.
- Testing: strict TDD, 80% coverage floor, colocated tests — `docs/testing.md`.
- Releases: SemVer from Conventional Commits, annotated tags, release branches — `docs/release-process.md`.

When you solve a bounded review defect, correct the root cause in the repo, not in a doc that
mirrors it — the repo is the source of truth.