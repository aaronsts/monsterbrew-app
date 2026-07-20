import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ConditionImmunitiesField } from "./condition-immunities-field";
import { renderWithForm } from "./test-utils";

const condition = (name: string) =>
  screen.getByRole("checkbox", { name });

describe("ConditionImmunitiesField", () => {
  it("renders a checkbox for each condition", () => {
    renderWithForm(<ConditionImmunitiesField />);
    expect(condition("Blinded")).toBeDefined();
    expect(condition("Charmed")).toBeDefined();
    expect(condition("Poisoned")).toBeDefined();
  });

  it("reflects pre-selected immunities as checked", () => {
    renderWithForm(<ConditionImmunitiesField />, {
      condition_immunities: ["charmed"],
    });
    expect(condition("Charmed").getAttribute("data-checked")).not.toBeNull();
    expect(condition("Blinded").getAttribute("data-checked")).toBeNull();
  });

  it("adds a condition to the array when checked", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<ConditionImmunitiesField />);

    await user.click(condition("Frightened"));

    expect(getForm().getValues("condition_immunities")).toEqual(["frightened"]);
  });

  it("removes a condition from the array when unchecked", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<ConditionImmunitiesField />, {
      condition_immunities: ["blinded", "charmed"],
    });

    await user.click(condition("Blinded"));

    expect(getForm().getValues("condition_immunities")).toEqual(["charmed"]);
  });
});
