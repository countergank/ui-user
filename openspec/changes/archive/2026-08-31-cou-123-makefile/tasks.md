# Tasks: Add `make setup` canonical install target

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~10 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single PR
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Add `setup` target + `.PHONY` (MAK-1/3/5) + README quickstart note (MAK-6) | PR 1 | `make setup` && `make help \| grep setup` | `make setup` runs pnpm install successfully | Revert `Makefile` + `README.md` commits |
| 2 | Regression gate (MAK-2/4) | PR 1 | `make install` && `make ci` | `make ci` full lint+typecheck+coverage+build green | N/A — proof-only, no new files |

## Phase 1: Implement `setup` target (MAK-1, MAK-5)

- [x] 1.1 In `Makefile`, add `setup: ## Install dependencies (pnpm install) — canonical alias of install` → `pnpm install` immediately after the `install` target (line ~20)
- [x] 1.2 In `Makefile` line 11, add `setup` to the `.PHONY` list, sorted alongside `install`

## Phase 2: Documentation (MAK-6)

- [x] 2.1 In `README.md` quickstart install line (~line 28), list `make setup` alongside `make install` and `pnpm install`

## Phase 3: Verification (MAK-2, MAK-4)

- [x] 3.1 Run `make setup` → assert pnpm install executes successfully (MAK-1)
- [x] 3.2 Run `make help | grep setup` → assert a `setup` entry with help text appears (MAK-2)
- [x] 3.3 Run `make install` → assert success, `install` preserved (MAK-3)
- [x] 3.4 Run `make ci` → assert lint + typecheck + coverage + build all pass (MAK-4 regression)
