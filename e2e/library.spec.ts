import { expect, test } from "./fixtures";
import { saveCreature, statblock } from "./helpers";

test.describe("Library", () => {
  test("shows the empty state when nothing is saved", async ({ page }) => {
    await page.goto("/library");

    await expect(
      page.getByRole("heading", { name: "No creatures yet" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Create your first monster/ }),
    ).toBeVisible();
  });

  test("lists saved creatures as cards", async ({ page }) => {
    await saveCreature(page, {
      name: "Goblin Scout",
      size: "Small",
      type: "Humanoid",
    });
    await saveCreature(page, {
      name: "Ancient Wyrm",
      size: "Gargantuan",
      type: "Dragon",
    });

    await page.goto("/library");

    await expect(page.getByText("Goblin Scout")).toBeVisible();
    await expect(page.getByText("Ancient Wyrm")).toBeVisible();
    await expect(page.getByText("Showing 2 of 2")).toBeVisible();
    // The card surfaces at-a-glance stats (labels are tooltip titles).
    await expect(page.getByTitle("Armor Class").first()).toBeVisible();
  });

  test("filters by search, shows no-matches, and clears", async ({ page }) => {
    await saveCreature(page, { name: "Goblin Scout", type: "Humanoid" });
    await saveCreature(page, { name: "Ancient Wyrm", type: "Dragon" });
    await page.goto("/library");

    const search = page.getByLabel("Search by name");

    await search.fill("goblin");
    await expect(page.getByText("Ancient Wyrm")).toHaveCount(0);
    await expect(page.getByText("Goblin Scout")).toBeVisible();
    await expect(page.getByText("Showing 1 of 2")).toBeVisible();

    await search.fill("nothing-matches-this");
    await expect(
      page.getByRole("heading", { name: /No creatures match/ }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByText("Showing 2 of 2")).toBeVisible();
  });

  test("filters by creature type", async ({ page }) => {
    await saveCreature(page, { name: "Goblin Scout", type: "Humanoid" });
    await saveCreature(page, { name: "Ancient Wyrm", type: "Dragon" });
    await page.goto("/library");

    await page.locator('[data-slot="select-trigger"]').click();
    await page.getByRole("option", { name: "Dragon", exact: true }).click();

    await expect(page.getByText("Ancient Wyrm")).toBeVisible();
    await expect(page.getByText("Goblin Scout")).toHaveCount(0);
    await expect(page.getByText("Showing 1 of 2")).toBeVisible();
  });

  test("downloads a JSON backup of saved creatures", async ({ page }) => {
    await saveCreature(page, { name: "Goblin Scout", type: "Humanoid" });
    await page.goto("/library");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download backup" }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(
      /^monsterbrew-backup-\d{4}-\d{2}-\d{2}\.json$/,
    );
  });

  test("duplicates a creature into the editor", async ({ page }) => {
    const id = await saveCreature(page, {
      name: "Goblin Scout",
      type: "Humanoid",
    });
    await page.goto(`/library/${id}`);

    await page.getByRole("button", { name: "Duplicate" }).click();

    await expect(page).toHaveURL(/\/editor/);
    await expect(page.getByLabel("Name")).toHaveValue("Copy of Goblin Scout");
  });

  test("deletes a creature and returns to the library", async ({ page }) => {
    const id = await saveCreature(page, {
      name: "Doomed Goblin",
      type: "Humanoid",
    });
    await page.goto(`/library/${id}`);
    await expect(statblock(page)).toBeVisible();

    await page.getByRole("button", { name: "Delete" }).click();

    await expect(page).toHaveURL(/\/library$/);
    await expect(
      page.getByRole("heading", { name: "No creatures yet" }),
    ).toBeVisible();
  });
});
