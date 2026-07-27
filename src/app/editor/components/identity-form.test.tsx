import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { IdentityForm } from "./identity-form";
import { renderWithForm } from "./test-utils";
import { Languages } from "@/schema/createCreatureSchema";

const languageInput = () =>
  screen.getByLabelText<HTMLInputElement>("Custom languages");
const addButton = () => screen.getByRole("button", { name: "Add" });

describe("IdentityForm — custom languages", () => {
  it("adds a custom language via the Add button and clears the input", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<IdentityForm />);

    await user.type(languageInput(), "telepathy 120 ft.");
    await user.click(addButton());

    expect(getForm().getValues("custom_languages")).toEqual([
      "telepathy 120 ft.",
    ]);
    expect(languageInput().value).toBe("");
    expect(
      screen.getByRole("button", { name: "Remove telepathy 120 ft." }),
    ).toBeDefined();
  });

  it("adds a custom language when pressing Enter", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<IdentityForm />);

    await user.type(languageInput(), "Void Speech{Enter}");

    expect(getForm().getValues("custom_languages")).toEqual(["Void Speech"]);
  });

  it("trims input and ignores duplicates", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<IdentityForm />, {
      custom_languages: ["Void Speech"],
    });

    await user.type(languageInput(), "  Void Speech  {Enter}");

    expect(getForm().getValues("custom_languages")).toEqual(["Void Speech"]);
  });

  it("disables the Add button for empty / whitespace input", async () => {
    const user = userEvent.setup();
    renderWithForm(<IdentityForm />);

    expect((addButton() as HTMLButtonElement).disabled).toBe(true);
    await user.type(languageInput(), "   ");
    expect((addButton() as HTMLButtonElement).disabled).toBe(true);
  });

  it("removes a custom language via its remove button", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<IdentityForm />, {
      custom_languages: ["Void Speech", "Deep Speech"],
    });

    await user.click(
      screen.getByRole("button", { name: "Remove Void Speech" }),
    );

    expect(getForm().getValues("custom_languages")).toEqual(["Deep Speech"]);
  });
});

describe("IdentityForm — enum languages", () => {
  it("adds an enum language to the array when checked", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<IdentityForm />);

    await user.click(screen.getByRole("checkbox", { name: "Common" }));

    expect(getForm().getValues("languages")).toEqual([Languages.common]);
  });

  it("reflects a pre-selected enum language as checked", () => {
    renderWithForm(<IdentityForm />, { languages: [Languages.draconic] });

    expect(
      screen.getByRole("checkbox", { name: "Draconic" }).getAttribute(
        "data-checked",
      ),
    ).not.toBeNull();
  });
});
