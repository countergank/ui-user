# Tasks: Standard Frontend Template

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~3500–4500 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 skills → PR2 github-flow → PR3 stack → PR4 architecture → PR5 testing → PR6 CI/CD → PR7 tooling → PR8 docs |
| Delivery strategy | ask-on-risk (resolved: exception-ok for stack per user decision) |
| Chain strategy | single-pr (user chose one PR with size:exception) |

Decision needed before apply: Yes (user resolved: single PR with size:exception)
Chained PRs recommended: Yes (user opted for single-pr instead)
Chain strategy: single-pr
400-line budget risk: High (user accepted size:exception)

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Skills integration (react-frontend) | PR 1 (merged) | `npx skills list` shows react-frontend | local npm | revert registry + skills-lock |
| 2 | GitHub flow: .github templates, flow docs, release mechanics | PR 2 | markdown/link check | local gh | revert .github/ + docs |
| 3 | Scaffold Vite+React19+TS+Tailwind/shadcn skeleton | PR 3 | `pnpm build` | `pnpm dev` | delete scaffolded src/config |
| 4 | Architecture: features dirs, shell, error handling | PR 4 | `pnpm test` (unit+comp) | `pnpm dev` | revert src/features + shell |
| 5 | Testing: Vitest+Testing Library+axe+Playwright, coverage | PR 5 | `pnpm test && pnpm test:e2e` | `pnpm test:e2e --headed` | remove e2e/ + config blocks |
| 6 | CI/CD: GitHub Actions + preview | PR 6 | `act` / CI status | push trigger | remove .github/workflows |
| 7 | Tooling/hygiene: commitlint, husky, Makefile, Dockerfile, .nvmrc | PR 7 | `make ci` | `make dev` | revert tooling files |
| 8 | Docs: docs/ + AGENTS.md + README | PR 8 | `make docs` / link check | local md render | revert docs/ |

## Phase 1: Skills (ticket #1 — COU-121) DELIVERED
- [x] 1.1 Run `npx skills add countergank/skills`; verify `react-frontend` installs.
- [x] 1.2 Write `skills-lock.json` pinning countergank skills (react-frontend).
- [x] 1.3 Update `.atl/skill-registry.md` to register `react-frontend`; record Tailwind/shadcn deviation in agent config.

## Phase 2: GitHub flow setup (ticket #2 — COU-249)
- [x] 2.1 Add `.github/PULL_REQUEST_TEMPLATE.md` + `.github/COMMIT_TEMPLATE.txt` from `github-conventions` skill assets (feature PRs target `develop`).
- [x] 2.2 Add `.github/` branch flow documentation pinning environment branches: `develop` default/integration, `staging` pre-prod mirror, `main` production protected; merge direction `feature → develop → release/x.y.z → staging → main → develop (backmerge)`; hotfix flow `hotfix/* → main → backmerge develop only`.
- [x] 2.3 Add release mechanics: version bump from commit history (SemVer), changelog generation, annotated tags `vX.Y.Z` (main) / `vX.Y.Z-rcN` (staging).
- [x] 2.4 Document branch protection reflecting the verified real state: protection already configured on develop/staging/main (1 reviewer, dismiss stale reviews, last-push approval, force-push blocked, enforce admins, admin bypass user leandrojaviercepeda); pending item = associate the CI check with all three protections once `.github/workflows/ci.yml` lands in Phase 6 (required_status_checks currently empty because CI does not exist yet).

## Phase 3: Stack setup (ticket #3 — COU-122)
- [x] 3.1 Scaffold `src/` skeleton: package.json (pnpm), .nvmrc, .editorconfig, .vscode.
- [x] 3.2 Add `tsconfig.json` strict + `@/` alias; `vite.config.ts` with alias/env (`vite-001/002`).
- [x] 3.3 Set Tailwind + shadcn/ui (Radix, CSS vars, darkMode class); `src/components/ui/`.
- [x] 3.4 Add `biome.json` + ESLint a11y/recommended config (skill eslint asset).

## Phase 4: Architecture (ticket #4)
- [x] 4.1 Create `src/features/<sample>` structure (components+hooks+api) demonstrating feature layout.
- [x] 4.2 Build app shell: landmarks, skip link, `RouteAnnouncer` (skill asset), focus mgmt.
- [x] 4.3 Add React Router lazy routes + Suspense; TanStack Query client + sample query.
- [x] 4.4 Add typed `Error` subclasses + route `ErrorBoundary` + error UI (`react-011`).

## Phase 5: Testing (ticket #5)
- [x] 5.1 Configure Vitest (jsdom, coverage thresholds) `vitest.config.ts` (skill asset).
- [x] 5.2 RED: write failing unit/component tests per stack+architecture scenarios.
- [x] 5.3 Add Testing Library + `userEvent` component tests; axe a11y assertions.
- [x] 5.4 Add Playwright `e2e/` critical journeys (keyboard + reduced-motion).
- [x] 5.5 Enable strict TDD in `openspec/config.yaml` once runner confirmed.

## Phase 6: CI/CD (ticket #6)
- [x] 6.1 Add `.github/workflows/ci.yml`: lint, typecheck, test+coverage, build, e2e.
- [x] 6.2 Add preview deploy step for PRs.

## Phase 7: Tooling & hygiene (ticket #7)
- [x] 7.1 Add `commitlint.config.ts` (conventional commits) + husky hooks.
- [x] 7.2 Add `Makefile` (dev/test/ci) + `Dockerfile` + `.env.example`/`.env.test`.

## Phase 8: Documentation (ticket #8)
- [x] 8.1 Add `docs/` (ADR, folder structure, component patterns, error handling, a11y policy, testing strategy).
- [x] 8.2 Add `AGENTS.md` pointing to countergank skills + repo standards.
- [x] 8.3 Write README (purpose, quickstart, consumption guide).
- [x] 8.4 Verify doc links and agent-readable standards resolve.

## Implementation order
Skills (1) → GitHub flow (2) → stack (3) → architecture (4) → testing (5) → CI/CD (6) → tooling (7) → docs (8),
strictly by dependency; each maps to one Linear ticket assigned to Leandro Cepeda.
