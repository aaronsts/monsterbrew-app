# Custom overwrites / custom options — implementation plan

> TODO: _"Add ability for custom options (language, hp, passive perception, …)"_
> (`docs/TODO.md` line 3)

## Goal

Let users **override derived/fixed values** in the editor. Three concrete items,
all already partially scaffolded in `monster-schema.ts`:

1. **Custom HP** — type an exact HP string instead of the value derived from
   hit dice + size + CON.
2. **Custom passive perception** — type an exact number instead of the value
   derived from WIS + perception proficiency.
3. **Custom languages** — add free-text languages beyond the fixed enum list
   (e.g. _"Void Speech"_, _"telepathy 120 ft."_, _"understands Common but can't
   speak"_).

The `…` in the TODO is open-ended; this plan covers the three named cases and
leaves a repeatable pattern (a derived value + a "custom" toggle) for future
ones.

## Current state (what already exists)

| Piece              | Schema                                                                 | Derivation                                            | UI                                         | Statblock                                                |
| ------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| HP                 | `custom_hp: boolean`, `hit_points: string`, `hit_dice: string` ✅      | in statblock only (`calculateHitPoints`)              | ❌ no toggle                               | ✅ `custom_hp ? hit_points : (medianHP \|\| hit_points)` |
| Passive perception | `passive_perception: number`, `custom_passive_perception?: boolean` ✅ | ✅ `monster-form.tsx` `useEffect` respects the toggle | ❌ no field/toggle                         | ✅ reads `passive_perception`                            |
| Languages          | `languages: z.array(languagesSchema)` (enum only)                      | n/a                                                   | fixed checkbox grid in `identity-form.tsx` | ✅ joins `languages`                                     |

So the schema and statblock are mostly ready — **the gap is UI + one small
schema addition for languages.**

## Design decisions to confirm

- **Languages: separate `custom_languages: string[]` field vs. widening
  `languages` to `string[]`.**
  Recommendation: **add a separate `custom_languages: z.array(z.string())`
  field.** Widening `languages` would ripple through all five converters
  (`improvedInitiative`, `tetraCube`, `open5e`, `fiveETools`, `markdown`, which
  currently cast to `Languages[]`) and would need an IndexedDB migration. A new
  optional field is additive, needs no migration, and keeps the enum checkbox UI
  untouched. Statblock/markdown just concatenate the two arrays.
- **Toggle control.** There's no `Switch` component in `src/components/ui/` yet.
  **Add the shadcn `switch`** (`pnpm dlx shadcn@latest add switch`) and use it for
  the custom toggles — a switch reads better than a checkbox for an on/off
  "override" affordance. Wire it into the same `Field` + `FieldLabel` layout used
  by `movements.hover` / `senses.is_blind_beyond`.
- **Derived-value display when the toggle is off.** Show the derived value in a
  disabled input so the user sees what they'd be overriding. Keep the driving
  inputs (`hit_dice`, ability scores) always editable.

## Implementation steps

### 0. Add the Switch primitive

- `pnpm dlx shadcn@latest add switch` (new-york style, matches the project).
  Verify it lands in `src/components/ui/switch.tsx` and imports cleanly under the
  Base UI setup (this branch is mid-migration to Base UI — sanity-check the
  generated file uses the project's conventions before wiring it in).

### 1. Custom HP (Combat form)

**File:** `src/app/editor/components/combat-form.tsx`

- Add a `Switch` bound to `custom_hp` next to the Hit Points field
  ("Set HP manually").
- When `custom_hp` is **off**: render the `hit_points` input as `disabled`,
  showing the derived value. Compute it with the existing
  `calculateHitPoints(hit_dice, size, con)` from `@/lib/utils`
  (watch `hit_dice`, `size`, `ability_scores.con`). Keep `hit_dice` editable.
- When `custom_hp` is **on**: `hit_points` becomes a normal editable text input.
- No statblock change needed — `monster-statblock.tsx` already branches on
  `custom_hp`.
- Optional consistency nicety: when the toggle is off, write the derived string
  back into `hit_points` via `form.setValue` (mirrors how passive perception is
  handled), so the saved record and the statblock never disagree.

### 2. Custom passive perception (Identity form → Senses)

**File:** `src/app/editor/components/identity-form.tsx`

- In the Senses `FieldGroup`, add a passive-perception number `Input` bound to
  `passive_perception` plus a `Switch` bound to `custom_passive_perception`
  ("Custom passive perception").
- Toggle **off** → input `disabled`, shows the derived value.
- Toggle **on** → input editable.
- Derivation already lives in `monster-form.tsx` (`useEffect` skips recompute
  when `custom_passive_perception` is truthy) — no logic change there.
- The derivation reads `skills.perception`; `skills` lives in the Defense form.
  Since all forms already share one `useFormContext`, this works without extra
  wiring.

### 3. Custom languages (Identity form → Languages)

**Files:**

- `src/schema/monster-schema.ts` — add `custom_languages: z.array(z.string())`
  to `monsterSchema` and `custom_languages: []` to `defaultMonster`.
- `src/app/editor/components/identity-form.tsx` — below the enum checkbox grid,
  add an "Add custom language" text input. On submit/Enter, append the trimmed
  value to `custom_languages`; render each as a removable chip/badge.
- `src/components/monster-statblock.tsx` and
  `src/components/standalone-statblock.tsx` — change the Languages
  `Description` to join `[...languages, ...custom_languages]`
  (title-case only the enum ones).
- `src/services/converters/markdown.ts` — include `custom_languages` in the
  exported Languages line.
- **Import converters — route non-enum languages into `custom_languages`.**
  Today `improvedInitiative`, `tetraCube`, `open5e`, and `fiveETools` cast raw
  strings to `Languages[]`, so imported creatures can carry values that aren't
  real enum members. Split each converter's language list against the `Languages`
  enum: known members → `languages`, everything else → `custom_languages`. A
  shared helper (e.g. `partitionLanguages(strings): { languages, custom_languages }`
  in `src/lib/utils.ts` or a converter helper) keeps this consistent across the
  four importers. This also makes the enum in `languages` genuinely valid, which
  matters once `monsterSchema` is strictly parsed.

## Cross-cutting / ripple checklist

- **`createCreatureSchema.ts` (legacy schema):** the migration path
  (`migration-creature-to-monster-plan.md`) maps legacy → monster. `custom_hp`
  and `custom_passive_perception` already map directly. Add `custom_languages`
  to the migration mapping with a default of `[]` for legacy records.
- **IndexedDB:** no version bump needed — `custom_languages` is optional/additive
  and existing records simply lack it (default `[]` on load via schema parse).
  Confirm `form.reset(stored)` tolerates the missing field (it will, given the
  default).
- **Statblock (both `monster-statblock.tsx` and `standalone-statblock.tsx`):**
  keep the two renderers in sync — they duplicate the Languages/HP/PP logic.
- **Tests:** converters are the most-tested area. Add coverage in
  `src/tests/converters/` for `custom_languages` round-tripping (at least
  markdown export). Add/extend a defense/identity form test for the toggle
  behavior if form tests exist for those sections.

## Suggested order

0. Add the shadcn `switch` primitive (prerequisite for the two toggles).
1. Custom HP toggle (self-contained, statblock already ready) — smallest, proves
   the toggle pattern.
2. Custom passive perception (derivation already wired) — same pattern in
   Identity.
3. Custom languages — schema + Identity UI + both statblocks + markdown export +
   migration mapping + routing non-enum languages in the four import converters.
   (Largest slice; do it last.)

## Out of scope / follow-ups

- Other potential "custom" fields hinted at by the `…` (custom initiative,
  custom AC, custom CR sub-values). The toggle pattern established here extends
  to them if needed later.
