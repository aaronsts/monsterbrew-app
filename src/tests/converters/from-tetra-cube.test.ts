import { describe, it, expect } from "vitest";
import { fromTetraCube } from "@/services/converters/from-tetra-cube";
import { monsterSchema } from "@/schema/monster-schema";
import { TetraCubeCreature } from "@/types/tetraCube";

const goblin = {
  name: "Goblin Boss",
  size: "Small",
  type: "Humanoid",
  tag: "goblinoid",
  alignment: "neutral evil",
  hitDice: 6,
  armorName: "leather armor, shield",
  otherArmorDesc: "17",
  customHP: false,
  hpText: "21 (6d6)",
  speed: 30,
  swimSpeed: 0,
  burrowSpeed: 0,
  climbSpeed: 0,
  flySpeed: 0,
  hover: false,
  strPoints: 10,
  dexPoints: 15,
  conPoints: 10,
  intPoints: 10,
  wisPoints: 8,
  chaPoints: 10,
  blindsight: 0,
  darkvision: 60,
  tremorsense: 0,
  truesight: 0,
  blind: false,
  cr: "1",
  customCr: "",
  customProf: 2,
  skills: [{ name: "stealth", stat: "dex", note: "ex" }],
  sthrows: [{ name: "dex", order: "1" }],
  damagetypes: [
    { name: "fire", stat: "", type: "r" },
    { name: "poison", stat: "", type: "i" },
  ],
  conditions: [{ name: "charmed" }],
  languages: [{ name: "common", speaks: true }],
  abilities: [{ name: "Nimble Escape", desc: "..." }],
  actions: [{ name: "Scimitar", desc: "..." }],
  reactions: [],
  bonusActions: [{ name: "Command", desc: "..." }],
  isLair: true,
  lairDescription: "The warren.",
  lairs: [{ name: "Collapse", desc: "..." }],
  isLegendary: false,
  legendariesDescription: "",
  legendaries: [],
  isMythic: false,
  mythicDescription: "",
  mythics: [],
} as unknown as TetraCubeCreature;

describe("fromTetraCube", () => {
  it("produces a schema-valid monster", () => {
    expect(monsterSchema.safeParse(fromTetraCube(goblin)).success).toBe(true);
  });

  it("maps damage, skills, lair and bonus actions", () => {
    const monster = fromTetraCube(goblin);
    expect(monster.type).toBe("humanoid");
    expect(monster.armor_class).toBe(17);
    expect(monster.saving_throws).toEqual({ dex: true });
    expect(monster.skills).toEqual({ stealth: "expert" });
    expect(monster.damage_modifiers).toEqual({ fire: "resistant", poison: "immune" });
    expect(monster.condition_immunities).toEqual(["charmed"]);
    expect(monster.bonus_actions).toHaveLength(1);
    expect(monster.has_lair).toBe(true);
    expect(monster.lair_actions).toHaveLength(1);
  });
});
