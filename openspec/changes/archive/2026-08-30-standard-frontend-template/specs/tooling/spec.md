# Tooling & Repo Hygiene — Standard Frontend Template

## ADDED Requirements

### TOOL-1: Repo conventions
The template MUST include `.editorconfig`, `.nvmrc`, `.vscode/` (workspace settings),
`biome.json`, `commitlint.config.ts`, and husky git hooks. Commits MUST follow
Conventional Commits.

### TOOL-2: Consumability
The template MUST include a `Makefile` (mirrors the backend standard) for common tasks and
a `Dockerfile` for containerized usage when required. Environment files MUST provide
`.env.example` and `.env.test`.

### TOOL-3: Skill registry
The project MUST maintain an `.atl/skill-registry.md` and a pinned skills lock
(`skills-lock.json`) recording the countergank skills (react-frontend) that govern all
work, per the countergank/skills packaging convention.

### TOOL-4: README
The repository root MUST have a README documenting the project's purpose, quickstart
(install, dev, test, build), and a pointer to where the standards are documented.
