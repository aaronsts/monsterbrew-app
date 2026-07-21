import { expect, test } from "@playwright/test";
import { selectCombo, statblock } from "./helpers";

test.describe("Monster editor — persistence", () => {
  test("warns and does not save when the name is empty", async ({ page }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(
      page.getByText("Please provide a name for the creature"),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/editor$/);
  });

  test("saves a creature and lists it under My Creatures", async ({ page }) => {
    await page.goto("/editor");
    await page.getByLabel("Name").fill("Test Owlbear");
    await selectCombo(page, "form-rhf-input-size", "Large");
    await selectCombo(page, "form-rhf-input-type", "Monstrosity");

    await page.getByRole("button", { name: "Save" }).click();

    // Save navigates to the list, anchored on the new creature's id.
    await expect(page).toHaveURL(/\/my-creatures\?id=/);
    // exact:true targets the name cell, not the expanded statblock detail row.
    await expect(
      page.getByRole("cell", { name: "Test Owlbear", exact: true }),
    ).toBeVisible();
  });

  test("reloads a saved creature back into the editor via ?id=", async ({
    page,
  }) => {
    await page.goto("/editor");
    await page.getByLabel("Name").fill("Reloadable Wyrm");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/\/my-creatures\?id=/);
    const id = new URL(page.url()).searchParams.get("id");
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
