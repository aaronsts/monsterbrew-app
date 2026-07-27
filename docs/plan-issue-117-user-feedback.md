# Implementation plan: issue #117 — User feedback #2

Issue #117 is a batch of editor UX feedback. This plan maps each bullet to
code. All items ship in a single PR, except the two deferred items at the
bottom.

## Item-by-item breakdown

### 1. Move ability scores to first in the Combat section

**Where:** `src/app/editor/components/combat-form.tsx`

The Ability Scores `FieldGroup` (currently after CR/Initiative, AC, and HP)
moves to the top of the `FieldSet`, directly under the legend. Pure JSX
reordering — the `useWatch`/`useEffect` derivations don't care about render
order.

This also reads better logically: CR, initiative, HP, and the new passive
perception placement (item 2) all derive from ability scores, so scores
should come first.

**Tests:** `combat-form.test.tsx` — verify nothing asserts field order; adjust
if it does.

### 2. Move passive perception behind the ability mods

**Where:** `src/app/editor/components/identity-form.tsx` (lines ~252–302) →
`src/app/editor/components/combat-form.tsx`

Interpretation: the passive perception input currently lives in the Identity
section under Senses, but it derives from WIS + proficiency — feedback asks to
put it right after the ability score grid. Move the `passive_perception`
Controller (with its nested `custom_passive_perception` Manual switch and the
`useWatch` on `custom_passive_perception`) into `CombatForm`, placed
immediately after the Ability Scores group.

The auto-compute effect (10 + perception) lives in `monster-form.tsx`
(`setValue("passive_perception", …)`), at the form hub — it keeps working
regardless of which section renders the input. No schema change.

*(Alternative reading — reorder the statblock display — doesn't apply: the
statblock already renders passive perception on the Senses line per SRD
convention. The editor-field move is the coherent reading next to item 1.)*

**Tests:** move any passive-perception assertions from
`identity-form.test.tsx` to `combat-form.test.tsx`.

### 3. Add a note explaining the two checkboxes in Skills

**Where:** `src/app/editor/components/defense-form/skills-field.tsx`

The two `CheckSquare`s per skill mean proficiency / expertise, but nothing
says so. Add a `FieldDescription` under the "Skills" `FieldLabel`, e.g.:

> Click a skill to cycle proficiency: one square = proficient (+PB), two
> squares = expertise (+2×PB).

Keep it one short plain sentence. The `aria-label` on each button already
announces the state; no a11y change needed.

### 4. Default of 2 hit dice for HP

**Where:** `src/schema/monster-schema.ts` — `defaultMonster.hit_dice: ""` →
`"2"`

With the default, a fresh creature immediately shows computed HP in the
preview (`calculateHitPoints` in `src/lib/utils.ts` runs off `hit_dice`,
`size`, CON via the effect in `combat-form.tsx`), instead of an empty/0 HP
line.

**Ripples to check:**
- `monster-statblock.tsx` HP fallback (`medianHP || creature.hit_points`) —
  behaves the same, just non-zero now.
- Tests that snapshot or compare against `defaultMonster` (converter tests
  build on it in places) — update expected values.
- Importers set their own `hit_dice`, so converters are unaffected.

### 5. Remove attack line / saving throw inserts from the Traits section

**Where:** `src/app/editor/components/markup-field.tsx`,
`src/app/editor/components/actions-form.tsx`

`MarkupField` unconditionally renders an insert button for every
`TAG_CATALOG` entry (Attack line, Saving throw line). Traits are passive
abilities; the composite tags don't belong there.

- Give `MarkupField` an optional prop, e.g.
  `tags?: Array<TagItem>` (default `TAG_CATALOG`).
- Thread it through `FeatureList` (new optional prop) and pass an empty list
  (or a filtered catalog) for the `traits` list only.
- Also fix the traits description placeholder, which currently shows
  `{@attack m|str|5|2d8+str|slashing}` — misleading for traits (folds into
  item 6).

The `TagHelpDialog` button can stay everywhere — it documents the whole
markup language, which is still valid inside trait text (e.g.
`{@condition prone}`, `{@dc con}`).

### 6. Individual placeholders for all action types

**Where:** `src/app/editor/components/actions-form.tsx`

`FeatureList` hardcodes `placeholder="ex. Multiattack"` for the name and one
generic description placeholder for all seven feature arrays. Add
`namePlaceholder` / `descriptionPlaceholder` props and set per section:

| Section | Name placeholder | Description placeholder |
|---|---|---|
| Traits | ex. Pack Tactics | ex. The creature has advantage on attack rolls against a creature if at least one of its allies is within 5 ft… |
| Actions | ex. Multiattack | Describe the effect… e.g. `{@attack m\|str\|5\|2d8+str\|slashing}` |
| Reactions | ex. Parry | ex. The creature adds 2 to its AC against one melee attack that would hit it… |
| Bonus Actions | ex. Nimble Escape | ex. The creature takes the Disengage or Hide action. |
| Lair Actions | ex. Grasping Roots | describe the lair effect… |
| Legendary Actions | ex. Tail Attack | e.g. `{@attack m\|str\|5\|1d8+str\|bludgeoning}` |
| Mythic Actions | ex. Rejuvenating Surge | describe the mythic effect… |

(Exact copy to be tuned during implementation; keep the `{@attack …}` example
only in sections where the insert buttons exist.)

### 7. Bug: leading space breaks markdown in the statblock

**Where:** `src/components/ui/stand-alone-description.tsx:18` and
`src/components/ui/description.tsx:62`

Both build `` `***${title}.*** ${description}` `` for react-markdown. If the
feature *name* starts (or ends) with a space, the emphasis delimiter run
(`*** Bite.***`) violates CommonMark's left/right-flanking rules and the
literal asterisks render in the statblock.

**Fix:** trim `title` and `description` when composing the markdown string in
both components. Also guard multi-line descriptions against 4-space-indented
lines becoming code blocks (strip leading whitespace per line, or leave for a
follow-up if out of scope). Trim at display level only — do **not** mutate
the stored `Monster` value or trim inside `resolveMarkup` (converters/tests
depend on round-tripping).

**Tests:** add cases to the statblock/description tests: `" Bite"` /
`"Bite "` names and a description starting with a space all render bold-italic
correctly.

### 8. Add a clear close button to the attack line popup

**Where:** `src/app/editor/components/token-editor-popover.tsx`

The token editor popover (attack *and* save) only closes via outside-click or
Escape. Add an explicit ✕ button in the `PopoverHeader` next to
`PopoverTitle` that calls `onOpenChange(false, { reason: "close-button" })`.
Check `src/components/ui/popover.tsx` for an existing `PopoverClose`
primitive first; otherwise an icon `Button` (`size="icon-sm"`,
`variant="ghost"`) with `sr-only` label. The `MarkupField` open/close state
machine (`handleActiveKeyChange`) needs no change — a non-`escape-key` close
reason won't suppress reopening, which is the desired behavior.

### 9. "Make it more clear for action sections"

Clarified by the author: the complaint is that all feature sections (traits,
actions, bonus actions, …) share the same placeholder copy, so the sections
are indistinguishable. This is resolved by item 6 (per-section placeholders);
no separate work.

### 10. Make damage optional for saving throws

**Where:** `src/app/editor/components/token-editors/save-editor.tsx` (UI);
grammar already supports it.

`resolveSave` / `validateSaveArgs` / `serializeSaveArgs` in
`src/lib/statblock-markup.ts` already treat `dice` as optional — an empty
dice slot renders `Dexterity Saving Throw: DC 13.` with no Failure clause and
round-trips fine. The gap is presentation:

- In `SaveEditor`, label the damage inputs as optional ("Damage dice (on
  failure, optional)") and hide or de-emphasize `DamageTypeSelect` while dice
  is empty.
- Verify the "On success" select behaves sensibly with no dice (today
  `effectiveOnSave` falls back to `"none"` — correct; "Half damage" without a
  Failure clause should probably be filtered out of the options when dice is
  empty).
- Consider a damage-less variant snippet, or leave the `TAG_CATALOG` snippet
  as-is since clearing the dice field now visibly works.

**Tests:** `src/tests/` markup tests — add explicit cases for `{@save dex|15}`
and `{@save dex|con|||the target is {@condition prone}}`.

## Follow-up fixes (added during review)

Requested by the author while reviewing this PR's verification run:

- **Suppress `+ 0` in HP formulas** — `calculateHitPoints`
  (`src/lib/utils.ts`) hardcoded `+ ${extraHP}`; now omits a zero bonus and
  formats negatives as `2d8 - 2`, matching the `{@damage}` resolver's
  convention.
- **AC description never rendered** — importers and the markdown export all
  carry `armor_description`, but the statblock's AC `StatLine`
  (`src/components/monster-statblock.tsx`) only printed the number. Now
  renders `15 (natural armor)` when a description is set.
- **Step senses/movements by 5** — `step={5}` on the number inputs in the
  Senses (identity form) and Speed (combat form) grids.

## Deferred / separate work

### Undo actions
Issue notes this is covered by #93 (auto-save; undo layers on top). **Out of
scope here** — no work in this plan.

### Add description field — included after all

Originally deferred, but the schema work turned out to already exist:
`monsterSchema` has `description: z.string().optional()`, `defaultMonster`
defaults it to `""`, the Open5e importer maps `desc` into it, and the legacy
migration carries it. What was missing (and is now added in this PR):

- A `Textarea` at the bottom of `IdentityForm`.
- Statblock render: italic paragraph at the bottom of the card, after a
  tapered rule, only when non-empty.
- Homebrewery export: appended as flavor text after the `{{monster}}` frame.

No IndexedDB migration needed — the field is optional, old records parse
fine.

## Delivery

Everything (items 1–10, the follow-up fixes, and the description field)
ships in one PR per the issue author, with a changelog entry via the
`changelog-entry` skill. Only undo remains out of scope (#93). Run
`pnpm exec vitest run` locally before pushing (CI has no test step).
