---
priority: P2
category: vite
---

# Configure Dev Server Proxy Correctly

**Do**: Use `server.proxy` in `vite.config.ts` to forward API requests to a backend during development. Match the proxy prefix to your API base path.

**Avoid**: Hardcoding backend URLs in source code. Using CORS workarounds when a proxy is simpler.

**Example**:
```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      // Rewrite prefix if backend expects different path
      "/api/v1": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ""),
      },
    },
  },
});

// In app code — no CORS issues, same-origin request
const res = await fetch("/api/users");
```
