const ImprovedInitiativeCreature = {
  Source: "",
  Type: "",
  HP: {
    Value: 1,
    Notes: "(1d1+0)",
  },
  AC: {
    Value: 10,
    Notes: "",
  },
  InitiativeModifier: 0,
  InitiativeAdvantage: false,
  Speed: [""],
  Abilities: {
    Str: 10,
    Dex: 10,
    Con: 10,
    Int: 10,
    Wis: 10,
    Cha: 10,
  },
  DamageVulnerabilities: [""],
  DamageResistances: [""],
  DamageImmunities: [""],
  ConditionImmunities: [""],
  Saves: [
    {
      Name: "",
      Modifier: 0,
    },
  ],
  Skills: [
    {
      Name: "",
      Modifier: 0,
    },
  ],
  Senses: [""],
  Languages: [],
  Challenge: "",
  Traits: [
    {
      Name: "",
      Content: "",
    },
  ],
  Actions: [
    {
      Name: "",
      Content: "",
    },
  ],
  BonusActions: [
    {
      Name: "",
      Content: "",
    },
  ],
  Reactions: [
    {
      Name: "",
      Content: "",
    },
  ],
  LegendaryActions: [
    {
      Name: "",
      Content: "",
    },
  ],
  MythicActions: [
    {
      Name: "",
      Content: "",
    },
  ],
  Description: "",
  Player: "",
  Version: "3.11.5",
  ImageURL: "",
};

const example = {
  Source: "5e Core Rules",
  Type: "Gargantuan Dragon, chaotic evil ",
  HP: {
    Value: 546,
    Notes: "(28d20+252)",
  },
  AC: {
    Value: 22,
    Notes: "(natural armor)",
  },
  InitiativeModifier: 0,
  InitiativeAdvantage: false,
  Speed: ["walk 40 ft.", "climb 40 ft.", "fly 80 ft."],
  Abilities: {
    Str: 30,
    Dex: 10,
    Con: 29,
    Int: 18,
    Wis: 15,
    Cha: 23,
  },
  DamageVulnerabilities: [],
  DamageResistances: [],
  DamageImmunities: ["fire"],
  ConditionImmunities: [],
  Saves: [
    {
      Name: "Dex",
      Modifier: 7,
    },
    {
      Name: "Con",
      Modifier: 16,
    },
    {
      Name: "Wis",
      Modifier: 9,
    },
    {
      Name: "Cha",
      Modifier: 13,
    },
  ],
  Skills: [
    {
      Name: "Perception",
      Modifier: 16,
    },
    {
      Name: "Stealth",
      Modifier: 7,
    },
  ],
  Senses: ["blindsight 60 ft.", "darkvision 120 ft.", "passive Perception 26"],
  Languages: ["Common", "Draconic"],
  Challenge: "24",
  Traits: [
    {
      Name: "Legendary Resistance (3/Day)",
      Content:
        "If the dragon fails a saving throw, it can choose to succeed instead.",
    },
  ],
  Actions: [
    {
      Name: "Multiattack",
      Content:
        "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.",
    },
    {
      Name: "Bite",
      Content:
        "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage.",
    },
    {
      Name: "Claw",
      Content:
        "Melee Weapon Attack: +17 to hit, reach 10 ft., one target. Hit: 17 (2d6 + 10) slashing damage.",
    },
    {
      Name: "Tail",
      Content:
        "Melee Weapon Attack: +17 to hit, reach 20 ft., one target. Hit: 19 (2d8 + 10) bludgeoning damage.",
    },
    {
      Name: "Frightful Presence",
      Content:
        "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 21 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.",
    },
    {
      Name: "Fire Breath (Recharge 5-6)",
      Content:
        "The dragon exhales fire in a 90-foot cone. Each creature in that area must make a DC 24 Dexterity saving throw, taking 91 (26d6) fire damage on a failed save, or half as much damage on a successful one.",
    },
  ],
  BonusActions: [],
  Reactions: [],
  LegendaryActions: [
    {
      Name: "Detect",
      Content: "The dragon makes a Wisdom (Perception) check.",
    },
    {
      Name: "Tail Attack",
      Content: "The dragon makes a tail attack.",
    },
    {
      Name: "Wing Attack (Costs 2 Actions)",
      Content:
        "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
    },
  ],
  MythicActions: [],
  Description: "",
  Player: "",
  Version: "3.11.5",
  ImageURL: "",
};
