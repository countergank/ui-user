import { URL, fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Vite config for the standard frontend template.
// - `@/` path alias -> ./src (must match tsconfig.json "paths")
// - Environment variables exposed via `import.meta.env.VITE_*` (VITE_ prefix)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/coverage/**"],
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
});
