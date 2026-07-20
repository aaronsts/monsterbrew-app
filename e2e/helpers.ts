import { Page, Locator, expect } from "@playwright/test";

export function statblock(page: Page): Locator {
  return page.locator('[data-slot="card"]');
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
 * The statblock ability-score row for a given ability (e.g. "DEX"). Its three
 * `<p>` cells are, in order: score, modifier, save. Header rows are excluded
 * because only real rows carry `bg-white`.
 */
export function abilityRow(page: Page, label: string): Locator {
  return statblock(page).locator("div.bg-white", {
    has: page.getByRole("heading", { level: 4, name: label, exact: true }),
  });
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
