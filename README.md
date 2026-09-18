# UI User

The user management web application for **countergank/api-user**, bootstrapped from the
countergank **standard frontend mold** (`countergank/frontend-standard-project`). It ships a
working React 19 + TypeScript SPA plus the standards (stack, structure, accessibility, testing,
release flow) inherited as the app's starting point.

## What you get

- **Stack** — Node `>=22` / pnpm `9.15.9` / Vite 6 / React 19 / TypeScript (strict) /
  Tailwind + shadcn/ui / TanStack Query 5 / Zustand 5 / React Router 7 / Biome + ESLint.
- **Layout** — features-first `src/features/<feature>/` with container/presentational
  components.
- **Accessible shell** — landmarks, skip link, route announcer, focus management
  (WCAG 2.2 AA baseline).
- **Typed error handling** — `Error` subclasses, route error boundary, retryable error UI.
- **Testing** — Vitest + Testing Library + axe (80% coverage floor) + Playwright e2e.
- **CI/CD** — GitHub Actions quality gates + PR preview artifact.
- **Governance** — countergank skills (`skills-lock.json`, `.atl/skill-registry.md`),
  ADRs (`docs/`), Conventional Commits (commitlint + husky).

## Quickstart

Prerequisites: **Node `>=22`** and **pnpm `9.15.9`** (enable with `corepack enable` if
missing). The full command surface lives in `package.json` and `Makefile`.

```bash
pnpm install          # install dependencies (or: make install / make setup)
pnpm dev              # Vite dev server on http://localhost:3000 (or: make dev)
pnpm test             # unit + component + a11y tests (or: make test)
pnpm test:coverage    # with coverage report / 80% gate (or: make test-coverage)
pnpm test:e2e         # Playwright critical journeys (or: make test-e2e)
pnpm build            # type-check + bundle to dist/ (or: make build)
pnpm preview          # serve the production build locally
```

> First time running E2E on a fresh machine: `pnpm exec playwright install chromium`.

Run the full local gate before pushing:

```bash
make ci               # lint + typecheck + test:coverage + build
```

### Docker

The `Dockerfile` builds `dist/` and serves it with nginx (port 80, SPA fallback):

```bash
docker build -t standard-frontend-template .
docker run -p 8080:80 standard-frontend-template
# → http://localhost:8080
```

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

## Environment variables

Secrets are managed with **Doppler**. Run `make dev` / `make build` (or `doppler run -- pnpm dev`)
to inject secrets from the active config. The project is linked to the `ui-user`
Doppler project (configs: `dev`, `dev_personal`, `stg`, `prd`).

Setup (once per machine):

```bash
doppler login
make doppler-setup        # links project + config
```

If the Doppler CLI is not installed, `make dev` / `make build` fall back to reading
`import.meta.env` from `.env.local`. All Vite-exposed variables MUST use the `VITE_` prefix to
reach `import.meta.env.VITE_*`:

- `VITE_API_BASE_URL` — base URL of the backend API the SPA talks to (set per config in Doppler).

The template reads env vars through the typed gateway `src/lib/env.ts` (ADR-11): the home
page renders a visible `AppEnvBadge` with the resolved `envMode`/`env.apiBaseUrl` as a working
example of how apps built from this template should consume env. Build for staging with
`make build-staging` (or `pnpm build:staging`), which uses the Doppler `stg` config and
`vite build --mode staging`. `.env.test` holds stable, non-environment-specific values for
Vitest.

## Consuming this template (bootstrap a new app)

1. **Mirror** this repository onto the new app's repo (clone + reset history, or copy the
   tree into a fresh repo/branch).
2. **Rename** — `package.json` `name`; the `<title>`/meta in `index.html`; the brand text and
   nav in `src/app-shell.tsx`.
3. **Install** — `pnpm install`.
4. **Configure env** — `doppler setup` in the new repo, set `VITE_API_BASE_URL` per config,
   then read it through `src/lib/env.ts` from your API client layer.
5. **Add a feature** — create `src/features/<feature>/` following
   `docs/component-patterns.md` (container + presentational + `api.ts`).
6. **Keep the governance layer** — `AGENTS.md`, `docs/`, `skills-lock.json`,
   `.atl/skill-registry.md`, `.github/`, `Makefile`, `Dockerfile`, and the commit/PR gates.

You inherit: the stack, the folder structure, the standards (ADRs), the accessibility and
testing baselines, CI/CD, and the branch/release flow (`.github/FLOW.md`).

## Documentation

| Doc | Covers |
|-----|--------|
| [docs/adr.md](docs/adr.md) | Architecture decisions and stack rationale |
| [docs/folder-structure.md](docs/folder-structure.md) | Where code lives |
| [docs/component-patterns.md](docs/component-patterns.md) | Component conventions |
| [docs/error-handling.md](docs/error-handling.md) | Typed error model |
| [docs/accessibility.md](docs/accessibility.md) | WCAG 2.2 AA policy and enforcement |
| [docs/testing.md](docs/testing.md) | Testing strategy and gates |
| [docs/release-process.md](docs/release-process.md) | SemVer, changelog, tags, releases |

## License

MIT — see [LICENSE](LICENSE).