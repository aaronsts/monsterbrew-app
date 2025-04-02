export const SKILLS = [
  { id: 1, skill_name: "acrobatics", skill_modifier: "dex" },
  { id: 2, skill_name: "animal handling", skill_modifier: "wis" },
  { id: 3, skill_name: "arcana", skill_modifier: "int" },
  { id: 4, skill_name: "athletics", skill_modifier: "str" },
  { id: 5, skill_name: "deception", skill_modifier: "cha" },
  { id: 6, skill_name: "history", skill_modifier: "int" },
  { id: 7, skill_name: "insight", skill_modifier: "wis" },
  { id: 8, skill_name: "intimidation", skill_modifier: "cha" },
  { id: 9, skill_name: "investigation", skill_modifier: "int" },
  { id: 10, skill_name: "medicine", skill_modifier: "wis" },
  { id: 11, skill_name: "nature", skill_modifier: "int" },
  { id: 12, skill_name: "perception", skill_modifier: "wis" },
  { id: 13, skill_name: "performance", skill_modifier: "cha" },
  { id: 14, skill_name: "persuasion", skill_modifier: "cha" },
  { id: 15, skill_name: "religion", skill_modifier: "int" },
  { id: 16, skill_name: "sleight of hand", skill_modifier: "dex" },
  { id: 17, skill_name: "stealth", skill_modifier: "dex" },
  { id: 18, skill_name: "survival", skill_modifier: "wis" },
] as const;

export type SkillModifier = "dex" | "wis" | "int" | "str" | "cha";
