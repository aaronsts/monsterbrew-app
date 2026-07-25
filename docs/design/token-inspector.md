# Implementation Plan: Token Inspector + Composite Line Tags

Status: Parts A + B + B4 implemented (unreleased) · Implements: `docs/roadmap-authoring-tools.md` §6 · Last updated: 2026-07-23

> **2026-07-23:** the *field internals* described here (backdrop mirror,
> hand-rolled autocomplete, insert-undo stack, preview chip line) were
> replaced by a CodeMirror 6 editor with in-field chips, lint squiggles, and
> native history — see `docs/design/codemirror-field.md`. The grammar,
> token-editor registry, popover editors, and stored-format contract below
> remain authoritative.

Builds on the markup system in `docs/design/attack-tokens.md`. **Decision already
taken (roadmap §6): Option B — composite line tags.** One token = one full
attack/save line = one structured popover editor. No schema change.

## What we're building

1. **Composite tags** `{@attack …}` / `{@save …}` — a single tag that renders a
   whole attack or saving-throw line, with damage **type** as a structured arg.
2. **Token inspector** — in the editor, rendered tokens become
   hover-highlight → click → popover editors whose fields write back into the
   `description` string. General across tag types via an editor **registry**.

Atomic 5eTools tags (`@atkr`, `@hit`, `@damage`, `@dc`, `@actSave`, …) keep
working unchanged — composite is an _authoring_ convenience layered on top.

## Key architectural findings (from the current code)

- **`resolveMarkup(text, ctx)` is the one choke point.** Its only callers are
  `monster-statblock.tsx` (feature + section text), `to-markdown.ts` (Homebrewery
  export, which the PDF/`creature-export-menu` path also uses), and the
  `markup-field.tsx` preview line. **Adding `@attack`/`@save` cases to
  `resolveTag` makes them render in the statblock, every export, and the preview
  at once — no consumer edits.**
- **`parseMarkup` returns ordered segments but no character offsets.** Splice-back
  needs them; we add `start`/`end` (additive, safe — see A1).
- **The interactive inspector must live in `MarkupField`, not the statblock.**
  `MarkupField` owns a single description's `value`/`onChange`; the statblock
  receives the whole watched `Monster` read-only and has no way to write back to
  a specific field path. The statblock gaining _visual_ chips is a later,
  read-only enhancement (see §D).
- `MarkupField` already has: a tag-insert catalog, an autocomplete menu, and a
  plain-text "Preview:" line. The inspector **replaces that preview line** with a
  chip-rendered preview; the catalog/menu stay.

---

## Part A — Composite tag resolution (pure logic, no UI)

All in `src/lib/statblock-markup.ts` (+ `statblock-markup.test.ts`). Ships first,
invisibly: existing content is unaffected; new tags simply gain meaning.

### A1. Add offsets to `parseMarkup`

Extend `TextSegment` and `TagSegment` with `start: number; end: number` (indices
into the source string). Purely additive — every current consumer ignores them.
The chip renderer (Part B) uses them to splice edits back precisely, which also
disambiguates multiple identical tags in one description.

### A2. `{@attack}` grammar + resolver

Positional, pipe-separated args:

```
{@attack <kind> | <hit> | <reach> | <dice> | <type>}
```

| arg     | values                                        | required | notes                                                       |
| ------- | --------------------------------------------- | -------- | ----------------------------------------------------------- |
| `kind`  | `m` / `r` / `m,r`                             | yes      | reuse existing `attackRoll()`                               |
| `hit`   | ability (`str`) **or** number (`7`)           | yes      | same flat-or-ability rule as `@hit`                         |
| `reach` | **structured** distance (see below)           | no       | editor shows number field(s); label derived from `kind`     |
| `dice`  | `2d8+str` / `2d8+1`                           | no       | reuse `resolveDiceAbilities`+`normalizeSigns`+`averageDice` |
| `type`  | `slashing`, `fire`, …                         | no       | capitalized in output                                       |

**Structured `reach` (DECIDED):** the slot stores numbers only; the word
(`reach`/`range`) and ` ft.` are rendered from `kind`, so the editor can present
plain number inputs.

| kind  | `reach` encoding | renders                        |
| ----- | ---------------- | ------------------------------ |
| `m`   | `5`              | `reach 5 ft.`                  |
| `r`   | `30/120`         | `range 30/120 ft.`             |
| `m,r` | `5;30/120`       | `reach 5 ft. or range 30/120 ft.` |

(`/` separates normal/long range; `;` separates the melee-reach and ranged-range
halves for thrown/versatile `m,r` attacks. Both are safe — the arg separator is
`|`.)

Resolves (e.g. `{@attack m|str|5|2d8+str|slashing}`, str 18, PB 3):

```
Melee Attack Roll: +7, reach 5 ft. Hit: 13 (2d8 + 4) Slashing damage.
```

Graceful omission: no `reach` → drop `, reach …`; no `dice` → drop the `Hit:`
clause; no `type` → `… (2d8 + 4) damage.` Never throws (statblock must not blank
mid-edit) — malformed → emit best-effort text or the raw tag.

### A3. `{@save}` grammar + resolver

```
{@save <ability> | <dc> | <dice> | <type> | <onSave>}
```

| arg       | values                           | required | notes                                              |
| --------- | -------------------------------- | -------- | -------------------------------------------------- |
| `ability` | tested ability (`dex`)           | yes      | reuse `@actSave` label logic                       |
| `dc`      | ability (`con`) or number (`15`) | yes      | reuse `@dc` resolution                             |
| `dice`    | `3d6`                            | no       | fail damage                                        |
| `type`    | `fire`, …                        | no       |                                                    |
| `onSave`  | `half` / `none` / custom text    | no       | success clause; default `half` when `dice` present |

Resolves (e.g. `{@save dex|con|3d6|fire|half}`, con 16, PB 2 → DC 13):

```
Dexterity Saving Throw: DC 13. Failure: 10 (3d6) Fire damage. Success: Half damage.
```

**Wording (DECIDED):** mirror the 2024 SRD phrasing (`… Saving Throw:` /
`Failure:` / `Success:`). `onSave` is `half` → "Success: Half damage.", `none` →
no Success clause, or any **custom** string rendered verbatim as the Success
clause (e.g. `the creature is {@condition prone}` → "Success: the creature is
prone.").

### A4. Optional damage **type** on the atomic `{@damage}`

Accept `{@damage 2d8 + str|slashing}` → `13 (2d8 + 4) Slashing damage`. Keeps the
type structured even outside a composite (multi-instance damage, hand tuning).
Back-compatible: no pipe → today's behaviour exactly.

### A5. Tests (`statblock-markup.test.ts`)

- `parseMarkup` offsets: `segments` reconstruct the source; `start`/`end` correct.
- `@attack` / `@save`: every arg present, each optional arg omitted, ability vs
  numeric slots, dice averages, malformed args pass through without throwing.
- `@damage|type` back-compat (no pipe unchanged).
- **Round-trip invariant** used by Part B: `serializeAttack(parseAttack(args))`
  is stable (idempotent).

---

## Part B — Token inspector (interactive UI)

Lives under `src/app/editor/components/` (co-located with `markup-field.tsx`).

### B1. Chip preview renderer — `markup-preview.tsx`

`<MarkupPreview value ctx onChange />`:

- `parseMarkup(value)` → map segments to nodes.
- Text segments → plain text. Tag segments whose `name` is in the **registry** →
  `<TokenChip>` showing the _resolved_ display text (`resolveTag(seg, ctx)`), with
  hover highlight + `cursor-pointer` + `aria-haspopup`. Non-registry tags render
  as resolved text (read-only).
- Clicking a chip opens its editor popover (B3). This component replaces the
  plain "Preview:" string currently in `MarkupField`.

### B2. Editor registry — `token-editors/`

The abstraction that makes the inspector "general":

```ts
interface TokenEditor<F> {
  name: string; // tag name handled
  label: string; // popover title
  parse(args: string): F; // tag args → field object
  serialize(fields: F): string; // field object → tag args
  Editor: React.FC<{ value: F; onChange: (f: F) => void; ctx: MarkupContext }>;
}
export const TOKEN_EDITORS: Record<string, TokenEditor<unknown>>;
```

v1 entries: `attack`, `save` (the composites). Adding an editable token later =
one entry. `Editor`s are shadcn form controls (Select for kind/ability/die,
Input for dice count / reach / DC number, a flat-or-ability toggle for hit/DC).

### B3. Popover + live two-way sync

**The editor is a controlled _view_ over the token in the textarea, not a
snapshot.** The textarea `value` is the single source of truth; the popover fields
are derived from the live-parsed token args, so typing in **either** surface keeps
the other in sync (DECIDED with the user).

- shadcn `Popover` anchored to the chip. Body = `editor.Editor` whose field values
  are `editor.parse(activeToken.args)` recomputed on every `value` change (no
  local field state), plus a live `resolveTag` preview.
- Field edit → `newArgs = editor.serialize(fields)`, rebuild
  `` `{@${name} ${newArgs}}` ``, `onChange(value.slice(0, seg.start) + rebuilt +
value.slice(seg.end))`. Because fields re-derive from `value`, this is a clean
  controlled round-trip.
- **Typing in the textarea** while the popover is open re-parses on each
  keystroke; the popover updates to match. If the token no longer parses as its
  tag (user broke the syntax), show an "unrecognised" state rather than throwing;
  it re-syncs the moment the text matches again.
- **Tracking which token is active across edits** (offsets shift as the user
  types): anchor on the tag segment under the caret. On each re-parse, re-locate
  the active token as the tag segment whose range contains the current caret
  (fall back to nearest same-name tag). Offsets from A1 make the splice exact and
  multi-tag-safe. The statblock preview updates live as today.

### B4. Insert-new-line entries

Extend `MarkupField`'s existing tag catalog with "Attack line" and "Saving throw"
entries that insert a starter `{@attack m|str||1d6+str|}` / `{@save dex|con|…}` at
the caret and immediately open its editor. Authors never have to hand-type the
composite grammar.

### B5. Tests

- `markup-preview` renders a chip per registry tag; clicking opens the popover;
  editing splices the right offsets back through `onChange`.
- Registry `parse`∘`serialize` round-trip per editor.

---

## Part C — "Convert imported line to editable attack" (optional, later)

5eTools imports arrive as atomic tags. Offer a per-action **"Make editable"**
action that recognises the canonical atomic sequence
(`{@atkr}…{@hit}…{@h}…{@damage}…<type> damage`) and rewrites it as one
`{@attack …}`. Structural parts (kind, dice, type-if-present) are explicit; flat
`+3` / `2d8+1` stay flat (the composite accepts flats — **no ability inference**).
Only offered when the pattern matches; otherwise the atomic tags remain editable
individually via their own (simpler) registry editors.

---

## Part D — Read-only chips in the statblock (optional, v2)

Share the `MarkupPreview` segment renderer to show subtle chips in
`monster-statblock.tsx` (visual only; plain text still in exports). A later step
could deep-link a statblock chip to focus + open the corresponding field editor —
but that needs feature→field-path plumbing, so it's explicitly out of v1.

---

## Persistence & stored-format contract

- Composite tags live in the `description` string like every other tag → **no
  IndexedDB migration, no schema change**; old creatures keep working.
- **But** saved descriptions now contain composite tags, so the **arg order is a
  stored contract.** Pin it, document it here, and keep `resolveTag` +
  `parse`/`serialize` backward-compatible if the grammar ever grows (append
  optional args at the end; never reorder).

## Deferred / future reference (out of scope for v1)

- **Multi-instance damage** — an attack that deals more than one damage instance
  ("2d8 slashing plus 1d6 fire"). v1 handles the primary instance in `@attack`;
  the leaning for later is to append a trailing atomic `{@damage 1d6|fire}` after
  the composite rather than making `@attack`'s damage/type args repeatable — it
  keeps the composite grammar fixed-arity and reuses A4. Revisit when authoring
  demand appears; not built now.

## Rollout (PR-sized steps)

1. **Part A** — offsets + `@attack`/`@save`/`@damage|type` + tests. Invisible; no
   UI. Safe to land alone.
2. **Part B** — chip preview + registry (`attack`, `save`) + popover splice-back,
   wired into `MarkupField`. The headline UX.
3. **B4** — insert-new-line catalog entries.
4. **Editors for atomic tags** (`hit`, `dc`, `damage`, `actSave`, `atkr`) — makes
   imported content editable token-by-token.
5. **Part C** — "convert imported line."
6. **Part D** — statblock chips (v2).

Steps 1–2 deliver the feature; run `pnpm exec vitest run` before every push (CI
has no test step).

## Decisions (resolved)

- **Where the inspector lives — DECIDED:** the **editor field's preview area**,
  i.e. the chip-rendered line directly beneath the description `<textarea>` in
  `MarkupField`. Confirmed with the user: hovering a `{@…}` token _in the
  description field_ opens its editor. A native `<textarea>` cannot host
  interactive spans, so the chips render in the preview mirror below it (not
  inside the textarea); the textarea remains the raw-text source of truth and the
  chips write back through `onChange`. Statblock-hover editing stays out of scope
  (§D, writeback plumbing).
- **Composite arg order & optionality (A2/A3) — DECIDED:** grammar locked as
  specified above; it is now a stored format (append-only if it ever grows).
- **Reach/range — DECIDED:** structured numeric slot (see A2 table); label
  derived from `kind`.
- **Save wording & `onSave` — DECIDED:** mirror 2024 SRD phrasing; `onSave` is
  `half` / `none` / custom text (see A3).
- **Authoring emphasis — DECIDED:** composite-first — new attacks/saves are added
  via an "Add attack line" / "Add saving throw" action that inserts the composite
  and opens its editor; the existing atomic tag catalog stays available for
  everything else and advanced tweaks. See B4.
- **Live two-way sync — DECIDED:** the textarea stays fully editable with the
  popover open; the popover is a controlled view over the live-parsed token, so
  raw typing and field edits stay in sync. See B3.

## Open questions / to confirm before building

_None blocking._ Grammar and UX decisions above are settled; remaining choices
(multi-instance damage) are deferred, not blocking v1.

## Implementation notes (adjustments found while building, 2026-07-22)

- **`parseMarkup` is now a brace-counting scanner, not a regex.** The old
  `TAG_RE` couldn't parse a tag whose args contain a nested tag — which the
  decided `onSave` custom text requires (`…|the target is {@condition
  prone}}`). Backward compatible; unbalanced braces still fall through as
  plain text. Composite args are likewise split on **top-level** pipes only
  (a nested `{@condition prone|XPHB}` carries its own `|`).
- **`parse*Args`/`serialize*Args` live in `statblock-markup.ts`**, not in the
  registry — one grammar implementation shared by the resolvers and the
  editors; the registry just points at them.
- **The chip preview parses the _raw_ string** (offsets must hold for
  splice-back), so `resolveMarkup`'s redundant-average normalisation
  (`10 ({@damage 2d8 + 1})`) is instead applied display-only, per text
  segment adjacent to a damage tag, in `markup-preview.tsx`.
- **Active-token tracking**: instead of caret anchoring, chips are keyed by
  `name:occurrence` (stable while offsets shift under typing) —
  `token-keys.ts`. `MarkupField` owns the open-popover key and uses
  `tokenKeyAt(value, insertOffset)` for B4's insert-then-open, which avoids a
  `setState`-in-effect entirely.
- **Dice slot is a free-text input** in v1 (the grammar allows arbitrary
  expressions); decomposed count/die selects can come later.
- UI primitives are **Base UI** (shadcn wrappers), not Radix.
- Dice expressions are display-normalised to spaced operators
  (`2d8+str` renders `2d8 + 4`), matching SRD style.
- **Caret-open (added in polish, 2026-07-23):** placing the textarea caret
  inside an editable token opens its popover editor via
  `tokenKeyContaining`; these opens pass `initialFocus={false}` to the Base
  UI popup so typing never loses focus. Escape suppresses reopening for that
  token until the caret leaves it (keyed off Base UI's `escape-key` close
  reason).
- **Insert undo:** programmatic snippet inserts (catalog/autocomplete) are
  invisible to the browser's native undo, so `MarkupField` keeps its own
  stack; Ctrl/Cmd+Z reverts the last insert only while the value still
  exactly matches its result (typed edits are never eaten). The listener
  sits on the field wrapper because focus may still be on the catalog
  button.
- Editor controls: short enumerations are radio chips; the 14-entry damage
  type list is a dropdown (`SelectControl`). Radio option ids are prefixed
  per `useId` group — several groups share one popover.
- **In-textarea token highlighting (`markup-highlights.tsx`):** a
  character-exact, transparent-text mirror div sits behind the (transparent)
  textarea with identical border/padding/font classes, painting background
  tints behind editable tokens (stronger on hover / while its editor is
  open). Hover detection hit-tests the mirror spans' own client rects on
  mousemove — no `caretPositionFromPoint`, so it works in every browser and
  across wrapped lines. If the mirror ever drifts from the textarea metrics
  (browser zoom, font fallback), that is the signal to migrate the field to
  CodeMirror 6 decorations instead of patching the mirror.
