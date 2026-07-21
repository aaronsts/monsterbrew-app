import { test as base, expect } from "@playwright/test";
import { addCoverageReport } from "monocart-reporter";

/**
 * Extends the base Playwright `test` with an auto-fixture that collects V8 JS
 * coverage around every test and hands it to the monocart reporter, which maps
 * it back to `src/` via Vite's source maps.
 *
 * Coverage is opt-in (`COVERAGE=1`, wired up as `pnpm test:e2e:coverage`) so a
 * normal `pnpm test:e2e` run pays none of the collection cost. `page.coverage`
 * is Chromium-only, so we also guard on the browser.
 *
 * Every spec imports `test`/`expect` from here instead of `@playwright/test` —
 * that's what makes the auto-fixture run for them.
 */
const collectCoverage = !!process.env.COVERAGE;

export const test = base.extend<{ autoCoverage: void }>({
  autoCoverage: [
    async ({ page, browserName }, use) => {
      const enabled = collectCoverage && browserName === "chromium";
      if (enabled) {
        await page.coverage.startJSCoverage({ resetOnNavigation: false });
      }

      await use();

      if (enabled) {
        const coverage = await page.coverage.stopJSCoverage();
        await addCoverageReport(coverage, test.info());
      }
    },
    { auto: true },
  ],
});

export { expect };
