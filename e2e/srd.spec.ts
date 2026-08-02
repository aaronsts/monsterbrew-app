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

  test("renders the baked-in {@…} tags as resolved statblock text", async ({
    page,
  }) => {
    // SRD descriptions ship as {@attack}/{@save}/{@damage} tags; the detail
    // page must resolve them — computed values, the official Hit: label the
    // upstream prose omits, and no leaked braces.
    await openSrdMonster(page, "Aboleth");

    const tentacle = statblock(page)
      .locator("p")
      .filter({ hasText: /^Tentacle\./ });
    await expect(tentacle).toContainText(
      "Melee Attack Roll: +9, reach 15 ft. Hit: 12 (2d6 + 5) Bludgeoning damage.",
    );
    const consume = statblock(page)
      .locator("p")
      .filter({ hasText: /^Consume Memories\./ });
    await expect(consume).toContainText(
      "Intelligence Saving Throw: DC 16",
    );
    await expect(statblock(page)).not.toContainText("{@");
  });

  test("copied SRD monsters recompute stat-linked values in the editor", async ({
    page,
  }) => {
    await openSrdMonster(page, "Aboleth");
    await page.getByRole("button", { name: "Copy to editor" }).click();
    await expect(page).toHaveURL(/\/editor/);

    // The preview resolves the copied tags with the aboleth's own stats.
    const tentacle = statblock(page)
      .locator("p")
      .filter({ hasText: /^Tentacle\./ });
    await expect(tentacle).toContainText("Melee Attack Roll: +9");
    await expect(statblock(page)).not.toContainText("{@");

    // STR 21 -> 23 bumps the STR-linked to-hit; INT 18 -> 20 bumps the
    // INT-derived save DC. That's the point of the tags: no retyping.
    await page.locator("#form-rhf-input-str").fill("23");
    await expect(tentacle).toContainText("Melee Attack Roll: +10");

    const consume = statblock(page)
      .locator("p")
      .filter({ hasText: /^Consume Memories\./ });
    await expect(consume).toContainText("DC 16");
    await page.locator("#form-rhf-input-int").fill("20");
    await expect(consume).toContainText("DC 17");
  });
});
