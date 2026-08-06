import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MonsterStatblock } from "./monster-statblock";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

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

  it("lists nonmagical attack modifiers under resistances and immunities", () => {
    const monster = makeMonster({
      nonmagical_attack_modifiers: {
        nonmagical: "resistant",
        silvered: "immune",
      },
    });

    const { container } = render(<MonsterStatblock creature={monster} />);
    expect(container.textContent).toContain("nonmagical attacks");
    expect(container.textContent).toContain("nonsilvered attacks");
  });

  it("renders without crashing when CR is cleared mid-edit", () => {
    const monster = makeMonster({
      cr: null as unknown as Monster["cr"],
      actions: [{ name: "Slam", description: "{@atkr m} {@hit str}" }],
    });

    const { container } = render(<MonsterStatblock creature={monster} />);
    expect(container.textContent).toContain("CR 0");
  });

  it("shows the subtype in the header line when set", () => {
    const monster = makeMonster({
      size: "medium",
      type: "humanoid",
      sub_type: "goblinoid",
      alignment: "chaotic evil",
    });

    const { container } = render(<MonsterStatblock creature={monster} />);
    expect(container.textContent).toContain(
      "medium humanoid (goblinoid), chaotic evil",
    );
  });

  it("uses the manual initiative bonus over the DEX modifier when set", () => {
    const base = makeMonster({
      ability_scores: { ...defaultMonster.ability_scores, dex: 16 },
    });

    const { container, rerender } = render(
      <MonsterStatblock creature={base} />,
    );
    expect(container.textContent).toContain("Initiative +3 (13)");

    rerender(
      <MonsterStatblock
        creature={{ ...base, custom_initiative: true, initiative_bonus: 7 }}
      />,
    );
    expect(container.textContent).toContain("Initiative +7 (17)");
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
