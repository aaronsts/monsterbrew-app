import { defaultMonster } from "../src/schema/monster-schema";
import { expect, test } from "./fixtures";
import { seedCreature, statblock } from "./helpers";
import type { Page } from "@playwright/test";

function launcher(page: Page) {
  return page.getByRole("dialog").filter({ hasText: "Create a new creature" });
}

function statblockTitle(page: Page) {
  return statblock(page).locator('[data-slot="card-title"]');
}

/**
 * The lazily-loaded bestiary, under either name it travels by: the raw module
 * on the dev server this suite normally runs against, or the built
 * `assets/srd-<hash>.js` chunk that `pnpm test:e2e:coverage` serves.
 */
function isBestiaryChunk(url: string) {
  return /srd-monsters/.test(url) || /\/assets\/srd-[^/]*\.js/.test(url);
}

/** A saved creature, stamped so ordering is deterministic. */
function savedCreature(name: string, updated_at: number) {
  return {
    ...defaultMonster,
    id: `seeded-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    updated_at,
  };
}

test.describe("New creature dialog", () => {
  test("greets an editor opened with nothing to load", async ({ page }) => {
    await page.goto("/editor");

    await expect(launcher(page)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Blank creature/ }),
    ).toBeVisible();
  });

  test("the blank option gives today's empty form", async ({ page }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: /Blank creature/ }).click();

    await expect(launcher(page)).toBeHidden();
    await expect(statblockTitle(page)).toHaveText("Example Creature");
    await expect(page.locator("#form-rhf-input-name")).toHaveValue("");
  });

  test("dismissing with Escape also starts blank", async ({ page }) => {
    await page.goto("/editor");
    await expect(launcher(page)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(launcher(page)).toBeHidden();
    await expect(statblockTitle(page)).toHaveText("Example Creature");
  });

  test("the picker loads an SRD monster without leaving the editor", async ({
    page,
  }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: /Existing creature/ }).click();
    await page.getByRole("searchbox").fill("owlbear");
    await page.getByRole("button", { name: /Owlbear/ }).click();

    await expect(page).toHaveURL(/\/editor$/);
    await expect(statblockTitle(page)).toHaveText("Owlbear");
    // Real SRD values, so this fails if the option diverges from `fromSrd`.
    await expect(page.locator("#form-rhf-input-name")).toHaveValue("Owlbear");
    await expect(statblock(page)).toContainText("CR 3");
  });

  test("returning to /editor after saving starts fresh, not on the last SRD copy", async ({
    page,
  }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: /Existing creature/ }).click();
    await page.getByRole("searchbox").fill("owlbear");
    await page.getByRole("button", { name: /Owlbear/ }).click();

    const name = page.locator("#form-rhf-input-name");
    await expect(name).toHaveValue("Owlbear");
    await name.fill("");
    // Typed rather than filled: the save nudge counts change events, and it is
    // the only route from `/editor` to `/editor?id=` without leaving the route.
    await name.pressSequentially("Fen Warden");
    await page.getByRole("button", { name: "Save now" }).click();
    await expect(page).toHaveURL(/\/editor\?id=/);

    // Same route, so `MonsterForm` never remounts. The launcher's state is
    // keyed on the edited id precisely so this cannot resurrect the SRD
    // starter with the launcher still suppressed.
    // Scoped to the header — the footer carries an "Editor" link too.
    await page
      .getByRole("banner")
      .getByRole("link", { name: "Editor", exact: true })
      .click();
    await expect(page).toHaveURL(/\/editor$/);

    await expect(launcher(page)).toBeVisible();
    await page.getByRole("button", { name: /Blank creature/ }).click();

    // The typed name survives as a dirty field — pre-existing `keepDirtyValues`
    // behaviour that predates this branch (verified against main), there to
    // protect in-progress edits (#137). What must *not* survive is the SRD
    // starter behind it: the owlbear's actions were never edited, so they fall
    // back to the blank default.
    await expect(statblock(page)).not.toContainText("Multiattack");
    await expect(statblock(page)).not.toContainText("Rend");
  });

  test("the picker filters by size and type", async ({ page }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: /Existing creature/ }).click();
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.getByText("329 creatures", { exact: true })).toBeVisible();

    // 45 of the 329 SRD monsters are dragons; the aboleth is an aberration.
    await page.getByRole("combobox", { name: "Type" }).click();
    await page.getByRole("option", { name: "Dragon", exact: true }).click();
    await expect(page.getByText("45 of 329 creatures")).toBeVisible();
    await expect(page.getByRole("button", { name: /Aboleth/ })).toBeHidden();

    // 11 of those dragons are Gargantuan.
    await page.getByRole("combobox", { name: "Size" }).click();
    await page.getByRole("option", { name: "Gargantuan", exact: true }).click();
    await expect(page.getByText("11 of 329 creatures")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Ancient Black Dragon/ }),
    ).toBeVisible();
  });

  test("the picker recovers from a filter combination with no matches", async ({
    page,
  }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: /Existing creature/ }).click();
    await expect(page.getByRole("searchbox")).toBeVisible();

    // No SRD monster sits at CR 3 and Gargantuan at once.
    await page.getByRole("combobox", { name: "Challenge rating" }).click();
    await page.getByRole("option", { name: "CR 3", exact: true }).click();
    await page.getByRole("combobox", { name: "Size" }).click();
    await page.getByRole("option", { name: "Gargantuan", exact: true }).click();

    await expect(page.getByText("No creatures match these filters.")).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();

    await expect(page.getByText("329 creatures", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Aboleth/ })).toBeVisible();
  });

  test("the picker keeps its height while the bestiary loads", async ({
    page,
  }) => {
    await page.goto("/editor");
    // Delay the bestiary so the placeholder is observable at all.
    await page.route("**/srd-monsters*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });

    await page.getByRole("button", { name: /Existing creature/ }).click();

    const dialog = page.getByRole("dialog");
    await expect(page.getByTestId("creature-list-skeleton")).toBeVisible();
    // The controls don't depend on the data, so they are usable straight away.
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Size" })).toBeVisible();
    const loading = await dialog.boundingBox();

    await expect(page.getByTestId("creature-list-skeleton")).toBeHidden();
    await expect(page.getByRole("button", { name: /Aboleth/ })).toBeVisible();
    const loaded = await dialog.boundingBox();

    // The whole point: the rows arriving must not resize the dialog.
    expect(Math.abs(loaded!.height - loading!.height)).toBeLessThan(4);

    // Nor should narrowing to a handful of results, or to none.
    await page.getByRole("searchbox").fill("owlbear");
    await expect(page.getByText("1 of 329 creatures")).toBeVisible();
    expect(
      Math.abs((await dialog.boundingBox())!.height - loading!.height),
    ).toBeLessThan(4);

    await page.getByRole("searchbox").fill("zzzz-no-match");
    await expect(page.getByText("No creatures match these filters.")).toBeVisible();
    expect(
      Math.abs((await dialog.boundingBox())!.height - loading!.height),
    ).toBeLessThan(4);
  });

  test("the picker offers your own creatures alongside the bestiary", async ({
    page,
  }) => {
    await page.goto("/");
    await seedCreature(page, savedCreature("Fen Hag", 9_000));

    await page.goto("/editor");
    await page.getByRole("button", { name: /Existing creature/ }).click();

    // Yours lead, and the count covers both sources.
    await expect(page.getByText("330 creatures", { exact: true })).toBeVisible();
    const first = page.getByRole("button", { name: /CR/ }).first();
    await expect(first).toContainText("Fen Hag");
    await expect(first).toContainText("Personal");

    // The source filter narrows to one side or the other.
    await page.getByRole("combobox", { name: "Source" }).click();
    await page.getByRole("option", { name: "My creatures", exact: true }).click();
    await expect(page.getByText("1 of 330 creatures")).toBeVisible();
    await expect(page.getByRole("button", { name: /Aboleth/ })).toBeHidden();
  });

  test("picking your own creature starts a copy, not an edit", async ({
    page,
  }) => {
    await page.goto("/");
    await seedCreature(page, savedCreature("Fen Hag", 9_000));

    await page.goto("/editor");
    await page.getByRole("button", { name: /Existing creature/ }).click();
    await page.getByRole("searchbox").fill("Fen Hag");
    await page.getByRole("button", { name: /Fen Hag/ }).click();

    // Loaded into the form, but as a new unsaved creature: the URL gains no
    // `?id=`, and the button still says Save rather than Update.
    await expect(page.locator("#form-rhf-input-name")).toHaveValue("Fen Hag");
    await expect(page).toHaveURL(/\/editor$/);
    await expect(
      page.getByRole("button", { name: "Save", exact: true }),
    ).toBeVisible();
  });

  test("the picker's Back control returns to the options", async ({ page }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: /Existing creature/ }).click();
    await expect(page.getByRole("searchbox")).toBeVisible();

    await page.getByRole("button", { name: /Back/ }).click();

    await expect(page.getByRole("button", { name: /Blank creature/ })).toBeVisible();
  });

  test("the import option opens the existing import dialog", async ({ page }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: /Import or paste/ }).click();

    await expect(
      page.getByRole("heading", { name: "Import creature" }),
    ).toBeVisible();
    // One scrim at a time: the launcher steps aside rather than stacking.
    await expect(launcher(page)).toBeHidden();
  });

  test("cancelling an import brings the options back", async ({ page }) => {
    await page.goto("/editor");
    await page.getByRole("button", { name: /Import or paste/ }).click();
    await expect(
      page.getByRole("heading", { name: "Import creature" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(launcher(page)).toBeVisible();
  });

  test("the recent list opens a saved creature by id", async ({ page }) => {
    await page.goto("/");
    await seedCreature(page, savedCreature("Fen Hag", 9_000));
    await seedCreature(page, savedCreature("Older Goblin", 1_000));

    await page.goto("/editor");
    await expect(page.getByText("Recent")).toBeVisible();
    await page.getByRole("button", { name: /Fen Hag/ }).click();

    await expect(page).toHaveURL(/\/editor\?id=seeded-fen-hag$/);
    await expect(launcher(page)).toBeHidden();
    await expect(page.locator("#form-rhf-input-name")).toHaveValue("Fen Hag");
  });

  test("never appears when loading a saved creature by id", async ({ page }) => {
    await page.goto("/");
    await seedCreature(page, savedCreature("Direct Load", 5_000));

    await page.goto("/editor?id=seeded-direct-load");

    await expect(page.locator("#form-rhf-input-name")).toHaveValue("Direct Load");
    await expect(launcher(page)).toBeHidden();
  });

  test("never appears after 'Copy to editor' hands a monster over", async ({
    page,
  }) => {
    // Reach the detail page by client navigation, as `e2e/srd.spec.ts` does.
    // `/library/srd/$key` is prerendered, so a direct `goto` lets the click
    // land on static HTML before React has attached the handler.
    await page.goto("/library?source=srd");
    await page.getByLabel("Search by name").fill("Owlbear");
    await page.getByRole("link", { name: /Owlbear/ }).first().click();
    await expect(page).toHaveURL(/\/library\/srd\//);

    await page.getByRole("button", { name: "Copy to editor" }).click();

    await expect(page).toHaveURL(/\/editor/);
    await expect(page.locator("#form-rhf-input-name")).toHaveValue("Owlbear");
    await expect(launcher(page)).toBeHidden();
  });

  test("keeps the bestiary out of the editor's initial load", async ({
    page,
  }) => {
    const requested: Array<string> = [];
    page.on("request", (request) => requested.push(request.url()));

    await page.goto("/editor");
    await expect(launcher(page)).toBeVisible();

    // `src/data/srd-monsters.json` is ~660 KB (a 504 KB built chunk). Opening
    // the editor must not pay for it; opening the SRD option must.
    expect(requested.filter(isBestiaryChunk)).toEqual([]);

    await page.getByRole("button", { name: /Existing creature/ }).click();
    await expect(page.getByRole("searchbox")).toBeVisible();

    // The positive control: without it, a filter that matches nothing would
    // make the assertion above pass for the wrong reason.
    await expect
      .poll(() => requested.filter(isBestiaryChunk).length)
      .toBeGreaterThan(0);
  });
});
