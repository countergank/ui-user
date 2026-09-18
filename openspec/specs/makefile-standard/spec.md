# Makefile Standard Specification

## Purpose

Defines the Makefile's build-tooling surface for the frontend template. This spec governs
the dependency-installation entry points (`make setup`, `make install`), the `make help`
auto-listing contract, and the preserved regression surface of the existing targets.

## Requirements

### Requirement: MAK-1 — `make setup` canonical install target

The Makefile SHALL provide a `setup` target that runs `pnpm install`, ensuring dependency
installation is invocable via `make setup`.

#### Scenario: Install via `make setup`

- GIVEN a checkout with prerequisites (Node >=22, pnpm) available
- WHEN a developer runs `make setup`
- THEN pnpm install executes successfully
- AND the project dependencies are installed

#### Scenario: No undocumented global tools

- GIVEN a developer runs `make setup`
- THEN only `pnpm` (already a documented prerequisite) is invoked
- AND no other global tool dependency is required

### Requirement: MAK-2 — `make help` lists `setup`

The `make help` target SHALL list `setup` among its targets, driven by the existing
auto-grep `target: ## help` mechanism.

#### Scenario: Help output lists setup

- GIVEN the Makefile has the `setup` target with a `##` help comment
- WHEN a developer runs `make help`
- THEN the output includes a `setup` entry with its help text

### Requirement: MAK-3 — `make install` preserved as alias

The existing `install` target SHALL remain intact and functional. `setup` is an additive
alias, not a replacement, to preserve CI and documentation compatibility.

#### Scenario: Existing install target still works

- GIVEN the `install` target exists as before
- WHEN a developer runs `make install`
- THEN pnpm install executes successfully

### Requirement: MAK-4 — Existing targets remain functional

The `dev`, `build`, `lint`, `test`, `test-coverage`, and `ci` targets SHALL continue to
work unchanged after the addition of `setup` (regression).

#### Scenario: CI regression

- GIVEN the `setup` target has been added
- WHEN a developer runs `make ci`
- THEN the lint, typecheck, coverage, and build steps all pass

### Requirement: MAK-5 — `setup` in `.PHONY`

The `.PHONY` declaration SHALL include `setup` so the target is never skipped if a file
named `setup` appears in the repo root.

#### Scenario: Phony declaration prevents file collision

- GIVEN the `.PHONY` line includes `setup`
- WHEN a file named `setup` exists in the repo root
- THEN `make setup` still runs the target instead of being skipped

### Requirement: MAK-6 — pnpm documented as sole tool dependency

The README SHALL document `make setup` as an install option, referencing pnpm (already a
documented prerequisite), so users are not surprised by an undocumented global tool.

#### Scenario: Quickstart documents setup

- GIVEN the README quickstart install line
- WHEN a user reads the install instructions
- THEN `make setup` is listed alongside `make install` and `pnpm install`
