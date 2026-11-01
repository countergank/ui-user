# TypeScript — Priority P0

Compiler baseline for every TypeScript file in the app.

## P0 — Enable strict TypeScript mode

Set `"strict": true` in `tsconfig.json`, which enables `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and the related flags. Fix type errors by adding proper types; keep the flags on.

```json
// ✅ tsconfig.json — strict baseline, hardened for null checks and indexing
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

```tsx
// ❌ any silences the compiler and removes the guarantee strict mode provides
function parseUser(raw: unknown): User {
  const obj = raw as any; // unchecked shape
  return { id: obj.id, name: obj.name };
}
```

Fix type errors by adding proper types, and parse unknown data through explicit validation (`typeof` checks, `Record<string, unknown>` narrowing) instead of assertion shortcuts.

**Note**: `"strict": true` is a tsconfig decision, so no ESLint rule can enforce it. `assets/eslint.config.js` carries the type-checked ESLint presets (`strictTypeChecked`), and this rule documents the compiler baseline the app builds on.
