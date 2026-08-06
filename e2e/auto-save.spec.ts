import { expect, test } from "./fixtures";
import { gotoBlankEditor, saveCreature, statblock } from "./helpers";

test.describe("Monster editor — auto-save", () => {
  test("auto-saves edits to a saved creature without clicking Update", async ({
    page,
  }) => {
    const id = await saveCreature(page, { name: "Auto Wyrm" });

    await page.goto(`/editor?id=${id}`);
    await expect(page.getByLabel("Name")).toHaveValue("Auto Wyrm");

    await page.getByLabel("Name").fill("Auto Wyrm, Evolved");
    // The debounced auto-save runs ~800ms after the last edit.
    await expect(page.getByText("All changes saved")).toBeVisible();

    // The save echoes back into the form via the query cache; that echo must
    // not start a second "Saving…" cycle (#93 regression). Watch the status
    // line long enough for a would-be echo (debounce + hold) to show itself.
    const echoSightings = await page.evaluate(async () => {
      const el = document.querySelector('span[aria-live="polite"]');
      let sightings = 0;
      let last = "";
      const started = Date.now();
      while (Date.now() - started < 3000) {
        const text = (el?.textContent ?? "").trim();
        if (text !== last && text.startsWith("Saving")) sightings += 1;
        last = text;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return sightings;
    });
    expect(echoSightings).toBe(0);

    // The edit must survive a full reload from IndexedDB on its own.
    await page.reload();
    await expect(page.getByLabel("Name")).toHaveValue("Auto Wyrm, Evolved");
    await expect(
      statblock(page).locator('[data-slot="card-title"]'),
    ).toHaveText("Auto Wyrm, Evolved");
  });

  test("nudges a new unsaved creature to save after several edits", async ({
    page,
  }) => {
    await gotoBlankEditor(page);
    // The nudge fires after 10 user edits (or 30s); each keystroke counts as
    // one edit, so typing an 11-character name trips it.
    await page.getByLabel("Name").pressSequentially("Nudged Newt");

    await expect(page.getByText("You have unsaved changes")).toBeVisible();

    // The toast's action saves in place — you stay in the editor with
    // auto-save armed, and the id lands in the URL so a reload resumes here.
    await page.getByRole("button", { name: "Save now" }).click();
    await expect(page).toHaveURL(/\/editor\?id=[^&]+$/);
    await expect(
      page.getByRole("button", { name: "Update", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue("Nudged Newt");
  });
});
