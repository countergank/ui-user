# Vitest — Priority P1

Test authoring rules and the CI coverage baseline.

## P1 — Mock at the top level and reset between tests

Place `vi.mock()` calls at the top level of the test file — Vitest hoists them above imports, so they apply before the module under test loads. Reset mock state in `afterEach` so one test's call history never leaks into the next.

```ts
// ✅ Top-level mock, cleared after each test
import { fetchData } from "./api";
vi.mock("./api");

afterEach(() => {
  vi.clearAllMocks(); // resets call history, keeps implementations
});

it("calls fetchData once", async () => {
  (fetchData as Mock).mockResolvedValue({ items: [] });
  await renderComponent();
  expect(fetchData).toHaveBeenCalledTimes(1);
});
```

```tsx
// ❌ vi.mock inside a test body — hoisting does not apply as expected
it("calls fetchData once", async () => {
  vi.mock("./api");
  await renderComponent();
});
```

Pick the reset that matches the need: `clearAllMocks()` resets call history, `resetAllMocks()` also strips implementations back to spies, and `restoreAllMocks()` restores the original implementations.

## P1 — Enforce coverage thresholds in CI

Define minimum coverage thresholds for lines, branches, functions, and statements in `vitest.config.ts`, and let CI fail when they are not met. Set targets the team can sustain and raise them over time.

```ts
// ✅ vitest.config.ts — thresholds gate the build
coverage: {
  provider: "v8",
  reporter: ["text", "lcov"],
  thresholds: {
    lines: 80,
    branches: 80,
    functions: 80,
    statements: 80,
  },
  include: ["src/**/*.{ts,tsx}"],
},
```

```ts
// ❌ No thresholds — coverage silently erodes
coverage: { provider: "v8" },
```

**Single source of truth**: `assets/vitest.config.ts` in this skill, which uses the v8 provider with 80/80 thresholds. If this rule and the asset ever disagree, follow the asset and update this rule to match.

**Note**: coverage thresholds live in the Vitest config, so no ESLint rule can enforce them; CI does, via the config above.
