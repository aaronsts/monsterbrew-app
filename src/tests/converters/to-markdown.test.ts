import { describe, expect, it } from "vitest";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";
import { monsterToHomebrewery } from "@/services/converters/to-markdown";

function makeMonster(overrides: Partial<Monster> = {}): Monster {
  return { ...structuredClone(defaultMonster), ...overrides };
}

describe("monsterToHomebrewery", () => {
  it("wraps the statblock in a Homebrewery monster block", () => {
    const md = monsterToHomebrewery(makeMonster({ name: "Goblin" }));
    expect(md.startsWith("{{monster,frame,wide")).toBe(true);
    expect(md.trimEnd().endsWith("}}")).toBe(true);
    expect(md).toContain("## Goblin");
  });

  it("renders the header block: type line, AC, HP and speed", () => {
    const md = monsterToHomebrewery(
      makeMonster({
        name: "Goblin",
        size: "small",
        type: "humanoid",
        alignment: "neutral evil",
        armor_class: 15,
        armor_description: "leather armor",
        custom_hp: true,
        hit_points: "7 (2d6)",
        movements: { ...defaultMonster.movements, walk: 30, fly: 60 },
      }),
    );
    expect(md).toContain("*Small humanoid, neutral evil*");
    expect(md).toContain("**Armor Class** :: 15 (leather armor)");
    expect(md).toContain("**Hit Points** :: 7 (2d6)");
    expect(md).toContain("**Speed** :: 30 ft., Fly 60 ft.");
  });

  it("emits the ability score table with modifiers", () => {
    const md = monsterToHomebrewery(
      makeMonster({
        ability_scores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
      }),
    );
    expect(md).toContain("|STR|DEX|CON|INT|WIS|CHA|");
    // str 8 -> -1, dex 14 -> +2
    expect(md).toContain("|8 -1|14 +2|10 +0|10 +0|8 -1|8 -1|");
  });

  it("computes saving throws and skills with the proficiency bonus", () => {
    const md = monsterToHomebrewery(
      makeMonster({
        ability_scores: { str: 8, dex: 14, con: 10, int: 10, wis: 12, cha: 8 },
        cr: { ...defaultMonster.cr, proficiency_bonus: 2 },
        saving_throws: { dex: true },
        skills: { stealth: "expert", perception: "proficient" },
      }),
    );
    // dex +2 mod + 2 pb = +4
    expect(md).toContain("**Saving Throws** :: Dex +4");
    // stealth (dex +2) expert -> +2 + 2*2 = +6; perception (wis +1) prof -> +1 + 2 = +3
    expect(md).toContain("**Skills** :: Stealth +6, Perception +3");
  });

  it("groups damage modifiers into resistances, immunities and vulnerabilities", () => {
    const md = monsterToHomebrewery(
      makeMonster({
        damage_modifiers: {
          fire: "resistant",
          poison: "immune",
          cold: "vulnerable",
        },
        nonmagical_attack_modifiers: { nonmagical: "resistant" },
        condition_immunities: ["poisoned"],
      }),
    );
    expect(md).toContain("**Resistances** :: Fire, Nonmagical Attacks");
    expect(md).toContain("**Immunities** :: Poison, Poisoned");
    expect(md).toContain("**Vulnerabilities** :: Cold");
  });

  it("always shows senses with passive perception", () => {
    const md = monsterToHomebrewery(
      makeMonster({
        senses: { ...defaultMonster.senses, darkvision: 60 },
        passive_perception: 12,
      }),
    );
    expect(md).toContain(
      "**Senses** :: Darkvision 60 ft., Passive Perception 12",
    );
  });

  it("renders traits without a heading and action sections with one", () => {
    const md = monsterToHomebrewery(
      makeMonster({
        traits: [{ name: "Nimble Escape", description: "Disengages." }],
        actions: [{ name: "Scimitar", description: "Slashes." }],
      }),
    );
    expect(md).toContain("***Nimble Escape.*** Disengages.");
    expect(md).toContain("### Actions");
    expect(md).toContain("***Scimitar.*** Slashes.");
  });

  it("resolves 5eTools markup in feature descriptions", () => {
    const md = monsterToHomebrewery(
      makeMonster({
        cr: { ...defaultMonster.cr, proficiency_bonus: 2 },
        ability_scores: { ...defaultMonster.ability_scores, str: 14 },
        actions: [
          {
            name: "Slam",
            description: "{@h}{@damage 1d6 + 2} bludgeoning damage.",
          },
        ],
      }),
    );
    expect(md).toContain("Slam");
    expect(md).not.toContain("{@");
    expect(md).toContain("Hit: ");
  });

  it("omits legendary and mythic sections unless enabled", () => {
    const md = monsterToHomebrewery(
      makeMonster({
        is_legendary: false,
        legendary_actions: [{ name: "Move", description: "Moves." }],
      }),
    );
    expect(md).not.toContain("### Legendary Actions");
  });
});
