# Design: Docker Compose Local (cou-124-docker-compose)

## Technical Approach

Add a single-file `docker-compose.yml` at repo root declaring one service `frontend-standard`
that builds from the existing multi-stage `Dockerfile` (node:22-alpine → nginx:alpine, EXPOSE
80). Compose V2 syntax (no `version:` key). Wire Makefile docker-* targets matching backend
conventions. Document compose bring-up and `VITE_*` rebuild limitation in README.

## Architecture Decisions

### Decision: Host port 8080

| Option | Tradeoff | Decision |
|--------|----------|----------|
| 8080 | No conflict with pnpm dev (3000) or preview (4173); standard dev port | **Chosen** |
| 3000 | Conflicts with Vite dev server | Rejected |
| 4173 | Conflicts with Vite preview | Rejected |

### Decision: No `env_file` — environment via `environment:` defaults only

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `env_file: .env` | Requires .env to exist or Compose v2.24+ `required: false`; adds failure mode | **Rejected** |
| `environment:` with `${VAR:-default}` | Zero-file dependency; works out-of-the-box; `.env.example` is documentation only | **Chosen** |

Rationale: The SPA has one env key (`VITE_API_BASE_URL`). Baking a default directly in
`environment:` eliminates the missing-file error entirely. Users who need overrides can use
`docker compose --env-file .env.local up` or edit the compose file. This matches spec DCL-4
scenario "Runs with no .env".

### Decision: `container_name: frontend-standard`

Explicit container name for predictable `docker ps` output and `make docker-status` output.
Matches backend naming convention. tradeoff: prevents running two instances simultaneously —
acceptable for local dev.

### Decision: No healthcheck

Nginx is single-process. Adding `HEALTHCHECK` adds compose complexity for marginal value
(the SPA is either up or dead). Can add later if needed.

### Decision: `restart: unless-stopped`

Standard production-like behavior for local dev. Container restarts on crash but not on
`docker compose down`.

## Data Flow

```
Developer host                 Docker container
─────────────                  ────────────────
make docker-up
  → docker compose up --build
                                    ┌─ build stage: node:22-alpine ─┐
                                    │  pnpm install --frozen-lockfile │
                                    │  pnpm build (VITE_* baked in)   │
                                    └────────────┬────────────────────┘
                                                 ↓
                                    ┌─ runtime stage: nginx:alpine ──┐
localhost:8080 ──── HTTP ────────→ │  nginx serves dist/ on :80     │
                                    │  SPA fallback (nginx.conf)      │
                                    └─────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `docker-compose.yml` | Create | Single service `frontend-standard`, build from `Dockerfile`, ports 8080:80, `environment:` defaults |
| `Makefile` | Modify | Add `docker-build`, `docker-up`, `docker-down`, `docker-logs`, `docker-redeploy`, `docker-status` targets with `COMPOSE := docker compose` |
| `README.md` | Modify | Add Docker Compose quick-start subsection under existing Docker section |

## Interfaces / Contracts

### docker-compose.yml (exact content)

```yaml
services:
  frontend-standard:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: frontend-standard
    ports:
      - "8080:80"
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL:-}
    restart: unless-stopped
```

No `version:` key (Compose V2). No `env_file:` — absent-file-proof by design.

### Makefile additions

```makefile
COMPOSE := docker compose

docker-build: ## Build the Docker image
	$(COMPOSE) build

docker-up: ## Start the container (build + background)
	$(COMPOSE) up --build -d

docker-down: ## Stop and remove the container
	$(COMPOSE) down

docker-logs: ## Tail container logs
	$(COMPOSE) logs -f

docker-status: ## Show container status
	$(COMPOSE) ps

docker-redeploy: ## Rebuild and restart in one command
	$(COMPOSE) up --build -d
```

Note: `docker-up` and `docker-redeploy` are identical — `docker-redeploy` is kept for backend
naming consistency (proposal AC).

### README addition (additive to existing Docker section, after line 53)

```markdown
#### Docker Compose

```bash
make docker-up        # or: docker compose up --build -d
# → http://localhost:8080

make docker-down      # stop and remove
make docker-logs      # tail logs
make docker-status    # show container status
```

> **Note**: `VITE_*` environment variables are baked into the bundle at build time. Changing
> them requires a rebuild — `make docker-up` (or `make docker-redeploy`) already includes
> `--build`. A rebuild takes ~30 seconds on a warm cache.
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Declarative | `docker compose config` validates YAML | Bash assertion in verify |
| Integration | `docker compose up --build` → HTTP 200 on :8080 | Manual or CI script |
| Teardown | `docker compose down` leaves no orphan containers | `docker ps --filter name=frontend-standard` returns empty |
| Port conflict | Occupied port 8080 → clear error from Docker | Manual test, documented |

No unit tests — this is infrastructure configuration, not application logic. Verification is
declarative (compose config) + integration (build, serve, HTTP check, teardown).

## Threat Matrix

N/A — no routing, shell injection, subprocess, VCS/PR automation, executable-file
classification, or process-integration boundary. Docker Compose is a local orchestration
tool; the compose file is a declarative YAML manifest with no dynamic command construction.

## Migration / Rollout

No migration required. This is a net-new file addition with Makefile and README edits.
Zero impact on existing workflows (pnpm dev, CI, Playwright, etc.).

## Open Questions

None — all decisions are resolved by the spec (DCL-1..DCL-8) and proposal scope.
