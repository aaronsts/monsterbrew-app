import { describe, expect, it } from "vitest";
import type {
  FoundryAttackActivity,
  FoundryItem,
  FoundrySaveActivity,
} from "@/types/foundry";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";
import { monsterToFoundryActor } from "@/services/converters/to-foundry";

function makeMonster(overrides: Partial<Monster> = {}): Monster {
  return { ...structuredClone(defaultMonster), ...overrides };
}

/** The single activity on an item, when the test expects exactly one. */
function onlyActivity(item: FoundryItem) {
  const activities = Object.values(item.system.activities);
  expect(activities).toHaveLength(1);
  return activities[0];
}

function itemNamed(
  actor: ReturnType<typeof monsterToFoundryActor>,
  name: string,
): FoundryItem {
  const item = actor.items.find((i) => i.name === name);
  if (!item) throw new Error(`no item named ${name}`);
  return item;
}

describe("monsterToFoundryActor — identity", () => {
  it("produces an npc actor carrying the creature's name", () => {
    const actor = monsterToFoundryActor(makeMonster({ name: "Goblin" }));
    expect(actor.name).toBe("Goblin");
    expect(actor.type).toBe("npc");
  });

  it("maps sizes onto Foundry's abbreviated ids", () => {
    const size = (value: string) =>
      monsterToFoundryActor(makeMonster({ size: value })).system.traits.size;
    expect(size("tiny")).toBe("tiny");
    expect(size("small")).toBe("sm");
    expect(size("medium")).toBe("med");
    expect(size("large")).toBe("lg");
    expect(size("huge")).toBe("huge");
    expect(size("gargantuan")).toBe("grg");
    // Monsterbrew has a titanic size; Foundry stops at gargantuan.
    expect(size("titanic")).toBe("grg");
  });

  it("defaults an unset size to medium", () => {
    expect(monsterToFoundryActor(makeMonster()).system.traits.size).toBe("med");
  });

  it("maps a known creature type and keeps the subtype", () => {
    const { type } = monsterToFoundryActor(
      makeMonster({ type: "dragon", sub_type: "chromatic" }),
    ).system.details;
    expect(type.value).toBe("dragon");
    expect(type.subtype).toBe("chromatic");
    expect(type.custom).toBe("");
  });

  it("routes an unrecognised creature type through `custom`", () => {
    const { type } = monsterToFoundryActor(
      makeMonster({ type: "clockwork" }),
    ).system.details;
    expect(type.value).toBe("custom");
    expect(type.custom).toBe("clockwork");
  });

  it("converts fractional challenge ratings to numbers", () => {
    const cr = (challenge_rating: string) =>
      monsterToFoundryActor(
        makeMonster({ cr: { ...defaultMonster.cr, challenge_rating } }),
      ).system.details.cr;
    expect(cr("1/8")).toBe(0.125);
    expect(cr("1/4")).toBe(0.25);
    expect(cr("1/2")).toBe(0.5);
    expect(cr("17")).toBe(17);
    expect(cr("0")).toBe(0);
  });

  it("falls back to CR 0 rather than NaN for an unparseable rating", () => {
    const cr = (challenge_rating: string) =>
      monsterToFoundryActor(
        makeMonster({ cr: { ...defaultMonster.cr, challenge_rating } }),
      ).system.details.cr;
    expect(cr("unknown")).toBe(0);
    expect(cr("")).toBe(0);
  });

  it("puts the flavour description in the biography as HTML", () => {
    const { biography } = monsterToFoundryActor(
      makeMonster({ description: "A sneaky menace.\n\nIt hoards socks." }),
    ).system.details;
    expect(biography.value).toBe("<p>A sneaky menace.</p><p>It hoards socks.</p>");
  });

  it("escapes HTML in the biography", () => {
    const { biography } = monsterToFoundryActor(
      makeMonster({ description: "Fears <script> & tags" }),
    ).system.details;
    expect(biography.value).toBe("<p>Fears &lt;script&gt; &amp; tags</p>");
  });
});

describe("monsterToFoundryActor — abilities, saves and skills", () => {
  it("carries ability scores and flags proficient saves", () => {
    const { abilities } = monsterToFoundryActor(
      makeMonster({
        ability_scores: { str: 18, dex: 14, con: 16, int: 8, wis: 12, cha: 10 },
        saving_throws: { dex: true, con: true },
      }),
    ).system;
    expect(abilities.str).toEqual({ value: 18, proficient: 0 });
    expect(abilities.dex).toEqual({ value: 14, proficient: 1 });
    expect(abilities.con).toEqual({ value: 16, proficient: 1 });
    expect(abilities.cha).toEqual({ value: 10, proficient: 0 });
  });

  it("maps skills onto Foundry's three-letter ids with expertise as 2", () => {
    const { skills } = monsterToFoundryActor(
      makeMonster({
        skills: {
          perception: "expert",
          stealth: "proficient",
          "sleight of hand": "proficient",
        },
      }),
    ).system;
    expect(skills.prc.value).toBe(2);
    expect(skills.ste.value).toBe(1);
    expect(skills.slt.value).toBe(1);
    // Untrained skills are still present, at 0.
    expect(skills.ath.value).toBe(0);
  });
});

describe("monsterToFoundryActor — defenses", () => {
  it("splits damage modifiers into immunities, resistances and vulnerabilities", () => {
    const { traits } = monsterToFoundryActor(
      makeMonster({
        damage_modifiers: {
          poison: "immune",
          fire: "resistant",
          cold: "vulnerable",
        },
      }),
    ).system;
    expect(traits.di.value).toEqual(["poison"]);
    expect(traits.dr.value).toEqual(["fire"]);
    expect(traits.dv.value).toEqual(["cold"]);
  });

  it("puts a damage type Foundry doesn't know into `custom`", () => {
    const { traits } = monsterToFoundryActor(
      makeMonster({ damage_modifiers: { starlight: "immune" } }),
    ).system;
    expect(traits.di.value).toEqual([]);
    expect(traits.di.custom).toBe("starlight");
  });

  it("falls back to custom text when a bypass would leak onto other types", () => {
    // `bypasses` applies to the whole list, so setting it beside an unrelated
    // fire immunity would let a *magical* Fireball through.
    const { traits } = monsterToFoundryActor(
      makeMonster({
        damage_modifiers: { fire: "immune" },
        nonmagical_attack_modifiers: { nonmagical: "immune" },
      }),
    ).system;
    expect(traits.di.value).toEqual(["fire"]);
    expect(traits.di.bypasses).toBeUndefined();
    expect(traits.di.custom).toContain("nonmagical attacks");
  });

  it("expresses nonmagical physical resistance as bypasses", () => {
    const { traits } = monsterToFoundryActor(
      makeMonster({ nonmagical_attack_modifiers: { nonmagical: "resistant" } }),
    ).system;
    expect(traits.dr.value).toEqual(["bludgeoning", "piercing", "slashing"]);
    expect(traits.dr.bypasses).toEqual(["mgc"]);
  });

  it("expresses nonsilvered physical immunity as a silvered bypass", () => {
    const { traits } = monsterToFoundryActor(
      makeMonster({ nonmagical_attack_modifiers: { silvered: "immune" } }),
    ).system;
    expect(traits.di.value).toEqual(["bludgeoning", "piercing", "slashing"]);
    expect(traits.di.bypasses).toEqual(["sil"]);
  });

  it("carries condition immunities", () => {
    const { traits } = monsterToFoundryActor(
      makeMonster({ condition_immunities: ["poisoned", "charmed"] }),
    ).system;
    expect(traits.ci.value).toEqual(["poisoned", "charmed"]);
  });

  it("maps languages, renaming the two that differ from Foundry's ids", () => {
    const { traits } = monsterToFoundryActor(
      makeMonster({
        languages: ["common", "deep-speech", "thieves-cant"],
        custom_languages: ["Gnollish", "Sock"],
      } as Partial<Monster>),
    ).system;
    expect(traits.languages.value).toEqual(["common", "deep", "cant"]);
    expect(traits.languages.custom).toBe("Gnollish; Sock");
  });
});

describe("monsterToFoundryActor — attributes", () => {
  it("pins armor class to a flat value", () => {
    const { ac } = monsterToFoundryActor(
      makeMonster({ armor_class: 17 }),
    ).system.attributes;
    expect(ac).toEqual({ flat: 17, calc: "flat" });
  });

  it("derives hit points and the dice formula from hit dice and size", () => {
    // 5d8 with CON 14 (+2): 5 * 4.5 = 22.5 -> 22, + 10 = 32.
    const { hp } = monsterToFoundryActor(
      makeMonster({
        size: "medium",
        hit_dice: "5",
        ability_scores: { ...defaultMonster.ability_scores, con: 14 },
      }),
    ).system.attributes;
    expect(hp.value).toBe(32);
    expect(hp.max).toBe(32);
    expect(hp.formula).toBe("5d8 + 10");
  });

  it("uses the authored hit points when custom_hp is set", () => {
    const { hp } = monsterToFoundryActor(
      makeMonster({ custom_hp: true, hit_points: "546 (28d20 + 252)" }),
    ).system.attributes;
    expect(hp.value).toBe(546);
    expect(hp.max).toBe(546);
    expect(hp.formula).toBe("28d20 + 252");
  });

  it("carries movement, omitting unset modes and keeping hover", () => {
    const { movement } = monsterToFoundryActor(
      makeMonster({
        movements: { ...defaultMonster.movements, walk: 30, fly: 60, hover: true },
      }),
    ).system.attributes;
    expect(movement.walk).toBe(30);
    expect(movement.fly).toBe(60);
    expect(movement.hover).toBe(true);
    expect(movement.swim).toBeNull();
    expect(movement.burrow).toBeNull();
  });

  it("carries senses and notes blindsight that blinds beyond its radius", () => {
    const { senses } = monsterToFoundryActor(
      makeMonster({
        senses: {
          ...defaultMonster.senses,
          darkvision: 120,
          blindsight: 60,
          is_blind_beyond: true,
        },
      }),
    ).system.attributes;
    expect(senses.darkvision).toBe(120);
    expect(senses.blindsight).toBe(60);
    expect(senses.tremorsense).toBeNull();
    expect(senses.special).toBe("blind beyond this radius");
  });

  it("expresses a custom initiative as a bonus over the dex modifier", () => {
    // DEX 14 -> +2 mod, authored initiative +7, so Foundry needs +5.
    const { init } = monsterToFoundryActor(
      makeMonster({
        ability_scores: { ...defaultMonster.ability_scores, dex: 14 },
        custom_initiative: true,
        initiative_bonus: 7,
      }),
    ).system.attributes;
    expect(init.bonus).toBe("5");
  });

  it("leaves the initiative bonus empty without a custom initiative", () => {
    const { init } = monsterToFoundryActor(makeMonster()).system.attributes;
    expect(init.bonus).toBe("");
  });
});

describe("monsterToFoundryActor — resources", () => {
  it("grants legendary actions only to legendary creatures", () => {
    const plain = monsterToFoundryActor(makeMonster()).system.resources;
    expect(plain.legact).toEqual({ value: 0, max: 0 });

    const legendary = monsterToFoundryActor(
      makeMonster({ is_legendary: true }),
    ).system.resources;
    expect(legendary.legact).toEqual({ value: 3, max: 3 });
  });

  it("flags a lair", () => {
    expect(
      monsterToFoundryActor(makeMonster({ has_lair: true })).system.resources
        .lair.value,
    ).toBe(true);
    expect(
      monsterToFoundryActor(makeMonster()).system.resources.lair.value,
    ).toBe(false);
  });
});

describe("monsterToFoundryActor — items", () => {
  it("emits one item per feature with the right activation type", () => {
    const actor = monsterToFoundryActor(
      makeMonster({
        traits: [{ name: "Amphibious", description: "Breathes water." }],
        actions: [{ name: "Slam", description: "Hits things." }],
        bonus_actions: [{ name: "Dash", description: "Moves fast." }],
        reactions: [{ name: "Parry", description: "Blocks." }],
        is_legendary: true,
        legendary_actions: [{ name: "Pounce", description: "Leaps." }],
        is_mythic: true,
        mythic_actions: [{ name: "Rebirth", description: "Returns." }],
        has_lair: true,
        lair_actions: [{ name: "Tremor", description: "Shakes." }],
      }),
    );
    expect(actor.items).toHaveLength(7);

    // A passive trait carries no activity at all.
    expect(itemNamed(actor, "Amphibious").system.activities).toEqual({});

    const activation = (name: string) =>
      onlyActivity(itemNamed(actor, name)).activation.type;
    expect(activation("Slam")).toBe("action");
    expect(activation("Dash")).toBe("bonus");
    expect(activation("Parry")).toBe("reaction");
    expect(activation("Pounce")).toBe("legendary");
    expect(activation("Rebirth")).toBe("mythic");
    expect(activation("Tremor")).toBe("lair");
  });

  it("omits gated sections when their flag is off", () => {
    const actor = monsterToFoundryActor(
      makeMonster({
        is_legendary: false,
        legendary_actions: [{ name: "Pounce", description: "Leaps." }],
        is_mythic: false,
        mythic_actions: [{ name: "Rebirth", description: "Returns." }],
        has_lair: false,
        lair_actions: [{ name: "Tremor", description: "Shakes." }],
      }),
    );
    expect(actor.items).toHaveLength(0);
  });

  it("resolves markup into the item description", () => {
    const actor = monsterToFoundryActor(
      makeMonster({
        ability_scores: { ...defaultMonster.ability_scores, str: 20 },
        cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
        actions: [{ name: "Slam", description: "{@h}{@damage 2d6 + str} bludgeoning damage." }],
      }),
    );
    const html = itemNamed(actor, "Slam").system.description.value;
    expect(html).not.toContain("{@");
    expect(html).toContain("Hit:");
    expect(html).toContain("2d6 + 5");
  });

  it("renders emphasis markup as HTML, not literal asterisks", () => {
    // resolveMarkup emits markdown for {@i}/{@b} because Homebrewery wants it;
    // Foundry renders this field as HTML.
    const actor = monsterToFoundryActor(
      makeMonster({
        traits: [
          { name: "Aura", description: "It casts {@i Fireball} and {@b runs}." },
        ],
      }),
    );
    const html = itemNamed(actor, "Aura").system.description.value;
    expect(html).toContain("<em>Fireball</em>");
    expect(html).toContain("<strong>runs</strong>");
    expect(html).not.toContain("*");
  });

  it("slugs the item identifier from its name", () => {
    const actor = monsterToFoundryActor(
      makeMonster({ actions: [{ name: "Bite of Doom", description: "Chomp." }] }),
    );
    expect(itemNamed(actor, "Bite of Doom").system.identifier).toBe(
      "bite-of-doom",
    );
  });
});

describe("monsterToFoundryActor — attack activities", () => {
  const attacker = (description: string) =>
    monsterToFoundryActor(
      makeMonster({
        ability_scores: { ...defaultMonster.ability_scores, str: 20, dex: 14 },
        cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
        actions: [{ name: "Bite", description }],
      }),
    );

  it("turns an ability-linked melee attack into a rollable weapon", () => {
    const actor = attacker("{@attack m|str|5|2d8 + str|slashing}");
    const item = itemNamed(actor, "Bite");
    expect(item.type).toBe("weapon");
    expect(item.system.proficient).toBe(1);

    const activity = onlyActivity(item) as FoundryAttackActivity;
    expect(activity.type).toBe("attack");
    expect(activity.attack.ability).toBe("str");
    expect(activity.attack.flat).toBe(false);
    expect(activity.attack.type.value).toBe("melee");
    expect(activity.range.reach).toBe("5");

    // Primary damage belongs to the item, the way Foundry's own exports write
    // it, and the STR term is *omitted*: dnd5e appends `@mod` to a weapon's
    // base damage itself, so writing the resolved +5 here would roll it twice.
    expect(item.system.damage?.base).toEqual({
      number: 2,
      denomination: 8,
      bonus: "",
      types: ["slashing"],
      custom: { enabled: false },
      scaling: { number: 1 },
    });
    expect(activity.damage.includeBase).toBe(true);
    expect(activity.damage.parts).toEqual([]);
  });

  it("keeps a non-ability damage expression off the base, where @mod can't reach it", () => {
    // No `str` in the dice, so Foundry must not add the modifier — the explicit
    // `parts` route is the only one that doesn't.
    const item = itemNamed(attacker("{@attack m|str|5|2d6|slashing}"), "Bite");
    expect(item.system.damage).toBeUndefined();

    const activity = onlyActivity(item) as FoundryAttackActivity;
    expect(activity.damage.includeBase).toBe(false);
    expect(activity.damage.parts).toHaveLength(1);
    expect(activity.damage.parts[0]).toMatchObject({
      number: 2,
      denomination: 6,
      bonus: "",
      types: ["slashing"],
    });
  });

  it("keeps a flat bonus alongside the ability term on the base", () => {
    // "1d10 + str + 2": the STR term drops out for @mod, the +2 stays.
    const item = itemNamed(
      attacker("{@attack m|str|5|1d10 + str + 2|slashing}"),
      "Bite",
    );
    expect(item.system.damage?.base).toMatchObject({
      number: 1,
      denomination: 10,
      bonus: "2",
    });
  });

  it("pins a numeric to-hit as a flat bonus", () => {
    const activity = onlyActivity(
      itemNamed(attacker("{@attack m|7|5|1d6|piercing}"), "Bite"),
    ) as FoundryAttackActivity;
    expect(activity.attack.flat).toBe(true);
    expect(activity.attack.bonus).toBe("7");
    expect(activity.attack.ability).toBe("");
  });

  it("maps a ranged attack's normal and long range", () => {
    const activity = onlyActivity(
      itemNamed(attacker("{@attack r|dex|30/120|1d8|piercing}"), "Bite"),
    ) as FoundryAttackActivity;
    expect(activity.attack.type.value).toBe("ranged");
    expect(activity.range.value).toBe("30");
    expect(activity.range.long).toBe("120");
    expect(activity.range.reach).toBeNull();
  });

  it("keeps the secondary damage rider on the activity, not the item", () => {
    const item = itemNamed(
      attacker("{@attack m|str|5|2d6 + str|slashing|1d8|acid}"),
      "Bite",
    );
    expect(item.system.damage?.base).toMatchObject({
      number: 2,
      denomination: 6,
      types: ["slashing"],
    });

    const activity = onlyActivity(item) as FoundryAttackActivity;
    expect(activity.damage.parts).toHaveLength(1);
    expect(activity.damage.parts[0]).toMatchObject({
      number: 1,
      denomination: 8,
      types: ["acid"],
    });
  });

  it("finds the dice even when a flat term comes first", () => {
    // "str + 2d6" resolves to "5 + 2d6"; an anchored match would lose the dice.
    const activity = onlyActivity(
      itemNamed(attacker("{@attack m|7|5|str + 2d6|force}"), "Bite"),
    ) as FoundryAttackActivity;
    expect(activity.damage.parts[0]).toMatchObject({
      number: 2,
      denomination: 6,
      bonus: "5",
      types: ["force"],
    });
  });

  it("expresses flat damage as a bonus-only part", () => {
    // Flat damage has no dice, so it can't live on the base: dnd5e skips `@mod`
    // for a deterministic base, and there would be no modifier at all.
    const item = itemNamed(attacker("{@attack m|str|5|4|force}"), "Bite");
    expect(item.system.damage).toBeUndefined();

    const activity = onlyActivity(item) as FoundryAttackActivity;
    expect(activity.damage.parts[0]).toMatchObject({
      number: null,
      denomination: null,
      bonus: "4",
      types: ["force"],
    });
  });

  it("omits base damage entirely for a damageless attack", () => {
    const item = itemNamed(attacker("{@attack m|str|5}"), "Bite");
    expect(item.system.damage).toBeUndefined();

    const activity = onlyActivity(item) as FoundryAttackActivity;
    expect(activity.damage.includeBase).toBe(false);
    expect(activity.damage.parts).toEqual([]);
  });
});

describe("monsterToFoundryActor — atomic attack markup", () => {
  // `prose-to-tags` falls back to this form whenever a line won't fit the
  // composite grammar, and ~30 shipped SRD actions use it.
  const attacker = (description: string) =>
    monsterToFoundryActor(
      makeMonster({
        ability_scores: { ...defaultMonster.ability_scores, str: 20 },
        cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
        actions: [{ name: "Rend", description }],
      }),
    );

  it("reads {@atkr} + {@hit} + {@damage} as a rollable attack", () => {
    const item = itemNamed(
      attacker(
        "{@atkr m} {@hit str} to hit, reach 15 ft. {@damage 2d8 + str} Slashing damage.",
      ),
      "Rend",
    );
    expect(item.type).toBe("weapon");

    const activity = onlyActivity(item) as FoundryAttackActivity;
    expect(activity.type).toBe("attack");
    expect(activity.attack.ability).toBe("str");
    expect(activity.attack.type.value).toBe("melee");
    expect(activity.range.reach).toBe("15");
    // Damage type comes from the prose, since the atomic form has no type slot.
    expect(item.system.damage?.base).toMatchObject({
      number: 2,
      denomination: 8,
      types: ["slashing"],
    });
  });

  it("reads the 2014 {@atk rw} form and its range", () => {
    const activity = onlyActivity(
      itemNamed(
        attacker(
          "{@atk rw} {@hit dex} to hit, range 30/120 ft. {@damage 1d8} Piercing damage.",
        ),
        "Rend",
      ),
    ) as FoundryAttackActivity;
    expect(activity.type).toBe("attack");
    expect(activity.attack.type.value).toBe("ranged");
    expect(activity.range.value).toBe("30");
    expect(activity.range.long).toBe("120");
  });

  it("picks up a second {@damage} tag as the rider", () => {
    const activity = onlyActivity(
      itemNamed(
        attacker(
          "{@atkr m} {@hit str}, reach 5 ft. {@damage 2d8 + str} Slashing damage plus {@damage 2d6} Fire damage.",
        ),
        "Rend",
      ),
    ) as FoundryAttackActivity;
    expect(activity.damage.parts).toHaveLength(1);
    expect(activity.damage.parts[0]).toMatchObject({
      number: 2,
      denomination: 6,
      types: ["fire"],
    });
  });

  it("leaves a feature with no to-hit as a plain feat", () => {
    const item = itemNamed(
      attacker("The creature deals {@damage 2d6} Fire damage to everything."),
      "Rend",
    );
    expect(item.type).toBe("feat");
    expect(onlyActivity(item).type).toBe("utility");
  });
});

describe("monsterToFoundryActor — save activities", () => {
  const breather = (description: string) =>
    monsterToFoundryActor(
      makeMonster({
        ability_scores: { ...defaultMonster.ability_scores, con: 16 },
        cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
        actions: [{ name: "Cold Breath", description }],
      }),
    );

  it("hands an ability-linked DC to Foundry to compute", () => {
    const item = itemNamed(breather("{@save dex|con|14d8|cold}"), "Cold Breath");
    expect(item.type).toBe("feat");

    const activity = onlyActivity(item) as FoundrySaveActivity;
    expect(activity.type).toBe("save");
    expect(activity.save.ability).toEqual(["dex"]);
    // `calculation: "con"` is Foundry's own 8 + PB + CON mod.
    expect(activity.save.dc).toEqual({ calculation: "con", formula: "" });
    expect(activity.damage.parts[0]).toMatchObject({
      number: 14,
      denomination: 8,
      types: ["cold"],
    });
    // No explicit success text and damage present: half on a save.
    expect(activity.damage.onSave).toBe("half");
  });

  it("writes a flat DC as a formula", () => {
    const activity = onlyActivity(
      itemNamed(breather("{@save dex|15|3d6|fire}"), "Cold Breath"),
    ) as FoundrySaveActivity;
    expect(activity.save.dc).toEqual({ calculation: "", formula: "15" });
  });

  it("honours an explicit none-on-save", () => {
    const activity = onlyActivity(
      itemNamed(breather("{@save dex|con|3d6|fire|none}"), "Cold Breath"),
    ) as FoundrySaveActivity;
    expect(activity.damage.onSave).toBe("none");
  });

  it("gives a feature that both attacks and saves two activities", () => {
    const item = itemNamed(
      monsterToFoundryActor(
        makeMonster({
          ability_scores: { ...defaultMonster.ability_scores, str: 20, con: 16 },
          cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
          actions: [
            {
              name: "Crushing Bite",
              description:
                "{@attack m|str|5|2d8 + str|piercing} {@save con|con|2d6|poison}",
            },
          ],
        }),
      ),
      "Crushing Bite",
    );
    const types = Object.values(item.system.activities).map((a) => a.type);
    expect(types).toContain("attack");
    expect(types).toContain("save");
  });

  it("degrades custom success text to none rather than inventing an enum", () => {
    const activity = onlyActivity(
      itemNamed(
        breather("{@save dex|con|3d6|fire|the target is pushed back}"),
        "Cold Breath",
      ),
    ) as FoundrySaveActivity;
    expect(activity.damage.onSave).toBe("none");
    // The wording survives in the description even though Foundry can't model it.
    expect(
      itemNamed(
        breather("{@save dex|con|3d6|fire|the target is pushed back}"),
        "Cold Breath",
      ).system.description.value,
    ).toContain("pushed back");
  });
});

describe("monsterToFoundryActor — fallback and determinism", () => {
  it("falls back to a plain feat for untagged prose", () => {
    const actor = monsterToFoundryActor(
      makeMonster({
        actions: [{ name: "Ponder", description: "It thinks very hard." }],
      }),
    );
    const item = itemNamed(actor, "Ponder");
    expect(item.type).toBe("feat");
    expect(item.system.description.value).toContain("It thinks very hard.");

    const activity = onlyActivity(item);
    expect(activity.type).toBe("utility");
  });

  it("produces byte-identical output for the same creature", () => {
    const creature = makeMonster({
      name: "Ancient Thing",
      actions: [{ name: "Bite", description: "{@attack m|str|5|2d8|slashing}" }],
      traits: [{ name: "Odd", description: "Very." }],
      is_legendary: true,
      legendary_actions: [{ name: "Pounce", description: "Leaps." }],
    });
    expect(JSON.stringify(monsterToFoundryActor(creature))).toBe(
      JSON.stringify(monsterToFoundryActor(creature)),
    );
  });

  it("gives different features different ids", () => {
    const actor = monsterToFoundryActor(
      makeMonster({
        actions: [
          { name: "Bite", description: "Chomp." },
          { name: "Claw", description: "Scratch." },
        ],
      }),
    );
    const ids = actor.items.map((i) => i._id);
    expect(new Set(ids).size).toBe(2);
    expect(ids.every((id) => /^[a-zA-Z0-9]{16}$/.test(id))).toBe(true);
  });
});
