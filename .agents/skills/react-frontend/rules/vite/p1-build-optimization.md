---
priority: P1
category: vite
---

# Optimize Build Output with Code Splitting

**Do**: Configure `manualChunks` to separate vendor libraries from application code. Set `chunkSizeWarningLimit` to catch oversized bundles. Use `rollupOptions.output` for fine-grained control over chunk naming.

**Avoid**: Shipping a single monolithic bundle. Ignoring chunk size warnings. Splitting chunks too aggressively (creates too many small requests).

**Example**:
```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 500, // kB
    sourcemap: true,
  },
});
```
