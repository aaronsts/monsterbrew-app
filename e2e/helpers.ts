import { expect } from "@playwright/test";
import type { Locator, Page} from "@playwright/test";

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
 * The statblock renders each ability as three consecutive grid cells: a score
 * cell (`<span><span>DEX</span> 10</span>`) followed by the modifier and save
 * `<span>` cells. These helpers resolve the modifier / save cell for a given
 * ability abbreviation (e.g. "DEX") by walking from its label span.
 */
function abilityCell(page: Page, label: string, sibling: 1 | 2): Locator {
  return statblock(page).locator(
    `xpath=.//span[normalize-space(text())="${label}"]/parent::span/following-sibling::span[${sibling}]`,
  );
}

/** The derived modifier cell for an ability (e.g. "DEX"). */
export function abilityMod(page: Page, label: string): Locator {
  return abilityCell(page, label, 1);
}

/** The derived saving-throw cell for an ability (e.g. "DEX"). */
export function abilitySave(page: Page, label: string): Locator {
  return abilityCell(page, label, 2);
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
