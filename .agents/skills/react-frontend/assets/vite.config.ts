// vite.config.ts
// Reusable Vite configuration template for React + TypeScript projects.
// Includes: path aliases, env variable handling, proxy for API dev, build optimization.

import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Path aliases — must match tsconfig.json "paths"
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3000,
    // Proxy API requests to backend during development
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Split vendor chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
    // Generate sourcemaps for production debugging
    sourcemap: true,
  },
  // Environment variable prefix is VITE_ by default
  // Access via import.meta.env.VITE_*
});
