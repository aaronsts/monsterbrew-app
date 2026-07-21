import { CHALLENGE_RATINGS, CREATURE_TYPES } from "@/lib/constants";

// Ordered list of CR labels ("0", "1/8", …, "30").
export const CR_VALUES: Array<string> = CHALLENGE_RATINGS.map(
  (c) => c.challenge_rating,
);

// Items for the CR filter multi-select combobox. An empty selection means
// "any CR" (no filter), so there is no explicit sentinel option.
export const CR_FILTER_ITEMS: Array<string> = CR_VALUES;

export const crFilterLabel = (value: string): string => `CR ${value}`;

export const TYPE_OPTIONS = [
  { label: "All types", value: "all" },
  ...CREATURE_TYPES.map((t) => ({
    label: t.label,
    value: t.value.toLowerCase(),
  })),
];
