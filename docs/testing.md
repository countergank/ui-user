# Testing Strategy

> Why: quality gates are automated, fast, and meaningfully fail. The 80% coverage threshold
> is a floor, not a trophy. This template runs strict TDD mode: the focused test is written
> before the implementation it locks in.

## The pyramid & stack

| Level | Tool | Where tests live | Command |
|-------|------|------------------|---------|
| Unit | Vitest | `src/**/*.test.ts` colocated | `pnpm test` |
| Component | Testing Library + `userEvent` | colocated `<name>.test.tsx` | `pnpm test` |
| A11y | `vitest-axe` | component tests + `src/test/axe-pipeline.test.tsx` | `pnpm test` |
| E2E | Playwright (Chromium) | `e2e/critical-journeys.spec.ts` | `pnpm test:e2e` |

## What each level proves

**Unit** — pure logic in isolation. `src/lib/errors.test.ts` proves the typed error model:
`AppError` carries `code`/`status`/`cause`, subclasses keep their `name`, and `toError()`
normalizes strings and arbitrary values.

**Component** — a component's user-facing behavior. `hero.test.tsx` queries by role and name:

```tsx
expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
```

**A11y** — `axe(container).toHaveNoViolations()` on components plus the instrumentation probe
(`src/test/axe-pipeline.test.tsx`) that ensures the runner actually detects violations.

**E2E** — the critical journeys on a real production build: page language + landmarks, skip
link as first Tab stop, keyboard navigation to About, route announcements, reduced-motion
transition override, data-failure recovery via **Try again**, and full-page axe scans. See
`e2e/critical-journeys.spec.ts`.

## Coverage gate

`vitest.config.ts` enforces 80% lines / branches / functions / statements via
`@vitest/coverage-v8`. Below the threshold the run exits non-zero, so the CI gate fails
without a manual review. Run it with:

```bash
pnpm test:coverage   # or make test-coverage
```

## Rules

- Tests colocate with the code they verify (configured in `vitest.config.ts`).
- Query by role/name from the user's perspective; avoid implementation matches.
- Test behavior, not implementation; mock at the boundary (query client in components).
- Axe assertions ride along with component tests, not as a separate ritual.
- The E2E suite serves the production build (`pnpm build && pnpm preview` in
  `playwright.config.ts`), so it also exercises the compiled output and SPA fallback.

## Command cheat sheet

```bash
pnpm test            # unit + component + a11y (one-shot)
pnpm test:watch      # watch mode
pnpm test:coverage   # with coverage report + 80% gate
pnpm test:e2e        # Playwright critical journeys
make test            # pnpm test
make test-e2e        # pnpm test:e2e (note: needs playwright browsers installed)
make ci              # lint + typecheck + test:coverage + build
pnpm lint            # Biome + ESLint (a11y included)
pnpm typecheck       # strict TypeScript
```

On a fresh machine, install the Playwright browser first:
`pnpm exec playwright install chromium`.