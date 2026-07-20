import { describe, it, expect } from "vitest";
import { fromImprovedInitiative } from "@/services/converters/from-improved-initiative";
import { monsterSchema } from "@/schema/monster-schema";

const dragon = {
  Source: "5e Core Rules",
  Type: "Gargantuan Dragon, chaotic evil",
  HP: { Value: 546, Notes: "(28d20+252)" },
  AC: { Value: 22, Notes: "(natural armor)" },
  InitiativeModifier: 0,
  InitiativeAdvantage: false,
  Speed: ["walk 40 ft.", "climb 40 ft.", "fly 80 ft."],
  Abilities: { Str: 30, Dex: 10, Con: 29, Int: 18, Wis: 15, Cha: 23 },
  DamageVulnerabilities: [],
  DamageResistances: [],
  DamageImmunities: ["fire"],
  ConditionImmunities: [],
  Saves: [
    { Name: "Dex", Modifier: 7 },
    { Name: "Con", Modifier: 16 },
    { Name: "Wis", Modifier: 9 },
    { Name: "Cha", Modifier: 13 },
  ],
  Skills: [
    { Name: "Perception", Modifier: 16 },
    { Name: "Stealth", Modifier: 7 },
  ],
  Senses: ["blindsight 60 ft.", "darkvision 120 ft.", "passive Perception 26"],
  Languages: ["Common", "Draconic"],
  Challenge: "24",
  Traits: [{ Name: "Legendary Resistance", Content: "..." }],
  Actions: [{ Name: "Bite", Content: "..." }],
  BonusActions: [],
  Reactions: [],
  LegendaryActions: [
    { Name: "Detect", Content: "..." },
    { Name: "Tail Attack", Content: "..." },
    { Name: "Wing Attack", Content: "..." },
  ],
  MythicActions: [],
  Description: "Ancient Red Dragon",
  Player: "",
  Version: "3.11.5",
  ImageURL: "",
};

describe("fromImprovedInitiative", () => {
  it("produces a schema-valid monster", () => {
    expect(monsterSchema.safeParse(fromImprovedInitiative(dragon)).success).toBe(
      true,
    );
  });

  it("maps identity, defenses and actions", () => {
    const monster = fromImprovedInitiative(dragon);
    expect(monster).toMatchObject({
      name: "Ancient Red Dragon",
      size: "gargantuan",
      type: "dragon",
      alignment: "chaotic evil",
      armor_class: 22,
      passive_perception: 26,
      custom_hp: true,
    });
    expect(monster.movements).toMatchObject({ walk: 40, climb: 40, fly: 80 });
    expect(monster.saving_throws).toEqual({ dex: true, con: true, wis: true, cha: true });
    // CR 24 -> proficiency bonus 7; expert threshold is a +14 modifier.
    expect(monster.skills).toEqual({ perception: "expert", stealth: "proficient" });
    expect(monster.damage_modifiers).toEqual({ fire: "immune" });
    expect(monster.languages).toEqual(["common", "draconic"]);
    expect(monster.is_legendary).toBe(true);
    expect(monster.legendary_actions).toHaveLength(3);
  });
});
