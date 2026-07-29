export const SKILLS = [
  {
    id: 1,
    skill_name: "acrobatics",
    label: "Acrobatics",
    skill_modifier: "dex",
  },
  {
    id: 2,
    skill_name: "animal handling",
    label: "Animal Handling",
    skill_modifier: "wis",
  },
  { id: 3, skill_name: "arcana", label: "Arcana", skill_modifier: "int" },
  { id: 4, skill_name: "athletics", label: "Athletics", skill_modifier: "str" },
  { id: 5, skill_name: "deception", label: "Deception", skill_modifier: "cha" },
  { id: 6, skill_name: "history", label: "History", skill_modifier: "int" },
  { id: 7, skill_name: "insight", label: "Insight", skill_modifier: "wis" },
  {
    id: 8,
    skill_name: "intimidation",
    label: "Intimidation",
    skill_modifier: "cha",
  },
  {
    id: 9,
    skill_name: "investigation",
    label: "Investigation",
    skill_modifier: "int",
  },
  { id: 10, skill_name: "medicine", label: "Medicine", skill_modifier: "wis" },
  { id: 11, skill_name: "nature", label: "Nature", skill_modifier: "int" },
  {
    id: 12,
    skill_name: "perception",
    label: "Perception",
    skill_modifier: "wis",
  },
  {
    id: 13,
    skill_name: "performance",
    label: "Performance",
    skill_modifier: "cha",
  },
  {
    id: 14,
    skill_name: "persuasion",
    label: "Persuasion",
    skill_modifier: "cha",
  },
  { id: 15, skill_name: "religion", label: "Religion", skill_modifier: "int" },
  {
    id: 16,
    skill_name: "sleight of hand",
    label: "Sleight of Hand",
    skill_modifier: "dex",
  },
  { id: 17, skill_name: "stealth", label: "Stealth", skill_modifier: "dex" },
  { id: 18, skill_name: "survival", label: "Survival", skill_modifier: "wis" },
] as const;

export type SkillModifier = "dex" | "wis" | "int" | "str" | "cha";
