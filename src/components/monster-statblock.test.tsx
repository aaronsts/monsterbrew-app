import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MonsterStatblock } from "./monster-statblock";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

afterEach(cleanup);

function makeMonster(overrides: Partial<Monster>): Monster {
  return { ...defaultMonster, ...overrides };
}

describe("MonsterStatblock markup resolution", () => {
  it("resolves stat-linked action tags against the creature", () => {
    const monster = makeMonster({
      ability_scores: { ...defaultMonster.ability_scores, str: 20 },
      cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
      actions: [
        {
          name: "Slam",
          description:
            "{@atkr m} {@hit str}, reach 5 ft. {@h}{@damage 2d8 + str} bludgeoning damage.",
        },
      ],
    });

    const { container } = render(<MonsterStatblock creature={monster} />);
    // +5 STR + 4 PB = +9; damage avg 9 + 5 = 14.
    expect(container.textContent).toContain("Melee Attack Roll: +9");
    expect(container.textContent).toContain("Hit: 14 (2d8 + 5)");
    expect(container.textContent).not.toContain("{@");
  });

  it("recomputes when the ability score changes", () => {
    const base = makeMonster({
      cr: { ...defaultMonster.cr, proficiency_bonus: 4 },
      actions: [{ name: "Slam", description: "{@atkr m} {@hit str}" }],
    });

    const { container, rerender } = render(
      <MonsterStatblock creature={base} />,
    );
    expect(container.textContent).toContain("Melee Attack Roll: +4");

    rerender(
      <MonsterStatblock
        creature={{
          ...base,
          ability_scores: { ...base.ability_scores, str: 20 },
        }}
      />,
    );
    expect(container.textContent).toContain("Melee Attack Roll: +9");
  });
});
