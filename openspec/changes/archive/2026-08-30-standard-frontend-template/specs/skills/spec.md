# Skills & Agent Configuration — Standard Frontend Template

## ADDED Requirements

### SKILL-1: Integrate countergank skills
The project MUST integrate the countergank skills repository via
`npx skills add countergank/skills`, making the published skills available to the project's
agents and workflows. The `react-frontend` skill MUST be first-class.

### SKILL-2: Registry and config ready
Before any stack execution, the project MUST have a ready `skills-lock.json` and an updated
`.atl/skill-registry.md` (and agent configuration) that register the countergank skills so
that all subsequent work (stack, architecture, testing, CI/CD, tooling, docs) is governed by
those skills.

### SKILL-3: Governed-by-skills invariant
Every later implementation ticket MUST be executed with the integrated skills loaded, so
the produced template conforms to the react-frontend skill's rules (React 19, TS strict,
Vite, Vitest, WCAG 2.2) and the documented Tailwind/shadcn deviation.
