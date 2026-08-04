import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fromImprovedInitiative } from "@/services/converters/from-improved-initiative";
import { resolveMarkup } from "@/lib/statblock-markup";

/**
 * Improved Initiative exports carry plain prose in either the 2014 wording
 * (`Melee Weapon Attack: +17 to hit …`) or the 2024 one (`Melee Attack Roll:
 * +7 …`); the import rewrites both into `{@…}` tags via proseToTags.
 */
function loadFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(`e2e/fixtures/improved-initiative/${name}.json`, "utf8"),
  );
}

describe("Improved Initiative import → markup", () => {
  it("tags a 2014-style attack line with atomic tags", () => {
    const monster = fromImprovedInitiative(loadFixture("ancient-red-dragon"));
    const bite = monster.actions.find((a) => a.name === "Bite");
    expect(bite?.description).toBe(
      "{@atk mw} {@hit str} to hit, reach 15 ft., one target. " +
        "Hit: {@damage 2d10 + 10} piercing damage plus {@damage 4d6} fire damage.",
    );
    expect(resolveMarkup(bite!.description, monster)).toBe(
      "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. " +
        "Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage.",
    );
  });

  it("converts a 2024-style attack line into a composite tag", () => {
    const monster = fromImprovedInitiative(loadFixture("flesh-golum"));
    const slam = monster.actions.find((a) => a.name === "Slam");
    expect(slam?.description).toBe(
      "{@attack m|str|5|2d8 + 4|bludgeoning|1d8|lightning}",
    );
    expect(resolveMarkup(slam!.description, monster)).toBe(
      "Melee Attack Roll: +7, reach 5 ft. " +
        "Hit: 13 (2d8 + 4) Bludgeoning damage plus 4 (1d8) Lightning damage.",
    );
  });

  it("converts a 2024-style save line into a composite tag", () => {
    const monster = fromImprovedInitiative(loadFixture("adult-black-dragon"));
    const breath = monster.actions.find((a) => a.name === "Acid Breath");
    // The DC cross-links to CON (the only ability producing DC 18).
    expect(breath?.description).toBe(
      "{@save dex|con|12d8|acid|half|each creature in a 60-foot-long, 5-foot-wide Line}",
    );
  });

  it("leaves every imported feature description brace-free after resolution", () => {
    for (const name of [
      "ancient-red-dragon",
      "flesh-golum",
      "adult-black-dragon",
    ]) {
      const monster = fromImprovedInitiative(loadFixture(name));
      const features = [
        ...monster.traits,
        ...monster.actions,
        ...monster.reactions,
        ...monster.bonus_actions,
        ...monster.legendary_actions,
        ...monster.mythic_actions,
      ];
      for (const feature of features) {
        expect(
          resolveMarkup(feature.description, monster),
          `${name} → ${feature.name}`,
        ).not.toContain("{@");
      }
    }
  });
});
