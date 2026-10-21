---
priority: P1
category: vitest
---

# Set Coverage Thresholds

**Do**: Define minimum coverage thresholds for lines, branches, functions, and statements in your Vitest config. Fail CI when thresholds are not met. Set realistic targets that grow over time.

**Avoid**: 100% coverage as an initial target (unrealistic). Setting thresholds without understanding what they measure. Ignoring uncovered branches in critical paths.

**Example**:
```ts
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.stories.{ts,tsx}", "src/types/**"],
    },
  },
});
```

**Single source of truth**: `assets/vitest.config.ts` in this skill. It uses the v8 provider with 80/80 thresholds (branches 80, functions 80, lines 80, statements 80). If this rule and the asset ever disagree, follow the asset and update this rule to match.
