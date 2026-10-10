---
priority: P1
category: typescript
---

# Prefer Nullish Coalescing Over Logical OR

**Do**: Use `??` when you want to fall back only on `null` or `undefined`. This preserves falsy values like `0`, `""`, and `false` that `||` would incorrectly replace.

**Avoid**: Using `||` for default values when `0`, empty string, or `false` are valid inputs.

**Example**:
```ts
// Correct: preserves falsy values
const count = input.count ?? 0;       // 0 stays 0
const label = input.label ?? "Default"; // "" stays ""
const enabled = input.enabled ?? true;  // false stays false

// Wrong: || replaces valid falsy values
const count = input.count || 0;       // 0 becomes 0 (ok by accident)
const label = input.label || "Default"; // "" becomes "Default" — BUG
```
