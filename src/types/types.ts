export interface Option {
  value: string;
  label: string;
}

export const DAMAGE_TYPES = [
  "acid",
  "bludgeoning",
  "cold",
  "fire",
  "force",
  "lightning",
  "necrotic",
  "piercing",
  "poison",
  "psychic",
  "radiant",
  "slashing",
  "thunder",
] as const;

export const CONDITIONS = [
  {
    label: "Blinded",
    value: "blinded",
  },
  {
    label: "Charmed",
    value: "charmed",
  },
  {
    label: "Deafened",
    value: "deafened",
  },
  {
    label: "Frightened",
    value: "frightened",
  },
  {
    label: "Grappled",
    value: "grappled",
  },
  {
    label: "Incapacitated",
    value: "incapacitated",
  },
  {
    label: "Invisible",
    value: "invisible",
  },
  {
    label: "Paralyzed",
    value: "paralyzed",
  },
  {
    label: "Petrified",
    value: "petrified",
  },
  {
    label: "Poisoned",
    value: "poisoned",
  },
  {
    label: "Prone",
    value: "prone",
  },
  {
    label: "Restrained",
    value: "restrained",
  },
  {
    label: "Stunned",
    value: "stunned",
  },
  {
    label: "Unconscious",
    value: "unconscious",
  },
  {
    label: "Exhaustion",
    value: "exhaustion",
  },
] as const;
