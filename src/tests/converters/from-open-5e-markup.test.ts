import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fromOpen5e } from "@/services/converters/from-open-5e";
import { resolveMarkup } from "@/lib/statblock-markup";

/** Open5e (v1) creatures carry plain 2014-style prose; imports tag it. */
function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(`e2e/fixtures/open-5e/${name}.json`, "utf8"));
}

describe("Open5e import → markup", () => {
  it("tags a 2014-style attack line and resolves it back", () => {
    const monster = fromOpen5e(loadFixture("owlbear"));
    const beak = monster.actions.find((a) => a.name === "Beak");
    expect(beak?.description).toBe(
      "{@atk mw} {@hit str} to hit, reach 5 ft., one target. " +
        "Hit: {@damage 1d10 + 5} piercing damage.",
    );
    expect(resolveMarkup(beak!.description, monster)).toBe(
      "Melee Weapon Attack: +7 to hit, reach 5 ft., one target. " +
        "Hit: 10 (1d10 + 5) piercing damage.",
    );
  });

  it("leaves every imported feature description brace-free after resolution", () => {
    const monster = fromOpen5e(loadFixture("owlbear"));
    const features = [
      ...monster.traits,
      ...monster.actions,
      ...monster.reactions,
      ...monster.bonus_actions,
      ...monster.legendary_actions,
    ];
    for (const feature of features) {
      expect(
        resolveMarkup(feature.description, monster),
        `owlbear → ${feature.name}`,
      ).not.toContain("{@");
    }
  });
});
