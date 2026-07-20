import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests for the monster editor. See `e2e/`.
 *
 * We run against the Next dev server for fast local iteration. For CI you can
 * swap the `webServer.command` to `pnpm build && pnpm start` for a more
 * production-faithful (and warm, non-lazy-compiled) run.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? "github"
    : [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Add firefox / webkit here if you want cross-browser coverage.
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
