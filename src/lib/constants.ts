export const CREATURE_TYPES = [
  {
    label: "Aberration",
    value: "aberration",
    description:
      "Aberrations are utterly alien beings. Many of them have innate magical abilities drawn from the creature’s alien mind rather than the mystical forces of the world. The quintessential aberrations are aboleths, beholders, mind flayers, and slaadi.",
  },
  {
    label: "Beast",
    value: "beast",
    description:
      "Beasts are non-humanoid creatures that are a natural part of the fantasy ecology. Some of them have magical powers, but most are unintelligent and lack any society or language. Beasts include all varieties of ordinary animals, dinosaurs, and giant versions of animals.",
  },
  {
    label: "Celestial",
    value: "Celestial",
    description:
      "Celestials are creatures native to the Upper Planes. Many of them are the servants of deities, employed as messengers or agents in the mortal realm and throughout the planes. Celestials are good by nature, so the exceptional celestial who strays from a good alignment is a horrifying rarity. Celestials include angels, couatls, and pegasi.",
  },
  {
    label: "Construct",
    value: "construct",
    description:
      "Constructs are made, not born. Some are programmed by their creators to follow a simple set of instructions, while others are imbued with sentience and capable of independent thought. Golems are the iconic constructs. Many creatures native to the outer plane of Mechanus, such as modrons, are constructs shaped from the raw material of the plane by the will of more powerful creatures.",
  },
  {
    label: "Dragon",
    value: "dragon",
    description:
      "Dragons are large reptilian creatures of ancient origin and tremendous power. True dragons, including the good metallic dragons and the evil chromatic dragons, are highly intelligent and have innate magic. Also in this category are creatures distantly related to true dragons, but less powerful, less intelligent, and less magical, such as wyverns and pseudodragons.",
  },
  {
    label: "Elemental",
    value: "elemental",
    description:
      "Elementals are creatures native to the elemental planes. Some creatures of this type are little more than animate masses of their respective elements, including the creatures simply called elementals. Others have biological forms infused with elemental energy. The races of genies, including djinn and efreet, form the most important civilizations on the elemental planes. Other elemental creatures include azers and invisible stalkers.",
  },
  {
    label: "Fey",
    value: "fey",
    description:
      "Fey are magical creatures closely tied to the forces of nature. They dwell in twilight groves and misty forests. In some worlds, they are closely tied to the Feywild, also called the Plane of Faerie. Some are also found in the Outer Planes, particularly the planes of Arborea and the Beastlands. Fey include dryads, pixies, and satyrs.",
  },
  {
    label: "Fiend",
    value: "fiend",
    description:
      "Fiends are creatures of wickedness that are native to the Lower Planes. A few are the servants of deities, but many more labor under the leadership of arch-devils and demon princes. Evil priests and mages sometimes summon fiends to the material world to do their bidding. If an evil celestial is a rarity, a good fiend is almost inconceivable. Fiends include demons, devils, hell hounds, rakshasas, and yugoloths.",
  },
  {
    label: "Giant",
    value: "giant",
    description:
      "Giants tower over humans and their kind. They are humanlike in shape, though some have multiple heads (ettins) or deformities (fomorians). The six varieties of true giant are hill giants, stone giants, frost giants, fire giants, cloud giants, and storm giants. Besides these, creatures such as ogres and trolls are giants.",
  },
  {
    label: "Humanoid",
    value: "humanoid",
    description:
      "Humanoids are the main peoples of a fantasy gaming world, both civilized and savage, including humans and a tremendous variety of other species. They have language and culture, few if any innate magical abilities (though most humanoids can learn spellcasting), and a bipedal form. The most common humanoid races are the ones most suitable as player characters: humans, dwarves, elves, and halflings. Almost as numerous but far more savage and brutal, and almost uniformly evil, are the races of goblinoids (goblins, hobgoblins, and bugbears), orcs, gnolls, lizardfolk, and kobolds.",
  },
  {
    label: "Monstrosity",
    value: "monstrosity",
    description:
      "Monstrosities are monsters in the strictest sense—frightening creatures that are not ordinary, not truly natural, and almost never benign. Some are the results of magical experimentation gone awry (such as owlbears), and others are the product of terrible curses (including minotaurs and yuan-­‐‑ti). They defy categorization, and in some sense serve as a catch-­‐‑all category for creatures that don’t fit into any other type.",
  },
  {
    label: "Ooze",
    value: "ooze",
    description:
      "Oozes are gelatinous creatures that rarely have a fixed shape. They are mostly subterranean, dwelling in caves and dungeons and feeding on refuse, carrion, or creatures unlucky enough to get in their way. Black puddings and gelatinous cubes are among the most recognizable oozes.",
  },
  {
    label: "Plant",
    value: "plant",
    description:
      "Plants in this context are vegetable creatures, not ordinary flora. Most of them are ambulatory, and some are carnivorous. The quintessential plants are the shambling mound and the treant. Fungal creatures such as the gas spore and the myconid also fall into this category.",
  },
  {
    label: "Undead",
    value: "undead",
    description:
      "Undead are once-living creatures brought to a horrifying state of undead through the practice of necromantic magic or some unholy curse. Undead include walking corpses, such as vampires and zombies, as well as bodiless spirits, such as ghosts and specters.",
  },
] as const;

export const CREATURE_SIZES = [
  {
    id: 1,
    label: "tiny",
    value: "Tiny",
    hit_dice: 4,
  },
  {
    id: 2,
    label: "small",
    value: "Small",
    hit_dice: 6,
  },
  {
    id: 3,
    label: "medium",
    value: "Medium",
    hit_dice: 8,
  },
  {
    id: 4,
    label: "large",
    value: "Large",
    hit_dice: 10,
  },
  {
    id: 5,
    label: "huge",
    value: "Huge",
    hit_dice: 12,
  },
  {
    id: 6,
    label: "gargantuan",
    value: "Gargantuan",
    hit_dice: 20,
  },
  {
    id: 7,
    label: "titanic",
    value: "Titanic",
    hit_dice: 20,
  },
] as const;

export const CHALLENGE_RATINGS = [
  {
    challenge_rating: "0",
    proficiency_bonus: 3,
    hit_points_range: "1 - 6",
    attack_bonus: 3,
    damage_per_round: "0 - 1 ",
    save_dc: 13,
    experience: 10,
    armor_class: 13,
  },
  {
    challenge_rating: "1/8",
    proficiency_bonus: 2,
    hit_points_range: "7 - 35",
    attack_bonus: 3,
    damage_per_round: "2 - 3",
    save_dc: 13,
    experience: 25,
    armor_class: 13,
  },
  {
    challenge_rating: "1/4",
    proficiency_bonus: 2,
    hit_points_range: "36 - 49",
    attack_bonus: 3,
    damage_per_round: "4 - 5",
    save_dc: 13,
    experience: 50,
    armor_class: 13,
  },
  {
    challenge_rating: "1/2",
    proficiency_bonus: 2,
    hit_points_range: "50 - 70",
    attack_bonus: 3,
    damage_per_round: "6 - 8",
    save_dc: 13,
    experience: 100,
    armor_class: 13,
  },
  {
    challenge_rating: "1",
    proficiency_bonus: 2,
    hit_points_range: "71 - 85",
    attack_bonus: 3,
    damage_per_round: "9 - 14",
    save_dc: 13,
    experience: 200,
    armor_class: 13,
  },
  {
    challenge_rating: "2",
    proficiency_bonus: 2,
    hit_points_range: "86 - 100",
    attack_bonus: 3,
    damage_per_round: "15 - 20",
    save_dc: 13,
    experience: 450,
    armor_class: 13,
  },
  {
    challenge_rating: "3",
    proficiency_bonus: 2,
    hit_points_range: "101 - 115",
    attack_bonus: 4,
    damage_per_round: "21 - 26",
    save_dc: 13,
    experience: 700,
    armor_class: 13,
  },
  {
    challenge_rating: "4",
    proficiency_bonus: 2,
    hit_points_range: "116 - 130",
    attack_bonus: 5,
    damage_per_round: "27 - 32",
    save_dc: 14,
    experience: 1100,
    armor_class: 14,
  },
  {
    challenge_rating: "5",
    proficiency_bonus: 3,
    hit_points_range: "131 - 145",
    attack_bonus: 6,
    damage_per_round: "33 - 38",
    save_dc: 15,
    experience: 1800,
    armor_class: 15,
  },
  {
    challenge_rating: "6",
    proficiency_bonus: 3,
    hit_points_range: "146 - 160",
    attack_bonus: 6,
    damage_per_round: "39 - 44",
    save_dc: 15,
    experience: 2300,
    armor_class: 15,
  },
  {
    challenge_rating: "7",
    proficiency_bonus: 3,
    hit_points_range: "161 - 175",
    attack_bonus: 6,
    damage_per_round: "45 - 50",
    save_dc: 15,
    experience: 2900,
    armor_class: 15,
  },
  {
    challenge_rating: "8",
    proficiency_bonus: 3,
    hit_points_range: "176 - 190",
    attack_bonus: 7,
    damage_per_round: "51 - 56",
    save_dc: 16,
    experience: 3900,
    armor_class: 16,
  },
  {
    challenge_rating: "9",
    proficiency_bonus: 4,
    hit_points_range: "191 - 205",
    attack_bonus: 7,
    damage_per_round: "57 - 62",
    save_dc: 16,
    experience: 5000,
    armor_class: 16,
  },
  {
    challenge_rating: "10",
    proficiency_bonus: 4,
    hit_points_range: "206 - 220",
    attack_bonus: 7,
    damage_per_round: "63 - 68",
    save_dc: 16,
    experience: 5900,
    armor_class: 17,
  },
  {
    challenge_rating: "11",
    proficiency_bonus: 4,
    hit_points_range: "221 - 235",
    attack_bonus: 8,
    damage_per_round: "69 - 74",
    save_dc: 17,
    experience: 7200,
    armor_class: 17,
  },
  {
    challenge_rating: "12",
    proficiency_bonus: 4,
    hit_points_range: "236 - 250",
    attack_bonus: 8,
    damage_per_round: "75 - 80",
    save_dc: 18,
    experience: 8400,
    armor_class: 17,
  },
  {
    challenge_rating: "13",
    proficiency_bonus: 5,
    hit_points_range: "251 - 265",
    attack_bonus: 8,
    damage_per_round: "81 - 86",
    save_dc: 18,
    experience: 10000,
    armor_class: 18,
  },
  {
    challenge_rating: "14",
    proficiency_bonus: 5,
    hit_points_range: "266 - 280",
    attack_bonus: 8,
    damage_per_round: "87 - 92",
    save_dc: 18,
    experience: 11500,
    armor_class: 18,
  },
  {
    challenge_rating: "15",
    proficiency_bonus: 5,
    hit_points_range: "281 - 295",
    attack_bonus: 8,
    damage_per_round: "93 - 98",
    save_dc: 18,
    experience: 13000,
    armor_class: 18,
  },
  {
    challenge_rating: "16",
    proficiency_bonus: 5,
    hit_points_range: "296 - 310",
    attack_bonus: 9,
    damage_per_round: "99 - 104",
    save_dc: 18,
    experience: 15000,
    armor_class: 18,
  },
  {
    challenge_rating: "17",
    proficiency_bonus: 6,
    hit_points_range: "311 - 325",
    attack_bonus: 10,
    damage_per_round: "105 - 110",
    save_dc: 19,
    experience: 18000,
    armor_class: 19,
  },
  {
    challenge_rating: "18",
    proficiency_bonus: 6,
    hit_points_range: "326 - 340",
    attack_bonus: 10,
    damage_per_round: "111 - 116",
    save_dc: 19,
    experience: 20000,
    armor_class: 19,
  },
  {
    challenge_rating: "19",
    proficiency_bonus: 6,
    hit_points_range: "341 - 355",
    attack_bonus: 10,
    damage_per_round: "117 - 122",
    save_dc: 19,
    experience: 22000,
    armor_class: 19,
  },
  {
    challenge_rating: "20",
    proficiency_bonus: 6,
    hit_points_range: "356 - 400",
    attack_bonus: 10,
    damage_per_round: "123 - 140",
    save_dc: 19,
    experience: 25000,
    armor_class: 19,
  },
  {
    challenge_rating: "21",
    proficiency_bonus: 7,
    hit_points_range: "401 - 445",
    attack_bonus: 11,
    damage_per_round: "141 - 158",
    save_dc: 20,
    experience: 33000,
    armor_class: 19,
  },
  {
    challenge_rating: "22",
    proficiency_bonus: 7,
    hit_points_range: "446 - 490",
    attack_bonus: 11,
    damage_per_round: "159 - 176",
    save_dc: 20,
    experience: 41000,
    armor_class: 19,
  },
  {
    challenge_rating: "23",
    proficiency_bonus: 7,
    hit_points_range: "491 - 535",
    attack_bonus: 11,
    damage_per_round: "177 - 194",
    save_dc: 20,
    experience: 50000,
    armor_class: 19,
  },
  {
    challenge_rating: "24",
    proficiency_bonus: 7,
    hit_points_range: "536 - 580",
    attack_bonus: 12,
    damage_per_round: "195 - 212",
    save_dc: 21,
    experience: 62000,
    armor_class: 19,
  },
  {
    challenge_rating: "25",
    proficiency_bonus: 8,
    hit_points_range: "581 - 625",
    attack_bonus: 12,
    damage_per_round: "213 - 230",
    save_dc: 21,
    experience: 75000,
    armor_class: 19,
  },
  {
    challenge_rating: "26",
    proficiency_bonus: 8,
    hit_points_range: "626 - 670",
    attack_bonus: 12,
    damage_per_round: "231 - 248",
    save_dc: 21,
    experience: 90000,
    armor_class: 19,
  },
  {
    challenge_rating: "27",
    proficiency_bonus: 8,
    hit_points_range: "671 - 715",
    attack_bonus: 13,
    damage_per_round: "249 - 266",
    save_dc: 22,
    experience: 105000,
    armor_class: 19,
  },
  {
    challenge_rating: "28",
    proficiency_bonus: 8,
    hit_points_range: "716 - 760",
    attack_bonus: 13,
    damage_per_round: "267 - 284",
    save_dc: 22,
    experience: 120000,
    armor_class: 19,
  },
  {
    challenge_rating: "29",
    proficiency_bonus: 9,
    hit_points_range: "760 - 805",
    attack_bonus: 13,
    damage_per_round: "285 - 302",
    save_dc: 22,
    experience: 135000,
    armor_class: 19,
  },
  {
    challenge_rating: "30",
    proficiency_bonus: 9,
    hit_points_range: "805 - 850",
    attack_bonus: 14,
    damage_per_round: "303 - 320",
    save_dc: 23,
    experience: 155000,
    armor_class: 19,
  },
] as const;
