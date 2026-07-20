import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SkillsField } from "./skills-field";
import { renderWithForm } from "./test-utils";

describe("SkillsField", () => {
  it("renders a toggle button for every skill", () => {
    renderWithForm(<SkillsField />);
    // Each skill button is labelled "<skill>: not proficient" initially.
    expect(screen.getByRole("button", { name: /^stealth:/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /^arcana:/ })).toBeDefined();
    // 18 skills total.
    expect(
      screen.getAllByRole("button", { name: /: (not proficient|proficient|expert)$/ }),
    ).toHaveLength(18);
  });

  it("starts every skill as not proficient", () => {
    renderWithForm(<SkillsField />);
    expect(
      screen.getByRole("button", { name: "stealth: not proficient" }),
    ).toBeDefined();
  });

  it("cycles a skill proficient -> expert -> off on repeated clicks", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<SkillsField />);

    const getStealth = () =>
      screen.getByRole("button", { name: /^stealth:/ });

    await user.click(getStealth());
    expect(getForm().getValues("skills")).toEqual({ stealth: "proficient" });

    await user.click(getStealth());
    expect(getForm().getValues("skills")).toEqual({ stealth: "expert" });

    await user.click(getStealth());
    expect(getForm().getValues("skills")).toEqual({});
  });

  it("computes modifiers using proficiency and expertise", async () => {
    const user = userEvent.setup();
    // stealth uses dex; dex 14 -> +2, proficiency bonus 3.
    renderWithForm(<SkillsField />, {
      ability_scores: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
      cr: {
        challenge_rating: "0",
        proficiency_bonus: 3,
        hit_points_range: "1 - 6",
        attack_bonus: 3,
        damage_per_round: "0 - 1 ",
        save_dc: 13,
        experience: 10,
        armor_class: 13,
      },
    });

    const stealth = () => screen.getByRole("button", { name: /^stealth:/ });

    // proficient: +2 + 3 = +5
    await user.click(stealth());
    expect(stealth().textContent).toContain("+5");

    // expert: +2 + 2*3 = +8
    await user.click(stealth());
    expect(stealth().textContent).toContain("+8");
  });
});
