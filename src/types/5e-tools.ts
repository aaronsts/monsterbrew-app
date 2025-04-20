const FiveEToolsCreature = {
  name: "Ancient Red Dragon",
  group: ["Chromatic Dragons"],
  source: "XMM",
  page: 256,
  size: ["G"],
  type: {
    type: "dragon",
    tags: ["chromatic"],
  },
  alignment: ["C", "E"],
  ac: [22],
  hp: {
    average: 507,
    formula: "26d20 + 234",
  },
  speed: {
    walk: 40,
    climb: 40,
    fly: 80,
    burrow: 0,
    swim: 0,
    canHover: false,
  },
  initiative: {
    proficiency: 2,
  },
  str: 30,
  dex: 10,
  con: 29,
  int: 18,
  wis: 15,
  cha: 27,
  save: {
    dex: "+7",
    wis: "+9",
  },
  skill: {
    perception: "+16",
    stealth: "+7",
  },
  senses: ["blindsight 60 ft.", "darkvision 120 ft."],
  passive: 26,
  immune: ["fire"],
  resist: [],
  vulnerable: [],
  conditionImmune: [],
  languages: ["Common", "Draconic"],
  cr: {
    cr: "24",
    xpLair: 75000,
  },
  spellcasting: [
    {
      name: "Spellcasting",
      type: "spellcasting",
      headerEntries: [
        "The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save {@dc 23}, {@hit 15} to hit with spell attacks):",
      ],
      will: [
        "{@spell Command|XPHB} (level 2 version)",
        "{@spell Detect Magic|XPHB}",
        "{@spell Scorching Ray|XPHB} (level 3 version)",
      ],
      daily: {
        "1e": [
          "{@spell Fireball|XPHB} (level 6 version)",
          "{@spell Scrying|XPHB}",
        ],
      },
      ability: "cha",
      displayAs: "action",
    },
  ],
  trait: [
    {
      name: "Legendary Resistance (4/Day, or 5/Day in Lair)",
      entries: [
        "If the dragon fails a saving throw, it can choose to succeed instead.",
      ],
    },
  ],
  action: [
    {
      name: "Multiattack",
      entries: [
        "The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast {@spell Scorching Ray|XPHB} (level 3 version).",
      ],
    },
    {
      name: "Rend",
      entries: [
        "{@atkr m} {@hit 17}, reach 15 ft. {@h}19 ({@damage 2d8 + 10}) Slashing damage plus 10 ({@damage 3d6}) Fire damage.",
      ],
    },
    {
      name: "Fire Breath {@recharge 5}",
      entries: [
        "{@actSave dex} {@dc 24}, each creature in a 90-foot {@variantrule Cone [Area of Effect]|XPHB|Cone}. {@actSaveFail} 91 ({@damage 26d6}) Fire damage. {@actSaveSuccess} Half damage.",
      ],
    },
  ],
  legendaryActionsLair: 4,
  legendary: [
    {
      name: "Commanding Presence",
      entries: [
        "The dragon uses Spellcasting to cast {@spell Command|XPHB} (level 2 version). The dragon can't take this action again until the start of its next turn.",
      ],
    },
    {
      name: "Fiery Rays",
      entries: [
        "The dragon uses Spellcasting to cast {@spell Scorching Ray|XPHB} (level 3 version). The dragon can't take this action again until the start of its next turn.",
      ],
    },
    {
      name: "Pounce",
      entries: [
        "The dragon moves up to half its {@variantrule Speed|XPHB}, and it makes one Rend attack.",
      ],
    },
  ],
  legendaryGroup: {
    name: "Red Dragon",
    source: "XMM",
  },
  environment: ["hill", "mountain"],
  treasure: ["any"],
  dragonAge: "ancient",
  soundClip: {
    type: "internal",
    path: "bestiary/red-dragon.mp3",
  },
  traitTags: ["Legendary Resistances"],
  senseTags: ["B", "SD"],
  actionTags: ["Breath Weapon", "Multiattack"],
  languageTags: ["C", "DR"],
  damageTags: ["F", "S"],
  damageTagsSpell: ["F"],
  spellcastingTags: ["O"],
  miscTags: ["MA", "RCH"],
  conditionInflictSpell: ["prone"],
  savingThrowForced: ["dexterity"],
  savingThrowForcedLegendary: ["constitution"],
  savingThrowForcedSpell: ["dexterity", "wisdom"],
  hasToken: true,
  hasFluff: true,
  hasFluffImages: true,
};
