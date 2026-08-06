import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";

/**
 * Every `ssr: false` route renders only on the client, so the server emits the
 * route's `pendingComponent` in its place — and nothing at all if the route
 * doesn't declare one, which is what left `<main>` empty and these pages blank
 * until their JS landed.
 *
 * Blocking scripts freezes each page in exactly that pre-hydration state.
 */
async function loadWithoutScripts(page: Page, path: string) {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto(path).catch(() => {
    // Aborting the scripts makes the navigation itself reject; the HTML we're
    // asserting on has already been delivered.
  });
}

test("the editor shell paints a skeleton before the client takes over", async ({
  page,
}) => {
  await loadWithoutScripts(page, "/editor");

  const skeleton = page.getByTestId("editor-skeleton");
  await expect(skeleton).toBeVisible();
  // Both halves stood in for, so the real UI doesn't reflow into place.
  await expect(page.getByTestId("editor-skeleton-form")).toBeVisible();
  await expect(page.getByTestId("editor-skeleton-preview")).toBeVisible();
  await expect(skeleton).toHaveAttribute("aria-busy", "true");
});

test("the library shell paints a skeleton before the client takes over", async ({
  page,
}) => {
  await loadWithoutScripts(page, "/library");

  await expect(page.getByTestId("library-skeleton-header")).toBeVisible();
  await expect(page.getByTestId("library-skeleton-filters")).toBeVisible();
  await expect(page.getByTestId("library-skeleton-grid")).toBeVisible();
});

test("the creature detail shell paints a skeleton before the client takes over", async ({
  page,
}) => {
  // Not prerendered — per-user ids aren't enumerable — but still `ssr: false`,
  // so the same empty-shell problem applies. Any id will do here.
  await loadWithoutScripts(page, "/library/any-id");

  await expect(
    page.getByTestId("creature-detail-skeleton-actions"),
  ).toBeVisible();
  await expect(
    page.getByTestId("creature-detail-skeleton-statblock"),
  ).toBeVisible();
});

test("the dev routes fall back to the generic page skeleton", async ({
  page,
}) => {
  await loadWithoutScripts(page, "/dev/components");

  await expect(page.locator('[aria-busy="true"]')).toBeVisible();
  await expect(
    page.locator('[data-slot="skeleton"]').first(),
  ).toBeVisible();
});
