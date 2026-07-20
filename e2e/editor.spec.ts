import { test, expect } from "@playwright/test";
import { statblock, editorForm, selectCombo } from "./helpers";

test.describe("Monster editor — live preview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor");
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
