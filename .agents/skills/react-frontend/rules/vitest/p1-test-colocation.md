---
priority: P1
category: vitest
---

# Colocate Tests with Source Files

**Do**: Place test files next to the source they test using `.test.tsx` suffix or a `__tests__/` directory. This makes it obvious which files have tests and simplifies navigation.

**Avoid**: A single monolithic `tests/` directory at the root. Naming test files inconsistently (mix `.spec.ts`, `.test.ts`, `Test.ts`).

**Example**:
```
src/
  components/
    Button.tsx
    Button.test.tsx        ← colocation (preferred)
    Input/
      Input.tsx
      __tests__/
        Input.test.tsx     ← __tests__ directory (alternative)
      Input.css

// vitest.config.ts
export default defineConfig({
  test: {
    include: ["**/*.{test,spec}.{ts,tsx}"],
  },
});
```
