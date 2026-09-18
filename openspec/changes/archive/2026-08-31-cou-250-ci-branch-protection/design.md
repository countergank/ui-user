# Design — cou-250-ci-branch-protection

> CI-gated merge acceptance on `develop`/`staging`/`main`: a `commitlint` PR job, required
> checks, review rules, and doc/ADR reconciliation. Config/infra change — verification is
> declarative (workflow lint + `gh api` read-back), not unit tests.

## Technical Approach

Add a PR-only `commitlint` job to `.github/workflows/ci.yml` mirroring the backend
(`fetch-depth: 0`, `npx commitlint --from base.sha --to head.sha --git-log-args="--first-parent" --verbose`),
before flipping GitHub branch protection. Keep the bundled `quality-gates` job (ADR-8) and
`preview` un-required. Then set required checks + reviews per branch in a CI-first order:
(1) land and green the `commitlint` job on `develop`, (2) flip `required_status_checks` on all
three branches, (3) add review rules to `staging`/`main`. Reconcile all four docs and add ADR-9.

## Architecture Decisions

### Decision: commitlint job check name
| Option | Trade-off | Decision |
|--------|-----------|----------|
| Use job key as required-check string | GitHub required checks key on the job **display name** (`name:`), not the key | **Align display name == check string** `commitlint` |
**Choice**: New job key `commitlint`, display `name: commitlint` (or key-only — no `name:` override), so the required status-check context string is unambiguously `commitlint`.
**Rationale**: GitHub's required-check picker lists the job `name:`; a mismatch silently never-enforces the check. Keeping key == name removes guesswork. Same logic applies to existing jobs: `quality-gates` (`name: Quality gates`) and `e2e` (`name: E2E (Playwright)`) — **either** drop their `name:` overrides so contexts are `quality-gates`/`e2e`, **or** require the literal display strings. Decision: **rename/remove `name:` so contexts == keys** (`quality-gates`, `e2e`, `commitlint`), matching spec MA-1 verbatim.

### Decision: how Co-Authored-By is rejected
| Option | Trade-off | Decision |
|--------|-----------|----------|
| Rely on `@commitlint/config-conventional` | Config **does not** reject `Co-Authored-By`/AI trailers by default | **Add custom commitlint rule** |
**Choice**: Add a custom `no-co-authored-by` rule to `commitlint.config.ts` that rejects any commit message (body/footer line) matching `/Co-Authored-By:\s*\S/im` and `/Co-authored-by:/im` (plus AI-attribution trailer patterns, e.g. trailers crediting an AI model).
**Rationale**: `commitlint.config.ts` currently only `extends` conventional; neither the local husky hook (`.husky/commit-msg` → `commitlint --edit`) nor CI rejects trailers today. A single config rule is shared by both hook and CI job, so local and remote stay consistent (repo = source of truth) and MA-3 passes.

### Decision: apply order to avoid merge-lock regression
| Option | Trade-off | Decision |
|--------|-----------|----------|
| Flip required checks before landing commitlint job | Branches lock with a check that has no green run | **CI-first, then flip** |
**Choice**: (1) commit `ci.yml` + config + doc/ADR changes; let `commitlint` go green on `develop`. (2) Set `required_status_checks.contexts` on all three. (3) Add review rules to `staging`/`main`. Verify read-back after each.
**Rationale**: GitHub only enforces a required check after a green run exists for that branch; flipping first would block merges on a check never reported.

### Decision: admin override / bypass handling
| Option | Trade-off | Decision |
|--------|-----------|----------|
| Remove `leandrojaviercepeda` develop bypass | Blocks legitimate solo self-merge | **Keep bypass; enforce_admins true everywhere; document residual** |
**Choice**: Keep the develop bypass user; set `enforce_admins: true` on all three; required checks (can't be bypassed by review override) are the hard gate; document the residual manual Settings backdoor in `BRANCH-PROTECTION.md`.
**Rationale**: Single-maintainer team; removing the bypass blocks self-merge. `enforce_admins` + required checks satisfy MA-4's "cannot merge via review bypass" intent; the manual Settings override is an accepted, auditable residual (MA-4 scenario).

### Decision: `preview` not required (reaffirm)
**Choice**: `preview` stays out of `required_status_checks` — artifact-only, PR-local, non-deterministic (MA-1, Decision 2 of proposal).

## CI job YAML — `commitlint`

Append to `.github/workflows/ci.yml` (name/email-style parallelism matches siblings):

```yaml
  # MA-3 commitlint PR gate: validates the PR's commits (base→head) against
  # Conventional Commits and rejects Co-Authored-By / AI-attribution trailers.
  commitlint:
    name: commitlint
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9.15.9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint commit messages
        run: npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --git-log-args="--first-parent" --verbose
```

`name: commitlint` (== key) is the required-check context string. PR-only (`if`) — branch
pushes are squash-merged, validated by the PR job + local husky hook (proposal Decision 3).

## Branch-protection settings payload (per branch)

`required_status_checks.contexts` = `["quality-gates", "e2e", "commitlint"]`, `strict: false`
on all three. Review rules:

**develop** (existing; verify/preserve): `required_approving_review_count: 1`, `dismiss_stale_reviews: true`,
`require_last_push_approval: true`, `enforce_admins: true`, bypass users `["leandrojaviercepeda"]`.
**staging / main** (add): same review payload but **no** bypass user; `enforce_admins: true`;
`required_status_checks` same as develop.

```json
{
  "required_status_checks": { "strict": false, "contexts": ["quality-gates", "e2e", "commitlint"] },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_last_push_approval": true,
    "bypass_pull_request_allowances": { "users": [], "teams": [], "apps": [] }
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

`staging`/`main` omit the bypass users array (develop keeps `leandrojaviercepeda`). Applied via
`PATCH /repos/{owner}/{repo}/branches/{branch}/protection` (REST, admin credential with
branch-protection write — Settings UI provides it; a PAT without the permission returns 403).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.github/workflows/ci.yml` | Modify | Add `commitlint` job (PR-only, first-parent). |
| `commitlint.config.ts` | Modify | Add `no-co-authored-by` custom rule (shared by husky + CI). |
| `.github/BRANCH-PROTECTION.md` | Modify | Reconcile: non-empty contexts, staging/main review, residual admin backdoor. |
| `AGENTS.md` | Modify | Rule 3: add CI gate + review acceptance. |
| `.github/FLOW.md` | Modify | Reference CI-as-merge-criteria. |
| `docs/adr.md` | Modify | Add ADR-9: CI-gated merge acceptance. |
| Branch protection (Settings) | Apply | REST PATCH payloads above (admin). |

## Interfaces / Contracts

- Check context strings: `quality-gates`, `e2e`, `commitlint` (job names == keys).
- Custom commitlint rule (type `UserConfig`):
  ```ts
  rules: {
    "no-co-authored-by": [2, "never", /(^|\n)Co-Authored-By:\s*[^\n]+/i],
  }
  ```
  Applies to both `.husky/commit-msg` (`--edit`) and the CI job (`--from/--to`).

## Testing Strategy

Config/infra — declarative verification, not unit tests:

| Layer | What to Verify | Approach |
|-------|---------------|----------|
| Workflow lint | `ci.yml` parses; job names == check strings | `actionlint` / `pnpm exec prettier` on YAML + `gh api` read-back |
| Commitlint rule | `Co-Authored-By` commit fails; conventional passes | Run `npx commitlint` against a fixture message in CI job + local `--edit` |
| Protection state | contexts non-empty, reviews, enforce_admins, bypass | `gh api repos/.../branches/{b}/protection` read-back per branch |
| Docs reconcile | docs match live `gh api` output | Compare documented payload to REST read-back (MA-5) |

## Threat Matrix

Applicable (VCS/PR automation: CI runs `npx commitlint` over git history; PR-event workflows).

| Boundary | Applicability | Design response | Planned RED tests |
|----------|---------------|-----------------|-------------------|
| Documentation-like paths | N/A — no executable md/MDX files execute | — | — |
| Git repository selection | Applicable | `actions/checkout@v4` fixates cwd; `--from/--to` use GitHub context SHAs, not user input | Wrong SHA range → job fails cleanly |
| Commit state | Applicable | `--first-parent` + base→head SHA range; no index manipulation | Non-conventional + `Co-Authored-By` commits fail |
| Push state | N/A — job reads history, never pushes | — | — |
| PR commands | Applicable | Fixed argument composition from `github.event.pull_request.*`; no shell interpolation of untrusted text | Malformed context (non-PR) → skipped via `if` |

## Migration / Rollout

Phased (CI-first to avoid merge-lock): (1) commit CI+config+docs+ADR, green `develop`; (2) flip
required checks on all three; (3) add review rules to `staging`/`main`. Verify read-back after
each. Rollback: clear `contexts`, revert `ci.yml`/config/doc edits via follow-up PR.

## Open Questions

- [ ] Confirm live develop protection via admin credential (exploration hit 403 on PAT) before flipping checks.
- [ ] Final display-name reconciliation: remove/rename existing `name:` overrides so required strings are the keys — confirm team accepts losing "Quality gates"/"E2E (Playwright)" labels.
