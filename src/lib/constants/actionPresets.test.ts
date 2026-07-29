import { describe, expect, it } from "vitest";
import { ACTION_PRESETS, getPresetsForType } from "./actionPresets";
import type { MarkupContext } from "@/lib/statblock-markup";
import {
  resolveMarkup,
  validateAttackArgs,
  validateSaveArgs,
} from "@/lib/statblock-markup";

/** A fully-specified creature so stat-linked tags resolve to real numbers. */
const ctx: MarkupContext = {
  name: "Test Beast",
  ability_scores: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 8 },
  cr: {
    challenge_rating: "5",
    proficiency_bonus: 3,
    hit_points_range: "",
    attack_bonus: 0,
    damage_per_round: "",
    save_dc: 0,
    experience: 0,
    armor_class: 0,
  },
};

/** Matches a legacy placeholder token like [MON], [STR ATK], or [STR 1D8]. */
const LEGACY_TOKEN = /\[[A-Z?]/;

describe("ACTION_PRESETS — native markup", () => {
  it("contains no legacy [MON]/[STR ATK]/[…] placeholder tokens", () => {
    for (const preset of ACTION_PRESETS) {
      expect(preset.desc, preset.name).not.toMatch(LEGACY_TOKEN);
    }
  });

  it("resolves every description to clean prose (no leaked {@ tags)", () => {
    for (const preset of ACTION_PRESETS) {
      expect(resolveMarkup(preset.desc, ctx), preset.name).not.toContain("{@");
    }
  });

  it("has valid args on every composite {@attack} / {@save} tag", () => {
    for (const preset of ACTION_PRESETS) {
      const attack = preset.desc.match(/\{@attack ([^}]*)\}/);
      if (attack) {
        expect(validateAttackArgs(attack[1]), preset.name).toEqual([]);
      }
      const save = preset.desc.match(/\{@save ([^}]*)\}/);
      if (save) {
        expect(validateSaveArgs(save[1]), preset.name).toEqual([]);
      }
    }
  });

  it("converts weapon attack lines to a single composite tag", () => {
    const club = ACTION_PRESETS.find((p) => p.name === "Club");
    expect(club?.desc).toBe("{@attack m|str|5|1d4+str|bludgeoning}");
    expect(resolveMarkup(club!.desc, ctx)).toBe(
      "Melee Attack Roll: +7, reach 5 ft. Hit: 6 (1d4 + 4) Bludgeoning damage.",
    );
  });

  it("keeps a melee-or-ranged weapon's dual distance", () => {
    const handaxe = ACTION_PRESETS.find((p) => p.name === "Handaxe");
    expect(handaxe?.desc).toBe("{@attack m,r|str|5;20/60|1d6+str|slashing}");
  });

  it("references the creature via {@mon} instead of hard-coded prose", () => {
    const multiattack = ACTION_PRESETS.find(
      (p) => p.name === "Multiattack (Action)",
    );
    expect(multiattack?.desc).toContain("{@mon}");
    expect(resolveMarkup(multiattack!.desc, ctx)).toContain("Test Beast");
  });
});

describe("getPresetsForType", () => {
  it("returns only trait-type presets for 'trait'", () => {
    const traits = getPresetsForType("trait");
    expect(traits.length).toBeGreaterThan(0);
    for (const t of traits) {
      const source = ACTION_PRESETS.find((p) => p.name === t.label);
      expect(source?.type ?? "trait").toBe("trait");
    }
  });

  it("inserts the realname, dropping the disambiguation suffix", () => {
    const actions = getPresetsForType("action");
    const dagger = actions.find((a) => a.label === "Dagger (STR)");
    expect(dagger?.name).toBe("Dagger");
    expect(dagger?.description).toBe("{@attack m,r|str|5;20/60|1d4+str|piercing}");
  });
});
