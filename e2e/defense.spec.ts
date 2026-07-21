import { expect, test } from "@playwright/test";
import {
  abilitySave,
  cycleDamage,
  cycleSkill,
  statblock,
  toggleCondition,
  toggleSave,
} from "./helpers";

/**
 * Coverage for `defense-form.tsx`
 */
test.describe("Monster editor — defense form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor");
    await expect(statblock(page)).toBeVisible();
  });

  test("saving-throw proficiency updates the SAVE column", async ({ page }) => {
    await page.locator("#form-rhf-input-con").fill("12"); // mod +1
    // Without proficiency, save === mod.
    await expect(abilitySave(page, "CON")).toHaveText("+1");

    await toggleSave(page, "con");
    await expect(abilitySave(page, "CON")).toHaveText("+3"); // 1 + PB(2)

    await toggleSave(page, "con"); // toggling off reverts
    await expect(abilitySave(page, "CON")).toHaveText("+1");
  });

  test("skill tri-state drives aria state and the statblock", async ({
    page,
  }) => {
    const stealth = page.getByRole("button", { name: /^stealth:/ });

    // DEX defaults to 10 (mod 0): proficient = +2, expert = +4.
    await cycleSkill(page, "stealth");
    await expect(stealth).toHaveAttribute("aria-label", "stealth: proficient");
    await expect(statblock(page).getByText("Stealth +2")).toBeVisible();

    await cycleSkill(page, "stealth");
    await expect(stealth).toHaveAttribute("aria-label", "stealth: expert");
    await expect(statblock(page).getByText("Stealth +4")).toBeVisible();

    await cycleSkill(page, "stealth"); // third click clears it
    await expect(stealth).toHaveAttribute(
      "aria-label",
      "stealth: not proficient",
    );
    await expect(statblock(page).getByText(/Stealth/)).toHaveCount(0);
  });

  test("damage modifiers route to the correct statblock row", async ({
    page,
  }) => {
    await cycleDamage(page, "fire", 1); // resistant
    await cycleDamage(page, "cold", 2); // vulnerable
    await cycleDamage(page, "poison", 3); // immune

    const sb = statblock(page);
    await expect(sb.getByText("Resistances", { exact: false })).toBeVisible();
    await expect(sb.getByText(/\bfire\b/)).toBeVisible();
    await expect(sb.getByText(/\bcold\b/)).toBeVisible();
    await expect(sb.getByText(/\bpoison\b/)).toBeVisible();
  });

  test("condition immunities appear in the statblock", async ({ page }) => {
    await toggleCondition(page, "poisoned");
    await toggleCondition(page, "charmed");

    const sb = statblock(page);
    await expect(sb.getByText(/\bpoisoned\b/)).toBeVisible();
    await expect(sb.getByText(/\bcharmed\b/)).toBeVisible();
  });
});
