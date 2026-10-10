// vitest.config.ts
// Reusable Vitest configuration for React + TypeScript projects.
// Includes: jsdom environment, coverage thresholds, test file patterns, Testing Library setup.

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    // Use jsdom for DOM-dependent React component tests
    environment: "jsdom",
    // Global test utilities available without import
    globals: true,
    // Setup file for Testing Library matchers
    setupFiles: ["./src/test/setup.ts"],
    // Include pattern: colocated .test.ts/.test.tsx files
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      // Exclude test files and config from coverage
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
      ],
    },
  },
});
