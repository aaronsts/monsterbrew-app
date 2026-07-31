import { expect, test } from "./fixtures";
import { statblock } from "./helpers";
import type { Locator, Page } from "@playwright/test";

/** Mirrors the constants in src/components/feedback-cta.tsx. */
const STORAGE_KEY = "monsterbrew:feedback-cta-shown";
const SHOW_DELAY_MS = 3 * 60 * 1_000;
const TOAST_DURATION_MS = 15_000;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1_000;
const DAY_MS = 24 * 60 * 60 * 1_000;

function ctaToast(page: Page): Locator {
  return page.locator("[data-sonner-toast]");
}

/**
 * Open /editor and wait for hydration (statblock visible) — the CTA's timer
 * starts on mount. The 3-minute delay is far too long to wait out for real,
 * so every test installs Playwright's fake clock (once per page, before
 * navigating; it survives navigations) and fast-forwards through the delay.
 */
async function gotoEditor(page: Page) {
  await page.goto("/editor");
  await expect(statblock(page)).toBeVisible();
}

test.describe("Feedback CTA", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
  });

  test("appears 3 minutes after load and auto-dismisses 15s later", async ({
    page,
  }) => {
    await gotoEditor(page);
    const toast = ctaToast(page);

    // Not there right away, nor just short of the delay.
    await expect(toast).toBeHidden();
    await page.clock.fastForward(SHOW_DELAY_MS - 5_000);
    await expect(toast).toBeHidden();

    await page.clock.fastForward(10_000);
    await expect(toast).toBeVisible();

    // Untouched, it should leave on its own after the toast duration.
    await page.clock.fastForward(TOAST_DURATION_MS + 5_000);
    await expect(toast).toBeHidden();
  });

  test("does not appear outside the editor", async ({ page }) => {
    await page.goto("/");
    // Fast-forward well past the delay to prove it never fires here.
    await page.clock.fastForward(SHOW_DELAY_MS * 2);
    await expect(ctaToast(page)).toBeHidden();
  });

  test("clicking the prompt opens the feedback dialog", async ({ page }) => {
    await gotoEditor(page);
    await page.clock.fastForward(SHOW_DELAY_MS + 1_000);
    await expect(ctaToast(page)).toBeVisible();

    await page.getByRole("button", { name: /Enjoying Monsterbrew/ }).click();

    await expect(
      page.getByRole("dialog").getByText("Send feedback"),
    ).toBeVisible();
    await expect(ctaToast(page)).toBeHidden();
  });

  test("the close button dismisses without opening the dialog", async ({
    page,
  }) => {
    await gotoEditor(page);
    await page.clock.fastForward(SHOW_DELAY_MS + 1_000);
    await expect(ctaToast(page)).toBeVisible();

    await page.getByRole("button", { name: "Dismiss" }).click();

    await expect(ctaToast(page)).toBeHidden();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("records the shown time and stays quiet on the next visit", async ({
    page,
  }) => {
    await gotoEditor(page);
    await page.clock.fastForward(SHOW_DELAY_MS + 1_000);
    await expect(ctaToast(page)).toBeVisible();

    const stored = await page.evaluate(
      (key) => Number(localStorage.getItem(key)),
      STORAGE_KEY,
    );
    // Stored with the page's (fast-forwarded) clock: at or after real now.
    expect(stored).toBeGreaterThan(Date.now() - 60_000);

    await gotoEditor(page);
    await page.clock.fastForward(SHOW_DELAY_MS + 5_000);
    await expect(ctaToast(page)).toBeHidden();
  });

  test("stays quiet while the 7-day snooze is active", async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, String(Date.now() - DAY_MS)],
    );

    await gotoEditor(page);
    await page.clock.fastForward(SHOW_DELAY_MS + 5_000);
    await expect(ctaToast(page)).toBeHidden();
  });

  test("shows again once the 7-day snooze has passed", async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, String(Date.now() - SNOOZE_MS - DAY_MS)],
    );

    await gotoEditor(page);
    await page.clock.fastForward(SHOW_DELAY_MS + 1_000);
    await expect(ctaToast(page)).toBeVisible();
  });
});
