// Vitest configuration for React + TypeScript projects (countergank react-frontend skill asset).
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
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Include pattern: colocated .test.ts/.test.tsx files (vitest-002 colocation)
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Under host load (load average 11-13) the 5s default timed out trivial DOM tests
    // that pass in isolation (~60 jsdom files with axe, MSW, coverage), so the gate
    // failed for reasons unrelated to the code; 20s matches `src/main.test.tsx`'s budget.
    testTimeout: 20_000,
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
      exclude: [
        "node_modules/",
        // Review candidate views live under `.git/gentle-ai/...` and are full repository
        // copies: without this the `all` scan counts their untouched `src/` as 0% and the
        // global gate collapses no matter how well the real suite covers the code.
        ".git/**",
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
