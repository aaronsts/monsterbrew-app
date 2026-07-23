# Implementation Plan: Migrate the description field to CodeMirror 6

Status: **implemented (all three phases, unreleased)** · Supersedes the *field
internals* of `docs/design/token-inspector.md` (its grammar, registry, popover
editors, and stored-format contract stay authoritative) · Last updated:
2026-07-23

Implementation notes (deltas from the plan below):

- Popover field edits dispatch **straight into CM** (`replaceRange` on the
  editor handle) instead of round-tripping through the controlled value — a
  whole-doc replace remaps the selection, which closed the popover mid-edit.
  The caret is pinned just inside the rewritten token while its popover edits.
- Chips collapse only **valid** composites; a composite with arg problems
  stays raw so its lint squiggle stays visible (`compositeProblems` is shared
  by the linter and the decoration builder).
- Chips are not atomic ranges on purpose: arrowing into a chip's hidden text
  expands it to raw — that *is* the enter-to-edit gesture for keyboards.
- The resolved-preview line under the field is gone (chips + the statblock
  cover it); `markup-preview.tsx` and the backdrop-mirror are deleted.
- Snippet inserts are annotated `isolateHistory` so each is one undo step.

## Why migrate, and why CodeMirror (not Tiptap)

The token-inspector work grew four hand-built subsystems inside `MarkupField`:
a transparent-text **backdrop mirror** for in-field token highlighting (breaks
silently if font metrics ever drift), a **hand-rolled autocomplete** menu, a
**custom insert-undo stack** (programmatic splices are invisible to native
textarea undo), and **caret/hover tracking** glued together from `select`/
`click`/`keyup`/`mousemove` events. Each is the textarea imitating an editor.

CodeMirror 6 replaces all four with primitives while keeping **the markup
string as the source of truth** — which is exactly why Tiptap/ProseMirror is
the wrong shape here: it's a rich-text *document model* and would force
serialization both ways plus node views around our `{@…}` tag strings.

**What survives unchanged:** `statblock-markup.ts` (parser offsets, grammar,
resolvers), the token-editor registry + `AttackEditor`/`SaveEditor` popover
content, `token-keys.ts`, and all persistence — descriptions remain plain
tagged strings; no schema/IndexedDB change.

## Dependencies

`@codemirror/state`, `@codemirror/view`, `@codemirror/commands` (history),
`@codemirror/autocomplete`, `@codemirror/lint`. No language package — our
"language" is `parseMarkup`. No React wrapper package; a ~100-line
`useEffect`-managed component gives full control. CM must only be
instantiated client-side (in an effect) — the editor route can still SSR.

## Phase 1 — Core swap (this lands first)

New `markup-editor.tsx`: a `MarkupEditor` component owning one `EditorView`.

- **Value sync:** controlled from the outside (RHF), uncontrolled inside.
  `updateListener` → `onChange(doc.toString())` on `docChanged`; an effect
  dispatches a whole-doc replace when the external value diverges.
- **Token decorations** replace `markup-highlights.tsx` (deleted):
  a `StateField<DecorationSet>` rebuilt from `keySegments(parseMarkup(doc))`
  marks editable tokens with class `mb-token` + `data-token-key`. Hover
  highlight becomes **plain CSS `:hover`** (the decoration spans are real
  DOM) — the entire mousemove hit-test dies. Active token gets `mb-token-active`
  via a `StateEffect`-driven field. Styles live in `globals.css` using
  `--color-*` theme vars.
- **Caret-open** unchanged in behavior: the update listener reports
  `tokenKeyContaining(doc, selection.head)` to `MarkupField`, which keeps its
  suppression (Escape) and outside-press-ignore logic.
- **Autocomplete:** `@codemirror/autocomplete` with one source that fires on
  `{@…` and offers `TAG_CATALOG`; a composite completion opens its popover
  after apply (same `tokenKeyAt` flow). The hand-rolled listbox dies.
- **Undo:** `history()` + default/history keymaps. Catalog inserts are
  transactions, so **native-quality undo covers programmatic inserts too**;
  the custom Ctrl+Z stack dies. The field-wrapper keydown handler dies.
- **Chrome styling:** wrapper div replicates the shadcn `Textarea` look
  (border, focus-within ring, min-height); a CM theme sets content
  padding/font to match `px-2.5 py-2 text-xs`; `EditorView.lineWrapping`;
  `placeholder()` extension; `contentAttributes` carries the `id` for the
  form label. `domEventHandlers.blur` → RHF `onBlur`.
- **Tests:** CM works under jsdom with small shims (`Range#getClientRects`
  etc.). Tests grab the view via `EditorView.findFromDOM` and drive
  selection/changes through `view.dispatch` instead of textarea events.
  Decoration assertions keep the `[data-token-key]` query style.

`MarkupPreview` (chip line under the field) stays in Phase 1 — popovers still
anchor to its chips.

## Phase 2 — Chips inside the field

- When the selection is **outside** a token, replace its range with a
  `WidgetType` chip showing the resolved text (`resolveTag`); when the caret
  is **inside** (or its popover is open), show the raw tagged text with the
  Phase-1 mark. Obsidian-style live preview. `MarkupContext` reaches the
  widget via a `StateEffect` dispatched when `ctx` changes.
- Clicking a chip dispatches the selection just inside the token — the
  existing caret-open flow does the rest.
- The editor popover detaches from the preview chips: a trigger-less Base UI
  `Popover` anchored (Positioner `anchor`) to the in-field
  `[data-token-key]` span. `PopoverContent` (ui/popover.tsx) grows an
  `anchor` pass-through.
- The `MarkupPreview` chip line under the field is then redundant — remove it
  (the statblock preview remains the resolved-text view); its popover tests
  move to the field's suite.

## Phase 3 — Lint squiggles + richer autocomplete info

- `@codemirror/lint` with diagnostics from `parseMarkup`: unbalanced `{@`
  openers (text segments still containing `{@`), unknown tag names (export a
  `KNOWN_TAGS` set from `statblock-markup.ts`), malformed composite args
  (bad `kind`, non-ability/non-numeric hit/dc slots).
- Autocomplete entries carry `info` (the resolved-preview hint) — mostly free
  with CM's completion API.

## Rollout

1. Phase 1 + delete mirror/menu/undo-stack code + port tests. Riskiest step;
   everything after is additive.
2. Phase 3 (small, independent of chips).
3. Phase 2 (chips + popover re-anchoring + `MarkupPreview` removal).

Run `pnpm exec vitest run` before every push (CI has no test step); verify
the editor in a real browser after each phase — CM rendering and popover
anchoring are exactly what jsdom approximates.
