import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NONMAGICAL_ATTACK_TYPES } from "./helpers";
import { NonmagicalDefensesField } from "./nonmagical-defenses-field";
import { renderWithForm } from "./test-utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const renderField = (defaults = {}) =>
  renderWithForm(
    <TooltipProvider>
      <NonmagicalDefensesField />
    </TooltipProvider>,
    defaults,
  );

describe("NonmagicalDefensesField", () => {
  it("renders a button for every nonmagical attack qualifier", () => {
    renderField();
    for (const { label } of NONMAGICAL_ATTACK_TYPES) {
      expect(screen.getByRole("button", { name: label })).toBeDefined();
    }
  });

  it("cycles a qualifier resistant -> immune -> off (never vulnerable)", async () => {
    const user = userEvent.setup();
    const { getForm } = renderField();
    const nonmagical = () =>
      screen.getByRole("button", { name: "Nonmagical attacks" });

    await user.click(nonmagical());
    expect(getForm().getValues("nonmagical_attack_modifiers")).toEqual({
      nonmagical: "resistant",
    });

    await user.click(nonmagical());
    expect(getForm().getValues("nonmagical_attack_modifiers")).toEqual({
      nonmagical: "immune",
    });

    await user.click(nonmagical());
    expect(getForm().getValues("nonmagical_attack_modifiers")).toEqual({});
  });

  it("reflects a pre-existing state with its colour class", () => {
    renderField({ nonmagical_attack_modifiers: { silvered: "immune" } });
    expect(
      screen.getByRole("button", { name: "Nonmagical, nonsilvered attacks" })
        .className,
    ).toContain("text-green-500");
  });

  it("tracks the two qualifiers independently", async () => {
    const user = userEvent.setup();
    const { getForm } = renderField();

    await user.click(
      screen.getByRole("button", { name: "Nonmagical attacks" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Nonmagical, nonsilvered attacks" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Nonmagical, nonsilvered attacks" }),
    );

    expect(getForm().getValues("nonmagical_attack_modifiers")).toEqual({
      nonmagical: "resistant",
      silvered: "immune",
    });
  });
});
