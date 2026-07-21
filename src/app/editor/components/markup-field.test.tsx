import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
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

/** Controlled wrapper so typing actually updates the field value. */
function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <MarkupField value={value} onChange={setValue} ctx={ctx} />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("MarkupField", () => {
  it("opens an autocomplete when the user types {@ and inserts on select", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const textarea = screen.getByRole("textbox");
    // `{{` types a literal `{` in userEvent's keyboard syntax.
    await user.type(textarea, "{{@hit");

    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeDefined();
    await user.click(screen.getByRole("option", { name: /To hit/i }));

    expect(screen.getByTestId("value").textContent).toBe("{@hit str} ");
  });

  it("keyboard-navigates and accepts a suggestion with Enter", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "{{@atkr");
    await screen.findByRole("listbox");
    // First option is "Melee attack roll"; Enter accepts it.
    await user.type(textarea, "{Enter}");

    expect(screen.getByTestId("value").textContent).toBe("{@atkr m} ");
  });

  it("reference list inserts a tag on click", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText(/Tag reference/i));
    await user.click(screen.getByRole("button", { name: /\{@recharge 5\}/ }));

    expect(screen.getByTestId("value").textContent).toBe("{@recharge 5}");
  });

  it("shows a live preview once the value contains a tag", () => {
    render(<Harness initial="{@atkr m} {@hit str}" />);
    // +5 STR + 4 PB
    expect(screen.getByText(/Melee Attack Roll: \+9/)).toBeDefined();
  });
});
