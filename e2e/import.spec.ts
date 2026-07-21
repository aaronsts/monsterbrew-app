import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type {
  ImportFormat} from "@/services/converters/detect-import-format";
import { monsterSchema } from "@/schema/monster-schema";
import {
  IMPORT_FORMAT_LABELS,
  detectImportFormat,
} from "@/services/converters/detect-import-format";

/**
 * Data-driven import e2e. Drop JSON files into `e2e/fixtures/<format>/` (the
 * folder name is one of the ImportFormat ids) and each one becomes a test that:
 *   1. uploads the file through the real import dialog,
 *   2. asserts the format is auto-detected as the folder name,
 *   3. imports, saves, and reads the persisted creature back out of IndexedDB,
 *   4. validates it against `monsterSchema` plus a few sanity invariants, and
 *   5. deep-equals a sibling `<name>.expected.json` when one exists.
 *
 * To (re)generate the expected snapshots, run with UPDATE_EXPECTED=1.
 */

const FIXTURES_ROOT = path.resolve(process.cwd(), "e2e/fixtures");
const UPDATE_EXPECTED = !!process.env.UPDATE_EXPECTED;
const FORMATS = Object.keys(IMPORT_FORMAT_LABELS) as Array<ImportFormat>;

interface Fixture {
  format: ImportFormat;
  name: string; // file basename without extension
  file: string; // absolute path to the input json
  expectedFile: string; // absolute path to the sibling snapshot (may not exist)
}

function collectFixtures(): Array<Fixture> {
  const fixtures: Array<Fixture> = [];
  for (const format of FORMATS) {
    const dir = path.join(FIXTURES_ROOT, format);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (!entry.endsWith(".json") || entry.endsWith(".expected.json")) continue;
      const name = entry.replace(/\.json$/, "");
      fixtures.push({
        format,
        name,
        file: path.join(dir, entry),
        expectedFile: path.join(dir, `${name}.expected.json`),
      });
    }
  }
  return fixtures;
}

/** Read a persisted creature straight out of the app's IndexedDB store. */
async function readStoredCreature(page: Page, id: string): Promise<unknown> {
  return page.evaluate(
    (creatureId) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("monsterbrewDB");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const req = db
            .transaction("creatures", "readonly")
            .objectStore("creatures")
            .get(creatureId);
          req.onsuccess = () => {
            resolve(req.result);
            db.close();
          };
          req.onerror = () => reject(req.error);
        };
      }),
    id,
  );
}

const fixtures = collectFixtures();

test.describe("Import fixtures", () => {
  if (fixtures.length === 0) {
    test.skip("no fixtures found under e2e/fixtures/<format>/", () => {});
    return;
  }

  for (const fixture of fixtures) {
    test(`${fixture.format} · ${fixture.name}`, async ({ page }) => {
      const label = IMPORT_FORMAT_LABELS[fixture.format];

      // Sanity check the fixture itself detects as the folder it lives in.
      const raw = JSON.parse(fs.readFileSync(fixture.file, "utf-8"));
      expect(
        detectImportFormat(raw),
        `${fixture.name} should be detected as ${fixture.format}`,
      ).toBe(fixture.format);

      await page.goto("/editor");

      // Open the import dialog from the editor toolbar.
      await page.getByRole("button", { name: "Import" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      // Upload the fixture and wait for auto-detection to resolve.
      await dialog.locator("#import-file").setInputFiles(fixture.file);
      await expect(dialog.getByText(`Detected format: ${label}`)).toBeVisible();

      // Import applies the creature to the form and closes the dialog.
      await dialog.getByRole("button", { name: "Import" }).click();
      await expect(dialog).toBeHidden();

      // Give the creature a name if the source had none, then save.
      const nameField = page.locator("#form-rhf-input-name");
      if (!(await nameField.inputValue()).trim()) {
        await nameField.fill(`E2E ${fixture.name}`);
      }
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page).toHaveURL(/\/library\/[^/]+$/);

      const id = new URL(page.url()).pathname.split("/library/")[1] || null;
      expect(id).toBeTruthy();

      const stored = (await readStoredCreature(page, id!)) as Record<
        string,
        unknown
      >;
      expect(stored, "creature should be persisted").toBeTruthy();

      // The persisted record must be a valid Monster (ignoring the storage id).
      const { id: _id, ...creature } = stored;
      const parsed = monsterSchema.safeParse(creature);
      expect(
        parsed.success,
        parsed.success ? "" : JSON.stringify(parsed.error?.issues, null, 2),
      ).toBe(true);

      // Cheap invariants that catch schema-valid-but-garbage conversions.
      expect((creature.name as string).trim().length).toBeGreaterThan(0);
      const abilities = creature.ability_scores as Record<string, number>;
      for (const key of ["str", "dex", "con", "int", "wis", "cha"]) {
        expect(typeof abilities[key]).toBe("number");
      }
      expect(
        (creature.cr as { challenge_rating: string }).challenge_rating.length,
      ).toBeGreaterThan(0);

      // Optional exact snapshot comparison.
      if (UPDATE_EXPECTED) {
        fs.writeFileSync(
          fixture.expectedFile,
          JSON.stringify(creature, null, 2) + "\n",
        );
      } else if (fs.existsSync(fixture.expectedFile)) {
        const expected = JSON.parse(
          fs.readFileSync(fixture.expectedFile, "utf-8"),
        );
        expect(creature).toEqual(expected);
      }
    });
  }
});
