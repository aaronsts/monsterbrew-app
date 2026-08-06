import { expect, test } from "./fixtures";
import { editorForm, gotoBlankEditor, selectCombo, statblock } from "./helpers";

test.describe("Monster editor — live preview", () => {
  test.beforeEach(async ({ page }) => {
    await gotoBlankEditor(page);
    await expect(statblock(page)).toBeVisible();
  });

  test("renders an empty statblock with placeholder name", async ({ page }) => {
    await expect(statblock(page).locator('[data-slot="card-title"]')).toHaveText(
      "Example Creature",
    );
  });

  test("live-syncs identity fields to the statblock", async ({ page }) => {
    await page.getByLabel("Name").fill("Goblin Boss");
    await selectCombo(page, "form-rhf-input-size", "Medium");
    await selectCombo(page, "form-rhf-input-type", "Humanoid");
    await page.getByLabel("Alignment").fill("Chaotic Evil");

    const sb = statblock(page);
    await expect(sb.locator('[data-slot="card-title"]')).toHaveText(
      "Goblin Boss",
    );
    // Size/type render as their raw values (lowercased); capitalization is CSS.
    await expect(
      sb.getByText(/medium humanoid, chaotic evil/i),
    ).toBeVisible();
  });

  test("clearing the challenge rating does not crash the editor", async ({
    page,
  }) => {
    const crField = page.locator("#form-rhf-input-cr");
    await crField.click();
    await page.getByRole("option", { name: /^1\/2/ }).click();
    await expect(statblock(page)).toContainText("CR 1/2");

    // The clear button empties the CR; the preview must survive and fall back.
    await crField
      .locator("..")
      .locator('[data-slot="combobox-clear"]')
      .click();

    await expect(crField).toHaveValue("");
    await expect(statblock(page)).toBeVisible();
    await expect(statblock(page)).toContainText("CR 0");
  });

  test("pressing Enter in the type combobox selects the first match", async ({
    page,
  }) => {
    const typeField = page.locator("#form-rhf-input-type");
    await typeField.click();
    await typeField.fill("dra");
    await page.keyboard.press("Enter");

    // Selection stores the item's raw value; capitalization is CSS.
    await expect(typeField).toHaveValue("dragon");
    await expect(statblock(page)).toContainText(/dragon/i);
  });

  test("recalculates the ability modifier from the score", async ({ page }) => {
    await page.locator("#form-rhf-input-dex").fill("16");

    // The form label shows the derived modifier next to the ability.
    await expect(editorForm(page).getByText("DEX (+3)")).toBeVisible();
    // And the derived +3 (Initiative / DEX mod & save) shows in the statblock.
    await expect(statblock(page)).toContainText("+3");
  });

  test("adds a trait that appears in the statblock", async ({ page }) => {
    await page.getByRole("button", { name: "Add trait" }).click();

    await page.locator("#form-rhf-traits-0-name").fill("Keen Smell");
    await page
      .locator("#form-rhf-traits-0-description")
      .fill("Advantage on Wisdom (Perception) checks that rely on smell.");

    const sb = statblock(page);
    // Traits render with no section heading (5e 2024 style), so assert the
    // trait itself appears in the statblock.
    await expect(sb.getByText("Keen Smell.")).toBeVisible();
  });

  test("removing a trait clears it from the statblock", async ({ page }) => {
    await page.getByRole("button", { name: "Add trait" }).click();
    await page.locator("#form-rhf-traits-0-name").fill("Pack Tactics");

    const sb = statblock(page);
    await expect(sb.getByText("Pack Tactics.")).toBeVisible();

    await page.getByRole("button", { name: "Remove trait" }).click();
    await expect(sb.getByText("Pack Tactics.")).toHaveCount(0);
  });

  test("legendary actions are hidden until enabled, then render", async ({
    page,
  }) => {
    // The legendary list and its statblock section are gated behind the toggle.
    await expect(
      page.getByRole("button", { name: "Add legendary action" }),
    ).toHaveCount(0);

    // The checkbox input is visually hidden; toggle it via its label.
    await page.locator('label[for="form-rhf-is-legendary"]').click();

    await page.getByRole("button", { name: "Add legendary action" }).click();
    await page
      .locator("#form-rhf-legendary_actions-0-name")
      .fill("Detect Presence");

    const sb = statblock(page);
    await expect(
      sb.getByRole("heading", { name: "Legendary Actions" }),
    ).toBeVisible();
    await expect(sb.getByText("Detect Presence.")).toBeVisible();
  });
});
