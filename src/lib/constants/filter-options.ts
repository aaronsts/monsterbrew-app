import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import {
  CHALLENGE_RATINGS,
  CREATURE_SIZES,
  CREATURE_TYPES,
} from "@/lib/constants";

/**
 * Option lists shared by every creature filter UI — the library grid's
 * `FilterBar` and the editor launcher's SRD picker. They live here rather than
 * beside either consumer so the two cannot drift: both filter the same
 * `Monster` fields, and `fromSrd` stores `size`/`type` lowercased, which is why
 * every `value` is lowercased too.
 */

export interface FilterOption {
  label: string;
  value: string;
}

/** Ordered CR labels ("0", "1/8", …, "30"). */
export const CR_VALUES: Array<string> = CHALLENGE_RATINGS.map(
  (cr) => cr.challenge_rating,
);

export const crFilterLabel = (value: string): string => `CR ${value}`;

/** `"all"` is the "don't filter on this" sentinel for the single-selects. */
export const TYPE_OPTIONS: Array<FilterOption> = [
  { label: "All types", value: "all" },
  ...CREATURE_TYPES.map((type) => ({
    label: type.label,
    value: type.value.toLowerCase(),
  })),
];

export const SIZE_OPTIONS: Array<FilterOption> = [
  { label: "All sizes", value: "all" },
  ...CREATURE_SIZES.map((size) => ({
    label: size.label,
    value: size.value.toLowerCase(),
  })),
];

const KNOWN_CREATURE_TYPES = new Set(
  CREATURE_TYPES.map((type) => type.value.toLowerCase()),
);

export const CR_OPTIONS: Array<FilterOption> = [
  { label: "Any CR", value: "all" },
  ...CR_VALUES.map((value) => ({ label: crFilterLabel(value), value })),
];

/**
 * The `Badge` variant that colours a creature by its type.
 *
 * `Monster["type"]` is a plain string — the form's combobox offers the known
 * types, but imported creatures can carry anything — so unknown values fall
 * back to a neutral badge rather than producing an invalid variant.
 */
export function creatureTypeVariant(
  type: string,
): VariantProps<typeof badgeVariants>["variant"] {
  const value = type.toLowerCase();
  return KNOWN_CREATURE_TYPES.has(value)
    ? (value as VariantProps<typeof badgeVariants>["variant"])
    : "outline";
}

/** Where a creature in the editor's picker came from. */
export const SOURCE_OPTIONS: Array<FilterOption> = [
  { label: "All sources", value: "all" },
  { label: "My creatures", value: "personal" },
  { label: "SRD", value: "srd" },
];
