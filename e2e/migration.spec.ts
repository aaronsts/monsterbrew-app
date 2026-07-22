import { expect, test } from "./fixtures";
import { legacyCreature, seedCreature, statblock } from "./helpers";

test.describe("Legacy creature migration", () => {
  test("auto-migrates a seeded legacy creature on open (no Legacy badge)", async ({
    page,
  }) => {
    const creature = legacyCreature({ name: "Old Goblin" });

    // Land on a page that doesn't touch the creatures DB, then seed a legacy
    // record into a fresh v1 store.
    await page.goto("/");
    await seedCreature(page, creature);

    // Opening the detail page opens the store at v2, which converts the seeded
    // legacy record to the Monster shape once — it renders with no migrate
    // prompt and no "Legacy" badge.
    await page.goto(`/library/${creature.id}`);

    await expect(
      statblock(page).locator('[data-slot="card-title"]'),
    ).toHaveText("Old Goblin");
    await expect(page.getByText("Legacy")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Legacy format" }),
    ).toHaveCount(0);
  });

  test("opens a migrated legacy creature straight in the editor", async ({
    page,
  }) => {
    const creature = legacyCreature({ name: "Old Goblin" });

    await page.goto("/");
    await seedCreature(page, creature);
    await page.goto(`/library/${creature.id}`);

    // No migrate dialog — Edit hands the already-migrated creature to the editor.
    await page.getByRole("button", { name: "Edit" }).click();

    await expect(page).toHaveURL(/\/editor/);
    await expect(page.getByLabel("Name")).toHaveValue("Old Goblin");
  });
});
