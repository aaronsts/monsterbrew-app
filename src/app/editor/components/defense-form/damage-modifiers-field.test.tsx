import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DamageModifiersField } from "./damage-modifiers-field";
import { renderWithForm } from "./test-utils";
import { DAMAGE_TYPES } from "@/types/types";
import { TooltipProvider } from "@/components/ui/tooltip";

const renderField = (defaults = {}) =>
  renderWithForm(
    <TooltipProvider>
      <DamageModifiersField />
    </TooltipProvider>,
    defaults,
  );

describe("DamageModifiersField", () => {
  it("renders a button for every damage type", () => {
    renderField();
    for (const type of DAMAGE_TYPES) {
      expect(screen.getByRole("button", { name: type })).toBeDefined();
    }
  });

  it("cycles a damage type resistant -> vulnerable -> immune -> off", async () => {
    const user = userEvent.setup();
    const { getForm } = renderField();
    const fire = () => screen.getByRole("button", { name: "fire" });

    await user.click(fire());
    expect(getForm().getValues("damage_modifiers")).toEqual({
      fire: "resistant",
    });

    await user.click(fire());
    expect(getForm().getValues("damage_modifiers")).toEqual({
      fire: "vulnerable",
    });

    await user.click(fire());
    expect(getForm().getValues("damage_modifiers")).toEqual({
      fire: "immune",
    });

    await user.click(fire());
    expect(getForm().getValues("damage_modifiers")).toEqual({});
  });

  it("reflects a pre-existing state with its colour class", () => {
    renderField({ damage_modifiers: { cold: "immune" } });
    expect(screen.getByRole("button", { name: "cold" }).className).toContain(
      "text-green-500",
    );
  });

  it("tracks several damage types independently", async () => {
    const user = userEvent.setup();
    const { getForm } = renderField();

    await user.click(screen.getByRole("button", { name: "fire" }));
    await user.click(screen.getByRole("button", { name: "acid" }));
    await user.click(screen.getByRole("button", { name: "acid" }));

    expect(getForm().getValues("damage_modifiers")).toEqual({
      fire: "resistant",
      acid: "vulnerable",
    });
  });
});
