import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { from5eTools } from "@/services/converters/from-5e-tools";
import { resolveMarkup } from "@/lib/statblock-markup";

/**
 * Imports keep the 5eTools `{@…}` tags verbatim (they are already our markup);
 * the render path resolves them. This asserts a real fixture round-trips into
 * clean, brace-free statblock text.
 */
function loadFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(`e2e/fixtures/5e-tools/${name}.json`, "utf8"),
  );
}

describe("5eTools import → markup resolution", () => {
  it("resolves the Gray Ooze pseudopod into clean prose", () => {
    const monster = from5eTools(loadFixture("gray-ooze"));
    const pseudopod = monster.actions.find((a) => a.name === "Pseudopod");
    expect(pseudopod).toBeDefined();

    const rendered = resolveMarkup(pseudopod!.description, monster);
    expect(rendered).not.toContain("{@");
    // {@atkr m} {@hit 3}, reach 5 ft. {@h}10 ({@damage 2d8 + 1}) Acid damage.
    expect(rendered).toContain("Melee Attack Roll: +3, reach 5 ft.");
    expect(rendered).toContain("Hit: 10 (2d8 + 1) Acid damage.");
    // {@spell Mending|XPHB} keeps the label, drops the source.
    expect(rendered).toContain("casting the Mending spell");
  });

  it("leaves every imported feature description brace-free after resolution", () => {
    for (const name of ["gray-ooze", "tarrasque", "arch-hag"]) {
      const monster = from5eTools(loadFixture(name));
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
