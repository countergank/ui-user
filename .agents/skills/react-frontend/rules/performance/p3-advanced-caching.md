---
priority: P3
category: performance
---

# Implement Advanced Caching Strategies

**Do**: Use `React.cache()` for deduplicating data fetches within a single render pass. Combine with HTTP caching headers and service workers for multi-request caching.

**Avoid**: Fetching the same data multiple times in one render tree. Caching mutable data that changes frequently.

**Example**:
```tsx
// Correct: React.cache deduplicates within render
import { cache } from "react";

const getUser = cache(async (id: string) => {
  const res = await fetch(`/api/users/${id}`, {
    next: { revalidate: 60 }, // HTTP cache for 60s
  });
  return res.json();
});

// Both calls share the same fetch result
function UserProfile({ id }: { id: string }) {
  const user = getUser(id);
  return <h1>{user.name}</h1>;
}

function UserAvatar({ id }: { id: string }) {
  const user = getUser(id); // no second fetch
  return <img src={user.avatar} alt="" />;
}

// Wrong: no deduplication — two identical fetches
async function fetchUser(id: string) {
  return fetch(`/api/users/${id}`).then(r => r.json());
}
```
