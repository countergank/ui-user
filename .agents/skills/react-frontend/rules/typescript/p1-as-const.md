---
priority: P1
category: typescript
---

# Use `as const` for Literal Types

**Do**: Apply `as const` to objects, arrays, and string literals when you need the compiler to infer the narrowest literal type instead of widening to `string`, `number`, or mutable types.

**Avoid**: Using `as const` on values that will be mutated. Overusing it on large objects where the widened type is sufficient.

**Example**:
```ts
// Correct: literal types inferred
const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  ERROR: "error",
} as const;
type Status = (typeof STATUS)[keyof typeof STATUS]; // "idle" | "loading" | "error"

const roles = ["admin", "editor", "viewer"] as const;
type Role = (typeof roles)[number]; // "admin" | "editor" | "viewer"

// Wrong: widened to string[]
const roles = ["admin", "editor", "viewer"]; // type is string[]
```
