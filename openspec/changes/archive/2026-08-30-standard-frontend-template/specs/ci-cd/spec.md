# CI/CD — Standard Frontend Template

## ADDED Requirements

### CI-1: Pipelines
The template MUST ship GitHub Actions workflows that run on push and pull_request:
lint (Biome + ESLint), typecheck (`tsc --noEmit`), unit + component + a11y tests with
coverage, and the build. E2E (Playwright) MUST run on the PR/merge pipeline.

### CI-2: Quality gates
CI MUST fail on lint errors, type errors, test failures, E2E failures, and coverage below
the configured threshold.

### CI-3: Preview deployment
The template MUST provide a preview-deployment step (e.g. GitHub Pages or a platform
preview) so reviewers can inspect the rendered app from a PR.
