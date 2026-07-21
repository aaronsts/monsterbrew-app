import { defineConfig, devices } from "@playwright/test";

const collectCoverage = !!process.env.COVERAGE;

/**
 * When COVERAGE=1 (via `pnpm test:e2e:coverage`), swap in the monocart reporter,
 * which consumes the V8 coverage collected by the `e2e/fixtures.ts` auto-fixture
 * and maps it back to `src/` through Vite's source maps. `sourceFilter` keeps the
 * report to our own code; deps and Vite-internal modules are dropped.
 */
const coverageReporter = [
  "monocart-reporter",
  {
    name: "Monsterbrew E2E Coverage",
    outputFile: "./coverage-e2e/report.html",
    coverage: {
      outputDir: "./coverage-e2e",
      reports: [
        ["v8", { inline: true }],
        ["console-summary"],
        ["lcovonly", { file: "lcov.info" }],
      ],

      entryFilter: (entry: { url: string }) =>
        /localhost:3000\/assets\/.*\.js/.test(entry.url),

      sourceFilter: (sourcePath: string) => sourcePath.startsWith("src/"),
    },
  },
] as const;

/**
 * E2E tests for the monster editor. See `e2e/`.
 *
 * We run against the TanStack Start (Vite) dev server for fast local
 * iteration. For CI you can swap the `webServer.command` to
 * `pnpm build && pnpm start` for a more production-faithful (and warm,
 * non-lazy-compiled) run.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: collectCoverage
    ? [["list"], coverageReporter]
    : process.env.CI
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
    // Normal runs use the dev server for speed. Coverage needs a production
    // build (with source maps) served by the Nitro output, otherwise V8
    // coverage can't be mapped from Vite's on-the-fly dev modules back to src/.
    command: collectCoverage ? "pnpm build && pnpm start" : "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI && !collectCoverage,
    timeout: collectCoverage ? 240_000 : 120_000,
  },
});
