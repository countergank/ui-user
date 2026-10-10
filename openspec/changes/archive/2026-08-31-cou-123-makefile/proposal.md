# Proposal: Add `make setup` canonical install target

## Intent

The COU-123 ticket lists `make setup` in its acceptance criteria, but the frontend Makefile
only exposes `install` for dependency installation. This is the frontend template's only gap vs
the COU-123 ACs. Adding `setup` as a canonical alias keeps the Makefile consistent with the
ticket while leaving the existing `install` target intact for CI/docker docs and backwards
compatibility.

## Scope

### In Scope
- Add a `setup` Make target that runs `pnpm install` (mirroring `install`).
- Add `setup` to the `.PHONY` declaration so it is never skipped if a `setup` file appears.
- Confirm `make help` lists `setup` via the existing `## help` comment mechanism.
- Document `make setup` as an install option in `README.md` quickstart.

### Out of Scope
- Removing or renaming the existing `install` target (kept for compatibility with CI/docker docs).
- Doppler or any secret-management automation.
- New `docker-*` variants or any change to docker-compose behavior.
- Automation / hook integration by other tools.
- Any backend-repo change (this is the frontend template only).

## Capabilities

> Contract for the sdd-spec phase. The only existing spec (`docker-compose-local`) is unrelated.

### New Capabilities
- None (pure mechanical target addition — no spec-level behavior contract).

### Modified Capabilities
- None (no spec-level requirements change; the Makefile is an implementation artifact, not a
  governed `openspec/specs/` capability).

## Approach

Add a single target to the frontend `Makefile`, adjacent to `install`:

```make
setup: ## Install dependencies (pnpm install) — canonical alias of install
	pnpm install
```

- Updated `.PHONY` line gains `setup` (kept sorted alongside `install`).
- `help` already greps `target: ## help` lines, so `setup` appears automatically once added.
- README quickstart line becomes `pnpm install ... (or: make install|make setup)`.

No behavioral risk to the Makefile's existing targets.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `Makefile` | Modified | Add `setup` target (~2 lines) + `.PHONY` gains `setup` |
| `README.md` | Modified | Quickstart documents `make setup` as an install option |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `setup` skipped if a file named `setup` appears | Low | `setup` added to `.PHONY` |
| `make help` omits `setup` if `##` comment is malformed | Low | Verify with `make help \| grep setup` |
| Backend convention drift (backend uses `install`, not `setup`) | Low | Out of scope; frontend explicitly adds `setup` per ticket ACs |

## Rollback Plan

Revert the two lines from the Makefile `.PHONY` and remove the `setup` target, plus the README
edit. Since no other target or file is touched, rollback is a clean `git checkout` of
`Makefile` and `README.md`.

## Dependencies

- None. Pure Makefile/README change; no new tools, packages, or services.

## Success Criteria

- [ ] `make help` lists `setup` (COU-123 AC).
- [ ] `make setup` runs `pnpm install` successfully (COU-123 AC).
- [ ] `make dev`, `make build`, `make lint`, `make test` continue to work (COU-123 AC).
- [ ] No undocumented global tools required (only pnpm, already a repo prerequisite).
- [ ] `make ci` passes the full local gate.
