import { describe, expect, it } from "vitest";
import type { Open5eCreature } from "@/types/open-5e";
import { fromOpen5e } from "@/services/converters/from-open-5e";
import { monsterSchema } from "@/schema/monster-schema";

const owlbear = {
  slug: "owlbear",
  desc: "A cross between a bear and an owl.",
  name: "Owlbear",
  size: "Large",
  type: "Monstrosity",
  subtype: "",
  group: "",
  alignment: "unaligned",
  armor_class: 13,
  armor_desc: "natural armor",
  hit_points: 59,
  hit_dice: "7d10+21",
  speed: { walk: 40 },
  strength: 20,
  dexterity: 12,
  constitution: 17,
  intelligence: 3,
  wisdom: 12,
  charisma: 7,
  strength_save: null,
  dexterity_save: null,
  constitution_save: 3,
  intelligence_save: null,
  wisdom_save: null,
  charisma_save: null,
  perception: 3,
  skills: { perception: 3 },
  damage_vulnerabilities: "",
  damage_resistances: "cold",
  damage_immunities: "",
  condition_immunities: "charmed, frightened",
  senses: "darkvision 60 ft., passive Perception 13",
  languages: "Common, Draconic",
  challenge_rating: "3",
  cr: 3,
  actions: [{ name: "Multiattack", desc: "..." }],
  bonus_actions: null,
  reactions: null,
  legendary_desc: "",
  legendary_actions: [],
  special_abilities: [{ name: "Keen Sight", desc: "..." }],
  spell_list: [],
  page_no: 1,
  environments: ["Forest"],
} as unknown as Open5eCreature;

describe("fromOpen5e", () => {
  it("produces a schema-valid monster", () => {
    expect(monsterSchema.safeParse(fromOpen5e(owlbear)).success).toBe(true);
  });

  it("maps saves, senses, damage and languages", () => {
    const monster = fromOpen5e(owlbear);
    expect(monster.type).toBe("monstrosity");
    expect(monster.hit_dice).toBe("7");
    expect(monster.saving_throws).toEqual({ con: true });
    expect(monster.skills).toEqual({ perception: "proficient" });
    expect(monster.damage_modifiers).toEqual({ cold: "resistant" });
    expect(monster.condition_immunities).toEqual(["charmed", "frightened"]);
    expect(monster.senses).toMatchObject({ darkvision: 60 });
    expect(monster.passive_perception).toBe(13);
    expect(monster.languages).toEqual(["common", "draconic"]);
  });
});
