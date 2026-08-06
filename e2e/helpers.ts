import { expect } from "@playwright/test";
import { defaultCreature } from "../src/schema/createCreatureSchema";
import type { Locator, Page } from "@playwright/test";

export function statblock(page: Page): Locator {
  return page.locator('[data-slot="card"]');
}

/** Saving navigates to `/library/<id>`; pull the id back off the path. */
export function creatureIdFromUrl(page: Page): string | null {
  const id = new URL(page.url()).pathname.split("/library/")[1];
  return id ? decodeURIComponent(id) : null;
}

export function editorForm(page: Page): Locator {
  return page.locator("form");
}

export async function gotoBlankEditor(page: Page) {
  await page.goto("/editor");
  await page.getByRole("button", { name: /Blank creature/ }).click();
  // Base UI keeps the popup mounted through its exit animation, so for a beat
  // after the click the options are still in the DOM *and* visible. Wait for the
  // dialog to actually leave before handing back: otherwise the next action can
  // match a control inside the closing launcher — e.g. the toolbar's "Import"
  // button also matches the "Import or paste" option, since Playwright's
  // accessible-name matching is substring by default.
  await expect(
    page.getByRole("dialog").filter({ hasText: "Create a new creature" }),
  ).toHaveCount(0);
}

/**
 * Fill the editor with a minimal creature and save it. Returns the new id
 * (parsed from the `/library/<id>` URL the Save button navigates to).
 */
export async function saveCreature(
  page: Page,
  opts: { name: string; size?: string; type?: string },
): Promise<string> {
  await gotoBlankEditor(page);
  await page.getByLabel("Name").fill(opts.name);
  if (opts.size) await selectCombo(page, "form-rhf-input-size", opts.size);
  if (opts.type) await selectCombo(page, "form-rhf-input-type", opts.type);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(/\/library\/[^/]+$/);
  const id = creatureIdFromUrl(page);
  if (!id) throw new Error("save did not navigate to a library detail page");
  return id;
}

export function legacyCreature(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...defaultCreature,
    id: `legacy-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "Old Goblin",
    ...overrides,
  };
}

/**
 * Write a record straight into the `creatures` store, bypassing the editor.
 * Creates the store if the DB doesn't exist yet, so it works from a cold start.
 */
export async function seedCreature(
  page: Page,
  record: Record<string, unknown>,
) {
  await page.evaluate(async (rec) => {
    const db: IDBDatabase = await new Promise((resolve, reject) => {
      const req = indexedDB.open("monsterbrewDB", 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("creatures")) {
          req.result.createObjectStore("creatures", { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("creatures", "readwrite");
        tx.objectStore("creatures").put(rec);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }, record);
}

export async function selectCombo(page: Page, inputId: string, option: string) {
  const input = page.locator(`#${inputId}`);
  await input.click();
  await input.press("ArrowDown"); // ensure the listbox is open

  await page
    .getByRole("option")
    .filter({ has: page.getByText(option, { exact: true }) })
    .first()
    .click();
  // The committed form value is the option's lowercase `value` (e.g. "large").
  await expect(input).toHaveValue(new RegExp(option, "i"));
}

/**
 * The statblock renders each ability as four consecutive grid cells: a label
 * cell (`<span>DEX</span>`) followed by the score, modifier, and save `<span>`
 * cells. These helpers resolve the modifier / save cell for a given ability
 * abbreviation (e.g. "DEX") by walking from its label cell.
 */
function abilityCell(page: Page, label: string, sibling: 2 | 3): Locator {
  return statblock(page).locator(
    `xpath=.//span[normalize-space(text())="${label}"]/following-sibling::span[${sibling}]`,
  );
}

/** The derived modifier cell for an ability (e.g. "DEX"). */
export function abilityMod(page: Page, label: string): Locator {
  return abilityCell(page, label, 2);
}

/** The derived saving-throw cell for an ability (e.g. "DEX"). */
export function abilitySave(page: Page, label: string): Locator {
  return abilityCell(page, label, 3);
}

/** Toggle a saving-throw checkbox via its (visually-hidden) label. */
export async function toggleSave(page: Page, ability: string) {
  await page.locator(`label[for="form-rhf-save-${ability}"]`).click();
}

/**
 * Advance a skill through its tri-state (none → proficient → expert → none).
 * The skill button's accessible name is `"<skill>: <state>"`.
 */
export async function cycleSkill(page: Page, skill: string, times = 1) {
  const button = page.getByRole("button", {
    name: new RegExp(`^${skill}:`),
  });
  for (let i = 0; i < times; i++) await button.click();
}

/**
 * Advance a damage type through its cycle (none → resistant → vulnerable →
 * immune → none). These buttons carry no aria state, so assert the result via
 * the statblock's Resistances / Immunities / Vulnerabilities rows.
 */
export async function cycleDamage(page: Page, type: string, times = 1) {
  const button = page.getByRole("button", { name: type, exact: true });
  for (let i = 0; i < times; i++) await button.click();
}

export async function toggleCondition(page: Page, value: string) {
  await page.locator(`label[for="form-rhf-condition-${value}"]`).click();
}

export async function toggleLanguage(page: Page, value: string) {
  await page.locator(`label[for="form-rhf-language-${value}"]`).click();
}

/**
 * Click one of a creature detail page's action icon buttons (e.g. "Edit",
 * "Duplicate", "Delete") — the tooltip-labelled buttons that replaced the
 * old "Actions" dropdown (#137). Exact match so "Edit" doesn't catch the
 * "Editor" nav control.
 */
export async function clickCreatureAction(page: Page, action: string) {
  await page.getByRole("button", { name: action, exact: true }).click();
}

/** Add a feature to one of the editor's field arrays and fill its inputs. */
export async function addFeature(
  page: Page,
  opts: {
    addLabel: string; // e.g. "Add trait"
    array: string; // e.g. "traits"
    index: number;
    name: string;
    description?: string;
  },
) {
  await page.getByRole("button", { name: opts.addLabel }).click();
  await page
    .locator(`#form-rhf-${opts.array}-${opts.index}-name`)
    .fill(opts.name);
  if (opts.description !== undefined) {
    await page
      .locator(`#form-rhf-${opts.array}-${opts.index}-description`)
      .fill(opts.description);
  }
}
