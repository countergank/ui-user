# Folder Structure

> Why: one glance at the tree tells you how this app is organized, where a new feature goes,
> and where cross-cutting code lives. Layout follows ADR-1 (features first). This tree
> mirrors the real repository — land code only inside these boundaries.

## The tree

```
frontend-standard-project/
├─ .github/
│  ├─ workflows/ci.yml          # CI/CD quality gates + PR preview artifact
│  ├─ FLOW.md                   # environment branch flow (develop/staging/main)
│  ├─ BRANCH-PROTECTION.md      # verified protection configuration
│  ├─ PULL_REQUEST_TEMPLATE.md  # PR conventions
│  └─ COMMIT_TEMPLATE.txt       # commit message template
├─ .agents/skills/              # countergank skills (react-frontend, github-conventions, git-environment-flow, linear-tickets)
├─ .claude/skills/              # symlinks to the same skills
├─ .atl/skill-registry.md       # agent-readable skill index
├─ skills-lock.json             # pinned skill versions (hashes)
├─ .husky/commit-msg            # conventional-commit gate
├─ .vscode/                     # workspace settings
├─ docs/                        # standards library (ADR, structure, patterns, a11y, testing, release)
├─ e2e/                         # Playwright critical journeys
├─ src/
│  ├─ components/
│  │  ├─ a11y/                  # a11y building blocks (route announcer)
│  │  ├─ error/                 # error view + route error boundary
│  │  └─ ui/                    # shadcn/ui primitives (button, card)
│  ├─ features/
│  │  └─ home/                  # sample feature: components/, hooks/, api.ts
│  ├─ hooks/                    # shared hooks (use-focus-management)
│  ├─ lib/                      # errors, query client, utils
│  ├─ routes/                   # router + lazy route modules
│  ├─ stores/                   # Zustand client/UI state (v5: createStore + bound hooks)
│  ├─ styles/                   # Tailwind entry + design tokens
│  ├─ test/                     # test setup + axe instrumentation
│  ├─ app-shell.tsx             # layout shell (landmarks, skip link)
│  ├─ main.tsx                  # bootstrap: QueryProvider + RouterProvider
│  └─ vite-env.d.ts
├─ .editorconfig / .nvmrc / .gitignore / .dockerignore
├─ package.json / pnpm-lock.yaml
├─ Makefile                     # pnpm script mirrors (backend parity)
├─ Dockerfile / nginx.conf      # static SPA image (nginx, EXPOSE 80)
├─ .env.example / .env.test     # VITE_ variable conventions
├─ vite.config.ts / vitest.config.ts / playwright.config.ts
├─ tsconfig.json / tsconfig.app.json / tsconfig.node.json / tsconfig.e2e.json
├─ tailwind.config.js / postcss.config.js
├─ biome.json / eslint.config.js / commitlint.config.ts
├─ index.html
└─ openspec/                    # SDD change artifacts (spec, design, tasks, verify)
```

## Directory purposes

| Path | Purpose | Example file |
|------|---------|--------------|
| `.github/` | CI/CD workflow, branch flow, PR/commit templates | `.github/workflows/ci.yml` |
| `.agents/skills/` + `.claude/skills/` | Installed countergank skills (source of runtime rules) | `.agents/skills/react-frontend/SKILL.md` |
| `.atl/skill-registry.md` + `skills-lock.json` | Agent-readable skill index + pinned versions | `.atl/skill-registry.md` |
| `.husky/` | Git hooks (commit message validation) | `.husky/commit-msg` |
| `docs/` | Standards library consumed by humans and agents | `adr.md`, `release-process.md` |
| `e2e/` | Playwright critical journeys (keyboard, reduced motion, axe) | `critical-journeys.spec.ts` |
| `src/components/a11y/` | Accessibility building blocks | `route-announcer.tsx` |
| `src/components/error/` | Error presentation + boundary | `route-error-boundary.tsx` |
| `src/components/ui/` | shadcn/ui primitives, owned by this repo | `button.tsx` |
| `src/features/<feature>/` | One folder per business capability | `src/features/home/home-page.tsx` |
| `src/hooks/` | Shared, cross-feature hooks | `use-focus-management.ts` |
| `src/lib/` | Infrastructure: errors, query client, env, utils | `errors.ts` |
| `src/routes/` | Router definition + lazy route modules | `home-route.tsx` |
| `src/stores/` | Zustand client/UI state: vanilla `createStore` + `initialState` + selectors + bound hook | `use-ui-store.ts` |
| `src/styles/` | Tailwind entry + design tokens (light/dark) | `tokens.css` |
| `src/test/` | Test setup, matchers, axe instrumentation | `axe-pipeline.test.tsx` |
| `openspec/` | SDD artifacts for the template change | `changes/standard-frontend-template/` |

## Where does new code go?

1. A business capability? Add `src/features/<feature>/` with `components/`, `hooks/`, and
   `api.ts` — see [component-patterns.md](component-patterns.md).
2. Reusable presentation used by several features? Add it to `src/components/`.
3. Infrastructure (errors, client, env, utils)? Add it to `src/lib/`.
4. Cross-component client/UI state? Add a store to `src/stores/` (see
   [component-patterns.md](component-patterns.md) state policy).
5. A route? Add `src/routes/<name>-route.tsx` as a lazy module and register it in
   `src/routes/index.tsx`.
6. A new standard? Add it to `docs/` — docs travel with the behavior they explain.