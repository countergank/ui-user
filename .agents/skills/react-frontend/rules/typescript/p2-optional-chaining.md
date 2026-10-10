---
priority: P2
category: typescript
---

# Prefer Optional Chaining Over Manual Null Checks

**Do**: Use `?.` for safe property access on potentially null/undefined values. Chain multiple optional accesses when navigating deep object graphs.

**Avoid**: Manual `&&` chains for null checks. Non-null assertions (`!`) when the value might actually be undefined.

**Example**:
```ts
// Correct: optional chaining
const city = user?.address?.city;
const firstTag = response?.data?.tags?.[0];

// Correct: with nullish coalescing for defaults
const name = user?.profile?.displayName ?? "Anonymous";

// Wrong: verbose && chains
const city = user && user.address && user.address.city;

// Wrong: non-null assertion when value may be undefined
const city = user!.address!.city!;
```
