// playwright.config.ts
// E2E configuration for the standard frontend template (TEST-4/5).
// Critical journeys run against a production preview (vite preview) in Chromium.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Keyboard/focus journeys assert document.activeElement after real Tab
  // presses; a single worker keeps headless window focus deterministic
  // (7 tests, ~15s total — acceptable for this suite).
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Production build first, then serve the built assets (SPA fallback on).
    command: "pnpm build && pnpm preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
