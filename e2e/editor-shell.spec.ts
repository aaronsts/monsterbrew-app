import { expect, test } from "./fixtures";

/**
 * `/editor` is `ssr: false`, so its component only runs on the client and the
 * server emits the route's `pendingComponent` in its place — nothing at all if
 * the route doesn't declare one, which is what left `<main>` empty and the page
 * blank until the JS landed.
 *
 * Blocking scripts freezes the page in exactly that pre-hydration state.
 */
test("the editor shell paints a skeleton before the client takes over", async ({
  page,
}) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/editor").catch(() => {
    // Aborting the scripts makes the navigation itself reject; the HTML is what
    // we're after and it has already been delivered.
  });

  const skeleton = page.getByTestId("editor-skeleton");
  await expect(skeleton).toBeVisible();
  // Both halves of the editor are stood in for, so the real UI doesn't reflow.
  await expect(page.getByTestId("editor-skeleton-form")).toBeVisible();
  await expect(page.getByTestId("editor-skeleton-preview")).toBeVisible();
  // Screen readers get told the region is busy rather than just seeing blocks.
  await expect(skeleton).toHaveAttribute("aria-busy", "true");
});
