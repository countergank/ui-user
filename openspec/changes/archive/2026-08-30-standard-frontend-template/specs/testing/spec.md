# Testing — Standard Frontend Template

## ADDED Requirements

### TEST-1: Unit tests
The template MUST use Vitest for unit tests. Tests MUST be colocated with the code they
cover (`vitest-002` per skill) and follow a clear structure (arrange/act/assert). Coverage
MUST be measured with a configured threshold.

### TEST-2: Component tests
Component tests MUST use Testing Library with `userEvent` for realistic interactions
(`vitest-003`, `vitest-004` per skill). Queries MUST be role/accessibility-based, not
implementation-based. Tests MUST use a configured `cleanup` policy and mock external
dependencies via established mock strategies.

### TEST-3: Accessibility tests
Automated accessibility checks MUST run via axe on rendered components. Accessibility
rules of WCAG 2.2 (per the react-frontend skill) MUST be asserted in tests and CI.

### TEST-4: E2E tests
The template MUST provide Playwright for end-to-end tests covering critical user journeys
in a real browser, including keyboard navigation and reduced-motion paths.

### TEST-5: Test command & integration
The test runner MUST be integrated so that `pnpm test` runs unit + component tests, and
`pnpm test:e2e` runs Playwright. CI MUST gate on unit, component, a11y, and E2E results and
on the coverage threshold. When the stack is scaffolded, strict TDD mode MAY be enabled by
confirming the runner in `openspec/config.yaml`.
