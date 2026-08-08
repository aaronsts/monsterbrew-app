import { expect, test } from "./fixtures";
import { clickCreatureAction, saveCreature, statblock } from "./helpers";

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

    await clickCreatureAction(page, "Duplicate");

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

    await clickCreatureAction(page, "Delete");
    // Deletion now asks for confirmation first.
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Delete" })
      .click();

    await expect(page).toHaveURL(/\/library$/);
    await expect(
      page.getByRole("heading", { name: "No creatures yet" }),
    ).toBeVisible();
  });

  test("exports a creature to every format from one dialog", async ({
    page,
  }) => {
    const id = await saveCreature(page, {
      name: "Goblin Scout",
      type: "Humanoid",
      size: "Small",
    });
    await page.goto(`/library/${id}`);

    await clickCreatureAction(page, "Export");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Opens on Homebrewery markdown.
    await expect(dialog.getByRole("textbox")).toHaveValue(
      /\{\{monster,frame,wide/,
    );
    await expect(dialog.getByRole("textbox")).toHaveValue(/## Goblin Scout/);

    await dialog.getByRole("tab", { name: "FoundryVTT" }).click();
    const actor = JSON.parse(await dialog.getByRole("textbox").inputValue());
    expect(actor.name).toBe("Goblin Scout");
    expect(actor.type).toBe("npc");
    expect(actor.system.traits.size).toBe("sm");
    expect(actor.system.details.type.value).toBe("humanoid");

    await dialog.getByRole("tab", { name: "Improved Initiative" }).click();
    const statblock = JSON.parse(
      await dialog.getByRole("textbox").inputValue(),
    );
    // The name lives in Description; the format has no Name field.
    expect(statblock.Description).toBe("Goblin Scout");
    expect(statblock.Type).toBe("Small Humanoid");

    // PDF has nothing to preview — it offers a print action instead.
    await dialog.getByRole("tab", { name: "PDF" }).click();
    await expect(dialog.getByRole("textbox")).toHaveCount(0);
    await expect(
      dialog.getByRole("button", { name: /Print statblock/ }),
    ).toBeVisible();
  });

  test("the export dialog fits a narrow viewport", async ({ page }) => {
    // Four tab labels are wider than a phone; without wrapping they force the
    // dialog past the viewport and push the footer buttons off-screen.
    const id = await saveCreature(page, { name: "Goblin Scout" });
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`/library/${id}`);
    await clickCreatureAction(page, "Export");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    for (const name of ["Homebrewery", "FoundryVTT", "Improved Initiative", "PDF"]) {
      await expect(dialog.getByRole("tab", { name })).toBeVisible();
    }
    await expect(dialog.getByRole("button", { name: /^Copy/ })).toBeVisible();

    expect(
      await dialog.evaluate((el) => el.scrollWidth > el.clientWidth),
    ).toBe(false);
  });
});
