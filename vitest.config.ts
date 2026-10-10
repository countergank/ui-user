// vitest.config.ts
// Reusable Vitest configuration for React + TypeScript projects (countergank
// react-frontend skill asset). Includes: jsdom environment, coverage thresholds,
// test file patterns, Testing Library setup.
import { URL, fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Must match the `@/` alias in vitest config and vite.config.ts (vite-001)
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Use jsdom for DOM-dependent React component tests
    environment: "jsdom",
    // Global test utilities available without import
    globals: true,
    // Setup file for Testing Library matchers + axe matchers
    setupFiles: ["./src/test/setup.ts"],
    // Include pattern: colocated .test.ts/.test.tsx files (vitest-002 colocation)
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Coverage configuration (TEST-1, vitest-003/coverage thresholds)
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      // Exclude test files, config, entry bootstrap and build artifacts from coverage
      exclude: [
        "node_modules/",
        ".agents/",
        ".claude/",
        "src/test/",
        "dist/",
        "coverage/",
        "e2e/",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
        "src/vite-env.d.ts",
      ],
    },
  },
});
