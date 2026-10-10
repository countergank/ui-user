# Archive Report — cou-250-ci-branch-protection

**Change**: cou-250-ci-branch-protection
**Archived on**: 2026-08-31
**Archived to**: `openspec/changes/archive/2026-08-31-cou-250-ci-branch-protection/`
**Branch**: `feature/COU-250-ci-branch-protection` — 4 commits ahead of `origin/develop`. Do NOT push/merge/PR from archive; the orchestrator handles the final PR.
**Artifact store mode**: both (OpenSpec files authoritative + Engram mirrors state)
**DAG**: explore → propose → spec → design → tasks → apply → verify → archive (Phases 1–7 `done`; Phase 5 tasks intentionally unchecked — GitHub Settings remote ops, post-merge admin step)

## Change summary (what was built)

The `cou-250-ci-branch-protection` change adds CI-gated merge acceptance to
`develop`, `staging`, and `main`: a PR whose CI is red or whose commit messages
are non-conventional cannot merge. Linear ticket COU-250 (In Progress → Done after merge).

1. **Phase 1 — Commitlint config (MA-3)**: Custom `no-co-authored-by` rule in
   `commitlint.config.ts` — severity 2 error, regex `/Co-Authored-By:\s*\S/i`.
   Applied locally (husky hook) and in CI.
2. **Phase 2 — CI workflow (MA-1, MA-3)**: `commitlint` job appended to
   `.github/workflows/ci.yml` — PR-only, fetch-depth 0, `--from/--to/--first-parent`.
   `quality-gates` and `e2e` job `name:` overrides removed (display name now equals key
   equals context — required-check alignment).
3. **Phase 3 — Documentation reconciliation (MA-4, MA-5)**:
   - `.github/BRANCH-PROTECTION.md` — contexts `["quality-gates", "e2e", "commitlint"]`,
     develop bypass user, staging/main review rules, `enforce_admins: true`, admin backdoor.
   - `.github/FLOW.md` — merge requires CI + review on all three branches.
   - `AGENTS.md` rule 3 — CI gate as merge criteria.
   - `docs/adr.md` — ADR-9: Context/Decision/Consequences for CI-gated merge acceptance.
4. **Phase 4 — Verification**: full local gate (lint/typecheck/test:coverage/build) all
   pass; commitlint positive + negative checks verified; 49/49 tests green.

**4 commits** on `feature/COU-250-ci-branch-protection` ahead of `origin/develop`.

## Verification status

- **Verdict**: PASS (`gentle-ai sdd-verify-validate` valid=true, verdict=pass,
  5/5 requirements, 10/10 scenarios).
- **Compliance**: 10/10 scenarios compliant across 5 requirements (MA-1 through MA-5).
- **Blockers**: 0 · **CRITICAL findings**: 0.
- **Runtime evidence**: `pnpm lint` exit 0 · `pnpm typecheck` exit 0 ·
  `pnpm test` 49/49 pass · `pnpm build` exit 0 · commitlint pos+neg verified ·
  CI YAML valid.
- Verify report at `openspec/changes/archive/2026-08-31-cou-250-ci-branch-protection/verify-report.md`
  and Engram topic `sdd/cou-250-ci-branch-protection/verify-report` (#1575).

## Final-state facts (at close)

- **Tasks**: 13/13 in-repo tasks `[x]` (Phases 1–4). 3 tasks Phase 5 `[ ]`
  — **intentionally unchecked**: GitHub Settings remote ops, a post-merge admin step,
  NOT repo code. Verified by sdd-verify at verification time.
- **Commits**: 4 conventional commits on `feature/COU-250-ci-branch-protection`
  not in `origin/develop` (6dc8aad, d925613, 1683e93, 6de8b02).
- **Gates green**: lint, typecheck, unit 49/49, build — all verified at runtime
  by sdd-verify.
- **DAG**: No `state.yaml` in change folder (delta-only layout). Phases 1–4 applied
  and verified; Phase 5 is a post-merge operational step recorded as open follow-up.
- **Native review receipt**: `reviewGate` structurally absent — no review artifact
  discovered for this candidate; archive proceeded under ordinary repository policy.

## Artifacts (archived)

| Artifact | Path |
|---|---|
| proposal | `openspec/changes/archive/2026-08-31-cou-250-ci-branch-protection/proposal.md` |
| spec (merge-acceptance) | `…/specs/merge-acceptance/spec.md` |
| design | `…/design.md` |
| tasks | `…/tasks.md` (13/13 in-repo complete; Phase 5 intentionally open) |
| verify-report | `…/verify-report.md` |
| archive report | `…/archive-report.md` (this file, additive) |

## Engram traceability (observations read)

| Artifact | Observation ID |
|---|---|
| proposal | #1570 (topic `sdd/cou-250-ci-branch-protection/proposal`) |
| explore | #1568 (topic `sdd/cou-250-ci-branch-protection/explore`) |
| spec | #1571 (topic `sdd/cou-250-ci-branch-protection/spec`) |
| design | #1572 (topic `sdd/cou-250-ci-branch-protection/design`) |
| tasks | #1573 (topic `sdd/cou-250-ci-branch-protection/tasks`) |
| apply-progress | #1574 (topic `sdd/cou-250-ci-branch-protection/apply-progress`) |
| verify-report | #1575 (topic `sdd/cou-250-ci-branch-protection/verify-report`) |

## Spec sync actions

**N/A by design.** This repo's openspec tracks only change deltas: there is no
`openspec/specs/{domain}/spec.md` main-spec tree and no `openspec/project/` tree. The
single delta spec (`specs/merge-acceptance/spec.md`) is the authoritative spec record
and travels with the change into the archive. No main-spec merge was performed (nothing
to merge into). A main-spec/project tree was deliberately NOT invented, per the
repository's real layout and the prior archive convention.

## Phase 5 FOLLOW-UP (post-merge admin op — OPEN)

Phase 5 tasks are GitHub repository Settings remote operations. They MUST run AFTER
the CI job first goes green on `develop` (Phases 1–2 merged). Sequencing:
commitlint job green on develop → then apply the following via admin credential:

### Required settings per branch

**`develop`**:
- `required_status_checks.contexts`: `["quality-gates", "e2e", "commitlint"]`
- `required_status_checks.strict`: `false`
- `enforce_admins`: `true`
- Bypass user preserved: `bypass_pull_request_allowances.users: ["leandrojaviercepeda"]`
- Review: not enforced (bypass user handles merge)

**`staging`**:
- `required_status_checks.contexts`: `["quality-gates", "e2e", "commitlint"]`
- `required_status_checks.strict`: `false`
- `enforce_admins`: `true`
- Review: `required_approving_review_count: 1`, `dismiss_stale_reviews: true`,
  `require_last_push_approval: true`
- No bypass users

**`main`**:
- Same as staging.

### API reference (for Phase 5 executor)
- `PATCH /repos/{owner}/{repo}/branches/{branch}/protection` with admin credential
- Verify each via `gh api repos/{owner}/{repo}/branches/{branch}/protection`

## Close status

**ARCHIVED.** The repo-code portion (Phases 1–4: commitlint config, CI job, docs/ADR-9)
is complete and verified PASS. The change folder was mechanically moved to
`openspec/changes/archive/2026-08-31-cou-250-ci-branch-protection/` (snapshot → `git mv` →
empty `diff -r` readback, exit 0). The active `openspec/changes/` directory no longer
contains this change. In this layout "closed" means: archive move completed + archive
report recorded. Phase 5 (GitHub Settings) remains an open follow-up — not a gap in
repo code, but a planned post-merge admin operation.

## Follow-ups

1. **Phase 5 — GitHub Settings (OPEN, post-merge admin step)**: Apply branch protection
   payloads per section above after commitlint job first runs green on `develop`.
2. **Linear COU-250**: Orchestrator moves ticket to Done after merge + Phase 5.

## Next recommended (orchestrator)

1. Push `feature/COU-250-ci-branch-protection` and open PR targeting `develop`.
2. Merge PR after CI gate passes (quality-gates + e2e + commitlint) and 1 approval.
3. After merge, wait for commitlint job to run green on `develop`.
4. Run Phase 5 GitHub Settings via admin credential (per exact payloads above).
5. Move Linear COU-250 to Done.
