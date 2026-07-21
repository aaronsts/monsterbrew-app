import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarkupField } from "./markup-field";
import type { MarkupContext } from "@/lib/statblock-markup";

afterEach(cleanup);

const ctx: MarkupContext = {
  ability_scores: { str: 20, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  cr: {
    challenge_rating: "5",
    proficiency_bonus: 4,
    hit_points_range: "",
    attack_bonus: 0,
    damage_per_round: "",
    save_dc: 0,
    experience: 0,
    armor_class: 0,
  },
};

describe("MarkupField", () => {
  it("opens the insert menu without crashing and inserts a tag", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MarkupField value="" onChange={onChange} ctx={ctx} />,
    );

    await user.click(screen.getByRole("button", { name: /insert stat tag/i }));

    // Menu opened (GroupLabel used to crash here when not inside a Group).
    const item = await screen.findByText("Melee attack roll");
    await user.click(item);

    expect(onChange).toHaveBeenCalledWith("{@atkr m} ");
  });

  it("shows a live preview once the value contains a tag", () => {
    render(
      <MarkupField value="{@atkr m} {@hit str}" onChange={vi.fn()} ctx={ctx} />,
    );
    // +5 STR + 4 PB
    expect(screen.getByText(/Melee Attack Roll: \+9/)).toBeDefined();
  });
});
