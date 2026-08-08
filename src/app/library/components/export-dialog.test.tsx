import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExportDialog } from "./export-dialog";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

function makeMonster(overrides: Partial<Monster> = {}): Monster {
  return { ...structuredClone(defaultMonster), ...overrides };
}

function renderDialog(overrides: Partial<Monster> = {}, onPrint = vi.fn()) {
  render(
    <ExportDialog
      creature={makeMonster({ name: "Goblin", ...overrides })}
      onPrint={onPrint}
      open
      onOpenChange={vi.fn()}
    />,
  );
  return { onPrint };
}

const preview = () => screen.getByRole<HTMLTextAreaElement>("textbox");
const tab = (name: string) => screen.getByRole("tab", { name });

describe("ExportDialog", () => {
  it("opens on Homebrewery markdown", () => {
    renderDialog();
    expect(tab("Homebrewery").getAttribute("aria-selected")).toBe("true");
    expect(preview().value).toContain("{{monster,frame,wide");
    expect(preview().value).toContain("## Goblin");
  });

  it("names the creature in the title", () => {
    renderDialog();
    expect(screen.getByText("Export Goblin")).toBeDefined();
  });

  it("marks the selected tab with the attribute its styling keys off", async () => {
    // Base UI uses `data-active`, not `data-selected`. The visual selected
    // state is CSS-only, so nothing else in this file would catch a rename.
    renderDialog();
    expect(tab("Homebrewery").hasAttribute("data-active")).toBe(true);
    expect(tab("FoundryVTT").hasAttribute("data-active")).toBe(false);

    await userEvent.click(tab("FoundryVTT"));
    expect(tab("FoundryVTT").hasAttribute("data-active")).toBe(true);
    expect(tab("Homebrewery").hasAttribute("data-active")).toBe(false);
  });

  it("switches to FoundryVTT actor JSON", async () => {
    renderDialog();
    await userEvent.click(tab("FoundryVTT"));

    const actor = JSON.parse(preview().value);
    expect(actor.name).toBe("Goblin");
    expect(actor.type).toBe("npc");
  });

  it("switches to an Improved Initiative statblock", async () => {
    renderDialog();
    await userEvent.click(tab("Improved Initiative"));

    const statblock = JSON.parse(preview().value);
    // Improved Initiative has no Name field — the name lives in Description.
    expect(statblock.Description).toBe("Goblin");
    expect(statblock.Abilities).toBeDefined();
  });

  it("offers the matching download extension per format", async () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /Save \.md/ })).toBeDefined();

    await userEvent.click(tab("FoundryVTT"));
    expect(screen.getByRole("button", { name: /Save \.json/ })).toBeDefined();

    await userEvent.click(tab("Improved Initiative"));
    expect(screen.getByRole("button", { name: /Save \.json/ })).toBeDefined();
  });

  it("keeps the two JSON formats distinct", async () => {
    renderDialog();
    await userEvent.click(tab("FoundryVTT"));
    const foundry = preview().value;

    await userEvent.click(tab("Improved Initiative"));
    expect(preview().value).not.toBe(foundry);
  });

  it("copies the visible format to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });

    renderDialog();
    await userEvent.click(tab("FoundryVTT"));
    const shown = preview().value;
    await userEvent.click(screen.getByRole("button", { name: /^Copy/ }));

    expect(writeText).toHaveBeenCalledWith(shown);
    vi.unstubAllGlobals();
  });

  it("swaps copy/download for a print button on the PDF tab", async () => {
    const { onPrint } = renderDialog();
    await userEvent.click(tab("PDF"));

    // Nothing to preview or copy for a print job.
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /^Copy/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Save \./ })).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: /Print statblock/ }),
    );
    expect(onPrint).toHaveBeenCalledOnce();
  });

  it("explains each format as you switch", async () => {
    // Read the description element directly rather than searching the whole
    // dialog: every format name also appears on its tab. Matched loosely on
    // purpose, so this guards that the blurb *tracks the tab* rather than
    // pinning copy that gets edited.
    const blurb = () =>
      document.querySelector('[data-slot="dialog-description"]')?.textContent ??
      "";

    renderDialog();
    expect(blurb()).toMatch(/homebrewery/i);

    await userEvent.click(tab("FoundryVTT"));
    expect(blurb()).toMatch(/foundry/i);

    await userEvent.click(tab("Improved Initiative"));
    expect(blurb()).toMatch(/improved initiative/i);
  });

  it("falls back to a generic title and filename when unnamed", () => {
    renderDialog({ name: "" });
    expect(screen.getByText("Export creature")).toBeDefined();
    expect(screen.getByRole("button", { name: /Save \.md/ })).toBeDefined();
  });
});
