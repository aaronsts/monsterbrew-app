export const ATTACK_TYPES = [
  "melee or ranged weapon attack:",
  "melee or ranged spell attack:",
  "melee weapon attack:",
  "melee spell attack:",
  "ranged weapon attack:",
  "ranged spell attack:",
];

/** Which feature list a preset belongs to. Untyped presets default to `trait`. */
export type PresetType =
  | "trait"
  | "action"
  | "reaction"
  | "bonus_action"
  | "legendary"
  | "mythic";

export interface ActionPreset {
  /** Disambiguated label shown in the picker, e.g. "Dagger (DEX)". */
  name: string;
  /** Name written into the form when the disambiguated label differs. */
  realname?: string;
  /** Description in Monsterbrew's native `{@…}` markup. */
  desc: string;
  type?: PresetType;
}

export const ACTION_PRESETS: Array<ActionPreset> = [
  {
    name: "Melee Weapon Attack (STR)",
    type: "action",
    desc: "{@attack m|str|???|???d???+str|???}",
  },
  {
    name: "Melee Weapon Attack (DEX)",
    type: "action",
    desc: "{@attack m|dex|???|???d???+dex|???}",
  },
  {
    name: "Melee Spell Attack (INT)",
    type: "action",
    desc: "{@attack m|int|???|???d???+int|???}",
  },
  {
    name: "Melee Spell Attack (WIS)",
    type: "action",
    desc: "{@attack m|wis|???|???d???+wis|???}",
  },
  {
    name: "Melee Spell Attack (CHA)",
    type: "action",
    desc: "{@attack m|cha|???|???d???+cha|???}",
  },
  {
    name: "Ranged Weapon Attack (STR)",
    type: "action",
    desc: "{@attack r|str|???/???|???d???+str|???}",
  },
  {
    name: "Ranged Weapon Attack (DEX)",
    type: "action",
    desc: "{@attack r|dex|???/???|???d???+dex|???}",
  },
  {
    name: "Ranged Spell Attack (INT)",
    type: "action",
    desc: "{@attack r|int|???/???|???d???+int|???}",
  },
  {
    name: "Ranged Spell Attack (WIS)",
    type: "action",
    desc: "{@attack r|wis|???/???|???d???+wis|???}",
  },
  {
    name: "Ranged Spell Attack (CHA)",
    type: "action",
    desc: "{@attack r|cha|???/???|???d???+cha|???}",
  },
  {
    name: "Melee or Ranged Weapon Attack (STR)",
    type: "action",
    desc: "{@attack m,r|str|???;???/???|???d???+str|???}",
  },
  {
    name: "Melee or Ranged Weapon Attack (DEX)",
    type: "action",
    desc: "{@attack m,r|dex|???;???/???|???d???+dex|???}",
  },
  {
    name: "Multiattack (Action)",
    realname: "Multiattack",
    desc: "The {@mon} makes two attacks.",
    type: "trait",
  },
  {
    name: "Legendary Resistance",
    realname: "Legendary Resistance (3/day)",
    desc: "If the {@mon} fails a saving throw, it can choose to succeed instead.",
    type: "trait",
  },
  {
    name: "Spellcasting (INT)",
    realname: "Spellcasting",
    desc: "The {@mon} is a ???-level spellcaster. Its spellcasting ability is Intelligence (spell save DC {@dc int}, {@hit int} to hit with spell attacks). The {@mon} has the following ??? spells prepared:\n\n> Cantrips (at will): _spell, spell, spell, spell_\n> 1st level (4 slots): _spell, spell, spell_\n> 2nd level (3 slots): _spell, spell, spell_\n> 3rd level (2 slots): _spell, spell_",
    type: "trait",
  },
  {
    name: "Spellcasting (WIS)",
    realname: "Spellcasting",
    desc: "The {@mon} is a ???-level spellcaster. Its spellcasting ability is Wisdom (spell save DC {@dc wis}, {@hit wis} to hit with spell attacks). The {@mon} has the following ??? spells prepared:\n\n> Cantrips (at will): _spell, spell, spell, spell_\n> 1st level (4 slots): _spell, spell, spell_\n> 2nd level (3 slots): _spell, spell, spell_\n> 3rd level (2 slots): _spell, spell_",
    type: "trait",
  },
  {
    name: "Spellcasting (CHA)",
    realname: "Spellcasting",
    desc: "The {@mon} is a ???-level spellcaster. Its spellcasting ability is Charisma (spell save DC {@dc cha}, {@hit cha} to hit with spell attacks). The {@mon} has the following ??? spells prepared:\n\n> Cantrips (at will): _spell, spell, spell, spell_\n> 1st level (4 slots): _spell, spell, spell_\n> 2nd level (3 slots): _spell, spell, spell_\n> 3rd level (2 slots): _spell, spell_",
    type: "trait",
  },
  {
    name: "Innate Spellcasting (INT)",
    realname: "Innate Spellcasting",
    desc: "The {@mon}'s innate spellcasting ability is Intelligence (spell save DC {@dc int}, {@hit int} to hit with spell attacks). It can innately cast the following spells, requiring no material components:\n\n> At will: _spell, spell, spell_\n> 3/day each: _spell, spell, spell_\n> 1/day each: _spell, spell_",
    type: "trait",
  },
  {
    name: "Innate Spellcasting (WIS)",
    realname: "Innate Spellcasting",
    desc: "The {@mon}'s innate spellcasting ability is Wisdom (spell save DC {@dc wis}, {@hit wis} to hit with spell attacks). It can innately cast the following spells, requiring no material components:\n\n> At will: _spell, spell, spell_\n> 3/day each: _spell, spell, spell_\n> 1/day each: _spell, spell_",
    type: "trait",
  },
  {
    name: "Innate Spellcasting (CHA)",
    realname: "Innate Spellcasting",
    desc: "The {@mon}'s innate spellcasting ability is Charisma (spell save DC {@dc cha}, {@hit cha} to hit with spell attacks). It can innately cast the following spells, requiring no material components:\n\n> At will: _spell, spell, spell_\n> 3/day each: _spell, spell, spell_\n> 1/day each: _spell, spell_",
    type: "trait",
  },
  {
    name: "Aggressive",
    desc: "As a bonus action, the {@mon} can move up to its speed toward a hostile creature that it can see.",
    type: "trait",
  },
  {
    name: "Ambusher",
    desc: "The {@mon} has advantage on attack rolls against any creature it has surprised.",
    type: "trait",
  },
  {
    name: "Amorphous",
    desc: "The {@mon} can move through a space as narrow as 1 inch wide without squeezing.",
    type: "trait",
  },
  {
    name: "Amphibious",
    desc: "The {@mon} can breathe air and water.",
    type: "trait",
  },
  {
    name: "Angelic Weapons",
    desc: "The {@mon}'s weapon attacks are magical. When the {@mon} hits with any weapon, the weapon deals an extra {@damage ???d???} radiant damage (included in the attack).",
    type: "trait",
  },
  {
    name: "Animal Telepathy",
    realname: "??? Telepathy",
    desc: "The {@mon} can magically command any ??? within 120 feet of it, using a limited telepathy.",
    type: "trait",
  },
  {
    name: "Antimagic Susceptibility",
    desc: "The {@mon} is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the {@mon} must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute.",
    type: "trait",
  },
  {
    name: "Assassinate",
    desc: "During its first turn, the {@mon} has advantage on attack rolls against any creature that hasn't taken a turn. Any hit the {@mon} scores against a surprised creature is a critical hit.",
    type: "trait",
  },
  {
    name: "Aversion to Damage",
    realname: "Aversion to ???",
    desc: "If the {@mon} takes ??? damage, it has disadvantage on attack rolls and ability checks until the end of its next turn.",
    type: "trait",
  },
  {
    name: "Beast of Burden",
    desc: "The {@mon} is considered to be a ??? animal for the purpose of determining its carrying capacity.",
    type: "trait",
  },
  {
    name: "Berserk",
    desc: "Whenever the {@mon} starts its turn with ??? hit points or fewer, roll a d6. On a 6, the {@mon} goes berserk. On each of its turns while berserk, the {@mon} attacks the nearest creature it can see. If no creature is near enough to move to and attack, the {@mon} attacks an object, with preference for an object smaller than itself. Once the {@mon} goes berserk, it continues to do so until it is destroyed or regains all its hit points.",
    type: "trait",
  },
  {
    name: "Blind Senses",
    desc: "The {@mon} can't use its blindsight while deafened and unable to smell.",
    type: "trait",
  },
  {
    name: "Blood Frenzy",
    desc: "The {@mon} has advantage on melee attack rolls against any creature that doesn't have all its hit points.",
    type: "trait",
  },
  {
    name: "Brave",
    desc: "The {@mon} has advantage on saving throws against being frightened.",
    type: "trait",
  },
  {
    name: "Breath Weapon (Cone, Action)",
    realname: "Breath Weapon (Recharge ???)",
    desc: "The {@mon} exhales ??? in a ???-foot cone. Each creature in that area must make a DC ??? Dexterity saving throw, taking {@damage ???d???} ??? damage on a failed save, or half as much damage on a successful one.",
    type: "action",
  },
  {
    name: "Breath Weapon (Line, Action)",
    realname: "Breath Weapon (Recharge ???)",
    desc: "The {@mon} exhales ??? in a ???-foot line that is ??? feet wide. Each creature in that line must make a DC ??? Dexterity saving throw, taking {@damage ???d???} ??? damage on a failed save, or half as much damage on a successful one.",
    type: "action",
  },
  {
    name: "Brute",
    desc: "A melee weapon deals one extra die of its damage when the {@mon} hits with it (included in the attack).",
    type: "trait",
  },
  {
    name: "Camouflage",
    realname: "??? Camouflage",
    desc: "The {@mon} has advantage on Dexterity (Stealth) checks made to hide in ??? terrain.",
    type: "trait",
  },
  {
    name: "Change Shape (Dragon, Action)",
    realname: "Change Shape",
    desc: "The {@mon} magically polymorphs into a humanoid or beast that has a challenge rating no higher than its own, or back into its true form. It reverts to its true form if it dies. Any equipment it is wearing or carrying is absorbed or borne by the new form (the {@mon}'s choice).\nIn a new form, the {@mon} retains its alignment, hit points, Hit Dice, ability to speak, proficiencies, Legendary Resistance, lair actions, and Intelligence, Wisdom, and Charisma scores, as well as this action. Its statistics and capabilities are otherwise replaced by those of the new form, except any class features or legendary actions of that form.",
    type: "action",
  },
  {
    name: "Change Shape (Humanoid, Action)",
    realname: "Change Shape",
    desc: "The {@mon} magically polymorphs into a small or medium humanoid, or back into its true form. Its statistics are the same in each form. Any equipment the {@mon} is wearing or carrying isn't transformed. If the {@mon} dies, it reverts to its true form.",
    type: "action",
  },
  {
    name: "Charge",
    desc: "If the {@mon} moves at least ??? ft. straight toward a target and then hits it with a ??? attack on the same turn, the target takes an extra {@damage ???d???} ??? damage. If the target is a creature, it must succeed on a DC ??? Strength saving throw or be knocked prone.",
    type: "action",
  },
  {
    name: "Confer Resistance",
    realname: "Confer ??? Resistance",
    desc: "The {@mon} can grant resistance to ??? damage to anyone riding it.",
    type: "trait",
  },
  {
    name: "Constrict (Action)",
    realname: "Constrict",
    desc: "_Melee Weapon Attack:_ {@hit str} to hit, reach 5 ft., one creature. _Hit:_ {@damage ???d??? + str} bludgeoning damage, and the target is grappled (escape DC ???). Until this grapple ends, the creature is restrained, and the {@mon} can't constrict another target.",
    type: "action",
  },
  {
    name: "Corrode Metal",
    desc: "Any nonmagical weapon made of metal that hits the {@mon} corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Non magical ammunition made of metal that hits the {@mon} is destroyed after dealing damage.\nThe {@mon} can eat through 2-inch-thick, nonmagical metal in 1 round.",
    type: "trait",
  },
  {
    name: "Cunning Action",
    desc: "On each of its turns, the {@mon} can use a bonus action to take the Dash, Disengage, or Hide action.",
    type: "trait",
  },
  {
    name: "Damage Absorption",
    realname: "??? Absorption",
    desc: "Whenever the {@mon} is subjected to ??? damage, it takes no damage and instead regains a number of hit points equal to the ??? damage dealt.",
    type: "trait",
  },
  {
    name: "Damage Transfer",
    desc: "While it is grappling a creature, the {@mon} takes only half the damage dealt to it, and the creature grappled by the {@mon} takes the other half.",
    type: "trait",
  },
  {
    name: "Dark Devotion",
    desc: "The {@mon} has advantage on saving throws against being charmed or frightened.",
    type: "trait",
  },
  {
    name: "Death Burst",
    desc: "When the {@mon} dies, it explodes in a burst of ???. Each creature within ??? ft. of it must make a DC ??? Dexterity saving throw, taking {@damage ???d???} ??? damage on a failed save, or half as much damage on a successful one.",
    type: "trait",
  },
  {
    name: "Detect (Legendary Action)",
    realname: "Detect",
    desc: "The {@mon} makes a Wisdom (Perception) check.",
    type: "legendary",
  },
  {
    name: "Devil's Sight",
    desc: "Magical darkness doesn't impede the devil's darkvision.",
    type: "trait",
  },
  {
    name: "Divine Awareness",
    desc: "The {@mon} knows if it hears a lie.",
    type: "trait",
  },
  {
    name: "Divine Eminence",
    desc: "As a bonus action, the {@mon} can expend a spell slot to cause its melee weapon attacks to magically deal an extra {@damage ???d???} radiant damage to a target on a hit. This benefit lasts until the end of the turn. If the {@mon} expends a spell slot of 2nd level or higher, the extra damage increases by 1d6 for each level above 1st.",
    type: "bonus_action",
  },
  {
    name: "Duergar Resilience",
    desc: "The duergar has advantage on saving throws against poison, spells, and illusions, as well as to resist being charmed or paralyzed.",
    type: "trait",
  },
  {
    name: "Dwarven Resilience",
    desc: "The dwarf has advantage on saving throws against poison, spells, and illusions, as well as to resist being charmed or paralyzed.",
    type: "trait",
  },
  {
    name: "Earth Glide",
    desc: "The {@mon} can burrow through nonmagical, unworked earth and stone. While doing so, the {@mon} doesn't disturb the material it moves through.",
    type: "trait",
  },
  {
    name: "Echolocation",
    desc: "The {@mon} can't use its blindsight while deafened.",
    type: "trait",
  },
  {
    name: "Elemental Demise",
    desc: "If the {@mon} dies, its body disintegrates into ???, leaving behind only equipment the {@mon} was wearing or carrying.",
  },
  {
    name: "Elemental Form",
    realname: "??? Form",
    desc: "The {@mon} can enter a hostile creature's space and stop there. It can move through a space as narrow as 1 inch wide without squeezing.",
    type: "trait",
  },
  {
    name: "Ephemeral",
    desc: "The {@mon} can't wear or carry anything.",
    type: "trait",
  },
  {
    name: "Etherealness (Action)",
    realname: "Etherealness",
    desc: "The {@mon} magically enters the Ethereal Plane from the Material Plane, or vice versa.",
    type: "action",
  },
  {
    name: "Ethereal Jaunt",
    desc: "As a bonus action, the {@mon} can magically shift from the Material Plane to the Ethereal Plane, or vice versa.",
    type: "bonus_action",
  },
  {
    name: "Ethereal Sight",
    desc: "The {@mon} can see 60 ft. into the Ethereal Plane when it is on the Material Plane, and vice versa.",
    type: "trait",
  },
  {
    name: "Evasion",
    desc: "If the {@mon} is subjected to an effect that allows it to make a Dexterity saving throw to take only half damage, the {@mon} instead takes no damage if it succeeds on the saving throw, and only half damage if it fails.",
    type: "trait",
  },
  {
    name: "False Appearance",
    desc: "While the {@mon} remains motionless, it is indistinguishable from ???.",
    type: "trait",
  },
  {
    name: "Fear Aura",
    desc: "Any creature hostile to the {@mon} that starts its turn within ??? feet of the {@mon} must make a DC ??? Wisdom saving throw, unless the {@mon} is incapacitated. On a failed save, the creature is frightened until the start of its next turn. If a creature's saving throw is successful, the creature is immune to the {@mon}'s Fear Aura for the next 24 hours.",
    type: "trait",
  },
  {
    name: "Fey Ancestry",
    desc: "The {@mon} has advantage on saving throws against being charmed, and magic can't put the {@mon} to sleep.",
    type: "trait",
  },
  {
    name: "Flyby",
    desc: "The {@mon} doesn't provoke opportunity attacks when it flies out of an enemy's reach.",
    type: "trait",
  },
  {
    name: "Freedom of Movement",
    desc: "The {@mon} ignores difficult terrain, and magical effects can't reduce its speed or cause it to be restrained. It can spend 5 feet of movement to escape from nonmagical restraints or being grappled.",
    type: "trait",
  },
  {
    name: "Frightful Presence (Action)",
    realname: "Frightful Presence",
    desc: "Each creature of the {@mon}'s choice that is within 120 feet of the {@mon} and aware of it must succeed on a DC ??? Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the {@mon}'s Frightful Presence for the next 24 hours.",
    type: "action",
  },
  {
    name: "Gnome Cunning",
    desc: "The gnome has advantage on Intelligence, Wisdom, and Charisma saving throws against magic.",
    type: "trait",
  },
  {
    name: "Grappler",
    desc: "The {@mon} has advantage on attack rolls against any creature grappled by it.",
    type: "trait",
  },
  {
    name: "Healing Touch (Action)",
    realname: "Healing Touch (???/day)",
    desc: "The {@mon} touches another creature. The target magically regains {@damage ???d??? + ???} hit points and is freed from any curse, disease, poison, blindness, or deafness.",
    type: "action",
  },
  {
    name: "Halfling Nimbleness",
    desc: "The halfling can move through the space of any creature that is of a size larger than its own.",
    type: "trait",
  },
  {
    name: "Heated Body",
    desc: "A creature that touches the {@mon} or hits it with a melee attack while within ??? feet of it takes {@damage ???d???} fire damage.",
    type: "trait",
  },
  {
    name: "Heated Weapons",
    desc: "Any metal melee weapon the {@mon} wields deals an extra {@damage ???d???} fire damage on a hit (included in the attack).",
    type: "trait",
  },
  {
    name: "Hellish Weapons",
    desc: "The {@mon}'s weapon attacks are magical and deal an extra {@damage ???d???} poison damage on a hit (included in the attacks).",
    type: "trait",
  },
  {
    name: "Hold Breath",
    desc: "The {@mon} can hold its breath for ???.",
    type: "trait",
  },
  {
    name: "Ice Walk",
    desc: "The {@mon} can move across and climb icy surfaces without needing to make an ability check. Additionally, difficult terrain composed of ice or snow doesn't cost it extra movement.",
    type: "trait",
  },
  {
    name: "Illumination",
    desc: "The {@mon} sheds bright light in a ???-foot radius and dim light in an additional ??? ft.",
    type: "trait",
  },
  {
    name: "Illusory Appearance (Action)",
    realname: "Illusory Appearance",
    desc: "The {@mon} covers itself and anything it is wearing or carrying with a magical illusion that makes it look like another creature of its general size and shape. The effect ends if the {@mon} takes a bonus action to end it or if it dies.\nThe changes wrought by this effect fail to hold up to physical inspection. For example, the {@mon} could appear to have no claws, but someone touching its hand might feel the claws. Otherwise, a creature must take an action to visually inspect the illusion and succeed on a DC ??? Intelligence (Investigation) check to discern that the {@mon} is disguised.",
    type: "action",
  },
  {
    name: "Immutable Form",
    desc: "The {@mon} is immune to any spell or effect that would alter its form.",
    type: "trait",
  },
  {
    name: "Incorporeal",
    desc: "The {@mon} can move through other creatures and objects as if they were difficult terrain. It takes {@damage ???d???} force damage if it ends its turn inside an object.",
    type: "trait",
  },
  {
    name: "Innate Spellcasting (Single Spell)",
    realname: "Innate Spellcasting (???/Day)",
    desc: "The {@mon} can innately cast ??? (spell save DC ???), requiring no material components. Its innate spellcasting ability is ???.",
    type: "trait",
  },
  {
    name: "Inscrutable",
    desc: "The {@mon} is immune to any effect that would sense its emotions or read its thoughts, as well as any divination spell that it refuses. Wisdom (Insight) checks made to ascertain the {@mon}'s intentions or sincerity have disadvantage.",
    type: "trait",
  },
  {
    name: "Invisibility (Action)",
    realname: "Invisibility",
    desc: "The {@mon} magically turns invisible until it attacks or casts a spell, or until its concentration ends (as if concentrating on a spell). Any equipment the {@mon} wears or carries is invisible with it.",
    type: "action",
  },
  {
    name: "Invisibility (Permanent)",
    realname: "Invisibility",
    desc: "The {@mon} is invisible.",
    type: "trait",
  },
  {
    name: "Keen Hearing",
    desc: "The {@mon} has advantage on Wisdom (Perception) checks that rely on hearing.",
    type: "trait",
  },
  {
    name: "Keen Sight",
    desc: "The {@mon} has advantage on Wisdom (Perception) checks that rely on sight.",
    type: "trait",
  },
  {
    name: "Keen Smell",
    desc: "The {@mon} has advantage on Wisdom (Perception) checks that rely on smell.",
    type: "trait",
  },
  {
    name: "Keen Hearing and Sight",
    desc: "The {@mon} has advantage on Wisdom (Perception) checks that rely on hearing or sight.",
    type: "trait",
  },
  {
    name: "Keen Hearing and Smell",
    desc: "The {@mon} has advantage on Wisdom (Perception) checks that rely on hearing or smell.",
    type: "trait",
  },
  {
    name: "Keen Sight and Smell",
    desc: "The {@mon} has advantage on Wisdom (Perception) checks that rely on sight or smell.",
    type: "trait",
  },
  {
    name: "Labyrinthine Recall",
    desc: "The {@mon} can perfectly recall any path it has traveled.",
    type: "trait",
  },
  {
    name: "Leadership (Action)",
    realname: "Leadership (Recharges after a Short or Long Rest)",
    desc: "For 1 minute, the {@mon} can utter a special command or warning whenever a nonhostile creature that it can see within 30 ft. of it makes an attack roll or a saving throw. The creature can add a d4 to its roll provided it can hear and understand the {@mon}. A creature can benefit from only one Leadership die at a time. This effect ends if the {@mon} is incapacitated.",
    type: "action",
  },
  {
    name: "Life Drain (Action)",
    realname: "Life Drain",
    desc: "_Melee Spell Attack:_ +??? to hit, reach ??? ft., one creature. _Hit:_ {@damage ???d??? + ???} necrotic damage. The target must succeed on a DC ??? Constitution saving throw or its hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the creature finishes a long rest. The target dies if this effect reduces its hit point maximum to 0.",
    type: "action",
  },
  {
    name: "Limited Amphibiousness",
    desc: "The {@mon} can breathe air and water, but it needs to be submerged at least once every 4 hours to avoid suffocating.",
    type: "trait",
  },
  {
    name: "Limited Magic Immunity",
    desc: "The {@mon} can't be affected or detected by spells of ??? level or lower unless it wishes to be. It has advantage on saving throws against all other spells and magical effects.",
    type: "trait",
  },
  {
    name: "Limited Telepathy",
    desc: "The {@mon} can magically communicate simple ideas, emotions, and images telepathically with any creature within ??? ft. of it.",
    type: "trait",
  },
  {
    name: "Lucky",
    desc: "When the {@mon} rolls a 1 on the d20 for an attack roll, ability check, or saving throw, it can reroll the die and must use the new roll.",
    type: "trait",
  },
  {
    name: "Magic Resistance",
    desc: "The {@mon} has advantage on saving throws against spells and other magical effects.",
    type: "trait",
  },
  {
    name: "Magic Weapons",
    desc: "The {@mon}'s weapon attacks are magical.",
    type: "trait",
  },
  {
    name: "Martial Advantage",
    desc: "Once per turn, the {@mon} can deal an extra {@damage ???d???} damage to a creature it hits with a weapon attack if that creature is within 5 ft. of an ally of the {@mon} that isn't incapacitated.",
    type: "trait",
  },
  {
    name: "Mimicry",
    desc: "The {@mon} can mimic ??? sounds it has heard. A creature that hears the sounds can tell they are imitations with a successful DC ??? Wisdom (Insight) check.",
    type: "trait",
  },
  {
    name: "Naturally Stealthy",
    desc: "The {@mon} can attempt to hide even when it is obscured only by a creature that is at least one size larger than itself.",
    type: "trait",
  },
  {
    name: "Nimble Escape",
    desc: "The {@mon} can take the Disengage or Hide action as a bonus action on each of its turns.",
    type: "trait",
  },
  {
    name: "Pack Tactics",
    desc: "The {@mon} has advantage on an attack roll against a creature if at least one of the {@mon}'s allies is within 5 ft. of the creature and the ally isn't incapacitated.",
    type: "trait",
  },
  {
    name: "Parry (Reaction)",
    realname: "Parry",
    desc: "The {@mon} adds ??? to its AC against one melee attack that would hit it. To do so, the {@mon} must see the attacker and be wielding a melee weapon.",
    type: "reaction",
  },
  {
    name: "Petrifying Gaze",
    desc: "If a creature starts its turn within ??? ft. of the {@mon} and the two of them can see each other, the {@mon} can force the creature to make a DC ??? Constitution saving throw if the {@mon} isn't incapacitated. On a failed save, the creature magically begins to turn to stone and is restrained. It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified until freed by the greater restoration spell or other magic.\nA creature that isn't surprised can avert its eyes to avoid the saving throw at the start of its turn. If it does so, it can't see the {@mon} until the start of its next turn, when it can avert its eyes again. If it looks at the {@mon} in the meantime, it must immediately make the save.\nIf the {@mon} sees its reflection within ??? ft. of it in bright light, it is affected by its own gaze.",
    type: "action",
  },
  {
    name: "Pounce",
    desc: "If the {@mon} moves at least ??? ft. straight toward a target and then hits it with a ??? attack on the same turn, the target takes an extra {@damage ???d???} ??? damage. If the target is a creature, it must succeed on a DC ??? Strength saving throw or be knocked prone. If the target is prone, the {@mon} can make another ??? attack against it as a bonus action.",
    type: "action",
  },
  {
    name: "Rampage",
    desc: "When the {@mon} reduces a creature to 0 hit points with a melee attack on its turn, the {@mon} can take a bonus action to move up to half its speed and make a ??? attack.",
    type: "action",
  },
  {
    name: "Reactive",
    desc: "The {@mon} can take one reaction on every turn in combat.",
    type: "trait",
  },
  {
    name: "Read Thoughts (Action)",
    realname: "Read Thoughts",
    desc: "The {@mon} magically reads the surface thoughts of one creature within ??? ft. of it. The effect can penetrate barriers, but 3 ft. of wood or dirt, 2 ft. of stone, 2 inches of metal, or a thin sheet of lead blocks it. While the target is in range, the {@mon} can continue reading its thoughts, as long as the {@mon}'s concentration isn't broken (as if concentrating on a spell). While reading the target's mind, the {@mon} has advantage on Wisdom (Insight) and Charisma (Deception, Intimidation, and Persuasion) checks against the target.",
    type: "action",
  },
  {
    name: "Reckless",
    desc: "At the start of its turn, the {@mon} can gain advantage on all melee weapon attack rolls it makes during that turn, but attack rolls against it have advantage until the start of its next turn.",
    type: "action",
  },
  {
    name: "Regeneration",
    desc: "The {@mon} regains ??? hit points at the start of its turn if it has at least 1 hit point.",
    type: "trait",
  },
  {
    name: "Regeneration (Troll)",
    realname: "Regeneration",
    desc: "The {@mon} regains ??? hit points at the start of its turn. If the {@mon} takes acid or fire damage, this trait doesn't function at the start of the {@mon}'s next turn. The {@mon} dies only if it starts its turn with 0 hit points and doesn't regenerate.",
    type: "trait",
  },
  {
    name: "Relentless",
    realname: "Relentless (Recharges after a Short or Long Rest)",
    desc: "If the {@mon} takes ??? damage or less that would reduce it to 0 hit points, it is reduced to 1 hit point instead.",
    type: "trait",
  },
  {
    name: "Rust Metal",
    desc: "Any nonmagical weapon made of metal that hits the {@mon} corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Non magical ammunition made of metal that hits the {@mon} is destroyed after dealing damage.",
    type: "trait",
  },
  {
    name: "Savage Attacks",
    desc: "When the {@mon} scores a critical hit with a melee weapon attack, it can roll one of the weapon’s damage dice one additional time and add it to the extra damage of the critical hit.",
    type: "trait",
  },
  {
    name: "Sense Magic",
    desc: "The {@mon} senses magic within 120 feet of it at will. This trait otherwise works like the detect magic spell but isn't itself magical.",
    type: "trait",
  },
  {
    name: "Shadow Stealth",
    desc: "While in dim light or darkness, the {@mon} can take the Hide action as a bonus action.",
    type: "trait",
  },
  {
    name: "Shapechanger",
    desc: "The {@mon} can use its action to polymorph into a ???, or back into its true form. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies.",
    type: "trait",
  },
  {
    name: "Shapechanger (Lycanthrope)",
    realname: "Shapechanger",
    desc: "The {@mon} can use its action to polymorph into a ???-humanoid hybrid or into a ???, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies.",
    type: "trait",
  },
  {
    name: "Shielded Mind",
    desc: "The {@mon} is immune to scrying and to any effect that would sense its emotions, read its thoughts, or detect its location.",
    type: "trait",
  },
  {
    name: "Siege Monster",
    desc: "The {@mon} deals double damage to objects and structures.",
    type: "trait",
  },
  {
    name: "Sneak Attack",
    realname: "Sneak Attack (1/Turn)",
    desc: "The {@mon} deals an extra {@damage ???d???} damage when it hits a target with a weapon attack and has advantage on the attack roll, or when the target is within 5 ft. of an ally of the {@mon} that isn't incapacitated and the {@mon} doesn't have disadvantage on the attack roll.",
    type: "action",
  },
  {
    name: "Speak With Plants and Beasts",
    desc: "The {@mon} can communicate with beasts and plants as if they shared a language.",
    type: "trait",
  },
  {
    name: "Spider Climb",
    desc: "The {@mon} can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.",
    type: "trait",
  },
  {
    name: "Split (Reaction)",
    realname: "Split",
    desc: "When a {@mon} that is Medium or larger is subjected to lightning or slashing damage, it splits into two new {@mon} if it has at least 10 hit points. Each new {@mon} has hit points equal to half the original {@mon}'s, rounded down. New {@mon} are one size smaller than the original {@mon}.",
    type: "reaction",
  },
  {
    name: "Standing Leap",
    desc: "The {@mon}'s long jump is up to ??? ft. and its high jump is up to ??? ft., with or without a running start.",
    type: "trait",
  },
  {
    name: "Steadfast",
    desc: "The {@mon} can't be frightened while it can see an allied creature within 30 feet of it.",
    type: "trait",
  },
  {
    name: "Sunlight Sensitivity",
    desc: "While in sunlight, the {@mon} has disadvantage on attack rolls, as well as on Wisdom (Perception) checks that rely on sight.",
    type: "trait",
  },
  {
    name: "Sure-Footed",
    desc: "The {@mon} has advantage on Strength and Dexterity saving throws made against effects that would knock it prone.",
    type: "trait",
  },
  {
    name: "Surprise Attack",
    desc: "If the {@mon} surprises a creature and hits it with an attack during the first round of combat, the target takes an extra {@damage ???d???} damage from the attack.",
    type: "trait",
  },
  {
    name: "Swarm",
    desc: "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a ???. The swarm can't regain hit points or gain temporary hit points.",
    type: "trait",
  },
  {
    name: "Teleport (Action or Legendary Action)",
    realname: "Teleport",
    desc: "The {@mon} magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see.",
    type: "action",
  },
  {
    name: "Trampling Charge",
    desc: "If the {@mon} moves at least ??? ft. straight toward a target and then hits it with a ??? attack on the same turn, the target takes an extra {@damage ???d???} ??? damage. If the target is a creature, it must succeed on a DC ??? Strength saving throw or be knocked prone. If the target is prone, the {@mon} can make another ??? attack against it as a bonus action.",
    type: "action",
  },
  {
    name: "Tunneler",
    desc: "The {@mon} can burrow through solid rock at half its burrow speed and leaves a ???-foot-diameter tunnel in its wake.",
    type: "trait",
  },
  {
    name: "Turn Resistance",
    desc: "The {@mon} has advantage on saving throws against any effect that turns undead.",
    type: "trait",
  },
  {
    name: "Two-Headed",
    desc: "The {@mon} has advantage on Wisdom (Perception) checks and on saving throws against being blinded, charmed, deafened, frightened, stunned, and knocked unconscious.",
    type: "trait",
  },
  {
    name: "Undead Fortitude",
    desc: "If damage reduces the {@mon} to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the {@mon} drops to 1 hit point instead.",
    type: "trait",
  },
  {
    name: "Water Breathing",
    desc: "The {@mon} can breathe only underwater.",
    type: "trait",
  },
  {
    name: "Web Sense",
    desc: "While in contact with a web, the {@mon} knows the exact location of any other creature in contact with the same web.",
    type: "trait",
  },
  {
    name: "Web Walker",
    desc: "The {@mon} ignores movement restrictions caused by webbing.",
    type: "trait",
  },
  {
    name: "Wing Attack (Legendary Action)",
    realname: "Wing Attack (Costs 2 Actions)",
    desc: "The {@mon} beats its wings. Each creature within ??? ft. of the {@mon} must succeed on a DC ??? Dexterity saving throw or take {@damage ???d??? + str} bludgeoning damage and be knocked prone. The {@mon} can then fly up to half its flying speed.",
    type: "legendary",
  },
  {
    name: "Battleaxe",
    desc: "{@attack m|str|5|1d8+str|slashing} or {@damage 1d10 + str} slashing damage if used with two hands.",
    type: "action",
  },
  {
    name: "Blowgun",
    desc: "{@attack r|dex|25/100|1+dex|piercing}",
    type: "action",
  },
  {
    name: "Club",
    desc: "{@attack m|str|5|1d4+str|bludgeoning}",
    type: "action",
  },
  {
    name: "Dagger (STR)",
    realname: "Dagger",
    desc: "{@attack m,r|str|5;20/60|1d4+str|piercing}",
    type: "action",
  },
  {
    name: "Dagger (DEX)",
    realname: "Dagger",
    desc: "{@attack m,r|dex|5;20/60|1d4+dex|piercing}",
    type: "action",
  },
  {
    name: "Dart (STR)",
    realname: "Dart",
    desc: "{@attack r|str|20/60|1d4+str|piercing}",
    type: "action",
  },
  {
    name: "Dart (DEX)",
    realname: "Dart",
    desc: "{@attack r|dex|20/60|1d4+dex|piercing}",
    type: "action",
  },
  {
    name: "Flail",
    desc: "{@attack m|str|5|1d8+str|bludgeoning}",
    type: "action",
  },
  {
    name: "Glaive",
    desc: "{@attack m|str|10|1d10+str|slashing}",
    type: "action",
  },
  {
    name: "Greataxe",
    desc: "{@attack m|str|5|1d12+str|slashing}",
    type: "action",
  },
  {
    name: "Greatclub",
    desc: "{@attack m|str|5|1d8+str|bludgeoning}",
    type: "action",
  },
  {
    name: "Greatsword",
    desc: "{@attack m|str|5|2d6+str|slashing}",
    type: "action",
  },
  {
    name: "Halberd",
    desc: "{@attack m|str|10|1d10+str|slashing}",
    type: "action",
  },
  {
    name: "Handaxe",
    desc: "{@attack m,r|str|5;20/60|1d6+str|slashing}",
    type: "action",
  },
  {
    name: "Hand Crossbow",
    desc: "{@attack r|dex|30/120|1d6+dex|piercing}",
    type: "action",
  },
  {
    name: "Heavy Crossbow",
    desc: "{@attack r|dex|100/400|1d10+dex|piercing}",
    type: "action",
  },
  {
    name: "Javelin",
    desc: "{@attack m,r|str|5;30/120|1d6+str|piercing}",
    type: "action",
  },
  {
    name: "Lance",
    desc: "{@attack m|str|10|1d12+str|piercing}",
    type: "action",
  },
  {
    name: "Light Crossbow",
    desc: "{@attack r|dex|80/320|1d8+dex|piercing}",
    type: "action",
  },
  {
    name: "Light Hammer",
    desc: "{@attack m,r|str|5;20/60|1d4+str|bludgeoning}",
    type: "action",
  },
  {
    name: "Longbow",
    desc: "{@attack r|dex|150/600|1d8+dex|piercing}",
    type: "action",
  },
  {
    name: "Longsword",
    desc: "{@attack m|str|5|1d8+str|slashing} or {@damage 1d10 + str} slashing damage if used with two hands.",
    type: "action",
  },
  {
    name: "Mace",
    desc: "{@attack m|str|5|1d6+str|bludgeoning}",
    type: "action",
  },
  {
    name: "Maul",
    desc: "{@attack m|str|5|2d6+str|bludgeoning}",
    type: "action",
  },
  {
    name: "Morningstar",
    desc: "{@attack m|str|5|1d8+str|piercing}",
    type: "action",
  },
  {
    name: "Net",
    desc: "_Ranged Weapon Attack:_ {@hit dex} to hit, range 5/15 ft., one Large or smaller creature. _Hit:_ The target is restrained. A creature can use its action to make a DC 10 Strength check to free itself or another creature in a net, ending the effect on a success. Dealing 5 slashing damage to the net (AC 10) frees the target without harming it and destroys the net.",
    type: "action",
  },
  {
    name: "Pike",
    desc: "{@attack m|str|10|1d10+str|piercing}",
    type: "action",
  },
  {
    name: "Quarterstaff",
    desc: "{@attack m|str|5|1d6+str|bludgeoning} or {@damage 1d8 + str} bludgeoning damage if used with two hands.",
    type: "action",
  },
  {
    name: "Rapier (STR)",
    realname: "Rapier",
    desc: "{@attack m|str|5|1d8+str|piercing}",
    type: "action",
  },
  {
    name: "Rapier (DEX)",
    realname: "Rapier",
    desc: "{@attack m|dex|5|1d8+dex|piercing}",
    type: "action",
  },
  {
    name: "Scimitar (STR)",
    realname: "Scimitar",
    desc: "{@attack m|str|5|1d6+str|slashing}",
    type: "action",
  },
  {
    name: "Scimitar (DEX)",
    realname: "Scimitar",
    desc: "{@attack m|dex|5|1d6+dex|slashing}",
    type: "action",
  },
  {
    name: "Shortbow",
    desc: "{@attack r|dex|80/320|1d6+dex|piercing}",
    type: "action",
  },
  {
    name: "Shortsword (STR)",
    realname: "Shortsword",
    desc: "{@attack m|str|5|1d6+str|piercing}",
    type: "action",
  },
  {
    name: "Shortsword (DEX)",
    realname: "Shortsword",
    desc: "{@attack m|dex|5|1d6+dex|piercing}",
    type: "action",
  },
  {
    name: "Sickle",
    desc: "{@attack m|str|5|1d4+str|slashing}",
    type: "action",
  },
  {
    name: "Sling",
    desc: "{@attack r|dex|30/120|1d4+dex|bludgeoning}",
    type: "action",
  },
  {
    name: "Spear",
    desc: "{@attack m,r|str|5;20/60|1d6+str|piercing} or {@damage 1d8 + str} piercing damage if used with two hands to make a melee attack.",
    type: "action",
  },
  {
    name: "Trident",
    desc: "{@attack m,r|str|5;20/60|1d6+str|piercing} or {@damage 1d8 + str} piercing damage if used with two hands to make a melee attack.",
    type: "action",
  },
  {
    name: "Unarmed Strike",
    desc: "{@attack m|str|5|1+str|bludgeoning}",
    type: "action",
  },
  {
    name: "Warhammer",
    desc: "{@attack m|str|5|1d8+str|bludgeoning} or {@damage 1d10 + str} bludgeoning damage if used with two hands.",
    type: "action",
  },
  {
    name: "War Pick",
    desc: "{@attack m|str|5|1d8+str|piercing}",
    type: "action",
  },
  {
    name: "Whip (STR)",
    realname: "Whip",
    desc: "{@attack m|str|10|1d4+str|slashing}",
    type: "action",
  },
  {
    name: "Whip (DEX)",
    realname: "Whip",
    desc: "{@attack m|dex|10|1d4+dex|slashing}",
    type: "action",
  },
];

/** A preset ready to append to a feature field array. */
export interface FeaturePreset {
  /** Searchable label — the preset's disambiguated `name`. */
  label: string;
  /** Value written into the feature's `name` field (drops suffixes like "(STR)"). */
  name: string;
  /** Value written into the feature's `description` field. */
  description: string;
}

/** Presets for a given feature list, mapped onto the `{ name, description }` shape. */
export function getPresetsForType(type: PresetType): Array<FeaturePreset> {
  return ACTION_PRESETS.filter((p) => (p.type ?? "trait") === type).map((p) => ({
    label: p.name,
    name: p.realname ?? p.name,
    description: p.desc,
  }));
}
