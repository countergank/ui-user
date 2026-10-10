# Design: Add `make setup` canonical install target

## Technical Approach

Add one Make target `setup` to the frontend `Makefile`, placed adjacent to (after) the
existing `install` target. It mirrors `install` by running `pnpm install`. Add `setup` to
the `.PHONY` line so it is never skipped by a file-collision. Update the README quickstart
install line to list `make setup`. The `help` target auto-greps `target: ## help` lines,
so `setup` appears in `make help` automatically. `install` is left untouched, preserving
CI/docker-docs compatibility.

## Architecture Decisions

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Alias vs rename | Additive `setup` alias, keep `install` | Rename/remove `install` | Preserves CI/docker-docs compatibility; COU-123 ACs require both |
| Target placement | Immediately after `install` target | End of file | Groups install entry points; readability |
| Help integration | Reuse existing `##` auto-grep | Manual help entry | Zero new machinery; `setup: ## ...` comment is auto-listed |
| File-collision guard | Add `setup` to `.PHONY` | Trust no file collision | `.PHONY` prevents silent skip if a `setup` file appears |

## Data Flow

    make setup ──► pnpm install ──► node_modules (dependencies installed)
    make help  ──► grep 'target: ##' ──► lists setup (auto)

No runtime data flow; purely a make-to-pnpm command dispatch.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `Makefile` | Modify | Add `setup: ## Install dependencies (pnpm install) — canonical alias of install` → `pnpm install`; add `setup` to `.PHONY` (line 11, sorted alongside `install`) |
| `README.md` | Modify | Quickstart install line (line 28) lists `make setup` alongside `make install` |

## Interfaces / Contracts

```
# Makefile — added after `install:` target
setup: ## Install dependencies (pnpm install) — canonical alias of install
	pnpm install
```

`.PHONY` updated from:
`.PHONY: help install dev ...` to `.PHONY: help install setup dev ...`

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Infra / declarative | `make setup` runs `pnpm install` | Manual/CI: run `make setup`, assert success |
| Infra / declarative | `make help` lists `setup` | Run `make help \| grep setup`, assert a `setup` entry |
| Infra / declarative | `make install` preserved | Run `make install`, assert success |
| Regression | `make ci` full gate | Run `make ci`, assert lint+typecheck+coverage+build pass |

No unit tests apply — this is build-tooling, verified declaratively via the `make`
commands listed.

## Threat Matrix

N/A — no routing, shell subprocess injection, VCS/PR automation, executable-file
classification, or process-integration boundary. The change only adds a Make target whose
recipe runs the pinned `pnpm` command; it introduces no new shell escaping, argument
parsing, or executable-execution surface beyond the existing `install` target it mirrors.
Note: the new target's recipe is a fixed literal (`pnpm install`), not user/param-driven,
so no injection boundary is introduced.

## Migration / Rollout

No migration required. `install` remains fully functional; `setup` is purely additive.
Rollback is a clean `git checkout` of `Makefile` and `README.md`.

## Open Questions

- None.
