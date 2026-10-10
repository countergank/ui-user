# docker-compose-local Specification

## Purpose

One-command local container bring-up for the SPA via Docker Compose v2: a single service
building from the existing `Dockerfile`, serving on host port `8080`, plus Makefile targets
and README docs. Infra: acceptance is declarative verification (compose config validate +
manual `up`/HTTP 200), not unit tests.

## Requirements

### Requirement: DCL-1 — Root compose file with single service

The repo MUST ship `docker-compose.yml` at the repository root declaring exactly one service
`frontend-standard`. The service MUST build from the existing `Dockerfile` using
`build: { context: ., dockerfile: Dockerfile }` without duplicating the Dockerfile.

#### Scenario: Compose file exists and validates

- GIVEN the repository root
- WHEN `docker compose config` is run
- THEN compose validates with no errors and a single service `frontend-standard` is declared
- AND the service's build context is `.` and its dockerfile is `Dockerfile`

### Requirement: DCL-2 — Host port mapping 8080:80

The service MUST map host port `8080` to container port `80` (`ports: ["8080:80"]`). The host
port MUST NOT conflict with `pnpm dev` (3000) or `pnpm preview` (4173).

#### Scenario: Port exposed without conflict

- GIVEN `pnpm dev` on 3000 or `pnpm preview` on 4173 is unrelated
- WHEN the service is started
- THEN the host reaches the SPA at `http://localhost:8080`

### Requirement: DCL-3 — One-command build and serve (HTTP 200)

`docker compose up --build` MUST build from the existing `Dockerfile` and serve the SPA, which
MUST respond HTTP 200 at `http://localhost:8080`.

#### Scenario: Happy-path bring-up

- GIVEN Docker and Compose v2 are installed and no `.env` is present
- WHEN `docker compose up --build` is run
- THEN the `frontend-standard` container starts without error
- AND `curl -o /dev/null -s -w "%{http_code}" http://localhost:8080` returns `200`

### Requirement: DCL-4 — Environment via defaults an optional env_file

The service SHOULD load env from an optional `env_file` (e.g. `.env` via
`${ENV_FILE:-.env}`) and MUST fall back to `${VAR:-default}` defaults so it runs correctly with
no `.env` present. The compose file MUST NOT contain hardcoded secrets.

#### Scenario: Runs with no .env

- GIVEN no `.env` file exists
- WHEN `docker compose up --build` is run
- THEN the SPA builds and serves successfully using default variable values

#### Scenario: Optional env overrides defaults

- GIVEN a `.env` file with a supported variable set
- WHEN the service is started
- THEN the variable from `.env` overrides the compose default

### Requirement: DCL-5 — Makefile docker targets

The Makefile MUST add docker targets `docker-build`, `docker-up`, `docker-down`,
`docker-logs`, and `docker-status`, each invoking `docker compose`. Target names MUST use
hyphens, matching the existing Makefile convention.

#### Scenario: Make targets wrap compose

- GIVEN the Makefile
- WHEN `make docker-up` is run
- THEN it executes `docker compose up --build` (`docker-up`) and each sibling target invokes the
  corresponding `docker compose` sub-command

### Requirement: DCL-6 — README bring-up documentation

The README MUST document local compose bring-up (`docker compose up --build`) and MUST document
that `VITE_*` variables are baked at build time, so changing them requires rebuild
(`docker compose up --build`).

#### Scenario: Limitation documented

- GIVEN a developer reads the README
- WHEN following the compose quick-start
- THEN they see the `docker compose up --build` command and the `VITE_*` rebuild-for-env
  limitation

### Requirement: DCL-7 — Clean teardown

`docker compose down` MUST stop and remove the single service container, leaving no orphaned or
hanging processes.

#### Scenario: Teardown removes the container

- GIVEN a running `frontend-standard` container
- WHEN `docker compose down` is run
- THEN the container is stopped and removed with no orphans reported

### Requirement: DCL-8 — Compose v2 syntax and port-conflict handling

The compose file MUST use Compose v2 syntax (no `version:` key). When host port `8080` is
already in use, the run MUST surface the conflict as a clear Docker port-in-use error rather
than a silent misbinding.

#### Scenario: Port already occupied

- GIVEN host port `8080` is already bound by another process
- WHEN `docker compose up` is run
- THEN Docker reports a clear port-in-use error and the service does not misbind
