import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CombatForm } from "./combat-form";
import { renderWithForm } from "./test-utils";
import { calculateHitPoints } from "@/lib/utils";
import { defaultMonster } from "@/schema/monster-schema";

const hpInput = () => screen.getByLabelText<HTMLInputElement>("Hit Points");
const manualToggle = () =>
  screen.getByRole("switch", { name: "Manual hit points" });

describe("CombatForm — custom HP", () => {
  it("disables the HP input by default (HP is derived)", () => {
    renderWithForm(<CombatForm />);
    expect(hpInput().disabled).toBe(true);
  });

  it("enables the HP input and flips custom_hp when the Manual switch is toggled", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<CombatForm />);

    await user.click(manualToggle());

    expect(getForm().getValues("custom_hp")).toBe(true);
    expect(hpInput().disabled).toBe(false);
  });

  it("derives hit_points from hit dice + size + CON while not custom", async () => {
    const { getForm } = renderWithForm(<CombatForm />, {
      custom_hp: false,
      size: "medium",
      hit_dice: "2",
      ability_scores: { ...defaultMonster.ability_scores, con: 14 },
    });

    await waitFor(() =>
      expect(getForm().getValues("hit_points")).toBe(
        calculateHitPoints("2", "medium", 14),
      ),
    );
    // Sanity: a d8 (medium) creature with 2 dice and +2 CON.
    expect(getForm().getValues("hit_points")).toBe("13 (2d8 + 4)");
  });

  it("recomputes the derived hit_points when hit dice change", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<CombatForm />, {
      custom_hp: false,
      size: "medium",
      hit_dice: "2",
    });

    await user.clear(screen.getByLabelText("Hit Dice"));
    await user.type(screen.getByLabelText("Hit Dice"), "4");

    await waitFor(() =>
      expect(getForm().getValues("hit_points")).toBe(
        calculateHitPoints("4", "medium", defaultMonster.ability_scores.con),
      ),
    );
  });

  it("keeps a manual hit_points value when custom_hp is on", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<CombatForm />, {
      custom_hp: true,
      size: "medium",
      hit_dice: "2",
    });

    await user.clear(hpInput());
    await user.type(hpInput(), "999");

    expect(getForm().getValues("hit_points")).toBe("999");
  });
});

describe("CombatForm — custom passive perception", () => {
  const ppInput = () =>
    screen.getByLabelText<HTMLInputElement>("Passive Perception");
  const ppToggle = () =>
    screen.getByRole("switch", { name: "Manual passive perception" });

  it("disables the passive perception input by default (it is derived)", () => {
    renderWithForm(<CombatForm />);
    expect(ppInput().disabled).toBe(true);
  });

  it("enables the input and flips custom_passive_perception when toggled", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<CombatForm />);

    await user.click(ppToggle());

    expect(getForm().getValues("custom_passive_perception")).toBe(true);
    expect(ppInput().disabled).toBe(false);
  });

  it("writes a manually entered passive perception to the form", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<CombatForm />, {
      custom_passive_perception: true,
    });

    await user.clear(ppInput());
    await user.type(ppInput(), "18");

    // The number input holds a raw string; monsterSchema coerces on save.
    expect(getForm().getValues("passive_perception")).toBe("18");
  });
});

describe("CombatForm — custom initiative", () => {
  const initiativeInput = () =>
    screen.getByLabelText<HTMLInputElement>("Initiative");
  const initiativeToggle = () =>
    screen.getByRole("switch", { name: "Manual initiative" });

  it("derives initiative_bonus from DEX while not manual and disables the input", async () => {
    const { getForm } = renderWithForm(<CombatForm />, {
      custom_initiative: false,
      ability_scores: { ...defaultMonster.ability_scores, dex: 16 },
    });

    expect(initiativeInput().disabled).toBe(true);
    await waitFor(() =>
      expect(getForm().getValues("initiative_bonus")).toBe(3),
    );
  });

  it("keeps a manual initiative_bonus when the Manual switch is on", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<CombatForm />, {
      ability_scores: { ...defaultMonster.ability_scores, dex: 16 },
    });

    await user.click(initiativeToggle());
    expect(getForm().getValues("custom_initiative")).toBe(true);
    expect(initiativeInput().disabled).toBe(false);

    await user.clear(initiativeInput());
    await user.type(initiativeInput(), "7");

    expect(getForm().getValues("initiative_bonus")).toBe("7");
  });
});
