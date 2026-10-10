---
priority: P0
category: vite
---

# Use VITE_ Prefix for Environment Variables

**Do**: Prefix all client-exposed environment variables with `VITE_`. Access them via `import.meta.env.VITE_*`. Store secrets server-side only — never in `.env` files committed to the repo.

**Avoid**: Using unprefixed variable names (Vite strips them from the client bundle). Committing `.env` files with API keys or secrets.

**Example**:
```env
# .env.local
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=abc123
# DATABASE_URL=postgres://...  ← server-only, not exposed
```

```tsx
// Correct: accessed via import.meta.env
const api = fetch(`${import.meta.env.VITE_API_URL}/users`);

// Wrong: unprefixed variables are undefined in client
const url = import.meta.env.API_URL; // undefined
```
