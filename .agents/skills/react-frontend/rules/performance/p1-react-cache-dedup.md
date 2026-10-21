---
priority: P1
category: performance
---

# Deduplicate Requests with React.cache()

> **Applies only to React Server Components frameworks** (Next.js App Router or equivalent), which provide `React.cache()` for per-request memoization. In a Vite SPA this rule does not apply: `React.cache()` does not exist there — use per-request memoization appropriate to your data layer instead.

**Do**: Use `React.cache()` to wrap data-fetching functions that may be called multiple times within a single request. This ensures the same promise is reused, avoiding duplicate network calls.

**Avoid**: Calling the same fetch function from multiple components without caching. Manual memoization of async functions at module scope (leaks across requests).

**Example**:
```tsx
import { cache } from "react";

// Correct: cached per-request
export const getUser = cache(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// Both calls return the same promise within one request
const userA = await getUser("123");
const userB = await getUser("123"); // same fetch, no duplicate
```
