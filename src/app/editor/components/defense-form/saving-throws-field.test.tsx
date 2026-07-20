import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SavingThrowsField } from "./saving-throws-field";
import { renderWithForm } from "./test-utils";

const crWithProfBonus = (proficiency_bonus: number) => ({
  challenge_rating: "0",
  proficiency_bonus,
  hit_points_range: "1 - 6",
  attack_bonus: 3,
  damage_per_round: "0 - 1 ",
  save_dc: 13,
  experience: 10,
  armor_class: 13,
});

describe("SavingThrowsField", () => {
  it("renders a checkbox for each of the six abilities", () => {
    renderWithForm(<SavingThrowsField />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(6);
    for (const ability of ["str", "dex", "con", "int", "wis", "cha"]) {
      expect(screen.getByRole("checkbox", { name: ability })).toBeDefined();
    }
  });

  it("shows the base ability modifier when the save is not proficient", () => {
    renderWithForm(<SavingThrowsField />, {
      ability_scores: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
    });
    // dex 14 -> +2, with no proficiency added
    expect(screen.getByText("+2")).toBeDefined();
  });

  it("adds the proficiency bonus to the modifier when checked", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<SavingThrowsField />, {
      ability_scores: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
      cr: crWithProfBonus(3),
    });

    await user.click(screen.getByRole("checkbox", { name: "dex" }));

    // dex 14 (+2) + proficiency 3 = +5
    expect(getForm().getValues("saving_throws.dex")).toBe(true);
    expect(screen.getByText("+5")).toBeDefined();
  });

  it("toggles the saving throw off again on a second click", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<SavingThrowsField />);
    const con = screen.getByRole("checkbox", { name: "con" });

    await user.click(con);
    expect(getForm().getValues("saving_throws.con")).toBe(true);

    await user.click(con);
    expect(getForm().getValues("saving_throws.con")).toBe(false);
  });
});
