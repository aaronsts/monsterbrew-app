import { test, expect } from "@playwright/test";
import { statblock, selectCombo, creatureIdFromUrl } from "./helpers";

test.describe("Monster editor — persistence", () => {
  test("warns and does not save when the name is empty", async ({ page }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText("Please provide a name for the creature"),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/editor$/);
  });

  test("saves a creature and opens its library detail page", async ({
    page,
  }) => {
    await page.goto("/editor");
    await page.getByLabel("Name").fill("Test Owlbear");
    await selectCombo(page, "form-rhf-input-size", "Large");
    await selectCombo(page, "form-rhf-input-type", "Monstrosity");

    await page.getByRole("button", { name: "Save" }).click();

    // Save navigates to the creature's detail page.
    await expect(page).toHaveURL(/\/library\/[^/]+$/);
    await expect(
      statblock(page).locator('[data-slot="card-title"]'),
    ).toHaveText("Test Owlbear");
  });

  test("reloads a saved creature back into the editor via ?id=", async ({
    page,
  }) => {
    await page.goto("/editor");
    await page.getByLabel("Name").fill("Reloadable Wyrm");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/\/library\/[^/]+$/);
    const id = creatureIdFromUrl(page);
    expect(id).toBeTruthy();

    // IndexedDB persists across same-origin navigations within this context.
    await page.goto(`/editor?id=${id}`);
    await expect(page.getByLabel("Name")).toHaveValue("Reloadable Wyrm");
    await expect(
      statblock(page).locator('[data-slot="card-title"]'),
    ).toHaveText("Reloadable Wyrm");
    // A loaded creature saves as an update, not a new record.
    await expect(page.getByRole("button", { name: "Update" })).toBeVisible();
  });
});
