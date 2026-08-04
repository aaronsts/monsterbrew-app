import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithForm } from "../test-utils";
import { setCrSuggestionsEnabled } from "./use-cr-suggestions-enabled";
import { CrAbilityHint, CrDamageHint, CrStatHint } from "./field-hint";
import { CrSuggestionsToggle } from "./cr-suggestions-toggle";
import { CrCalculator } from ".";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

/** Real CR 5: PB +3; benchmark AC/DC 15, HP 95 (71–119). */
const cr5: Monster["cr"] = {
  ...defaultMonster.cr,
  challenge_rating: "5",
  proficiency_bonus: 3,
};

beforeEach(() => setCrSuggestionsEnabled(true));

describe("CrStatHint", () => {
  it("classifies AC against the benchmark", () => {
    renderWithForm(<CrStatHint stat="ac" />, { cr: cr5, armor_class: 15 });
    expect(screen.getByText("On par")).toBeTruthy();
  });

  it("flags a high AC", () => {
    renderWithForm(<CrStatHint stat="ac" />, { cr: cr5, armor_class: 18 });
    expect(screen.getByText("High")).toBeTruthy();
  });

  it("flags a low AC", () => {
    renderWithForm(<CrStatHint stat="ac" />, { cr: cr5, armor_class: 12 });
    expect(screen.getByText("Low")).toBeTruthy();
  });

  it("classifies HP using the statblock's own derivation", () => {
    renderWithForm(<CrStatHint stat="hp" />, {
      cr: cr5,
      custom_hp: true,
      hit_points: "95 (10d10 + 40)",
    });
    expect(screen.getByText("On par")).toBeTruthy();
  });

  it("renders nothing when the CR has no benchmark row", () => {
    renderWithForm(<CrStatHint stat="ac" />, {
      cr: { ...defaultMonster.cr, challenge_rating: "" },
      armor_class: 15,
    });
    expect(screen.queryByText(/High|On par|Low/)).toBeNull();
  });

  it("renders nothing while suggestions are disabled", () => {
    setCrSuggestionsEnabled(false);
    renderWithForm(<CrStatHint stat="ac" />, { cr: cr5, armor_class: 15 });
    expect(screen.queryByText(/High|On par|Low/)).toBeNull();
  });
});

describe("CrAbilityHint", () => {
  // CR 5 (PB +3): the benchmark's +7 attack implies a +4 best modifier.
  const abilityScores = { ...defaultMonster.ability_scores, str: 18 }; // +4

  it("renders only on the creature's highest ability", () => {
    renderWithForm(
      <>
        <CrAbilityHint ability="str" />
        <CrAbilityHint ability="dex" />
      </>,
      { cr: cr5, ability_scores: abilityScores },
    );
    // One chip: the STR one (modifier +4 vs +4 -> on par); DEX renders nothing.
    expect(screen.getAllByText(/^(High|On par|Low)$/)).toHaveLength(1);
    expect(
      screen.getByText("STR modifier on par for this challenge rating"),
    ).toBeTruthy();
  });

  it("classifies the modifier against the benchmark's implied modifier", () => {
    renderWithForm(<CrAbilityHint ability="str" />, {
      cr: cr5,
      ability_scores: { ...defaultMonster.ability_scores, str: 22 }, // +6 vs +4
    });
    expect(screen.getByText("High")).toBeTruthy();
  });

  it("renders nothing while suggestions are disabled", () => {
    setCrSuggestionsEnabled(false);
    renderWithForm(<CrAbilityHint ability="str" />, {
      cr: cr5,
      ability_scores: abilityScores,
    });
    expect(screen.queryByText(/High|On par|Low/)).toBeNull();
  });
});

describe("CrDamageHint", () => {
  /** 2d6 + 2 = 9 average. */
  const claw = {
    name: "Claw",
    description: "{@attack m|str|5|2d6 + 2|slashing}",
  };
  const multiattack = (text: string) => ({
    name: "Multiattack",
    description: text,
  });

  it("renders nothing until an action carries a damage tag", () => {
    renderWithForm(<CrDamageHint />, {
      cr: cr5,
      actions: [{ name: "Howl", description: "It howls, and all hear it." }],
    });
    expect(screen.queryByText(/High|On par|Low/)).toBeNull();
  });

  it("classifies the round's damage against the benchmark", () => {
    // Four claws: 36, against the CR 5 budget of 35 ± 9.
    renderWithForm(<CrDamageHint />, {
      cr: cr5,
      actions: [multiattack("It makes four Claw attacks."), claw],
    });
    expect(screen.getByText("On par")).toBeTruthy();
  });

  it("flags a creature that hits far above its CR", () => {
    renderWithForm(<CrDamageHint />, {
      cr: cr5,
      actions: [multiattack("It makes ten Claw attacks."), claw],
    });
    expect(screen.getByText("High")).toBeTruthy();
    expect(
      screen.getByText("Damage per round high for this challenge rating"),
    ).toBeTruthy();
  });

  it("renders nothing while suggestions are disabled", () => {
    setCrSuggestionsEnabled(false);
    renderWithForm(<CrDamageHint />, {
      cr: cr5,
      actions: [multiattack("It makes four Claw attacks."), claw],
    });
    expect(screen.queryByText(/High|On par|Low/)).toBeNull();
  });
});

describe("CR suggestions toggle (shared store)", () => {
  it("flipping the toggle hides a hint in a separately rendered sibling tree", async () => {
    const user = userEvent.setup();
    // Two independent renders = two sibling React trees sharing no context,
    // like the button-row toggle and the combat-form hints in the real editor.
    renderWithForm(<CrStatHint stat="ac" />, { cr: cr5, armor_class: 15 });
    renderWithForm(<CrSuggestionsToggle />);
    expect(screen.getByText("On par")).toBeTruthy();

    await user.click(screen.getByRole("switch", { name: "CR suggestions" }));
    expect(screen.queryByText("On par")).toBeNull();

    await user.click(screen.getByRole("switch", { name: "CR suggestions" }));
    expect(screen.getByText("On par")).toBeTruthy();
  });

  it("hides the whole benchmark strip while suggestions are off", () => {
    setCrSuggestionsEnabled(false);
    renderWithForm(<CrCalculator />, { cr: cr5 });
    expect(screen.queryByText("CR benchmarks")).toBeNull();
  });
});
