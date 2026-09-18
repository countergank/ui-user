# Archive Report — standard-frontend-template

**Change**: standard-frontend-template
**Archived on**: 2026-08-30
**Archived to**: `openspec/changes/archive/2026-08-30-standard-frontend-template/`
**Branch**: `chore/stack-setup` @ `ace00cf` — do NOT push/merge/PR from archive; the orchestrator handles the final PR.
**Artifact store mode**: both (OpenSpec files authoritative + Engram mirrors state)
**DAG**: explore → propose → spec → design → tasks → apply → verify → archive (all 8 phases `done`)

## Change summary (what was built)

The `standard-frontend-template` change built countergank's standard frontend template in
8 phases, each mapped to a Linear ticket (all to Leandro Cepeda):

1. **Skills (COU-121)**: countergank skills integrated (`react-frontend` first-class, 87 rules
   across 10 categories, plus `github-conventions`, `git-environment-flow`, `linear-tickets`);
   `.claude/skills` symlinks; `skills-lock.json` content-hash pinning; `.atl/skill-registry.md`
   registering all three with the ADR-2 Tailwind/shadcn deviation recorded. Shipped via PR #1.
2. **GitHub flow (COU-249)**: `.github/PULL_REQUEST_TEMPLATE.md`, `COMMIT_TEMPLATE.txt`,
   `FLOW.md`, `BRANCH-PROTECTION.md`, `docs/release-process.md`; environment branch model
   (feature → develop → release/x.y.z → staging → main, hotfix flow), SemVer release mechanics
   with annotated tags. Shipped via PRs #3-#4.
3. **Stack (COU-122)**: pnpm Vite skeleton, strict TypeScript + `@/` alias, Tailwind +
   shadcn/ui (Radix + CSS vars + CVA), Biome + ESLint a11y, `.nvmrc`, `.editorconfig`, `.vscode`.
4. **Architecture**: `src/features/home/` (container/presentational), accessible app shell
   (landmarks, skip link as first tab stop, `RouteAnnouncer`, focus management),
   React Router lazy routes + Suspense, TanStack Query client, typed `Error` subclasses
   (`AppError`/`DataFetchError`/`RouteError`/`toError`) + `RouteErrorBoundary` + `ErrorView`.
5. **Testing**: Vitest (jsdom, colocated, coverage 80/80/80/80), Testing Library + userEvent
   role-based tests, vitest-axe a11y pipeline, Playwright e2e critical journeys (keyboard +
   reduced-motion + axe + `#fail` recovery), strict TDD enabled in `openspec/config.yaml`.
6. **CI/CD (COU-128)**: `.github/workflows/ci.yml` — `quality-gates` (lint/typecheck/
   test:coverage/build), `e2e` (Playwright), `preview` (PR artifact `preview-dist`).
7. **Tooling (COU-123/124/125/127)**: commitlint + husky v9 conventional-commit hook,
   Makefile, multi-stage Dockerfile + nginx SPA fallback (docker built+run smoke-tested),
   `.env.example`/`.env.test`, `.dockerignore`.
8. **Documentation (COU-129)**: `docs/` standards library (adr.md with ADR-1..8,
   folder-structure, component-patterns, error-handling, accessibility, testing,
   release-process), `AGENTS.md` governance, `README.md` purpose/quickstart/consumption guide.

## Verification status

- **Verdict**: PASS WITH WARNINGS (`gentle-ai sdd-verify-validate` valid=true,
  pass_with_warnings, req 33, scen 0). Phase 8 full-change report supersedes/extends the
  Phase 1 skills-scope report.
- **Compliance**: 33/33 requirements compliant across 7 delta domains (stack 9, architecture
  6, testing 5, ci-cd 3, tooling 4, documentation 3, skills 3).
- **Blockers**: 0 · **CRITICAL findings**: 0.
- **Runtime evidence**: `pnpm test` 49 passed / 0 failed (14 files); Playwright e2e 7/7;
  coverage 98.68% stmts / 94.28% branch / 92.3% funcs / 98.68% lines (threshold 80);
  `pnpm lint`, `pnpm typecheck`, `pnpm build` all exit 0; commitlint good=0 / bad=1;
  `make -n lint` maps to `pnpm lint`.
- **E2E flakiness (real gatekeeper finding)**: React mount race in the skip-link/keyboard
  journeys surfaced during Phase 5; fixed in commit `3bffcd9` (skip-link `waitFor` +
  single-worker Playwright config) and verified with 5 consecutive full e2e runs, 7/7 green
  each. Verdict remains pass_with_warnings per validator; no re-verify required.

## Final-state facts (at close)

- **Tasks**: 28/28 `[x]` in `tasks.md` (Phases 1-8); 0 unchecked. Task Completion Gate:
  PASS, validated on the persisted artifact before archiving.
- **Commits**: branch `chore/stack-setup` carries **25 commits** not in `origin/develop` at
  archive time. Launch final-state stated 24 — that count predates the 25th commit `ace00cf`
  ("chore(sdd): append full-change verification report"); counting against the stale local
  `develop` ref (2 behind origin) shows 27. Phases 1-2 already merged via PRs #1-#4; commits
  #3-#25 are Phases 3-8 plus the verify-report append.
- **Gates green**: lint, typecheck, unit+component+a11y, e2e, coverage, build, commitlint,
  Makefile dry-run — all verified at runtime by sdd-verify.
- **DAG**: `state.yaml` phases reconciled at archive time — apply/verify/archive set to
  `done`, `delivery` records single-pr resolution.
- **Native review receipt**: `reviewGate` structurally absent — no review artifact was
  discovered for this candidate; archive proceeded under ordinary repository policy (nothing
  to read, nothing to block on).

## Artifacts (archived)

| Artifact | Path |
|---|---|
| exploration | `openspec/changes/archive/2026-08-30-standard-frontend-template/exploration.md` |
| proposal | `…/proposal.md` |
| specs (7 domains) | `…/specs/{stack,architecture,testing,ci-cd,tooling,documentation,skills}/spec.md` |
| design | `…/design.md` |
| tasks | `…/tasks.md` |
| verify-report | `…/verify-report.md` |
| state | `…/state.yaml` |
| archive report | `…/archive-report.md` (this file, additive) |

## Engram traceability (observations read)

| Artifact | Observation ID |
|---|---|
| proposal | #1527 (topic `sdd/standard-frontend-template/proposal`) |
| spec + design + tasks | #1528 (topic `sdd/standard-frontend-template/tasks`) |
| apply-progress | #1540 (topic `sdd/standard-frontend-template/apply-progress`) |
| verify-report | #1558 (topic `sdd/standard-frontend-template/verify-report`) |

## Spec sync actions

**N/A by design.** This repo's openspec tracks only change deltas: there is no
`openspec/specs/{domain}/spec.md` main-spec tree and no `openspec/project/` tree. The seven
delta specs are the authoritative spec record and travel with the change into the archive.
No main-spec merge was performed (nothing to merge into, nothing destructive — the
`config.yaml` archive rule "warn before merging destructive deltas" is not triggered). A
main-spec/project tree was deliberately NOT invented, per the launch instruction and the real
opencode layout.

## Follow-ups (non-blocking; all recorded in verify-report as WARNING/SUGGESTION)

1. **Task 2.4 (WARNING)** — associate the CI status check with the develop/staging/main
   branch protections (`required_status_checks` currently empty) once `.github/workflows/ci.yml`
   first runs on the default branch. CI/environment follow-up, NOT a spec violation.
2. **Preview job (SUGGESTION)** — ships a downloadable `preview-dist` artifact, not a live
   preview URL; Pages/Vercel promotion path documented inline in ci.yml. Future enhancement.
3. **skills-lock.json (SUGGESTION)** — pins by content hash only; add an explicit `version`
   field per entry (version currently lives in SKILL.md metadata) for at-a-glance audibility.

## Close status

**ARCHIVED.** The change folder was mechanically moved to
`openspec/changes/archive/2026-08-30-standard-frontend-template/` (snapshot → `git mv` →
empty `diff -r` readback, exit 0). The active `openspec/changes/` directory no longer
contains this change. In this layout "closed" means: archive move completed + DAG phases
marked `done` in `state.yaml` + this archive report recorded. There is no separate
change-state registry in `openspec/config.yaml` to update. The change is fully planned,
implemented, verified, and archived — the SDD cycle is complete for this change.