import { expect, test } from "./fixtures";
import { statblock } from "./helpers";
import type { Page } from "@playwright/test";

/** Narrow the SRD grid to a single monster by name and open its detail page. */
async function openSrdMonster(page: Page, name: string) {
  await page.goto("/library?source=srd");
  await page.getByLabel("Search by name").fill(name);
  await page.getByRole("link", { name: new RegExp(name) }).first().click();
  await expect(page).toHaveURL(/\/library\/srd\//);
  await expect(statblock(page)).toBeVisible();
}

test.describe("SRD library", () => {
  test("toggles from own creatures to the SRD bestiary", async ({ page }) => {
    await page.goto("/library");

    // With nothing saved, the "my creatures" view shows the empty state.
    await expect(
      page.getByRole("heading", { name: "No creatures yet" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "SRD monsters" }).click();

    await expect(page).toHaveURL(/source=srd/);
    await expect(page.getByText("Browse the D&D 2024 SRD monsters")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Aboleth/ }).first(),
    ).toBeVisible();
  });

  test("SRD detail is read-only: only a Copy to editor action", async ({
    page,
  }) => {
    await openSrdMonster(page, "Aboleth");

    await expect(
      page.getByRole("button", { name: "Copy to editor" }),
    ).toBeVisible();
    // None of the owner-only actions from the personal library appear here.
    // (Exact match so "Edit" doesn't catch the "Editor" nav control.)
    await expect(
      page.getByRole("button", { name: "Edit", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Duplicate", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Delete", exact: true }),
    ).toHaveCount(0);
  });

  test("copies an SRD monster into the editor as a fresh creature", async ({
    page,
  }) => {
    await openSrdMonster(page, "Aboleth");

    await page.getByRole("button", { name: "Copy to editor" }).click();

    await expect(page).toHaveURL(/\/editor/);
    // The main identity Name field (trait/action rows also have "Name" inputs).
    await expect(page.locator("#form-rhf-input-name")).toHaveValue("Aboleth");
    // It's a template, not a saved copy — the editor opened without an id.
    await expect(page).not.toHaveURL(/id=/);
  });

  test("shows the exact SRD hit points for a size/die-mismatched monster", async ({
    page,
  }) => {
    // The Archmage is a "Small" creature with d8 hit dice (31d8 + 31 = 170),
    // which the size-derived recompute gets wrong — it must show the real value.
    await openSrdMonster(page, "Archmage");

    const hpLine = statblock(page)
      .locator("p")
      .filter({ hasText: /^HP\b/ });
    await expect(hpLine).toContainText("170");
  });
});
