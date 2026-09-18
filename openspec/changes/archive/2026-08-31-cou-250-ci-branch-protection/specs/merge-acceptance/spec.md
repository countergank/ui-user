# Merge Acceptance Specification

> Change: `cou-250-ci-branch-protection`
> Type: New (no existing domain spec)
> Verification note: this is a config/infra change. "Tests" are declarative verification of GitHub branch-protection settings and CI workflow presence — not unit tests.

## Purpose

Define merge-acceptance criteria for environment branches (`develop`, `staging`, `main`):
required CI status checks, review rules, the commitlint PR gate, and enforcement semantics.

## Requirements

### MA-1: Required Status Checks

Branch protection on `develop`, `staging`, and `main` MUST require the status checks
`quality-gates`, `e2e`, and `commitlint` before any PR can merge. The `preview` check MUST
NOT be required (artifact-only, non-deterministic).

#### Scenario: PR with all required checks green merges

- GIVEN a PR targeting `develop` (or `staging` or `main`)
- WHEN `quality-gates`, `e2e`, and `commitlint` all pass
- THEN the PR is eligible to merge (subject to review rule MA-2)

#### Scenario: PR with a failing required check is blocked

- GIVEN a PR targeting `develop`
- WHEN `e2e` fails and `quality-gates` and `commitlint` pass
- THEN the PR MUST NOT be mergeable

#### Scenario: PR with preview failure still merges

- GIVEN a PR targeting `develop`
- WHEN `preview` fails but `quality-gates`, `e2e`, and `commitlint` pass
- THEN the PR MUST still be mergeable

### MA-2: Review Rules

`develop`, `staging`, and `main` MUST require at least 1 approving review before merge.
Stale approvals MUST be dismissed on new pushes. The last push to the PR MUST be approved
( require-last-push-approval).

#### Scenario: PR with one approval and all checks green merges

- GIVEN a PR with 1 approval and no new pushes since approval
- WHEN all required checks pass
- THEN the PR is mergeable

#### Scenario: New push dismisses stale approval

- GIVEN an approved PR
- WHEN the author pushes a new commit
- THEN the previous approval is dismissed and a new review is required

### MA-3: Commitlint PR Gate

The CI workflow MUST include a `commitlint` job that runs only on `pull_request` events.
It MUST validate commits from the PR base SHA to HEAD using
`npx commitlint --from base.sha --to head.sha --git-log-args="--first-parent" --verbose`.
Commits containing `Co-Authored-By` or AI-attribution trailers MUST fail this job.

#### Scenario: Conventional commits pass commitlint

- GIVEN a PR with commits following Conventional Commits format
- WHEN commitlint runs
- THEN the job passes

#### Scenario: Non-conventional commit fails commitlint

- GIVEN a PR with a commit message "fixed stuff"
- WHEN commitlint runs
- THEN the job fails

#### Scenario: Co-Authored-By trailer fails commitlint

- GIVEN a PR whose last commit contains `Co-Authored-By: Gemini`
- WHEN commitlint runs
- THEN the job fails

### MA-4: Enforcement Semantics

`enforce_admins` MUST be set to `true` on `develop`, `staging`, and `main` so branch
protection rules apply to repository admins. Required status checks (`quality-gates`,
`e2e`, `commitlint`) cannot be overridden by review bypass. A documented manual admin
override via the GitHub Settings UI is accepted as a residual backdoor and MUST be
recorded in `BRANCH-PROTECTION.md`.

#### Scenario: Admin push with red CI is blocked

- GIVEN the repo admin pushes directly or approves a PR with failing checks
- WHEN branch protection is enforced
- THEN the merge/push is blocked by required status checks

#### Scenario: Manual admin override is documented

- GIVEN an admin needs to bypass branch protection in an emergency
- WHEN they use the Settings UI to temporarily disable protection
- THEN the override MUST be recorded in `.github/BRANCH-PROTECTION.md` as an accepted backdoor

### MA-5: Documentation Reconciliation

The following documents MUST be updated to reflect the enforced state:
`.github/BRANCH-PROTECTION.md`, `AGENTS.md` (rule 3), `.github/FLOW.md`, and
`docs/adr.md` (new ADR-9: CI-gated merge acceptance).

#### Scenario: Documentation matches live protection

- GIVEN branch protection is configured as specified in MA-1 through MA-4
- WHEN a contributor reads `BRANCH-PROTECTION.md`
- THEN the documented rules match the actual GitHub Settings configuration
