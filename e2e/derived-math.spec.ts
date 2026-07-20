import { test, expect } from "@playwright/test";
import {
  statblock,
  editorForm,
  abilityRow,
  selectCombo,
  toggleSave,
} from "./helpers";

test.describe("Monster editor — derived math", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor");
    await expect(statblock(page)).toBeVisible();
  });

  test("ability modifier: positive, and the negative branch", async ({
    page,
  }) => {
    await page.locator("#form-rhf-input-dex").fill("16"); // floor(16/2)-5 = +3
    await expect(editorForm(page).getByText("DEX (+3)")).toBeVisible();
    // Row cells: [score, mod, save]. No proficiency yet, so mod === save.
    await expect(abilityRow(page, "DEX").locator("p").nth(1)).toHaveText("+3");
    await expect(abilityRow(page, "DEX").locator("p").nth(2)).toHaveText("+3");

    await page.locator("#form-rhf-input-str").fill("7"); // floor(7/2)-5 = -2
    await expect(abilityRow(page, "STR").locator("p").nth(1)).toHaveText("-2");
  });

  test("saving throw adds the CR-derived proficiency bonus", async ({
    page,
  }) => {
    await page.locator("#form-rhf-input-dex").fill("16"); // mod +3
    await expect(abilityRow(page, "DEX").locator("p").nth(2)).toHaveText("+3");

    // Default CR 0 → PB 2.
    await toggleSave(page, "dex");
    await expect(abilityRow(page, "DEX").locator("p").nth(2)).toHaveText("+5"); // 3 + 2

    // Raising the CR to 5 raises PB to 3, so the save follows.
    await selectCombo(page, "form-rhf-input-cr", "5");
    await expect(abilityRow(page, "DEX").locator("p").nth(2)).toHaveText("+6"); // 3 + 3
  });

  test("median HP: exact number and well-formed notation", async ({ page }) => {
    // size large → d10; CON 14 → mod +2; 10 hit dice.
    // extraHP = 2*10 = 20; hp = 10 + 10*10 = 110; median = floor(110/2 + 20) = 75.
    await selectCombo(page, "form-rhf-input-size", "Large");
    await page.locator("#form-rhf-input-con").fill("14");
    await page.locator("#form-rhf-input-hit-dice").fill("10");

    await expect(statblock(page).getByText("75 (10d10 + 20)")).toBeVisible();
  });

  test("passive perception derives from WIS and perception proficiency", async ({
    page,
  }) => {
    // Default WIS 10 → mod 0 → passive 10.
    await expect(
      statblock(page).getByText(/Passive perception 10/),
    ).toBeVisible();

    await page.locator("#form-rhf-input-wis").fill("14"); // mod +2 → 12
    await expect(
      statblock(page).getByText(/Passive perception 12/),
    ).toBeVisible();

    // Perception proficient adds PB (2) → 14; expert adds 2·PB → 16.
    const perception = page.getByRole("button", { name: /^perception:/ });
    await perception.click();
    await expect(
      statblock(page).getByText(/Passive perception 14/),
    ).toBeVisible();
    await perception.click();
    await expect(
      statblock(page).getByText(/Passive perception 16/),
    ).toBeVisible();
  });
});
