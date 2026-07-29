import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithForm } from "../test-utils";
import { ActionsForm } from ".";

// jsdom doesn't implement PointerEvent / pointer capture / ResizeObserver,
// which Base UI's Combobox relies on when handling clicks and positioning.
if (typeof window !== "undefined" && !window.PointerEvent) {
  class PointerEventShim extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
    }
  }
  window.PointerEvent = PointerEventShim as typeof PointerEvent;
}
if (typeof Element !== "undefined") {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
}
if (typeof window !== "undefined" && !window.ResizeObserver) {
  class ResizeObserverShim {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverShim;
}

// "Actions" is ambiguous by text alone — it's both the section legend and the
// Actions feature list's own title — so locate each list's header row via its
// unique "Add …" button instead of by title text.
const rowFor = (addLabel: string) =>
  screen.getByRole("button", { name: addLabel }).closest("div")!.parentElement!;

describe("ActionsForm — feature lists", () => {
  it("adds an empty trait when 'Add trait' is clicked", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<ActionsForm />);

    await user.click(screen.getByRole("button", { name: "Add trait" }));

    expect(getForm().getValues("traits")).toEqual([{ name: "", description: "" }]);
  });

  it("only the Traits list offers a preset picker", () => {
    renderWithForm(<ActionsForm />);

    expect(within(rowFor("Add trait")).getByRole("combobox")).toBeDefined();
    expect(within(rowFor("Add action")).queryByRole("combobox")).toBeNull();
  });

  it("appends the chosen preset's name and description to Traits", async () => {
    const user = userEvent.setup();
    const { getForm } = renderWithForm(<ActionsForm />);

    await user.click(within(rowFor("Add trait")).getByRole("combobox"));
    await user.click(await screen.findByText("Legendary Resistance"));

    expect(getForm().getValues("traits")).toEqual([
      {
        name: "Legendary Resistance (3/day)",
        description:
          "If the {@mon} fails a saving throw, it can choose to succeed instead.",
      },
    ]);
  });

  it("reveals the Legendary Actions list only once the checkbox is checked", async () => {
    const user = userEvent.setup();
    renderWithForm(<ActionsForm />);

    expect(screen.queryByText("Legendary Description")).toBeNull();

    await user.click(screen.getByRole("checkbox", { name: "Legendary Actions" }));

    expect(screen.getByText("Legendary Description")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Add legendary action" }),
    ).toBeDefined();
  });
});
