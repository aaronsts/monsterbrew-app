import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithForm } from "../test-utils";
import { NewCreatureDialog } from ".";
import type { StoredMonster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";
import { useCreatures } from "@/hooks/use-creatures";

vi.mock("@/hooks/use-creatures", () => ({ useCreatures: vi.fn() }));

// Two entries is enough to prove the view swapped; the picker's own tests
// exercise it against the real bestiary.
vi.mock("@/services/srd", () => ({
  getSrdMonsters: () => [
    { key: "srd-2024_owlbear", monster: { ...defaultMonster, name: "Owlbear" } },
    { key: "srd-2024_aboleth", monster: { ...defaultMonster, name: "Aboleth" } },
  ],
}));

function stored(id: string, name: string, updated_at: number): StoredMonster {
  return { ...defaultMonster, id, name, updated_at };
}

/** Stub the query hook with just the fields `RecentCreatures` reads. */
function mockSaved(saved: Array<StoredMonster>) {
  vi.mocked(useCreatures).mockReturnValue({
    data: saved,
    isPending: false,
  } as ReturnType<typeof useCreatures>);
}

function launcherHandlers() {
  return {
    onStartBlank: vi.fn(),
    onImport: vi.fn(),
    onPickCreature: vi.fn(),
    onPickRecent: vi.fn(),
  };
}

function renderLauncher({
  saved = [],
  open = true,
}: { saved?: Array<StoredMonster>; open?: boolean } = {}) {
  mockSaved(saved);

  const handlers = {
    onStartBlank: vi.fn(),
    onImport: vi.fn(),
    onPickCreature: vi.fn(),
    onPickRecent: vi.fn(),
  };
  renderWithForm(<NewCreatureDialog open={open} {...handlers} />);
  return handlers;
}

describe("NewCreatureDialog", () => {
  it("stays out of the way when closed", () => {
    renderLauncher({ open: false });

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("button", { name: /Blank creature/ })).toBeNull();
  });

  it("offers the three ways to start a new creature", () => {
    renderLauncher();

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Blank creature/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Existing creature/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Import or paste/ })).toBeTruthy();
  });

  it("starts a blank creature from the blank option", async () => {
    const { onStartBlank } = renderLauncher();

    await userEvent.click(
      screen.getByRole("button", { name: /Blank creature/ }),
    );

    expect(onStartBlank).toHaveBeenCalled();
  });

  it("starts a blank creature when the dialog is dismissed", async () => {
    const { onStartBlank } = renderLauncher();

    await userEvent.keyboard("{Escape}");

    expect(onStartBlank).toHaveBeenCalled();
  });

  it("opens the import dialog", async () => {
    const { onImport } = renderLauncher();

    await userEvent.click(
      screen.getByRole("button", { name: /Import or paste/ }),
    );

    expect(onImport).toHaveBeenCalled();
  });

  it("swaps the options for the SRD picker, and back again", async () => {
    renderLauncher();

    await userEvent.click(screen.getByRole("button", { name: /Existing creature/ }));

    expect(await screen.findByRole("searchbox")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Blank creature/ })).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /Back/ }));

    expect(screen.getByRole("button", { name: /Blank creature/ })).toBeTruthy();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("backs out to the options when Escape is pressed inside the SRD picker", async () => {
    const { onStartBlank } = renderLauncher();

    await userEvent.click(screen.getByRole("button", { name: /Existing creature/ }));
    expect(await screen.findByRole("searchbox")).toBeTruthy();

    await userEvent.keyboard("{Escape}");

    // Escape leaves the sub-view; it does not abandon the launcher.
    expect(onStartBlank).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Blank creature/ })).toBeTruthy();

    // A second Escape, now on the options, does start blank.
    await userEvent.keyboard("{Escape}");
    expect(onStartBlank).toHaveBeenCalled();
  });

  it("reopens on the options, not the picker it was left on", async () => {
    mockSaved([]);
    const handlers = launcherHandlers();
    // Plain render: `rerender` has to swap the launcher's own props, and this
    // component takes no form context.
    const { rerender } = render(<NewCreatureDialog open {...handlers} />);

    await userEvent.click(screen.getByRole("button", { name: /Existing creature/ }));
    expect(await screen.findByRole("searchbox")).toBeTruthy();

    // Closed by the parent (import option, or a pick) — never via onOpenChange.
    rerender(<NewCreatureDialog open={false} {...handlers} />);
    rerender(<NewCreatureDialog open {...handlers} />);

    expect(screen.getByRole("button", { name: /Blank creature/ })).toBeTruthy();
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  it("hands a picked SRD monster to onPickCreature", async () => {
    const { onPickCreature } = renderLauncher();

    await userEvent.click(screen.getByRole("button", { name: /Existing creature/ }));
    await userEvent.click(
      await screen.findByRole("button", { name: /Owlbear/ }),
    );

    expect(onPickCreature).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Owlbear" }),
    );
  });

  it("omits the recent list when nothing is saved", () => {
    renderLauncher({ saved: [] });

    expect(screen.queryByText("Recent")).toBeNull();
  });

  it("offers saved creatures and hands their id to onPickRecent", async () => {
    const { onPickRecent } = renderLauncher({
      saved: [stored("fen-hag-id", "Fen Hag", 9_000)],
    });

    expect(screen.getByText("Recent")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: /Fen Hag/ }));

    expect(onPickRecent).toHaveBeenCalledWith("fen-hag-id");
  });
});
