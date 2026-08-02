import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { EditorView } from "@codemirror/view";
import { acceptCompletion } from "@codemirror/autocomplete";
import { MarkupField } from "./markup-field";
import type { MarkupContext } from "@/lib/statblock-markup";

afterEach(cleanup);

if (typeof window !== "undefined") {
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
if (typeof Range !== "undefined") {
  Range.prototype.getClientRects = function () {
    return {
      length: 0,
      item: () => null,
      [Symbol.iterator]: Array.prototype[Symbol.iterator],
    };
  };
  Range.prototype.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
  });
}
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView ??= () => {};
}

const ctx: MarkupContext = {
  ability_scores: { str: 20, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  cr: {
    challenge_rating: "5",
    proficiency_bonus: 4,
    hit_points_range: "",
    attack_bonus: 0,
    damage_per_round: "",
    save_dc: 0,
    experience: 0,
    armor_class: 0,
  },
};

/** Controlled wrapper so edits actually update the field value. */
function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <MarkupField value={value} onChange={setValue} ctx={ctx} />
      <output data-testid="value">{value}</output>
    </>
  );
}

function getView(container: HTMLElement): EditorView {
  const dom = container.querySelector<HTMLElement>(".cm-editor");
  const view = dom && EditorView.findFromDOM(dom);
  if (!view) throw new Error("CodeMirror view not found");
  return view;
}

const fieldValue = () => screen.getByTestId("value").textContent;

describe("MarkupField (CodeMirror)", () => {
  it("renders the value and mirrors edits back out", () => {
    const { container } = render(<Harness initial="Bites once." />);
    const view = getView(container);
    expect(view.state.doc.toString()).toBe("Bites once.");

    act(() =>
      view.dispatch({
        changes: { from: 11, insert: " Hard." },
        userEvent: "input.type",
      }),
    );
    expect(fieldValue()).toBe("Bites once. Hard.");
  });

  it("autocompletes {@… input and opens a composite's editor on accept", async () => {
    const { container } = render(<Harness />);
    const view = getView(container);
    act(() => view.focus());
    act(() =>
      view.dispatch({
        changes: { from: 0, insert: "{@att" },
        selection: { anchor: 5 },
        userEvent: "input.type",
      }),
    );

    // CM's completion tooltip opens with our catalog options. (The insert
    // buttons also say "Attack line", so wait on the tooltip itself.)
    await waitFor(() => {
      expect(document.querySelector(".cm-tooltip-autocomplete li")).not.toBe(
        null,
      );
    });
    // acceptCompletion refuses within the (default 75ms) interactionDelay
    // that guards against accidental Enter right as the list opens.
    await new Promise((resolve) => setTimeout(resolve, 100));
    let accepted = false;
    act(() => {
      accepted = acceptCompletion(view);
    });
    expect(accepted).toBe(true);

    expect(fieldValue()).toBe("{@attack m|str|5|1d6+str|slashing}");
    expect(await screen.findByLabelText("Damage dice")).toBeDefined();
  });

  it("insert buttons add a tag on click and open composite editors", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole("button", { name: /saving throw line/i }),
    );

    expect(fieldValue()).toBe("{@save dex|con|2d6|fire|half}");
    expect(await screen.findByLabelText("Failure damage dice")).toBeDefined();
    // A just-inserted token gets the add wording, not the edit wording.
    expect(
      screen.getByRole("button", { name: "Add saving throw" }),
    ).toBeDefined();
  });

  it("cancelling a just-inserted token removes it again", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(
      screen.getByRole("button", { name: /saving throw line/i }),
    );
    await screen.findByLabelText("Failure damage dice");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByLabelText("Failure damage dice")).toBeNull(),
    );
    expect(fieldValue()).toBe("");
  });

  it("cancelling an edit keeps the token untouched", async () => {
    const user = userEvent.setup();
    const initial = "Bite. {@attack m|con|5|1d6+str|slashing} x";
    const { container } = render(<Harness initial={initial} />);
    fireEvent.mouseDown(container.querySelector(".cm-content .mb-chip")!);

    const dice = await screen.findByLabelText("Damage dice");
    await user.clear(dice);
    await user.type(dice, "9d10");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByLabelText("Damage dice")).toBeNull(),
    );
    expect(fieldValue()).toBe(initial);
  });

  it("collapses valid tokens into resolved-text chips while the caret is outside", () => {
    const initial =
      "Bite. {@attack m|con|5|1d6+str|slashing} or {@save dex|con|2d6|fire} — {@hit str}";
    const { container } = render(<Harness initial={initial} />);

    const chips = container.querySelectorAll(".cm-content .mb-chip");
    expect(chips).toHaveLength(2); // composites only; {@hit} has no editor
    // CON +0 + PB 4 = +4; 1d6+5 -> 8.
    expect(chips[0].textContent).toBe(
      "Melee Attack Roll: +4, reach 5 ft. Hit: 8 (1d6 + 5) Slashing damage.",
    );
    // CON 10 -> DC 8 + 4 + 0 = 12.
    expect(chips[1].textContent).toBe(
      "Dexterity Saving Throw: DC 12. Failure: 7 (2d6) Fire damage. Success: Half damage.",
    );
    // The raw tag text is replaced, and atomic tags stay as typed.
    const content = container.querySelector(".cm-content");
    expect(content?.textContent).not.toContain("{@attack");
    expect(content?.textContent).toContain("{@hit str}");
  });

  it("keeps an invalid composite raw so its squiggle stays visible", () => {
    const { container } = render(<Harness initial="x {@attack q|banana} y" />);
    expect(container.querySelector(".cm-content .mb-chip")).toBeNull();
    expect(container.querySelector(".cm-content")?.textContent).toContain(
      "{@attack q|banana}",
    );
  });

  it("opens the editor dialog from a chip click and shows the token raw", async () => {
    const { container } = render(
      <Harness initial="Bite. {@attack m|con|5|1d6+str|slashing} x" />,
    );
    const chip = container.querySelector<HTMLElement>(".cm-content .mb-chip");
    expect(chip).not.toBeNull();

    fireEvent.mouseDown(chip!);
    expect(await screen.findByLabelText("Damage dice")).toBeDefined();
    // Active token: raw tag text visible, chip gone for this token…
    const content = container.querySelector(".cm-content");
    expect(content?.textContent).toContain(
      "{@attack m|con|5|1d6+str|slashing}",
    );
    // …and its decoration is tinted as active.
    const mark = container.querySelector('[data-token-key="attack:0"]');
    expect(mark?.className).toContain("mb-token-active");
  });

  it("splices dialog field edits back into the markup on save", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness initial="Bite. {@attack m|con|5|1d6+str|slashing} against one target." />,
    );
    fireEvent.mouseDown(container.querySelector(".cm-content .mb-chip")!);

    const dice = await screen.findByLabelText("Damage dice");
    expect((dice as HTMLInputElement).value).toBe("1d6+str");
    await user.clear(dice);
    await user.type(dice, "2d8+str");
    // Edits are staged in the dialog until confirmed.
    expect(fieldValue()).toBe(
      "Bite. {@attack m|con|5|1d6+str|slashing} against one target.",
    );

    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(fieldValue()).toBe(
      "Bite. {@attack m|con|5|2d8+str|slashing} against one target.",
    );
  });

  it("splices the edited token only, even among identical tags", async () => {
    const user = userEvent.setup();
    const initial =
      "{@attack m|str|5|1d6+str|slashing} or {@attack m|str|5|1d6+str|slashing}";
    const { container } = render(<Harness initial={initial} />);
    const chips = container.querySelectorAll<HTMLElement>(
      ".cm-content .mb-chip",
    );
    expect(chips).toHaveLength(2);
    fireEvent.mouseDown(chips[1]); // the 2nd token's chip

    const dice = await screen.findByLabelText("Damage dice");
    await user.clear(dice);
    await user.type(dice, "3d10");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(fieldValue()).toBe(
      "{@attack m|str|5|1d6+str|slashing} or {@attack m|str|5|3d10|slashing}",
    );
  });

  it("opens the editor dialog from a click on raw token text (caret inside)", async () => {
    const { container } = render(
      <Harness initial="Bite. {@attack m|con|5|1d6+str|slashing} x" />,
    );
    const view = getView(container);
    act(() => view.focus());
    act(() => view.dispatch({ selection: { anchor: 25 } })); // caret on "1d6"

    // The token shows raw for hand-editing; clicking it still opens the
    // dialog, same as clicking its chip would.
    const mark = container.querySelector('[data-token-key="attack:0"]');
    expect(mark).not.toBeNull();
    fireEvent.click(mark!);
    expect(await screen.findByLabelText("Damage dice")).toBeDefined();
  });

  it("keeps clicks on an invalid raw token dialog-free for hand repair", () => {
    const { container } = render(<Harness initial="x {@attack q|banana} y" />);
    const mark = container.querySelector('[data-token-key="attack:0"]');
    expect(mark).not.toBeNull();
    fireEvent.click(mark!);
    expect(screen.queryByLabelText("Damage dice")).toBeNull();
  });

  it("keeps the dialog closed while the caret moves through a composite tag", () => {
    const { container } = render(
      <Harness initial="Bite. {@attack m|con|5|1d6+str|slashing} x" />,
    );
    const view = getView(container);
    act(() => view.focus());
    act(() => view.dispatch({ selection: { anchor: 25 } })); // on "1d6"

    // The tag expands to raw text for hand-editing, but no modal opens and
    // focus stays in the text.
    expect(container.querySelector(".cm-content")?.textContent).toContain(
      "{@attack m|con|5|1d6+str|slashing}",
    );
    expect(screen.queryByLabelText("Damage dice")).toBeNull();
    expect(document.activeElement).toBe(view.contentDOM);
  });

  it("survives repeated open/close cycles on the same chip", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness initial="Bite. {@attack m|con|5|1d6+str|slashing} x" />,
    );
    fireEvent.mouseDown(container.querySelector(".cm-content .mb-chip")!);
    await screen.findByLabelText("Damage dice");

    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByLabelText("Damage dice")).toBeNull(),
    );

    // The chip is back (the caret never entered the token) — reopen it.
    const chip = container.querySelector<HTMLElement>(".cm-content .mb-chip");
    expect(chip).not.toBeNull();
    fireEvent.mouseDown(chip!);
    expect(await screen.findByLabelText("Damage dice")).toBeDefined();
  });

  it("squiggles malformed markup after the lint delay", async () => {
    const { container } = render(
      <Harness initial="{@attack q|banana|5} and {@wat} and take {@hit str" />,
    );

    // @codemirror/lint runs ~300ms after the doc settles.
    await waitFor(
      () => {
        const ranges = container.querySelectorAll(".cm-lintRange");
        expect(ranges.length).toBeGreaterThanOrEqual(3);
      },
      { timeout: 3000 },
    );
    expect(container.querySelector(".cm-lintRange-error")).not.toBeNull();
    expect(container.querySelector(".cm-lintRange-warning")).not.toBeNull();
  });

  it("Ctrl+Z reverts a catalog insert (e.g. one nested inside an attack line)", async () => {
    const user = userEvent.setup();
    const initial = "{@attack m|str|5|1d6+str|slashing}";
    const { container } = render(<Harness initial={initial} />);
    const view = getView(container);
    act(() => view.dispatch({ selection: { anchor: 10 } })); // caret inside the token

    await user.click(screen.getByRole("button", { name: /attack line/i }));
    // The snippet nested itself inside the existing tag.
    expect(fieldValue()).not.toBe(initial);

    fireEvent.keyDown(view.contentDOM, { key: "z", ctrlKey: true });
    expect(fieldValue()).toBe(initial);
  });

  it("undoes typing and inserts as separate history steps", async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const view = getView(container);

    await user.click(
      screen.getByRole("button", { name: /saving throw line/i }),
    );
    const snippet = fieldValue();

    act(() =>
      view.dispatch({
        changes: { from: view.state.doc.length, insert: "!" },
        userEvent: "input.type",
      }),
    );
    expect(fieldValue()).toBe(`${snippet}!`);

    fireEvent.keyDown(view.contentDOM, { key: "z", ctrlKey: true });
    expect(fieldValue()).toBe(snippet); // typing undone, insert intact
    fireEvent.keyDown(view.contentDOM, { key: "z", ctrlKey: true });
    expect(fieldValue()).toBe(""); // insert undone
  });
});

describe("token editor registry", () => {
  it("round-trips parse ∘ serialize for every registered editor", async () => {
    const { TOKEN_EDITORS } = await import("../../token-editors");
    const samples: Record<string, string> = {
      attack: "m|str|5|2d8+str|slashing",
      save: "dex|con|3d6|fire|the target is {@condition prone}",
    };
    for (const [name, editor] of Object.entries(TOKEN_EDITORS)) {
      const args = samples[name];
      expect(args, `add a round-trip sample for "${name}"`).toBeDefined();
      const once = editor.serialize(editor.parse(args));
      expect(editor.serialize(editor.parse(once))).toBe(once);
    }
  });
});
