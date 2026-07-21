import { expect, test } from "./fixtures";
import { legacyCreature, seedCreature, statblock } from "./helpers";

test.describe("Legacy creature migration", () => {
  test("renders a legacy creature with the Legacy badge", async ({ page }) => {
    const creature = legacyCreature({ name: "Old Goblin" });
    await page.goto("/library");
    await seedCreature(page, creature);

    await page.goto(`/library/${creature.id}`);

    await expect(page.getByText("Legacy").first()).toBeVisible();
    await expect(
      statblock(page).locator('[data-slot="card-title"]'),
    ).toHaveText("Old Goblin");
  });

  test("migrates a legacy creature to the new format", async ({ page }) => {
    const creature = legacyCreature({ name: "Old Goblin" });
    await page.goto("/library");
    await seedCreature(page, creature);
    await page.goto(`/library/${creature.id}`);

    await page.getByRole("button", { name: "Edit" }).click();

    // The migrate dialog warns before the destructive in-place migration.
    await expect(
      page.getByRole("heading", { name: "Legacy format" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Migrate", exact: true }).click();

    // The success toast confirms the record was rewritten. (The dialog's own
    // success screen is racy: onMigrated reloads the parent creature, which
    // resets the dialog's phase — so we assert the durable outcomes instead.)
    await expect(page.getByText(/Migrated Old Goblin/)).toBeVisible();

    // Reloading the detail page now shows the new format — no Legacy badge.
    await page.goto(`/library/${creature.id}`);
    await expect(statblock(page)).toBeVisible();
    await expect(page.getByText("Legacy")).toHaveCount(0);
  });
});
