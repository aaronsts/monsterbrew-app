import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fromTetraCube } from "@/services/converters/from-tetra-cube";
import { resolveMarkup } from "@/lib/statblock-markup";

/**
 * TetraCube exports carry 2014-style prose, with the statblock labels often
 * wrapped in markdown italics (`_Melee Weapon Attack:_ … _Hit:_ …`). The
 * import drops those underscores and rewrites the prose into `{@…}` tags.
 */
function loadFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(`e2e/fixtures/tetra-cube/${name}.json`, "utf8"),
  );
}

describe("TetraCube import → markup", () => {
  it("tags a plain 2014-style attack line", () => {
    const monster = fromTetraCube(loadFixture("goblin-boss"));
    const scimitar = monster.actions.find((a) => a.name === "Scimitar");
    expect(scimitar?.description).toBe(
      "{@atk mw} {@hit str} to hit, reach 5 ft., one target. " +
        "Hit: {@damage 1d6 + 2} slashing damage.",
    );
  });

  it("strips label italics and tags the underscored wording", () => {
    const monster = fromTetraCube(loadFixture("ancient-silver-dragon"));
    const bite = monster.actions.find((a) => a.name === "Bite");
    expect(bite?.description).toBe(
      "{@atk mw} {@hit str} to hit, reach 15 ft., one target. " +
        "Hit: {@damage 2d10 + 10} piercing damage.",
    );
    expect(resolveMarkup(bite!.description, monster)).toBe(
      "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. " +
        "Hit: 21 (2d10 + 10) piercing damage.",
    );
  });

  it("stat-links 2014-style DCs inside longer prose", () => {
    const monster = fromTetraCube(loadFixture("ancient-silver-dragon"));
    const presence = monster.actions.find(
      (a) => a.name === "Frightful Presence",
    );
    // DC 21 is CHA-derived; the WIS save itself computes to 17.
    expect(presence?.description).toContain("{@dc cha} Wisdom saving throw");
    const breath = monster.actions.find((a) =>
      a.name.startsWith("Breath Weapons"),
    );
    expect(breath?.description).toContain("{@dc con} Constitution saving throw");
    expect(breath?.description).toContain("{@damage 15d8}");
  });

  it("keeps tagging when an attack head carries a parenthetical rider", () => {
    const monster = fromTetraCube(loadFixture("dryad"));
    const club = monster.actions.find((a) => a.name === "Club");
    expect(club?.description).toBe(
      "{@atk mw} {@hit str} to hit (+6 to hit with shillelagh), reach 5 ft., one target. " +
        "Hit: {@damage 1d4} bludgeoning damage, or {@damage 1d8 + 4} bludgeoning damage with shillelagh.",
    );
  });

  it("leaves every imported feature description brace-free after resolution", () => {
    for (const name of ["goblin-boss", "ancient-silver-dragon", "dryad"]) {
      const monster = fromTetraCube(loadFixture(name));
      const features = [
        ...monster.traits,
        ...monster.actions,
        ...monster.reactions,
        ...monster.bonus_actions,
        ...monster.lair_actions,
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
