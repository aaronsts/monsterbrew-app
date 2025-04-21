import { z } from "zod";

// Utility definitions
const source = z.string();
const page = z.number().int().optional();

// Alignment definition
const alignment = z.union([
  z.string(), // Reference to alignment in util.json
  z.object({
    alignment: z.array(z.string()),
    chance: z.number().int().optional(),
    note: z.string().optional(),
  }),
  z.object({
    special: z.string(),
  }),
]);

// AC Item definition
const acItem = z.union([
  z.object({
    ac: z.number().int(),
    from: z.array(z.string()).optional(),
    condition: z.string().optional(),
    braces: z.literal(true).optional(),
  }),
  z.object({
    special: z.string(),
  }),
  z.number().int(),
]);

// Ability Score definition
const abilityScore = z.union([
  z.number().int().nullable(),
  z.object({
    special: z.string(),
  }),
]);

// Legendary Actions definition
const legendaryActions = z.number().int().min(1);

// Speed definition
const speed = z
  .object({
    walk: z.union([z.number().int(), z.string()]).optional(),
    fly: z.union([z.number().int(), z.string()]).optional(),
    swim: z.union([z.number().int(), z.string()]).optional(),
    climb: z.union([z.number().int(), z.string()]).optional(),
    burrow: z.union([z.number().int(), z.string()]).optional(),
    hover: z.boolean().optional(),
    canHover: z.boolean().optional(),
  })
  .or(
    z.object({
      special: z.string(),
    })
  );

// HP definition
const hp = z.union([
  z.object({
    average: z.number().int(),
    formula: z.string(),
  }),
  z.object({
    special: z.string(),
  }),
]);

// Save definition
const save = z
  .object({
    str: z.string().optional(),
    dex: z.string().optional(),
    con: z.string().optional(),
    int: z.string().optional(),
    wis: z.string().optional(),
    cha: z.string().optional(),
    special: z.any().optional(), // For use in homebrew
  })
  .refine((data) => Object.keys(data).length >= 1, {
    message: "At least one property is required",
  });

// Skill definition
const skillOption = z.object({
  acrobatics: z.string().optional(),
  "animal handling": z.string().optional(),
  arcana: z.string().optional(),
  athletics: z.string().optional(),
  deception: z.string().optional(),
  history: z.string().optional(),
  insight: z.string().optional(),
  intimidation: z.string().optional(),
  investigation: z.string().optional(),
  medicine: z.string().optional(),
  nature: z.string().optional(),
  perception: z.string().optional(),
  performance: z.string().optional(),
  persuasion: z.string().optional(),
  religion: z.string().optional(),
  "sleight of hand": z.string().optional(),
  stealth: z.string().optional(),
  survival: z.string().optional(),
});

const skill = z
  .object({
    acrobatics: z.string().optional(),
    "animal handling": z.string().optional(),
    arcana: z.string().optional(),
    athletics: z.string().optional(),
    deception: z.string().optional(),
    history: z.string().optional(),
    insight: z.string().optional(),
    intimidation: z.string().optional(),
    investigation: z.string().optional(),
    medicine: z.string().optional(),
    nature: z.string().optional(),
    perception: z.string().optional(),
    performance: z.string().optional(),
    persuasion: z.string().optional(),
    religion: z.string().optional(),
    "sleight of hand": z.string().optional(),
    stealth: z.string().optional(),
    survival: z.string().optional(),
    other: z
      .array(
        z.object({
          oneOf: skillOption,
        })
      )
      .optional(),
    special: z.any().optional(), // For use in homebrew
  })
  .refine((data) => Object.keys(data).length >= 1, {
    message: "At least one property is required",
  });

// Tool definition
const tool = z
  .record(z.string(), z.string())
  .refine((data) => Object.keys(data).length >= 1, {
    message: "At least one property is required",
  });

// Gear definition
const gearItem = z.union([
  z.string(), // An item UID, e.g. "longsword|phb"
  z.object({
    item: z.string(),
    quantity: z.number().int(),
  }),
]);

// Trait definition
const trait = z
  .array(
    z.object({
      name: z.string(),
      entries: z.array(z.any()), // Reference to entry.json
      type: z.enum(["entries", "inset"]).optional(),
      sort: z.number().int().optional(),
    })
  )
  .nullable();

// Action definition
const action = z
  .array(
    z.object({
      name: z.string(),
      entries: z.array(z.any()), // Reference to entry.json
    })
  )
  .nullable();

// Environment definition
const environment = z.array(z.string()).min(1);

// Treasure definition
const treasure = z.array(z.string()).min(1);

// Challenge Rating definition
const cr = z.union([
  z.string(),
  z.object({
    cr: z.string(),
    lair: z.string().optional(),
    coven: z.string().optional(),
    xp: z.number().int().optional(),
    xpLair: z.number().int().optional(),
  }),
]);

// Initiative definition
const initiative = z.union([
  z
    .object({
      initiative: z.number().optional(),
      proficiency: z.string().optional(), // Proficiency Level
      advantageMode: z.enum(["adv", "dis"]).optional(),
    })
    .refine((data) => Object.keys(data).length >= 1, {
      message: "At least one property is required",
    }),
  z.number(),
]);

// Main creature definition
export const fiveECreatureSchema = z.object({
  name: z.string(),
  shortName: z.union([z.string(), z.boolean()]).optional(),
  alias: z.array(z.string()).optional(),
  group: z.array(z.string()).nullable().optional(),
  level: z.number().int().optional(),
  size: z.array(z.string()), // Reference to size
  sizeNote: z.string().optional(),
  type: z.union([
    z.string(), // Reference to creatureType
    z.object({
      type: z.union([
        z.string(), // Reference to creatureType
        z.object({
          choose: z.array(z.string()),
        }),
      ]),
      swarmSize: z.string().optional(),
      tags: z
        .array(
          z.union([
            z.string(),
            z.object({
              tag: z.string(),
              prefix: z.string(),
            }),
          ])
        )
        .optional(),
      sidekickType: z.string().optional(),
      sidekickTags: z
        .array(
          z.union([
            z.string(),
            z.object({
              tag: z.string(),
              prefix: z.string(),
            }),
          ])
        )
        .optional(),
      sidekickHidden: z.literal(true).optional(),
      note: z.string().optional(),
    }),
  ]),
  source: source,
  sourceSub: z.string().optional(),
  otherSources: z
    .array(
      z.object({
        source: source,
        page: page.optional(),
      })
    )
    .optional(),
  reprintedAs: z
    .array(
      z.object({
        name: z.string().optional(),
        source: source,
        page: page.optional(),
      })
    )
    .optional(),
  alignment: z.array(alignment).optional(),
  alignmentPrefix: z.string().optional(),
  ac: z.array(acItem).optional(),
  hp: hp.optional(),
  speed: speed.optional(),
  initiative: initiative.optional(),
  str: abilityScore.optional(),
  dex: abilityScore.optional(),
  con: abilityScore.optional(),
  int: abilityScore.optional(),
  wis: abilityScore.optional(),
  cha: abilityScore.optional(),
  save: save.optional(),
  skill: skill.optional(),
  tool: tool.optional(),
  gear: z.array(gearItem).optional(),
  senses: z.array(z.string()).min(1).nullable().optional(),
  passive: z.union([z.number().int(), z.string(), z.null()]).optional(),
  languages: z.array(z.string()).min(1).nullable().optional(),
  pbNote: z.string().optional(),
  cr: cr.optional(),
  vulnerable: z
    .array(
      z.union([
        z.string(),
        z.object({
          vulnerable: z.array(z.string()),
          note: z.string().optional(),
        }),
      ])
    )
    .optional(),
  resist: z
    .array(
      z.union([
        z.string(),
        z.object({
          resist: z.array(z.string()),
          note: z.string().optional(),
        }),
      ])
    )
    .optional(),
  immune: z
    .array(
      z.union([
        z.string(),
        z.object({
          immune: z.array(z.string()),
          note: z.string().optional(),
        }),
      ])
    )
    .optional(),
  conditionImmune: z
    .array(
      z.union([
        z.string(),
        z.object({
          conditionImmune: z.array(z.string()),
          note: z.string().optional(),
        }),
      ])
    )
    .optional(),
  spellcasting: z.array(z.any()).nullable().optional(), // Reference to entrySpellcasting
  trait: trait.optional(),
  actionNote: z.string().optional(),
  actionHeader: z.array(z.any()).min(1).optional(), // Reference to entry.json
  action: action.optional(),
  bonusNote: z.string().optional(),
  bonusHeader: z.array(z.any()).min(1).optional(), // Reference to entry.json
  bonus: action.optional(),
  reactionNote: z.string().optional(),
  reactionHeader: z.array(z.any()).min(1).optional(), // Reference to entry.json
  reaction: action.optional(),
  legendaryGroup: z
    .object({
      name: z.string(),
      source: source,
    })
    .optional(),
  legendaryActions: legendaryActions.optional(),
  legendaryHeader: z.array(z.any()).min(1).optional(), // Reference to entry.json
  legendary: z
    .array(
      z.object({
        name: z.string().optional(),
        entries: z.array(z.any()), // Reference to entry.json
      })
    )
    .nullable()
    .optional(),
  mythicHeader: z.array(z.any()).min(1).optional(), // Reference to entry.json
  mythic: z
    .array(
      z.object({
        name: z.string().optional(),
        entries: z.array(z.any()), // Reference to entry.json
      })
    )
    .nullable()
    .optional(),
  variant: z.array(z.any()).nullable().optional(), // Reference to entryVariantBestiary
  page: page,
  familiar: z.literal(true).nullable().optional(),
  additionalSources: z
    .array(
      z.object({
        source: source,
        page: page.optional(),
      })
    )
    .optional(),
  hasToken: z.literal(true).optional(),
  tokenCredit: z.string().optional(),
  environment: environment.optional(),
  treasure: treasure.optional(),
  soundClip: z.string().optional(),
  dragonCastingColor: z.string().optional(),
  dragonAge: z.string().optional(),
  traitTags: z
    .array(
      z.enum([
        "Aggressive",
        "Ambusher",
        "Amorphous",
        "Amphibious",
        "Antimagic Susceptibility",
        "Beast of Burden",
        "Brute",
        "Camouflage",
        "Charge",
        "Damage Absorption",
        "Death Burst",
        "Devil's Sight",
        "False Appearance",
        "Fey Ancestry",
        "Flyby",
        "Hold Breath",
        "Illumination",
        "Immutable Form",
        "Incorporeal Movement",
        "Keen Senses",
        "Legendary Resistances",
        "Light Sensitivity",
        "Magic Resistance",
        "Magic Weapons",
        "Mimicry",
        "Pack Tactics",
        "Pounce",
        "Rampage",
        "Reckless",
        "Regeneration",
        "Rejuvenation",
        "Shapechanger",
        "Siege Monster",
        "Sneak Attack",
        "Spell Immunity",
        "Spider Climb",
        "Sunlight Sensitivity",
        "Tree Stride",
        "Tunneler",
        "Turn Immunity",
        "Turn Resistance",
        "Undead Fortitude",
        "Unusual Nature",
        "Water Breathing",
        "Web Sense",
        "Web Walker",
      ])
    )
    .optional(),
  actionTags: z
    .array(
      z.enum([
        "Breath Weapon",
        "Frightful Presence",
        "Multiattack",
        "Parry",
        "Shapechanger",
        "Swallow",
        "Teleport",
        "Tentacles",
      ])
    )
    .optional(),
  languageTags: z
    .array(
      z.enum([
        "X",
        "XX",
        "CS",
        "LF",
        "TP",
        "OTH",
        "AB",
        "AQ",
        "AU",
        "C",
        "CE",
        "CSL",
        "D",
        "DR",
        "DS",
        "DU",
        "E",
        "G",
        "GI",
        "GO",
        "GTH",
        "H",
        "I",
        "IG",
        "O",
        "P",
        "S",
        "T",
        "TC",
        "U",
      ])
    )
    .optional(),
  senseTags: z.array(z.enum(["B", "D", "SD", "T", "U"])).optional(),
  spellcastingTags: z
    .array(
      z.enum([
        "P",
        "I",
        "F",
        "S",
        "O",
        "CA",
        "CB",
        "CC",
        "CD",
        "CP",
        "CR",
        "CS",
        "CL",
        "CW",
      ])
    )
    .optional(),
  damageTags: z.array(z.string()).optional(), // Reference to dataDamageTags
  damageTagsSpell: z.array(z.string()).optional(), // Reference to dataDamageTags
  damageTagsLegendary: z.array(z.string()).optional(), // Reference to dataDamageTags
  miscTags: z
    .array(
      z.enum([
        "AOE",
        "CUR",
        "DIS",
        "HPR",
        "MW",
        "RW",
        "MA",
        "RA",
        "RCH",
        "MLW",
        "RNG",
        "THW",
      ])
    )
    .optional(),
  attachedItems: z.array(z.string()).min(1).optional(),
  conditionInflict: z.array(z.string()).optional(), // Reference to tagsConditions
  conditionInflictLegendary: z.array(z.string()).optional(), // Reference to tagsConditions
  conditionInflictSpell: z.array(z.string()).optional(), // Reference to tagsConditions
  savingThrowForced: z.array(z.string()).optional(), // Reference to tagsSavingThrow
  savingThrowForcedLegendary: z.array(z.string()).optional(), // Reference to tagsSavingThrow
  savingThrowForcedSpell: z.array(z.string()).optional(), // Reference to tagsSavingThrow
  footer: z.array(z.any()).optional(), // Reference to entry.json
  srd: z.union([z.boolean(), z.string()]).optional(),
  srd52: z.union([z.boolean(), z.string()]).optional(),
  basicRules: z.union([z.boolean(), z.string()]).optional(),
  freeRules2024: z.union([z.boolean(), z.string()]).optional(),
  legacy: z.boolean().optional(),
  summonedBySpell: z.string().optional(),
  summonedBySpellLevel: z.number().int().optional(),
  summonedByClass: z.string().optional(),
  summonedScaleByPlayerLevel: z.literal(true).optional(),
  _isCopy: z.boolean().optional(),
  _versions: z.array(z.any()).optional(), // Reference to creatureVersion
  hasFluff: z.literal(true).optional(),
  hasFluffImages: z.literal(true).optional(),
  // Homebrew fields
  externalSources: z
    .array(
      z.object({
        entry: z.any(), // Reference to entry.json
      })
    )
    .optional(),
  resource: z
    .array(
      z.object({
        name: z.string().optional(),
        value: z.number().int(),
        formula: z.string().optional(),
      })
    )
    .min(1)
    .optional(),
  fluff: z.any().optional(), // Complex fluff definition
  tokenUrl: z.string().optional(),
  tokenHref: z.string().optional(),
  foundryImg: z.string().optional(),
  foundryTokenScale: z.number().optional(),
  foundryTokenSubjectHref: z.string().optional(),
  foundryTokenSubjectScale: z.number().optional(),
  foundryPrototypeToken: z.any().optional(), // Complex object
  isNamedCreature: z.literal(true).nullable().optional(),
  isNpc: z.literal(true).nullable().optional(),
});
