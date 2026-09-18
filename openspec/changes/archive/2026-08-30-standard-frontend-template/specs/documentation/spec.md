# Documentation — Standard Frontend Template

## ADDED Requirements

### DOC-1: docs/ folder
The template MUST include a `docs/` folder describing the standards: stack rationale,
architecture decisions (ADR), folder structure, component patterns, error handling,
accessibility policy, and testing strategy. Documentation MUST follow a low-cognitive-load
approach (progressive, example-first).

### DOC-2: Agent-readable standards
The template MUST include agent-readable standards so AI agents and future devs are
governed by the same rules: an `AGENTS.md` (and the `.atl/skill-registry.md`) that points
to the countergank skills and the repo conventions. Future frontend apps MUST be able to
consume these standards as their mold.

### DOC-3: Consumption guide
The template MUST document how a new countergank frontend application is bootstrapped from
this template and what it inherits (stack, structure, standards).
