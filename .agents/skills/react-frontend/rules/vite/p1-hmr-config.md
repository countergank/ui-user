---
priority: P1
category: vite
---

# Configure HMR and File Watching

**Do**: Configure `server.watch` to ignore large directories like `node_modules`, `.git`, and build output. Set `server.hmr` options for WebSocket protocol and overlay behavior in development.

**Avoid**: Watching unnecessary directories that cause excessive CPU usage. Disabling HMR overlay (hides runtime errors).

**Example**:
```ts
// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      overlay: true, // show error overlay on HMR failures
    },
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/coverage/**",
      ],
    },
    open: true, // auto-open browser
  },
});
```
