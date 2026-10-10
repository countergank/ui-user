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
      provider: "istanbul",
      reporter: ["text", "lcov", "html"],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 85,
        statements: 80,
      },
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.stories.{ts,tsx}", "src/types/**"],
    },
  },
});
```
