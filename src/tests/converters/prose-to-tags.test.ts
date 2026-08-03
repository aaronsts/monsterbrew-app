import { describe, expect, it } from "vitest";
import type { MarkupContext } from "@/lib/statblock-markup";
import { resolveMarkup } from "@/lib/statblock-markup";
import { findChallengeRating } from "@/services/converters/monster-mappers";
import { proseToTags } from "@/services/converters/prose-to-tags";

function makeCtx(
  scores: Partial<MarkupContext["ability_scores"]>,
  cr = "10",
): MarkupContext {
  return {
    ability_scores: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
      ...scores,
    },
    cr: findChallengeRating(cr),
  };
}

// Aboleth: STR +5, INT/CHA +4, CON/WIS +2, DEX -1; CR 10 -> PB +4.
const aboleth = makeCtx(
  { str: 21, dex: 9, con: 15, int: 18, wis: 15, cha: 18 },
  "10",
);

describe("proseToTags — attack lines", () => {
  it("converts a full attack line to a composite {@attack} tag", () => {
    const prose =
      "Melee Attack Roll: +9, reach 15 ft. 12 (2d6 + 5) Bludgeoning damage. " +
      "If the target is a Large or smaller creature, it has the Grappled condition (escape DC 14).";
    expect(proseToTags(prose, aboleth)).toBe(
      "{@attack m|str|15|2d6 + 5|bludgeoning} " +
        "If the target is a Large or smaller creature, it has the Grappled condition (escape DC 14).",
    );
  });

  it("resolves back to the original prose plus the official Hit: label", () => {
    const prose =
      "Melee Attack Roll: +9, reach 15 ft. 12 (2d6 + 5) Bludgeoning damage.";
    expect(resolveMarkup(proseToTags(prose, aboleth), aboleth)).toBe(
      "Melee Attack Roll: +9, reach 15 ft. Hit: 12 (2d6 + 5) Bludgeoning damage.",
    );
  });

  it("handles melee-or-ranged lines with both distances", () => {
    // STR and DEX tie at +5; melee-capable attacks prefer STR.
    const ctx = makeCtx({ str: 16, dex: 16 }, "1");
    const prose =
      "Melee or Ranged Attack Roll: +5, reach 5 ft. or range 20/60 ft. 6 (1d6 + 3) Bludgeoning damage.";
    const converted = proseToTags(prose, ctx);
    expect(converted).toBe("{@attack m,r|str|5;20/60|1d6 + 3|bludgeoning}");
    expect(resolveMarkup(converted, ctx)).toBe(
      "Melee or Ranged Attack Roll: +5, reach 5 ft. or range 20/60 ft. Hit: 6 (1d6 + 3) Bludgeoning damage.",
    );
  });

  it("captures secondary damage and on-hit effect riders", () => {
    const prose =
      "Melee Attack Roll: +9, reach 5 ft. 12 (2d6 + 5) Slashing damage plus 4 (1d8) Acid damage, and the target has the Grappled condition.";
    const converted = proseToTags(prose, aboleth);
    expect(converted).toBe(
      "{@attack m|str|5|2d6 + 5|slashing|1d8|acid|the target has the Grappled condition}",
    );
    expect(resolveMarkup(converted, aboleth)).toBe(
      "Melee Attack Roll: +9, reach 5 ft. Hit: 12 (2d6 + 5) Slashing damage plus 4 (1d8) Acid damage, and the target has the Grappled condition.",
    );
  });

  it("handles flat damage with no dice", () => {
    // Rat-like: DEX +2 is the only +4 candidate.
    const ctx = makeCtx({ str: 6, dex: 14 }, "1/8");
    const prose = "Melee Attack Roll: +4, reach 5 ft. 1 Piercing damage.";
    expect(proseToTags(prose, ctx)).toBe("{@attack m|dex|5|1|piercing}");
  });

  it("keeps the to-hit flat when several abilities tie without a convention", () => {
    // WIS and CHA tie at +5 and neither STR nor DEX matches.
    const ctx = makeCtx({ wis: 16, cha: 16 }, "1");
    const prose = "Ranged Attack Roll: +5, range 60 ft. 7 (2d6) Fire damage.";
    expect(proseToTags(prose, ctx)).toBe("{@attack r|5|60|2d6|fire}");
  });

  it("falls back to atomic tags when the line carries extra prose", () => {
    // "to hit" is an upstream quirk the composite grammar can't hold.
    const ctx = makeCtx({ str: 30 }, "24");
    const prose =
      "Melee Attack Roll: +17 to hit, reach 15 ft. 19 (2d8 + 10) Slashing damage plus 9 (2d8) Fire damage.";
    expect(proseToTags(prose, ctx)).toBe(
      "{@atkr m} {@hit str} to hit, reach 15 ft. {@damage 2d8 + 10} Slashing damage plus {@damage 2d8} Fire damage.",
    );
  });
});

describe("proseToTags — saving throws", () => {
  it("converts a full save line to a composite {@save} tag", () => {
    const prose =
      "Intelligence Saving Throw: DC 16, one creature within 30 feet that is Charmed or Grappled by the aboleth. " +
      "Failure: 10 (3d6) Psychic damage. Success: Half damage. " +
      "Failure or Success: The aboleth gains the target's memories.";
    const converted = proseToTags(prose, aboleth);
    expect(converted).toBe(
      "{@save int|int|3d6|psychic|half|one creature within 30 feet that is Charmed or Grappled by the aboleth||The aboleth gains the target's memories}",
    );
    expect(resolveMarkup(converted, aboleth)).toBe(prose);
  });

  it("suppresses the default half-damage success when the prose has none", () => {
    const prose =
      "Constitution Saving Throw: DC 14, each creature in a 30-foot Cone. Failure: 21 (6d6) Fire damage.";
    const converted = proseToTags(prose, aboleth);
    expect(converted).toBe(
      "{@save con|con|6d6|fire|none|each creature in a 30-foot Cone}",
    );
    expect(resolveMarkup(converted, aboleth)).toBe(prose);
  });

  it("links the DC to a different ability when it is the single candidate", () => {
    // Blue-dragon style: DEX save, but only CON (+6, PB +5) produces DC 19.
    const ctx = makeCtx({ con: 23 }, "16");
    const prose =
      "Dexterity Saving Throw: DC 19, each creature in a 90-foot-long, 5-foot-wide Line. " +
      "Failure: 60 (11d10) Lightning damage. Success: Half damage.";
    expect(proseToTags(prose, ctx)).toBe(
      "{@save dex|con|11d10|lightning|half|each creature in a 90-foot-long, 5-foot-wide Line}",
    );
  });

  it("keeps the DC flat when several abilities could source it", () => {
    // DC 16 matches INT and CHA (+4 each) but not the named WIS.
    const prose =
      "Wisdom Saving Throw: DC 16, one creature. Failure: The target has the Charmed condition.";
    expect(proseToTags(prose, aboleth)).toBe(
      "{@save wis|16||||one creature|The target has the Charmed condition}",
    );
  });

  it("preserves custom success text", () => {
    const prose =
      "Constitution Saving Throw: DC 14, one creature. Failure: 10 (3d6) Poison damage. Success: Half damage only.";
    expect(proseToTags(prose, aboleth)).toBe(
      "{@save con|con|3d6|poison|Half damage only|one creature}",
    );
  });

  it("falls back to an atomic {@dc} when the head carries extra prose", () => {
    // Djinni-style parenthetical breaks the composite grammar.
    const ctx = makeCtx({ str: 21 }, "11");
    const prose =
      "Strength Saving Throw: DC 17 (a creature makes this save only once per turn). Failure: 8 (1d8 + 4) Thunder damage.";
    expect(proseToTags(prose, ctx)).toBe(
      "Strength Saving Throw: {@dc str} (a creature makes this save only once per turn). Failure: {@damage 1d8 + 4} Thunder damage.",
    );
  });

  it("leaves the whole line alone when nothing can be verified", () => {
    // DC 15 matches no ability (all +0, PB +2) and pipes poison the target slot.
    const ctx = makeCtx({}, "1");
    const prose =
      "Dexterity Saving Throw: DC 15, each creature in a 10-foot-radius Sphere [Area of Effect]|XPHB|Sphere centered on a point within 30 feet. Failure: 7 (2d6) Acid damage.";
    expect(proseToTags(prose, ctx)).toBe(
      "Dexterity Saving Throw: DC 15, each creature in a 10-foot-radius Sphere [Area of Effect]|XPHB|Sphere centered on a point within 30 feet. Failure: {@damage 2d6} Acid damage.",
    );
  });
});

describe("proseToTags — damage and pass-through", () => {
  it("tags verifiable damage clauses in plain prose", () => {
    const prose =
      "The creature regains 10 (3d6) Hit Points at the start of its turn.";
    expect(proseToTags(prose, aboleth)).toBe(
      "The creature regains {@damage 3d6} Hit Points at the start of its turn.",
    );
  });

  it("leaves damage clauses whose printed average is wrong", () => {
    const prose = "The target takes 12 (3d6) Fire damage.";
    expect(proseToTags(prose, aboleth)).toBe(prose);
  });

  it("passes tag-free prose through unchanged", () => {
    const prose = "The aboleth can breathe air and water.";
    expect(proseToTags(prose, aboleth)).toBe(prose);
    expect(proseToTags("", aboleth)).toBe("");
  });

  it("is idempotent on already-tagged text", () => {
    const tagged =
      "{@attack m|str|15|2d6 + 5|bludgeoning} If the target is Large, it is Grappled.";
    expect(proseToTags(tagged, aboleth)).toBe(tagged);
  });
});
