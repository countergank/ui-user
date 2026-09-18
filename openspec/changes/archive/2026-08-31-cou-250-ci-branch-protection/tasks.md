# Tasks: CI-Gated Branch Protection

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | N/A (single-pr) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Commitlint config + CI job + name alignment | PR 1 | `pnpm lint && pnpm typecheck` | `echo "feat(x): bad\n\nCo-Authored-By: X" \| npx commitlint` fails; `pnpm build` passes | `commitlint.config.ts` + `.github/workflows/ci.yml` |
| 2 | Documentation reconciliation + ADR-9 | PR 1 | link check on updated docs | N/A — static markdown | docs files only |

## Phase 1: Commitlint Config (MA-3)

- [x] 1.1 Add custom `no-co-authored-by` rule to `commitlint.config.ts` — reject body/footer lines matching `/Co-Authored-By:\s*\S/i` at severity 2 (error), shared by husky hook + CI job.
- [x] 1.2 RED: verify commitlint rejects Co-Authored-By — run `echo "feat(x): add feature\n\nCo-Authored-By: Gemini" | npx commitlint` locally; must exit non-zero.
- [x] 1.3 GREEN: verify commitlint passes conventional commits — run `echo "feat(x): add feature" | npx commitlint`; must exit zero.

## Phase 2: CI Workflow — commitlint job + check-name alignment (MA-1, MA-3)

- [x] 2.1 Append `commitlint` job to `.github/workflows/ci.yml` — PR-only (`if: github.event_name == 'pull_request'`), `fetch-depth: 0`, `npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --git-log-args="--first-parent" --verbose`.
- [x] 2.2 Remove `name: Quality gates` override from `quality-gates` job key — display name becomes `quality-gates` (matches key and required-check context).
- [x] 2.3 Remove `name: E2E (Playwright)` override from `e2e` job key — display name becomes `e2e` (matches key and required-check context).
- [x] 2.4 Verify workflow YAML parses cleanly — run `actionlint .github/workflows/ci.yml` (or `pnpm exec prettier --check .github/workflows/ci.yml` if actionlint unavailable).

## Phase 3: Documentation Reconciliation (MA-4, MA-5)

- [x] 3.1 Update `.github/BRANCH-PROTECTION.md` — set `required_status_checks.contexts` to `["quality-gates", "e2e", "commitlint"]`; split develop (bypass user `leandrojaviercepeda`) vs staging/main (no bypass); document `enforce_admins: true` + admin Settings backdoor residual.
- [x] 3.2 Update `.github/FLOW.md` — add note that merge requires CI-as-merge-criteria (required status checks + review) on all three branches.
- [x] 3.3 Update `AGENTS.md` rule 3 — replace "no direct pushes" note with: CI gate (`quality-gates` + `e2e` + `commitlint`) required on develop/staging/main; review required on all three; admin override via Settings documented in BRANCH-PROTECTION.md.
- [x] 3.4 Add ADR-9 to `docs/adr.md` — Context/Decision/Consequences: CI-gated merge acceptance, required checks `["quality-gates", "e2e", "commitlint"]`, review rules on all three branches, `enforce_admins: true`, admin residual backdoor.

## Phase 4: Verification

- [x] 4.1 Run full local gate: `pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build` — must pass with no regressions.
- [x] 4.2 Commitlint negative check: create temp commit with `Co-Authored-By` trailer, verify `npx commitlint --from HEAD~1 --to HEAD` fails, then discard.
- [x] 4.3 Commitlint positive check: verify `echo "feat(x): valid" | npx commitlint` passes.

## Phase 5: GitHub Settings — Ops/Apply (not repo code)

> These tasks are GitHub repository Settings operations, not repo commits. They MUST run
> AFTER the CI job goes green on `develop` (Phase 1–2 merged). They apply via
> `PATCH /repos/{owner}/{repo}/branches/{branch}/protection` with admin credential.

- [ ] 5.1 **develop** — flip `required_status_checks`: set `contexts: ["quality-gates", "e2e", "commitlint"]`, `strict: false`. Verify read-back via `gh api repos/.../branches/develop/protection`.
- [ ] 5.2 **staging** — flip `required_status_checks` (same contexts). Verify read-back.
- [ ] 5.3 **main** — flip `required_status_checks` (same contexts). Verify read-back.
- [ ] 5.4 **staging** — add review rules: `required_approving_review_count: 1`, `dismiss_stale_reviews: true`, `require_last_push_approval: true`, `enforce_admins: true`, no bypass users. Verify read-back.
- [ ] 5.5 **main** — add review rules (same payload as staging). Verify read-back.

## Implementation order

Phase 1 (config) → Phase 2 (CI workflow) → Phase 3 (docs) → Phase 4 (verify) → merge PR → Phase 5 (flip settings). CI-first ordering prevents merge-lock regression (design Decision 3).
