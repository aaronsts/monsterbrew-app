import { test, expect } from "@playwright/test";
import {
  statblock,
  abilitySave,
  selectCombo,
  toggleSave,
  cycleSkill,
  cycleDamage,
  toggleCondition,
  toggleLanguage,
  addFeature,
} from "./helpers";

/**
 * The highest-leverage test: fill a value in every section, save, reload via
 * `?id=`, and assert it all survived. Text/number fields are checked on their
 * form inputs; record- and toggle-shaped fields (skills, damage, conditions,
 * languages, legendary/mythic/lair) are checked through the statblock, which is
 * more robust than introspecting custom checkbox internals.
 */
test.describe("Monster editor — full round-trip", () => {
  test("a richly-filled creature survives save → reload intact", async ({
    page,
  }) => {
    await page.goto("/editor");
    await expect(statblock(page)).toBeVisible();

    // --- Identity ---
    await page.locator("#form-rhf-input-name").fill("Ancient Brass Dragon");
    await selectCombo(page, "form-rhf-input-type", "Dragon");
    await selectCombo(page, "form-rhf-input-size", "Large");
    await page.locator("#form-rhf-input-sub-type").fill("metallic");
    await page.locator("#form-rhf-input-alignment").fill("Chaotic Good");
    await page
      .locator('[id="form-rhf-input-senses.darkvision"]')
      .fill("60");
    await toggleLanguage(page, "common");
    await toggleLanguage(page, "draconic");

    // --- Combat ---
    await page.locator("#form-rhf-input-armor-class").fill("19");
    await page.locator("#form-rhf-input-armor-description").fill("natural armor");
    await page.locator("#form-rhf-input-hit-dice").fill("16");
    await page.locator("#form-rhf-input-str").fill("23");
    await page.locator("#form-rhf-input-con").fill("21");
    await page.locator("#form-rhf-input-wis").fill("13");
    await page.locator('[id="form-rhf-input-movements.walk"]').fill("40");
    await page.locator('[id="form-rhf-input-movements.fly"]').fill("80");

    // --- Defense ---
    await toggleSave(page, "dex");
    await toggleSave(page, "con");
    await cycleSkill(page, "perception", 2); // expert
    await cycleSkill(page, "stealth", 1); // proficient
    await cycleDamage(page, "fire", 3); // immune
    await toggleCondition(page, "frightened");

    // --- Actions (incl. gated sections) ---
    await addFeature(page, {
      addLabel: "Add trait",
      array: "traits",
      index: 0,
      name: "Legendary Resistance",
    });
    await addFeature(page, {
      addLabel: "Add action",
      array: "actions",
      index: 0,
      name: "Multiattack",
    });
    await addFeature(page, {
      addLabel: "Add reaction",
      array: "reactions",
      index: 0,
      name: "Parry",
    });
    await addFeature(page, {
      addLabel: "Add bonus action",
      array: "bonus_actions",
      index: 0,
      name: "Change Shape",
    });

    await page.locator('label[for="form-rhf-is-legendary"]').click();
    await page
      .locator("#form-rhf-legendary_description")
      .fill("The dragon can take 3 legendary actions.");
    await addFeature(page, {
      addLabel: "Add legendary action",
      array: "legendary_actions",
      index: 0,
      name: "Detect",
    });

    await page.locator('label[for="form-rhf-is-mythic"]').click();
    await addFeature(page, {
      addLabel: "Add mythic action",
      array: "mythic_actions",
      index: 0,
      name: "Mythic Strike",
    });

    await page.locator('label[for="form-rhf-has-lair"]').click();
    await addFeature(page, {
      addLabel: "Add lair action",
      array: "lair_actions",
      index: 0,
      name: "Tremor",
    });

    // --- Save ---
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page).toHaveURL(/\/my-creatures\?id=/);
    const id = new URL(page.url()).searchParams.get("id");
    expect(id).toBeTruthy();

    // --- Reload & assert fidelity ---
    await page.goto(`/editor?id=${id}`);
    await expect(page.getByRole("button", { name: "Update" })).toBeVisible();

    // Text / number inputs
    await expect(page.locator("#form-rhf-input-name")).toHaveValue(
      "Ancient Brass Dragon",
    );
    await expect(page.locator("#form-rhf-input-sub-type")).toHaveValue(
      "metallic",
    );
    await expect(page.locator("#form-rhf-input-alignment")).toHaveValue(
      "Chaotic Good",
    );
    await expect(page.locator("#form-rhf-input-type")).toHaveValue(/dragon/i);
    await expect(page.locator("#form-rhf-input-size")).toHaveValue(/large/i);
    await expect(page.locator("#form-rhf-input-armor-class")).toHaveValue("19");
    await expect(
      page.locator("#form-rhf-input-armor-description"),
    ).toHaveValue("natural armor");
    await expect(page.locator("#form-rhf-input-hit-dice")).toHaveValue("16");
    await expect(page.locator("#form-rhf-input-str")).toHaveValue("23");
    await expect(page.locator("#form-rhf-input-con")).toHaveValue("21");
    await expect(
      page.locator('[id="form-rhf-input-senses.darkvision"]'),
    ).toHaveValue("60");
    await expect(
      page.locator('[id="form-rhf-input-movements.fly"]'),
    ).toHaveValue("80");

    // Saving throws: CON 21 → mod +5, +2 PB → +7 save.
    await expect(abilitySave(page, "CON")).toHaveText("+7");

    // Statblock-backed fields
    const sb = statblock(page);
    await expect(sb.locator('[data-slot="card-title"]')).toHaveText(
      "Ancient Brass Dragon",
    );
    await expect(sb.getByText(/Common/)).toBeVisible();
    await expect(sb.getByText(/Draconic/)).toBeVisible();
    await expect(sb.getByText("Perception +5")).toBeVisible(); // wis 13 (+1) + 2·PB
    await expect(sb.getByText("Stealth +2")).toBeVisible(); // dex 10 (0) + PB
    await expect(sb.getByText(/\bfire\b/)).toBeVisible(); // damage immunity
    await expect(sb.getByText(/\bfrightened\b/)).toBeVisible(); // condition immunity
    await expect(sb.getByText("Legendary Resistance.")).toBeVisible();
    await expect(sb.getByText("Multiattack.")).toBeVisible();
    await expect(sb.getByText("Parry.")).toBeVisible();
    await expect(sb.getByText("Change Shape.")).toBeVisible();
    await expect(
      sb.getByRole("heading", { name: "Legendary Actions" }),
    ).toBeVisible();
    await expect(sb.getByText("Detect.")).toBeVisible();
    await expect(
      sb.getByRole("heading", { name: "Mythic Actions" }),
    ).toBeVisible();
    await expect(sb.getByText("Mythic Strike.")).toBeVisible();
    await expect(
      sb.getByRole("heading", { name: "Lair Actions" }),
    ).toBeVisible();
    await expect(sb.getByText("Tremor.")).toBeVisible();
  });
});
