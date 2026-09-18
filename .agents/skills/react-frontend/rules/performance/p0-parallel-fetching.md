---
priority: P0
category: performance
---

# Fetch Independent Data in Parallel

**Do**: Use `Promise.all` or `Promise.allSettled` to fetch independent resources concurrently. Group related fetches that share the same loading boundary.

**Avoid**: Awaiting fetches sequentially when they have no dependency on each other. Mixing dependent and independent fetches in the same `Promise.all`.

**Example**:
```tsx
// Correct: parallel fetching
const [users, posts, comments] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
  fetch("/api/comments").then((r) => r.json()),
]);

// Wrong: sequential — 3x slower
const users = await fetch("/api/users").then((r) => r.json());
const posts = await fetch("/api/posts").then((r) => r.json());
const comments = await fetch("/api/comments").then((r) => r.json());
```
