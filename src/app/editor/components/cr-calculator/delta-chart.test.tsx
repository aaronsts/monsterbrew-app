import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithForm } from "../test-utils";
import { DeltaChart, deltaChartData } from "./delta-chart";
import { setCrSuggestionsEnabled } from "./use-cr-suggestions-enabled";
import type { Monster } from "@/schema/monster-schema";
import { compareToCr } from "@/lib/cr-calculator";
import { defaultMonster } from "@/schema/monster-schema";

const cr5: Monster["cr"] = {
  ...defaultMonster.cr,
  challenge_rating: "5",
  proficiency_bonus: 3,
};

beforeEach(() => setCrSuggestionsEnabled(true));

function comparisonFor(overrides: Partial<Monster>) {
  const comparison = compareToCr({
    cr: cr5,
    armor_class: 15,
    hit_points: "95",
    hit_dice: "",
    size: "medium",
    custom_hp: true,
    ability_scores: defaultMonster.ability_scores,
    name: "Test Beast",
    traits: [],
    actions: [],
    is_legendary: false,
    legendary_actions: [],
    ...overrides,
  });
  expect(comparison).not.toBeNull();
  return comparison!;
}

describe("deltaChartData", () => {
  it("normalizes each stat to tolerance units", () => {
    // AC 17 vs 15 ± 1 -> +2 tolerance units; HP 71 vs 95 ± 24 -> exactly -1.
    const data = deltaChartData(
      comparisonFor({ armor_class: 17, hit_points: "71" }),
    );
    const byStat = Object.fromEntries(data.map((d) => [d.stat, d]));
    expect(byStat["Armor class"].delta).toBe(2);
    expect(byStat["Hit points"].delta).toBe(-1);
  });

  it("clamps extreme deltas to the ±3 domain edge", () => {
    // AC 40 vs 15 ± 1 -> +25 raw; HP 1 vs 95 ± 24 -> -3.9 raw.
    const data = deltaChartData(
      comparisonFor({ armor_class: 40, hit_points: "1" }),
    );
    const byStat = Object.fromEntries(data.map((d) => [d.stat, d]));
    expect(byStat["Armor class"].delta).toBe(3);
    expect(byStat["Hit points"].delta).toBe(-3);
  });

  it("charts the four always-readable stats", () => {
    const data = deltaChartData(comparisonFor({}));
    expect(data.map((d) => d.stat)).toEqual([
      "Atk. bonus",
      "Armor class",
      "Save DC",
      "Hit points",
    ]);
  });

  it("adds damage per round once the actions carry damage tags", () => {
    const data = deltaChartData(
      comparisonFor({
        actions: [
          { name: "Claw", description: "{@attack m|str|5|2d6 + 2|slashing}" },
        ],
      }),
    );
    // 9 damage against the CR 5 budget of 35 ± 9 -> -26/9 tolerance units.
    expect(data.at(-1)?.stat).toBe("Dmg/round");
    expect(data.at(-1)?.delta).toBeCloseTo(-26 / 9);
  });
});

describe("DeltaChart", () => {
  it("starts collapsed and reveals the chart when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderWithForm(<DeltaChart />, { cr: cr5 });

    const trigger = screen.getByText("Benchmark deltas");
    expect(screen.queryByText(/within ±1 counts as on par/)).toBeNull();

    await user.click(trigger);
    expect(screen.getByText(/within ±1 counts as on par/)).toBeTruthy();
  });

  it("renders nothing when the CR has no benchmark row", () => {
    renderWithForm(<DeltaChart />, {
      cr: { ...defaultMonster.cr, challenge_rating: "" },
    });
    expect(screen.queryByText("Benchmark deltas")).toBeNull();
  });
});
