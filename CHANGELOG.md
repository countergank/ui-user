# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-08

First production release of the countergank standard frontend template.

### Added

- Standard frontend stack: Vite 6, React 19, TypeScript (strict), Tailwind + shadcn/ui, TanStack Query 5, React Router 7, Biome + ESLint (#5)
- Screaming/feature-based architecture with accessible shell, typed error model, and route code-splitting (#5)
- Testing stack: Vitest + Testing Library + axe (WCAG 2.2 AA) + Playwright critical journeys (#5)
- CI/CD pipeline with quality-gates, e2e, commitlint, and PR preview artifact (#6)
- GitHub environment branch flow (develop → release → staging → main) with branch protection (#3, #6)
- Docker Compose + multi-stage Dockerfile for local bring-up (#7)
- `make setup` canonical install target and Makefile target parity (#8)
- Zustand v5 for client/UI state with typed stores, selectors, and test isolation (#9)
- Doppler secret management with typed, fail-fast env handling via `src/lib/env.ts` (ADR-11) (#10)
