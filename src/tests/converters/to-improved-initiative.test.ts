import { describe, expect, it } from "vitest";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";
import { toImprovedInitiative } from "@/services/converters/to-improved-initiative";
import { fromImprovedInitiative } from "@/services/converters/from-improved-initiative";

function makeMonster(overrides: Partial<Monster> = {}): Monster {
  return { ...structuredClone(defaultMonster), ...overrides };
}

describe("toImprovedInitiative — header", () => {
  it("puts the creature's name in Description, where the importer reads it", () => {
    // Improved Initiative has no `Name` field; `Description` is the name slot,
    // which is why `fromImprovedInitiative` reads the name from there.
    const out = toImprovedInitiative(makeMonster({ name: "Goblin Scout" }));
    expect(out.Description).toBe("Goblin Scout");
  });

  it("writes size, type and alignment as one Type line", () => {
    const out = toImprovedInitiative(
      makeMonster({
        size: "gargantuan",
        type: "dragon",
        alignment: "chaotic evil",
      }),
    );
    expect(out.Type).toBe("Gargantuan Dragon, chaotic evil");
  });

  it("includes a subtype in parentheses without breaking the Type line", () => {
    const out = toImprovedInitiative(
      makeMonster({
        size: "medium",
        type: "humanoid",
        sub_type: "goblinoid",
        alignment: "neutral evil",
      }),
    );
    expect(out.Type).toBe("Medium Humanoid (Goblinoid), neutral evil");
  });

  it("omits the alignment clause when there is none", () => {
    const out = toImprovedInitiative(
      makeMonster({ size: "small", type: "beast", alignment: "" }),
    );
    expect(out.Type).toBe("Small Beast");
  });

  it("splits hit points into a value and its dice notes", () => {
    const out = toImprovedInitiative(
      makeMonster({ custom_hp: true, hit_points: "256 (19d12 + 133)" }),
    );
    expect(out.HP).toEqual({ Value: 256, Notes: "(19d12 + 133)" });
  });

  it("derives hit points from hit dice when they are not custom", () => {
    // 5d8 with CON 14 (+2): 22 + 10 = 32.
    const out = toImprovedInitiative(
      makeMonster({
        size: "medium",
        hit_dice: "5",
        ability_scores: { ...defaultMonster.ability_scores, con: 14 },
      }),
    );
    expect(out.HP.Value).toBe(32);
    expect(out.HP.Notes).toBe("(5d8 + 10)");
  });

  it("carries armor class and its description", () => {
    const out = toImprovedInitiative(
      makeMonster({ armor_class: 17, armor_description: "natural armor" }),
    );
    expect(out.AC).toEqual({ Value: 17, Notes: "natural armor" });
  });
});

describe("toImprovedInitiative — speed and senses", () => {
  it("labels every speed, including walk", () => {
    // The importer matches on keywords, so a bare "30 ft." would be dropped.
    const out = toImprovedInitiative(
      makeMonster({
        movements: {
          walk: 40,
          climb: 40,
          fly: 80,
          swim: 0,
          burrow: 0,
          hover: false,
        },
      }),
    );
    expect(out.Speed).toEqual(["walk 40 ft.", "climb 40 ft.", "fly 80 ft."]);
  });

  it("marks hover on the fly speed", () => {
    const out = toImprovedInitiative(
      makeMonster({
        movements: { ...defaultMonster.movements, walk: 30, fly: 60, hover: true },
      }),
    );
    expect(out.Speed).toContain("fly 60 ft. (hover)");
  });

  it("lists senses and always ends with passive Perception", () => {
    const out = toImprovedInitiative(
      makeMonster({
        senses: { ...defaultMonster.senses, blindsight: 60, darkvision: 120 },
        passive_perception: 26,
      }),
    );
    expect(out.Senses).toEqual([
      "blindsight 60 ft.",
      "darkvision 120 ft.",
      "passive Perception 26",
    ]);
  });

  it("notes blindsight that blinds beyond its radius", () => {
    const out = toImprovedInitiative(
      makeMonster({
        senses: {
          ...defaultMonster.senses,
          blindsight: 30,
          is_blind_beyond: true,
        },
      }),
    );
    expect(out.Senses[0]).toBe("blindsight 30 ft. (blind beyond this radius)");
  });
});

describe("toImprovedInitiative — defenses", () => {
  it("computes saving throws as modifier plus proficiency", () => {
    const out = toImprovedInitiative(
      makeMonster({
        ability_scores: { ...defaultMonster.ability_scores, dex: 14, con: 18 },
        cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
        saving_throws: { dex: true, con: true },
      }),
    );
    expect(out.Saves).toEqual([
      { Name: "Dex", Modifier: 6 }, // +2 mod + 4 PB
      { Name: "Con", Modifier: 8 }, // +4 mod + 4 PB
    ]);
  });

  it("doubles proficiency for expertise in a skill", () => {
    const out = toImprovedInitiative(
      makeMonster({
        ability_scores: { ...defaultMonster.ability_scores, dex: 14, wis: 16 },
        cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
        skills: { perception: "expert", stealth: "proficient" },
      }),
    );
    expect(out.Skills).toEqual([
      { Name: "Perception", Modifier: 11 }, // +3 mod + 8
      { Name: "Stealth", Modifier: 6 }, // +2 mod + 4
    ]);
  });

  it("groups damage modifiers into the three lists", () => {
    const out = toImprovedInitiative(
      makeMonster({
        damage_modifiers: {
          fire: "resistant",
          poison: "immune",
          cold: "vulnerable",
        },
        condition_immunities: ["poisoned"],
      }),
    );
    expect(out.DamageResistances).toEqual(["fire"]);
    expect(out.DamageImmunities).toEqual(["poison"]);
    expect(out.DamageVulnerabilities).toEqual(["cold"]);
    expect(out.ConditionImmunities).toEqual(["poisoned"]);
  });

  it("spells out nonmagical attack modifiers, which have no field of their own", () => {
    const out = toImprovedInitiative(
      makeMonster({ nonmagical_attack_modifiers: { nonmagical: "resistant" } }),
    );
    expect(out.DamageResistances).toContain(
      "bludgeoning, piercing, and slashing from nonmagical attacks",
    );
  });

  it("lists both known and custom languages", () => {
    const out = toImprovedInitiative(
      makeMonster({
        languages: ["common", "draconic"],
        custom_languages: ["Thieves' argot"],
      } as Partial<Monster>),
    );
    expect(out.Languages).toEqual(["common", "draconic", "Thieves' argot"]);
  });
});

describe("toImprovedInitiative — features", () => {
  it("maps each section onto its Improved Initiative list", () => {
    const out = toImprovedInitiative(
      makeMonster({
        traits: [{ name: "Amphibious", description: "Breathes water." }],
        actions: [{ name: "Slam", description: "Hits things." }],
        bonus_actions: [{ name: "Dash", description: "Moves fast." }],
        reactions: [{ name: "Parry", description: "Blocks." }],
        is_legendary: true,
        legendary_actions: [{ name: "Pounce", description: "Leaps." }],
        is_mythic: true,
        mythic_actions: [{ name: "Rebirth", description: "Returns." }],
      }),
    );
    expect(out.Traits).toEqual([
      { Name: "Amphibious", Content: "Breathes water." },
    ]);
    expect(out.Actions).toEqual([{ Name: "Slam", Content: "Hits things." }]);
    expect(out.BonusActions).toEqual([{ Name: "Dash", Content: "Moves fast." }]);
    expect(out.Reactions).toEqual([{ Name: "Parry", Content: "Blocks." }]);
    expect(out.LegendaryActions).toEqual([
      { Name: "Pounce", Content: "Leaps." },
    ]);
    expect(out.MythicActions).toEqual([
      { Name: "Rebirth", Content: "Returns." },
    ]);
  });

  it("omits gated sections when their flag is off", () => {
    const out = toImprovedInitiative(
      makeMonster({
        is_legendary: false,
        legendary_actions: [{ name: "Pounce", description: "Leaps." }],
        is_mythic: false,
        mythic_actions: [{ name: "Rebirth", description: "Returns." }],
      }),
    );
    expect(out.LegendaryActions).toEqual([]);
    expect(out.MythicActions).toEqual([]);
  });

  it("folds lair actions into traits, since the format has no lair section", () => {
    const out = toImprovedInitiative(
      makeMonster({
        has_lair: true,
        lair_actions: [{ name: "Tremor", description: "Shakes." }],
      }),
    );
    expect(out.Traits).toContainEqual({
      Name: "Lair Action: Tremor",
      Content: "Shakes.",
    });
  });

  it("resolves {@…} markup, which Improved Initiative cannot read", () => {
    const out = toImprovedInitiative(
      makeMonster({
        ability_scores: { ...defaultMonster.ability_scores, str: 20 },
        cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
        actions: [
          { name: "Bite", description: "{@atkr m} {@hit str}. {@h}{@damage 2d8 + str} piercing damage." },
        ],
      }),
    );
    const bite = out.Actions[0].Content;
    expect(bite).not.toContain("{@");
    expect(bite).toContain("+9"); // +5 STR + 4 PB
    expect(bite).toContain("2d8 + 5");
  });
});

describe("toImprovedInitiative — round-trip through fromImprovedInitiative", () => {
  const original = makeMonster({
    name: "Ancient Red Dragon",
    size: "gargantuan",
    type: "dragon",
    alignment: "chaotic evil",
    armor_class: 22,
    armor_description: "natural armor",
    custom_hp: true,
    hit_points: "546 (28d20 + 252)",
    ability_scores: { str: 30, dex: 10, con: 29, int: 18, wis: 16, cha: 23 },
    cr: {
      ...defaultMonster.cr,
      challenge_rating: "24",
      proficiency_bonus: 7,
      experience: 62000,
    },
    movements: { walk: 40, climb: 40, fly: 80, swim: 0, burrow: 0, hover: false },
    saving_throws: { dex: true, con: true, wis: true, cha: true },
    // DEX 10 (+0) keeps stealth's total under 2×PB so the importer's
    // expertise heuristic reads it back as merely proficient.
    skills: { perception: "expert", stealth: "proficient" },
    damage_modifiers: { fire: "immune", cold: "resistant" },
    condition_immunities: ["frightened"],
    senses: {
      blindsight: 60,
      darkvision: 120,
      tremorsense: 0,
      truesight: 0,
      is_blind_beyond: false,
    },
    languages: ["common", "draconic"],
    passive_perception: 26,
    traits: [{ name: "Legendary Resistance", description: "It succeeds anyway." }],
    actions: [{ name: "Bite", description: "It bites with big teeth." }],
    reactions: [{ name: "Parry", description: "It blocks." }],
    bonus_actions: [{ name: "Shift", description: "It slides aside." }],
    is_legendary: true,
    legendary_actions: [{ name: "Tail Attack", description: "It sweeps." }],
  } as Partial<Monster>);

  const round = fromImprovedInitiative(toImprovedInitiative(original));

  it("preserves identity", () => {
    expect(round.name).toBe("Ancient Red Dragon");
    expect(round.size).toBe("gargantuan");
    expect(round.type).toBe("dragon");
    expect(round.alignment).toBe("chaotic evil");
  });

  it("preserves ability scores and challenge rating", () => {
    expect(round.ability_scores).toEqual(original.ability_scores);
    expect(round.cr.challenge_rating).toBe("24");
    expect(round.cr.proficiency_bonus).toBe(7);
  });

  it("preserves armor class, hit points and movement", () => {
    expect(round.armor_class).toBe(22);
    expect(round.armor_description).toBe("natural armor");
    expect(round.hit_points).toBe("546 (28d20 + 252)");
    expect(round.movements).toEqual(original.movements);
  });

  it("preserves defenses", () => {
    expect(round.saving_throws).toEqual(original.saving_throws);
    expect(round.skills).toEqual(original.skills);
    expect(round.damage_modifiers).toEqual(original.damage_modifiers);
    expect(round.condition_immunities).toEqual(["frightened"]);
  });

  it("preserves senses, languages and passive perception", () => {
    expect(round.senses).toEqual(original.senses);
    expect(round.languages).toEqual(original.languages);
    expect(round.passive_perception).toBe(26);
  });

  it("loses expertise on a high-ability proficient skill, by the importer's design", () => {
    // Documented, not dodged: the *importer* infers expertise from
    // `Modifier >= 2 × PB` (from-improved-initiative.ts). The exporter writes
    // the true total, so a proficient skill on a good ability comes back as
    // expertise. Fixing it would mean writing a wrong modifier; the round-trip
    // fixture above picks scores that stay clear of the threshold.
    const lossy = makeMonster({
      cr: { ...defaultMonster.cr, proficiency_bonus: 2 },
      ability_scores: { ...defaultMonster.ability_scores, wis: 16 },
      skills: { perception: "proficient" },
    });
    // WIS 16 (+3) + PB 2 = 5, and 5 >= 2 × 2.
    expect(toImprovedInitiative(lossy).Skills).toEqual([
      { Name: "Perception", Modifier: 5 },
    ]);
    expect(fromImprovedInitiative(toImprovedInitiative(lossy)).skills).toEqual({
      perception: "expert",
    });
  });

  it("preserves every feature section", () => {
    expect(round.traits).toEqual(original.traits);
    expect(round.actions).toEqual(original.actions);
    expect(round.reactions).toEqual(original.reactions);
    expect(round.bonus_actions).toEqual(original.bonus_actions);
    expect(round.legendary_actions).toEqual(original.legendary_actions);
    expect(round.is_legendary).toBe(true);
  });
});
