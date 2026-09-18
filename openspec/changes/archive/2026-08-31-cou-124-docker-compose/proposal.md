# Proposal — cou-124-docker-compose

## Intent

The SPA lacks a one-command local container bring-up. The Dockerfile and nginx.conf already
work (`docker run`), but there's no `docker-compose.yml` — developers must remember port
mappings and env flags manually. Adding compose mirrors the backend standard and satisfies
COU-124 ACs.

## Motivation

- Reproduce local bring-up with `docker compose up --build` (one command).
- Consistency with backend `countergank` pattern: service naming, env_file, Makefile targets.
- All 8 ACs trace to a single compose file + docs.

## Scope

### In Scope

- `docker-compose.yml` (repo root) — single service `frontend-standard`, builds from existing
  `Dockerfile`, maps `8080:80`, env via `.env` (optional) with `${VAR:-default}` fallbacks.
- Makefile `docker-*` targets: `docker-build`, `docker-up`, `docker-down`, `docker-logs`,
  `docker-redeploy`, `docker-status`.
- README section documenting compose bring-up.

### Out of Scope

- `docker-compose.dev.yml` override / dev-mode profile (future option).
- GHCR image publish (separate change).
- Changes to `Dockerfile` or `nginx.conf` (keep as-is).
- Runtime env injection for `VITE_*` vars (baked at build — document limitation).
- Doppler integration.

## Non-goals

- Dev hot-reload via compose (vite dev server is separate workflow).
- CI/CD compose usage (GitHub Actions uses raw `docker build`).

## Capabilities

### New Capabilities

- `docker-compose-local`: compose-based local container orchestration for the SPA, Makefile
  integration, and documentation. Becomes `openspec/specs/docker-compose-local/spec.md`.

### Modified Capabilities

- None (no existing `openspec/specs/`).

## Approach

Single service `frontend-standard`:

```yaml
services:
  frontend-standard:
    build: { context: ., dockerfile: Dockerfile }
    ports: ["8080:80"]
    env_file: ["${ENV_FILE:-.env}"]
    restart: unless-stopped
```

Env handling: `env_file: .env` (optional) + all defaults via `${VAR:-default}` in compose
file or Dockerfile — works with zero `.env` present. Host port `8080` avoids conflict with
`pnpm dev` (3000) and `pnpm preview` (4173).

Makefile targets mirror backend pattern with `COMPOSE := docker compose`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docker-compose.yml` | New | Root-level compose file (single service). |
| `Makefile` | Modified | Add `docker-build`, `docker-up`, `docker-down`, `docker-logs`, `docker-redeploy`, `docker-status` targets. |
| `README.md` | Modified | Add compose quick-start section. |

## Decisions

1. **Host port 8080**: avoids 3000 (dev) and 4173 (preview). Low collision risk.
2. **Env defaults ≥ .env.example**: compose uses `${VAR:-default}` so it works without `.env`.
   `.env.example` stays as documentation, not loaded by default.
3. **No healthcheck in v1**: nginx is single-process; a healthcheck adds complexity for
   marginal value. Can add `curl -f http://localhost/` later.
4. **Service name `frontend-standard`**: follows backend `<role>-<project>` pattern. No
   `container_name` — compose derives it.
5. **`VITE_*` limitation documented**: env vars are baked at build time; changing them requires
   `docker compose up --build`. This is inherent to Vite SPA, not a compose limitation.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Port 8080 conflict on user machine | Low | Document `ports` override in README. |
| `VITE_*` env confusion (build-time only) | Med | Document clearly in README and compose comments. |
| Compose version compatibility | Low | Target compose V2 syntax only (no `version:` key). |

## Rollback Plan

Delete `docker-compose.yml`, remove `docker-*` targets from Makefile, remove README section.
Single revert PR. No data or state to clean up.

## Dependencies

- Existing `Dockerfile` (node:22-alpine build → nginx:alpine).
- Existing `nginx.conf` (SPA fallback).
- Docker + Docker Compose V2 installed on developer machine.

## Success Criteria

- [ ] `docker-compose.yml` exists at repo root.
- [ ] `docker compose up --build` raises SPA container without error.
- [ ] SPA responds HTTP 200 on `http://localhost:8080`.
- [ ] Uses existing `Dockerfile` (no duplicate).
- [ ] Env vars load from `.env.example` or defaults (works with no `.env`).
- [ ] Makefile or README documents compose bring-up.
- [ ] No port conflict with `pnpm dev` (3000) / `pnpm preview` (4173).
- [ ] `docker compose down` cleans up cleanly.
