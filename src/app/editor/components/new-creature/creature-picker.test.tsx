import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreaturePicker } from "./creature-picker";
import type { StoredMonster } from "@/schema/monster-schema";
import type * as srdService from "@/services/srd";
import { getSrdMonster } from "@/services/srd";
import { defaultMonster } from "@/schema/monster-schema";
import { useCreatures } from "@/hooks/use-creatures";

vi.mock("@/hooks/use-creatures", () => ({ useCreatures: vi.fn() }));

/**
 * Render five *real* converted SRD entries rather than all 329.
 *
 * Every test in this file mounts the list, and 329 rows under V8 coverage
 * instrumentation pushed the slowest cases past vitest's 5 s timeout on CI —
 * they passed locally only because this machine is faster. The subset keeps the
 * data real (same converter, same shapes) while costing ~1% of the DOM; the
 * true 329 / 45 / 11 counts are asserted in `e2e/new-creature.spec.ts`, against
 * a real browser where rendering them is cheap.
 *
 * Aboleth (large, aberration, CR 10), Adult Red Dragon (huge, dragon, CR 17),
 * Archmage (small, humanoid, CR 12), Giant Owl (large, celestial, CR 1/4),
 * Owlbear (large, monstrosity, CR 3) — one per filter axis the tests exercise.
 */
vi.mock("@/services/srd", async (importActual) => {
  const actual = await importActual<typeof srdService>();
  const subset = new Set([
    "srd-2024_aboleth",
    "srd-2024_adult-red-dragon",
    "srd-2024_archmage",
    "srd-2024_giant-owl",
    "srd-2024_owlbear",
  ]);
  return {
    ...actual,
    getSrdMonsters: () =>
      actual.getSrdMonsters().filter((entry) => subset.has(entry.key)),
  };
});

/** Stub the saved-creature store; the bestiary itself stays real. */
function mockSaved(saved: Array<StoredMonster> = []) {
  vi.mocked(useCreatures).mockReturnValue({
    data: saved,
    isPending: false,
  } as ReturnType<typeof useCreatures>);
}

function savedCreature(id: string, name: string): StoredMonster {
  return { ...defaultMonster, id, name, updated_at: 9_000 };
}

afterEach(cleanup);

/** Render the picker and wait for the lazily-imported bestiary to arrive. */
async function renderPicker(
  props: Partial<Parameters<typeof CreaturePicker>[0]> & {
    saved?: Array<StoredMonster>;
  } = {},
) {
  mockSaved(props.saved ?? []);
  const onPick = props.onPick ?? vi.fn();
  const onBack = props.onBack ?? vi.fn();
  render(<CreaturePicker onPick={onPick} onBack={onBack} />);
  // Aboleth, not Owlbear: a test may seed a saved creature whose name also
  // contains "Owlbear", and the role query would then match two rows.
  await screen.findByRole("button", { name: /Aboleth/ });
  return { onPick, onBack };
}

describe("CreaturePicker", () => {
  it("lists the bestiary once the chunk has loaded", async () => {
    await renderPicker();

    expect(screen.getByRole("button", { name: /Aboleth/ })).toBeTruthy();
    expect(screen.getByText("5 creatures")).toBeTruthy();
  });

  it("narrows the list to name matches as you type", async () => {
    await renderPicker();

    await userEvent.type(screen.getByRole("searchbox"), "owlbear");

    await waitFor(() =>
      expect(screen.getByText("1 of 5 creatures")).toBeTruthy(),
    );
    expect(screen.queryByRole("button", { name: /Aboleth/ })).toBeNull();
  });

  it("matches case-insensitively and ignores surrounding whitespace", async () => {
    await renderPicker();

    await userEvent.type(screen.getByRole("searchbox"), "  OWLBEAR ");

    await waitFor(() =>
      expect(screen.getByText("1 of 5 creatures")).toBeTruthy(),
    );
  });

  it("says so when nothing matches", async () => {
    await renderPicker();

    await userEvent.type(screen.getByRole("searchbox"), "tarrasque-zzz");

    expect(await screen.findByText(/No creatures match/)).toBeTruthy();
  });

  it("hands over the same Monster that 'Copy to editor' would", async () => {
    const { onPick } = await renderPicker();

    await userEvent.click(screen.getByRole("button", { name: /Owlbear/ }));

    // The SRD detail page hands `entry.monster` to the editor; the picker must
    // produce exactly that, or the two entry points disagree.
    expect(onPick).toHaveBeenCalledWith(
      getSrdMonster("srd-2024_owlbear")?.monster,
    );
  });

  it("narrows the list with the size filter", async () => {
    await renderPicker();

    await userEvent.click(screen.getByRole("combobox", { name: "Size" }));
    await userEvent.click(await screen.findByRole("option", { name: "Small" }));

    // The owlbear is Large, so it drops out; the count reflects the filter.
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Owlbear/ })).toBeNull(),
    );
    expect(screen.getByText(/of 5 creatures/)).toBeTruthy();
  });

  it("narrows the list with the creature type filter", async () => {
    await renderPicker();

    await userEvent.click(screen.getByRole("combobox", { name: "Type" }));
    await userEvent.click(
      await screen.findByRole("option", { name: "Dragon" }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Aboleth/ })).toBeNull(),
    );
    expect(
      screen.getByRole("button", { name: /Adult Red Dragon/ }),
    ).toBeTruthy();
  });

  it("narrows the list with the challenge rating filter", async () => {
    await renderPicker();

    await userEvent.click(
      screen.getByRole("combobox", { name: "Challenge rating" }),
    );
    await userEvent.click(await screen.findByRole("option", { name: "CR 3" }));

    // The owlbear is CR 3 and stays; the CR 10 aboleth goes.
    expect(screen.getByRole("button", { name: /Owlbear/ })).toBeTruthy();
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Aboleth/ })).toBeNull(),
    );
  });

  it("offers a way back when the filters match nothing", async () => {
    const { onPick } = await renderPicker();

    await userEvent.type(screen.getByRole("searchbox"), "tarrasque-zzz");
    await waitFor(() =>
      expect(screen.getByText(/No creatures match/)).toBeTruthy(),
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Clear filters" }),
    );

    expect(await screen.findByRole("button", { name: /Owlbear/ })).toBeTruthy();
    expect(screen.getByText("5 creatures")).toBeTruthy();
    expect(onPick).not.toHaveBeenCalled();
  });

  it("lists your own creatures above the bestiary", async () => {
    await renderPicker({
      saved: [savedCreature("fen-hag", "Fen Hag")],
    });

    const rows = screen.getAllByRole("button", { name: /CR/ });
    expect(rows[0].textContent).toContain("Fen Hag");
    // 329 SRD monsters plus the one saved creature.
    expect(screen.getByText("6 creatures")).toBeTruthy();
  });

  it("marks your own creatures apart from bestiary entries", async () => {
    await renderPicker({ saved: [savedCreature("fen-hag", "Fen Hag")] });

    const mine = screen.getByRole("button", { name: /Fen Hag/ });
    const srd = screen.getByRole("button", { name: /Owlbear/ });

    expect(mine.textContent).toContain("Mine");
    expect(srd.textContent).not.toContain("Mine");
  });

  it("narrows to just your creatures with the source filter", async () => {
    await renderPicker({ saved: [savedCreature("fen-hag", "Fen Hag")] });

    await userEvent.click(screen.getByRole("combobox", { name: "Source" }));
    await userEvent.click(
      await screen.findByRole("option", { name: "My creatures" }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Owlbear/ })).toBeNull(),
    );
    expect(screen.getByRole("button", { name: /Fen Hag/ })).toBeTruthy();
    expect(screen.getByText("1 of 6 creatures")).toBeTruthy();
  });

  it("narrows to just the bestiary with the source filter", async () => {
    await renderPicker({ saved: [savedCreature("fen-hag", "Fen Hag")] });

    await userEvent.click(screen.getByRole("combobox", { name: "Source" }));
    await userEvent.click(await screen.findByRole("option", { name: "SRD" }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: /Fen Hag/ })).toBeNull(),
    );
    expect(screen.getByText("5 of 6 creatures")).toBeTruthy();
  });

  it("hands over one of your creatures without its stored id", async () => {
    const { onPick } = await renderPicker({
      saved: [savedCreature("fen-hag", "Fen Hag")],
    });

    await userEvent.click(screen.getByRole("button", { name: /Fen Hag/ }));

    // Picking here starts a new creature; keeping the id would point the
    // editor's save path at the original record.
    expect(onPick).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Fen Hag" }),
    );
    expect(onPick).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: "fen-hag" }),
    );
  });

  it("searches across both sources at once", async () => {
    await renderPicker({ saved: [savedCreature("mine-owl", "My Owlbear")] });

    await userEvent.type(screen.getByRole("searchbox"), "owlbear");

    expect(
      await screen.findByRole("button", { name: /My Owlbear/ }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Owlbear/ })).toBeTruthy();
  });

  it("returns to the options when Back is clicked", async () => {
    const { onBack } = await renderPicker();

    await userEvent.click(screen.getByRole("button", { name: /Back/ }));

    expect(onBack).toHaveBeenCalled();
  });

  it("holds its shape while the bestiary chunk loads", () => {
    // Synchronous first paint: the dynamic import has not settled yet.
    mockSaved();
    render(<CreaturePicker onPick={vi.fn()} onBack={vi.fn()} />);

    // The controls don't depend on the bestiary, so they are here from the
    // start rather than popping in and shoving the list down.
    expect(screen.getByRole("searchbox")).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Size" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Type" })).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Challenge rating" }),
    ).toBeTruthy();

    // And a list-shaped placeholder holds the height until the rows land.
    expect(screen.getByTestId("creature-list-skeleton")).toBeTruthy();

    // Emphatically not the empty-result message: it would be wrong, and it
    // would collapse the height it is meant to be holding.
    expect(screen.queryByText(/No creatures match/)).toBeNull();
  });

  it("swaps the placeholder for the real rows once loaded", async () => {
    await renderPicker();

    expect(screen.queryByTestId("creature-list-skeleton")).toBeNull();
  });
});
