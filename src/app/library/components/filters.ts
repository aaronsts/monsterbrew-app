import { CHALLENGE_RATINGS, CREATURE_TYPES } from "@/lib/constants";

// Ordered list of CR labels ("0", "1/8", …, "30"); the CR slider works on
// indices into this list so the non-linear low end stays evenly spaced.
export const CR_VALUES: string[] = CHALLENGE_RATINGS.map(
  (c) => c.challenge_rating,
);
export const CR_MAX = CR_VALUES.length - 1;

export const TYPE_OPTIONS = [
  { label: "All types", value: "all" },
  ...CREATURE_TYPES.map((t) => ({
    label: t.label,
    value: t.value.toLowerCase(),
  })),
];
