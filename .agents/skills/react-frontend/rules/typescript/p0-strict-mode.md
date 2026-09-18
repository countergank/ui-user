---
priority: P0
category: typescript
---

# Enable Strict TypeScript Mode

**Do**: Set `"strict": true` in `tsconfig.json`. This enables `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and related flags. Fix errors by adding proper types rather than disabling flags.

**Avoid**: Disabling individual strict flags to silence errors. Using `any` as a quick fix for type errors.

**Example**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}

// Correct: explicit type for unknown data
function parseUser(raw: unknown): User {
  if (typeof raw !== "object" || raw === null) throw new Error("Invalid");
  const obj = raw as Record<string, unknown>;
  return { id: String(obj.id), name: String(obj.name) };
}
```
