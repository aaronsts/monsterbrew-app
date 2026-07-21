import { describe, expect, it } from "vitest";
import srdData from "@/data/srd-monsters.json";
import { fromSrd } from "@/services/converters/from-srd";
import { getSrdMonsters } from "@/services/srd";
import { monsterSchema } from "@/schema/monster-schema";
import { calculateHitPoints } from "@/lib/utils";

/** Replicates how the statblock derives the displayed HP number. */
function displayedHp(monster: ReturnType<typeof fromSrd>): number {
  const median = calculateHitPoints(
    monster.hit_dice,
    monster.size,
    monster.ability_scores.con,
  );
  const raw = monster.custom_hp ? monster.hit_points : median || monster.hit_points;
  return Number.parseInt(raw, 10);
}

const aboleth = {
  key: "srd-2024_aboleth",
  name: "Aboleth",
  size: "Large",
  type: "Aberration",
  category: "Monsters",
  subcategory: "",
  alignment: "lawful evil",
  armor_class: 17,
  armor_detail: "natural armor",
  hit_points: 150,
  hit_dice: "20d10 + 40",
  speed: { walk: 10, swim: 40 },
  ability_scores: {
    strength: 21,
    dexterity: 9,
    constitution: 15,
    intelligence: 18,
    wisdom: 15,
    charisma: 18,
  },
  saving_throws: {
    strength: 5,
    dexterity: 3,
    constitution: 6,
    intelligence: 8,
    wisdom: 6,
    charisma: 4,
  },
  skill_bonuses: { history: 12, perception: 10 },
  passive_perception: 20,
  darkvision_range: 120,
  blindsight_range: null,
  tremorsense_range: null,
  truesight_range: null,
  languages: "Deep Speech; telepathy 120 ft.",
  challenge_rating_text: "10",
  resistances_and_immunities: {
    damage_immunities_display: "",
    damage_resistances_display: "",
    damage_vulnerabilities_display: "",
    condition_immunities_display: "",
  },
  actions: [
    { name: "Consume Memories", desc: "…", action_type: "ACTION" },
    { name: "Tentacle", desc: "…", action_type: "ACTION" },
    { name: "Lash", desc: "…", action_type: "LEGENDARY_ACTION" },
  ],
  traits: [{ name: "Amphibious", desc: "The aboleth can breathe air and water." }],
};

describe("fromSrd", () => {
  it("produces a valid Monster", () => {
    const monster = fromSrd(aboleth);
    expect(monsterSchema.safeParse(monster).success).toBe(true);
  });

  it("maps identity and combat fields", () => {
    const monster = fromSrd(aboleth);
    expect(monster.name).toBe("Aboleth");
    expect(monster.type).toBe("aberration");
    expect(monster.size).toBe("large");
    expect(monster.armor_class).toBe(17);
    expect(monster.hit_points).toBe("150");
    expect(monster.hit_dice).toBe("20");
    expect(monster.cr.challenge_rating).toBe("10");
    expect(monster.movements.walk).toBe(10);
    expect(monster.movements.swim).toBe(40);
  });

  it("detects proficient saving throws from the bonus vs. the modifier", () => {
    // prof +4; str/cha bonuses equal the raw modifier (not proficient),
    // dex/con/int/wis exceed it (proficient).
    const monster = fromSrd(aboleth);
    expect(monster.saving_throws.str).toBeUndefined();
    expect(monster.saving_throws.cha).toBeUndefined();
    expect(monster.saving_throws.dex).toBe(true);
    expect(monster.saving_throws.con).toBe(true);
    expect(monster.saving_throws.int).toBe(true);
    expect(monster.saving_throws.wis).toBe(true);
  });

  it("maps skills, marking expertise", () => {
    const monster = fromSrd(aboleth);
    // history +12: int mod +4, prof +4 -> proficiency portion +8 == 2*prof -> expert
    expect(monster.skills?.history).toBe("expert");
    // perception +10: wis mod +2, portion +8 == 2*prof -> expert
    expect(monster.skills?.perception).toBe("expert");
  });

  it("splits actions into standard and legendary", () => {
    const monster = fromSrd(aboleth);
    expect(monster.actions.map((a) => a.name)).toEqual([
      "Consume Memories",
      "Tentacle",
    ]);
    expect(monster.is_legendary).toBe(true);
    expect(monster.legendary_actions.map((a) => a.name)).toEqual(["Lash"]);
  });

  it("keeps SRD language display text as custom languages", () => {
    const monster = fromSrd(aboleth);
    expect(monster.custom_languages).toContain("deep speech");
    expect(monster.custom_languages).toContain("telepathy 120 ft.");
  });
});

describe("getSrdMonsters", () => {
  const entries = getSrdMonsters();

  it("loads and converts the whole SRD dataset", () => {
    expect(entries.length).toBeGreaterThan(300);
  });

  it("produces a schema-valid Monster for every entry", () => {
    const invalid = entries.filter(
      (entry) => !monsterSchema.safeParse(entry.monster).success,
    );
    expect(invalid.map((e) => e.key)).toEqual([]);
  });

  it("has a unique key for every entry (routing depends on it)", () => {
    const keys = new Set(entries.map((e) => e.key));
    expect(keys.size).toBe(entries.length);
  });

  it("displays the exact SRD hit points for every monster", () => {
    const source = srdData as Array<{ key: string; hit_points: number }>;
    const hpByKey = new Map(source.map((m) => [m.key, m.hit_points]));
    const wrong = entries
      .map((entry) => ({
        name: entry.monster.name,
        expected: hpByKey.get(entry.key),
        actual: displayedHp(entry.monster),
      }))
      .filter((row) => row.expected !== row.actual);
    expect(wrong).toEqual([]);
  });
});
