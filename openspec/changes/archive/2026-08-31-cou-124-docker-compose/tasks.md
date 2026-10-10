# Tasks: Docker Compose Local (cou-124-docker-compose)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~65 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | N/A (single-pr) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Compose file + Makefile targets + README docs | PR 1 | `docker compose config` validates | `docker compose up --build` + `curl -I localhost:8080` → 200 + `docker compose down` clean | `docker-compose.yml`, Makefile docker targets, README Docker section |
| 2 | Local gate (pnpm lint/test/build green) | PR 1 | `pnpm lint && pnpm typecheck && pnpm build` | N/A — offline check | N/A — zero runtime boundary |

## Phase 1: Compose + Makefile + Docs (DCL-1, DCL-2, DCL-4, DCL-5, DCL-6, DCL-8)

- [x] 1.1 Create `docker-compose.yml` at repo root — single service `frontend-standard`, `build: { context: ., dockerfile: Dockerfile }`, `container_name: frontend-standard`, `ports: ["8080:80"]`, `environment: - VITE_API_BASE_URL=${VITE_API_BASE_URL:-}`, `restart: unless-stopped`. No `version:` key. No `env_file:`.
- [x] 1.2 Add `COMPOSE := docker compose` variable and six targets to `Makefile`: `docker-build`, `docker-up`, `docker-down`, `docker-logs`, `docker-status`, `docker-redeploy`. Each with `##` help comment. Update `.PHONY` line.
- [x] 1.3 Add `#### Docker Compose` subsection to `README.md` under existing Docker section (after line 53) — `make docker-up` quick-start, all five target commands, and `VITE_*` rebuild-for-env limitation note.

## Phase 2: Verification (DCL-1, DCL-3, DCL-7)

- [x] 2.1 Validate compose file: run `docker compose config` — must exit 0 and declare one service `frontend-standard` with correct build context, ports, and environment.
- [x] 2.2 Integration bring-up: run `docker compose up --build -d`, then `curl -I http://localhost:8080` — must return HTTP 200. Then `docker compose down` — must exit 0 with no orphan containers.
- [x] 2.3 Local gate: run `pnpm lint && pnpm typecheck && pnpm build` — must pass with no regressions.

## Implementation order

Phase 1 (compose file + Makefile + README) → Phase 2 (verify compose config + integration + local gate). No sequencing constraints between Phase 1 tasks — they are independent files that can be created in any order.
