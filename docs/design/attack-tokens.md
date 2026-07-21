# Design: Stat-linked attack tokens & 5eTools markup import

## Goal

Give Monsterbrew its own inline markup for action/trait text so that:

1. **Authors can tag attack modifiers, damage, and save DCs to a creature's stats.**
   A tagged value (e.g. a to-hit bonus derived from STR + proficiency) is
   **recomputed in the statblock** whenever the underlying ability score, size,
   or CR changes — no more manually re-typing `+7` on every attack.
2. **5eTools imports are transformed into that same markup.** Today a 5eTools
   `action` like
   `{@atkr m} {@hit 3}, reach 5 ft. {@h}10 ({@damage 2d8 + 1}) Acid damage.`
   is stored verbatim and rendered literally (curly-brace soup) in the
   statblock. It should become clean, stat-linked Monsterbrew text.

## Current state (what we build on)

- The canonical creature type is `Monster` (`src/schema/monster-schema.ts`).
  Every feature (`traits`, `actions`, `reactions`, `bonus_actions`,
  `legendary_actions`, `mythic_actions`, `lair_actions`) is
  `{ name: string; description: string }`.
- `from5eTools` (`src/services/converters/from-5e-tools.ts`) maps 5eTools JSON
  into `Monster`. `convertFeatures()` currently does `entries.join("\n")` — the
  `{@…}` tags pass through untouched.
- The statblock (`src/components/monster-statblock.tsx`) renders each feature
  via `StandAloneDescription` (`src/components/ui/stand-alone-description.tsx`),
  which wraps the description in Markdown (`***title.*** description`).
  It already receives the full `creature`, so ability scores / PB / size are in
  scope for computing derived values.
- The editor action UI is `src/app/editor/components/actions-form.tsx` — each
  feature description is a plain `<Textarea>`.
- Game math lives in `src/lib/utils.ts` (`calculateStatBonus`,
  `calculateHitPoints`). CR/PB reference tables in `src/lib/constants.ts`.
- Tests live in `src/tests/converters/*` and colocated `*.test.ts(x)`.

### Tag inventory (from `e2e/fixtures/5e-tools/*.json`)

Combat / mechanics tags we must translate:

| 5eTools tag                    | Meaning                          | Renders as |
|--------------------------------|----------------------------------|------------|
| `{@atkr m}` / `{r}` / `{m,r}`  | attack roll type (2024)          | `Melee Attack Roll:` |
| `{@atk mw}` / `rw` / `ms` / `rs` | attack type (2014, legacy)     | `Melee Weapon Attack:` |
| `{@hit 19}`                    | flat to-hit bonus                | `+19` |
| `{@h}`                         | "Hit:" label                     | `Hit:` |
| `{@damage 4d12 + 10}`          | damage dice                      | `26 (4d12 + 10)` (avg recomputed) |
| `{@dc 20}`                     | save DC                          | `DC 20` |
| `{@actSave dex}`               | save prompt (2024)               | `Dexterity Saving Throw:` |
| `{@actSaveFail}` / `Success` / `SuccessOrFail` | save outcome label | `Failure:` / `Success:` |
| `{@dice 1d6}`                  | inline dice                      | `1d6` |
| `{@recharge 5}`                | recharge                         | `(Recharge 5–6)` |

Flavour / reference tags — strip the source, keep the label:

| Tag | Renders as |
|-----|-----------|
| `{@spell Mending\|XPHB}` | `Mending` |
| `{@condition prone}` | `prone` |
| `{@variantrule Cover\|XPHB}` | `Cover` |
| `{@status concentration}` | `concentration` |
| `{@item longsword\|XPHB}` | `longsword` |
| `{@creature goblin\|XMM}` | `goblin` |

General rule for any unhandled `{@tag text|source|display}`: emit `display ??
text` (first pipe-segment), i.e. never leak braces into output.

## Monsterbrew markup — adopt the 5eTools tag syntax

**Decision:** Monsterbrew's native markup *is* the 5eTools `{@…}` tag syntax.
We do not invent a new delimiter. Markup lives **inside the existing
`description` strings** — no schema change, backward compatible, every
converter/exporter keeps speaking one shape — and 5eTools imports need almost
**no conversion** because their tags are already our tags.

### One extension: ability keywords for stat-linking

5eTools always writes a **number** where a bonus/DC goes (`{@hit 3}`, `{@dc 15}`).
Monsterbrew accepts, in the *same slot*, an **ability keyword** (`str dex con int
wis cha`) which means "compute this from the creature's stats and recompute it in
the statblock." Because 5eTools never puts a word there, the two are unambiguous
and fully backward compatible.

```
{@hit str}      to-hit from an ability   -> "+7"   (mod(str) + PB)   ← Monsterbrew
{@hit 3}        flat to-hit (as 5eTools)  -> "+3"                     ← 5eTools
{@dc con}       save DC from an ability    -> "DC 15" (8 + PB + mod(con))  ← Monsterbrew
{@dc 15}        flat DC (as 5eTools)       -> "DC 15"                  ← 5eTools
{@damage 2d8 + str}   ability-linked damage -> "2d8 + 4" (str resolved)   ← Monsterbrew
{@damage 2d8 + 1}     flat damage (as 5eTools) -> "2d8 + 1"           ← 5eTools
```

**This is what "takes care of import linking":** imported flat values stay flat
and correct with zero guessing, and an author opts a value into being
stat-linked simply by swapping the number for an ability keyword. No fragile
"which ability produced +3?" inference on import.

### Tags the renderer interprets

| Tag | Renders as |
|-----|-----------|
| `{@atkr m}` / `{r}` / `{m,r}` | `Melee Attack Roll:` / `Ranged…` / `Melee or Ranged…` |
| `{@atk mw}` / `rw` / `ms` / `rs` (legacy 2014) | `Melee Weapon Attack:` etc. |
| `{@hit str}` / `{@hit 3}` | `+7` / `+3` |
| `{@h}` | `Hit:` |
| `{@damage 2d8 + str}` / `{@damage 2d8 + 1}` | `2d8 + 4` / `2d8 + 1` (+ optional avg — see below) |
| `{@dc con}` / `{@dc 15}` | `DC 15` |
| `{@actSave dex}` | `Dexterity Saving Throw:` |
| `{@actSaveFail}` / `{@actSaveSuccess}` / `{@actSaveSuccessOrFail}` | `Failure:` / `Success:` / `Failure or Success:` |
| `{@recharge 5}` / `{@recharge}` | `(Recharge 5–6)` / `(Recharge 6)` |
| `{@dice 1d6}` | `1d6` |
| reference tags `{@spell/@condition/@item/@variantrule/@status/@creature …\|SRC}` | first pipe-segment (`Mending`, `prone`, …) |
| any other `{@tag text\|src\|display}` | `display ?? text` — never leak braces |

### Damage average (the one place we're richer than raw 5eTools)

5eTools writes the average as **literal text before** the tag:
`{@h}10 ({@damage 2d8 + 1})`. To make averages dynamic (goal #1), the renderer
can compute and prepend the average itself so `{@damage 2d8 + str}` →
`13 (2d8 + 4)`. If it does, the importer must **strip the redundant literal
average** that precedes ` ({@damage …})` so we don't double it (`10 (13 (2d8+1))`).
See open questions — this is the only non-trivial import edit.

### Resolution semantics

- `mod(ability)` = `calculateStatBonus(creature.ability_scores[ability])`.
- `{@hit ABILITY}` → `+ (mod + creature.cr.proficiency_bonus)`;
  `{@hit N}` → `+N` verbatim.
- `{@dc ABILITY}` → `DC (8 + PB + mod(ability))`; `{@dc N}` → `DC N`.
- `{@damage DICE}` → resolve any ability keyword inside the expression to its
  `mod` (`2d8 + str` → `2d8 + 4`); optionally prepend the computed average
  (`sum(count*(die+1)/2) + flatBonus`, floored, min 1) — same dice math as
  `calculateHitPoints`.
- Unknown ability / malformed tag → render the raw tag text unchanged and do
  **not** throw (statblock must never blank out mid-edit).

## Implementation

### 1. Tag core — `src/lib/statblock-markup.ts` (+ `statblock-markup.test.ts`)

- `TAG_RE` + `parseMarkup(text): Array<TextSegment | Tag>` — splits a description
  into literal-text and `{@…}` tag segments (name, args, pipe-parts).
- `resolveTag(tag, creature): string` — one switch over tag names producing
  display text, using `calculateStatBonus`, PB, an `averageDamage(diceExpr, …)`
  helper, and the ability-keyword extension for `@hit/@dc/@damage`.
- `resolveMarkup(text, creature): string` — parse + resolve + join; used by the
  renderer **and** the exporters. Pure, no React, fully unit-tested.
- Note: this same resolver interprets tags no matter their origin (5eTools
  import, SRD library, or hand-typed), so nothing source-specific lives here.

### 2. Statblock rendering — `stand-alone-description.tsx` + `monster-statblock.tsx`

- Thread `creature` (or just `{ ability_scores, cr }`) down through
  `TraitList` / `FeatureSection` into `StandAloneDescription`.
- In `StandAloneDescription`, run `resolveMarkup(description, creature)` before
  handing the string to Markdown.
  - v1: resolve to plain string (keeps the current Markdown pipeline).
  - v2 (optional): render tags as styled `<span>` chips (subtle accent colour)
    via a segment-based renderer, so stat-linked values are visually
    distinguishable in the app (still plain text in Homebrewery/PDF export).
- Export: `markdown.ts` (Homebrewery) and the PDF path must also call
  `resolveMarkup` so exports contain final values, not raw `{@…}` tags. Audit
  every place a `description` reaches output.

### 3. 5eTools import — mostly pass-through (`from-5e-tools.ts`)

Because the tags are already our markup, import barely converts. `convertFeatures`
/ `convertTraits` keep the tag strings verbatim; the only cleanups:

- **Strip source refs** so links don't carry `|XPHB` into text — either here or
  (simpler) leave them and let `resolveMarkup` drop the source at render time.
  Prefer doing it in `resolveMarkup` so SRD/hand-typed content benefits too.
- **Strip the redundant literal damage average** iff the renderer prepends its
  own (see markup section): drop the integer immediately before ` ({@damage …})`.
  Skip this if we decide the renderer keeps 5eTools's literal average as-is.
- Everything else (`@hit/@dc/@atkr/@h/@actSave/@recharge/@dice`) needs **no**
  conversion — it already renders correctly.

No "which ability made +3?" inference — flat imported values stay flat; authors
opt into linking by editing a value to an ability keyword.

### 4. Editor authoring UI — `actions-form.tsx`

- Add a small **"Insert" popover** above/next to each description `<Textarea>`
  (or one shared control that targets the focused field) offering:
  attack roll type, to-hit (ability picker → `{@hit str}`), damage (dice input +
  optional ability → `{@damage 2d8 + str}`), save DC (ability picker), Hit /
  Failure / Success labels, recharge.
- Insert the corresponding tag at the caret (track selection on the textarea;
  splice into the RHF field value).
- Live inline hint: show the resolved preview beneath the field (reuse
  `resolveMarkup` with the watched creature) so authors see `+7` / `13 (2d8+4)`
  as they type. The right-hand statblock preview already updates live too.
- Keep it optional — hand-typed `{@hit str}` must work without the UI.

### 5. Tests

- `statblock-markup.test.ts` — `parseMarkup` + `resolveTag` across every tag row,
  ability-keyword vs numeric args, dice averages, malformed tags (pass through).
- Extend `from-5e-tools.test.ts` — assert the gray-ooze Pseudopod action, after
  `resolveMarkup` with its stats, renders clean human text (no `{@…}`, correct
  `+3` / damage). Add tarrasque (saves, recharge, dice) + arch-hag coverage.
- Statblock render test — a `Monster` whose action uses `{@hit str}` /
  `{@damage 2d8 + str}` renders the computed strings; bumping STR changes them.
- Round-trip guard — importing a fixture and rendering must contain **no** `{@`.
- Run `pnpm exec vitest run` before pushing (CI has no test step).

## Rollout / ordering

1. Tag core (`statblock-markup.ts`) + tests — no UI, no visible change.
2. Statblock + export rendering — plain descriptions unaffected; `{@…}` tags
   gain meaning everywhere they're rendered/exported.
3. 5eTools import cleanup + fixture tests — imports now render as clean text.
4. Editor insert UI + live preview.
5. (Optional) styled tag chips in-app.

Steps 1–3 deliver the headline value (clean 5eTools imports that render + dynamic
stat-linked values); 4 makes them easily authorable; 5 is polish.

## Decisions & open questions

- **Syntax — DECIDED:** reuse the 5eTools `{@…}` tags as our native markup;
  extend the value slot of `@hit/@dc/@damage` to accept an ability keyword for
  stat-linking. Resolves the earlier delimiter + import-linking questions:
  imports pass through, linking is an authoring choice, no inference.
- **Damage average — DECIDED (implemented):** the renderer prepends a computed
  average (`13 (2d8 + 4)`, dynamic), and `resolveMarkup` strips 5eTools's
  redundant literal pre-tag average (`10 ({@damage …})` → `{@damage …}`) so it's
  never doubled. Hand-typed content, which never carries the literal average, is
  unaffected.
- **Persistence:** tags live in the `description` string, so no IndexedDB
  migration is needed and old saved creatures keep working. Confirm we don't
  want a structured action sub-model instead (bigger change, out of scope here).
