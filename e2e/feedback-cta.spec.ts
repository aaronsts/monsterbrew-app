import { expect, test } from "./fixtures";
import { statblock } from "./helpers";
import type { Locator, Page } from "@playwright/test";

/** Mirrors the constants in src/components/feedback-cta.tsx. */
const STORAGE_KEY = "monsterbrew:feedback-cta-shown";
const SHOW_DELAY_MS = 5_000;
const TOAST_DURATION_MS = 10_000;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1_000;
const DAY_MS = 24 * 60 * 60 * 1_000;

function ctaToast(page: Page): Locator {
  return page.locator("[data-sonner-toast]");
}

/**
 * Open /editor and wait for hydration (statblock visible) — the CTA's 5s
 * timer starts on mount, so this is the reference point for timing checks.
 */
async function gotoEditor(page: Page): Promise<number> {
  await page.goto("/editor");
  await expect(statblock(page)).toBeVisible();
  return Date.now();
}

test.describe("Feedback CTA", () => {
  test("appears ~5s after load and auto-dismisses ~10s later", async ({
    page,
  }) => {
    const hydratedAt = await gotoEditor(page);
    const toast = ctaToast(page);

    // Not there right away, nor 2s in — the 5s delay is still running.
    await expect(toast).toBeHidden();
    await page.waitForTimeout(2_000);
    await expect(toast).toBeHidden();

    await expect(toast).toBeVisible({ timeout: SHOW_DELAY_MS + 5_000 });
    const shownAfterMs = Date.now() - hydratedAt;
    expect(shownAfterMs).toBeGreaterThanOrEqual(SHOW_DELAY_MS - 500);

    // Untouched, it should stay up ~10s and then leave on its own.
    const visibleAt = Date.now();
    await expect(toast).toBeHidden({ timeout: TOAST_DURATION_MS + 5_000 });
    const visibleForMs = Date.now() - visibleAt;
    expect(visibleForMs).toBeGreaterThanOrEqual(TOAST_DURATION_MS - 1_000);
  });

  test("does not appear outside the editor", async ({ page }) => {
    await page.goto("/");
    // Give it well past the 5s delay to prove it never fires here.
    await page.waitForTimeout(SHOW_DELAY_MS + 3_000);
    await expect(ctaToast(page)).toBeHidden();
  });

  test("clicking the prompt opens the feedback dialog", async ({ page }) => {
    await gotoEditor(page);
    await expect(ctaToast(page)).toBeVisible({ timeout: SHOW_DELAY_MS + 5_000 });

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
    await expect(ctaToast(page)).toBeVisible({ timeout: SHOW_DELAY_MS + 5_000 });

    await page.getByRole("button", { name: "Dismiss" }).click();

    await expect(ctaToast(page)).toBeHidden();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("records the shown time and stays quiet on the next visit", async ({
    page,
  }) => {
    await gotoEditor(page);
    await expect(ctaToast(page)).toBeVisible({ timeout: SHOW_DELAY_MS + 5_000 });

    const stored = await page.evaluate(
      (key) => Number(localStorage.getItem(key)),
      STORAGE_KEY,
    );
    expect(stored).toBeGreaterThan(Date.now() - 60_000);

    await gotoEditor(page);
    await page.waitForTimeout(SHOW_DELAY_MS + 3_000);
    await expect(ctaToast(page)).toBeHidden();
  });

  test("stays quiet while the 7-day snooze is active", async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, String(Date.now() - DAY_MS)],
    );

    await gotoEditor(page);
    await page.waitForTimeout(SHOW_DELAY_MS + 3_000);
    await expect(ctaToast(page)).toBeHidden();
  });

  test("shows again once the 7-day snooze has passed", async ({ page }) => {
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [STORAGE_KEY, String(Date.now() - SNOOZE_MS - DAY_MS)],
    );

    await gotoEditor(page);
    await expect(ctaToast(page)).toBeVisible({ timeout: SHOW_DELAY_MS + 5_000 });
  });
});
