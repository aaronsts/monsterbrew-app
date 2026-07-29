import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PresetPicker } from "./preset-picker";
import type { FeaturePreset } from "@/lib/constants/actionPresets";

afterEach(cleanup);

// jsdom doesn't implement PointerEvent / pointer capture, which Base UI's
// Combobox relies on when handling clicks and typeahead.
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

const presets: Array<FeaturePreset> = [
  { label: "Pack Tactics", name: "Pack Tactics", description: "Advantage on attack rolls when an ally is near." },
  { label: "Keen Smell", name: "Keen Smell", description: "Advantage on Wisdom (Perception) checks that rely on smell." },
];

describe("PresetPicker", () => {
  it("renders the trigger label and no popup content until opened", () => {
    render(
      <PresetPicker presets={presets} triggerLabel="Insert preset" onSelect={vi.fn()} />,
    );

    expect(screen.getByRole("combobox")).toBeDefined();
    expect(screen.getByText("Insert preset")).toBeDefined();
    expect(screen.queryByText("Pack Tactics")).toBeNull();
  });

  it("lists every preset label when opened", async () => {
    const user = userEvent.setup();
    render(
      <PresetPicker presets={presets} triggerLabel="Insert preset" onSelect={vi.fn()} />,
    );

    await user.click(screen.getByRole("combobox"));

    expect(await screen.findByText("Pack Tactics")).toBeDefined();
    expect(screen.getByText("Keen Smell")).toBeDefined();
  });

  it("filters presets by label or description as the user types", async () => {
    const user = userEvent.setup();
    render(
      <PresetPicker presets={presets} triggerLabel="Insert preset" onSelect={vi.fn()} />,
    );

    await user.click(screen.getByRole("combobox"));
    await screen.findByText("Pack Tactics");

    await user.type(screen.getByPlaceholderText("Search presets…"), "smell");

    expect(screen.getByText("Keen Smell")).toBeDefined();
    expect(screen.queryByText("Pack Tactics")).toBeNull();
  });

  it("shows an empty state when no preset matches the query", async () => {
    const user = userEvent.setup();
    render(
      <PresetPicker presets={presets} triggerLabel="Insert preset" onSelect={vi.fn()} />,
    );

    await user.click(screen.getByRole("combobox"));
    await screen.findByText("Pack Tactics");

    await user.type(screen.getByPlaceholderText("Search presets…"), "nonexistent");

    expect(await screen.findByText("No presets found.")).toBeDefined();
  });

  it("calls onSelect with the chosen preset when an item is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <PresetPicker presets={presets} triggerLabel="Insert preset" onSelect={onSelect} />,
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Keen Smell"));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(presets[1]);
  });
});
