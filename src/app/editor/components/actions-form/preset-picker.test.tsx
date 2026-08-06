import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PresetPicker } from "./preset-picker";
import type { FeaturePreset } from "@/lib/constants/actionPresets";

// Base UI measures this popup's anchor with a ResizeObserver, which jsdom
// lacks. It stays local rather than moving to `vitest.setup.ts`: recharts'
// ResponsiveContainer only uses its fallback dimensions while ResizeObserver is
// absent, so a global stub that never fires would blank out the chart tests.
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
