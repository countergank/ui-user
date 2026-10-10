# Proposal — cou-250-ci-branch-protection

## Intent

Link CI checks to branch protection and make them the **merge-acceptance criteria** on
`develop`, `staging`, and `main`, so a PR whose CI is red or whose commit messages are
non-conventional cannot merge. Today a PR with red CI can still merge (via admin bypass),
`staging`/`main` have zero protection, and `.github/BRANCH-PROTECTION.md` documents all three
as fully protected — diverging from the verified live state.

## Motivation

- COU-250 AC requires CI checks as merge gates on all three branches and a PR-wide
  conventional-commit gate.
- `required_status_checks.contexts` is **empty** on all three branches → CI is not a merge
  criterion anywhere.
- Live state (gatekeeper-verified): `develop` has review protection but empty checks;
  `staging` and `main` have **no** review protection and no checks. The doc claims all three are
  fully protected → documentation gap to reconcile.

## Scope

### In Scope

- Add a `commitlint` job to `.github/workflows/ci.yml` (PR-only), mirroring the backend:
  `actions/checkout@v4` with `fetch-depth: 0`, then
  `npx commitlint --from base.sha --to head.sha --git-log-args="--first-parent" --verbose`.
  Fails on non-conventional commits and on `Co-Authored-By`/AI-attribution trailers.
- Set required status checks on all three branches: `quality-gates` + `e2e` + `commitlint`.
- Ensure review required on all three: `develop` already has it; add to `staging` and `main`
  (1 approval, dismiss-stale, require-last-push-approval — matching `develop`).
- Reconcile docs with reality: `.github/BRANCH-PROTECTION.md`, `AGENTS.md` rule 3, `.github/FLOW.md`,
  and `docs/adr.md` (add **ADR-9: CI-gated merge acceptance**).
- Document enforcement semantics, including the admin-override nuance.

### Out of Scope

- Backend-style release Docker workflow (frontend has no image).
- Live preview URL promotion.
- Splitting the bundled `quality-gates` job into independent per-check jobs (keeps ADR-8 single gate).
- Making `preview` a required check (artifact-only, see Decision 2).

## Non-goals

- No change to the quality-gates job internals (still one bundled gate).
- No source-branch restrictions for `release/*` / `hotfix/*` on staging/main (tracked in
  `git-environment-flow` as follow-up).
- Not changing Squash/commit strategy.

## Capabilities

### New Capabilities

- `merge-acceptance`: required CI checks + review as merge gates per environment branch; the PR-wide commitlint gate. Each becomes `openspec/specs/merge-acceptance/spec.md`.

### Modified Capabilities

- None (no existing `openspec/specs/` to modify).

## Approach

Option 2 (recommended by exploration): add the `commitlint` job while **keeping** the bundled
`quality-gates` job, then set required status checks (`quality-gates` + `e2e` + `commitlint`)
and verify/complete review protection on all three branches. Update docs + add ADR-9.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | Modified | Add `commitlint` job (PR-only, first-parent). |
| Branch protection (repo Settings) | Modified | Required status checks on all 3; review on staging/main; admin-bypass decision. |
| `.github/BRANCH-PROTECTION.md` | Modified | Reconcile with verified live state + CI criteria. |
| `AGENTS.md` | Modified | Rule 3 reflect CI gate + review acceptance. |
| `.github/FLOW.md` | Modified | Reference CI-as-merge-criteria. |
| `docs/adr.md` | Modified | Add ADR-9. |

## Proposals / Decisions Required

1. **Admin-override interpretation** (the key COU-250 nuance): the AC says "block merge even
   with admin override of review". `leandrojaviercepeda` is in the develop bypass-allowance
   list, and GitHub admins can always bypass via `enforce_admins`. Recommended realistic
   interpretation: set `enforce_admins: true` so branch rules apply to admins, **add CI checks
   as required** (these cannot be overridden by review bypass), and accept that a repo admin
   retains a **manual** Settings backdoor — document this residual as an accepted, auditable
   override. Do **not** remove the solo bypass while the team is one maintainer (it would block
   legitimate self-merge). **Decision: enforce_admins + required checks; document residual manual admin override.**
2. **`preview` as required check?** **Decision: NO** — artifact-only, PR-local, non-deterministic
   pipeline; adding it would slow merges needlessly and it isn't a merge gate.
3. **Commitlint scope**: runs **only on `pull_request`** events. Branch pushes (squash merges)
   don't run it; acceptable because feature commits are validated by the PR job + local husky
   hook. **Decision: PR-only is sufficient.**

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Live-protection change needs admin permission | Med | Verify + apply via admin credential/Settings UI before spec. |
| CI re-runs on next develop push (checks now required) | Med | Sequential gate order; first green run must satisfy new checks. |
| Required checks validated only after first green run | Med | Land commitlint job first, green it, then set required. |
| Admin override residual violates AC literally | Med | Accept + document as decision (above). |

## Rollback Plan

Revert to permissive state quickly: clear `required_status_checks.contexts` on the affected
branches and remove review rules added to `staging`/`main`; revert `ci.yml` commitlint job +
doc edits via a follow-up revert PR. CI job removal is contained to one workflow file.

## Dependencies

- Admin credential with branch-protection write (repo Settings, not PAT — PAT returned 403).
- `commitlint` + `@commitlint/config-conventional` already in `package.json` (Phase 6 confirmed).
- Backend's `commitlint` job as the mirror source.

## Success Criteria

- [ ] `commitlint` job exists in `ci.yml` and fails on non-conventional/`Co-Authored-By` commits.
- [ ] Required checks (`quality-gates` + `e2e` + `commitlint`) set on `develop`, `staging`, `main`.
- [ ] Review required (1 approval) on all three branches; `enforce_admins` true.
- [ ] `preview` NOT a required check.
- [ ] `.github/BRANCH-PROTECTION.md`, `AGENTS.md` rule 3, `.github/FLOW.md`, `docs/adr.md` (ADR-9) reconcile doc with reality.
- [ ] A PR with red CI or bad commit message **cannot** merge via review bypass; residual manual admin override documented.
