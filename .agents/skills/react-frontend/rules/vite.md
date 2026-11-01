# Vite — Priority P1

Build configuration and asset handling in `vite.config.ts`.

## P1 — Split vendor chunks in the build

Configure `manualChunks` under `build.rollupOptions.output` to separate vendor libraries from application code, and set `build.chunkSizeWarningLimit` to surface oversized bundles.

```ts
// ✅ Vendor and router live in their own cacheable chunks
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

```ts
// ❌ No chunking — one monolithic bundle re-downloads on every deploy
export default defineConfig({ build: { sourcemap: true } });
```

Split at library boundaries: vendor code changes rarely and stays cached, while application code changes often. Avoid splitting so finely that the browser fetches dozens of tiny chunks.

## P2 — Import static assets through the pipeline

Import images, fonts, and SVGs directly so Vite hashes and optimizes them. Reserve the `public/` directory for assets that must keep their exact filename and path, such as `favicon.ico`.

```tsx
// ✅ Imported asset — hashed, optimized, and build-verified
import logo from "./assets/logo.svg";

function Header() {
  return <img src={logo} alt="Company logo" />;
}
```

```tsx
// ❌ Relative path to a src asset breaks once the bundle is deployed
<img src="./assets/logo.svg" alt="logo" />
```

To use an SVG as a React component (`import { ReactComponent as Logo }`), set `exportType: "named"` in the vite-plugin-svgr configuration — without it the import resolves to a URL string, not a component.
