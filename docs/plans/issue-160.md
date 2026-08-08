# Issue #160 — FoundryVTT + Improved Initiative export, plus the stale converter docs

Branch: `feat/issue-160-export-gaps` · Worktree: `.claude/worktrees/issue-160` · E2E port: **3160**

## Scope decisions (agreed before planning)

The issue lists four items. One is dropped by request:

- **Item 1, export from the editor — dropped.** Export stays a library-only feature.

Item 2 (the Improved Initiative exporter) was dropped and then **reinstated** later in
implementation; it is in scope. A 2024-style rewrite of the Homebrewery markdown export
was raised and then dropped; `to-markdown.ts` keeps its current output and is not touched
by this branch.

That leaves:

1. **FoundryVTT export** (`to-foundry.ts` + `src/types/foundry.ts`).
2. **Improved Initiative export** (`to-improved-initiative.ts`, against the existing
   `src/types/improved-initiative.ts`), with a round-trip test against
   `fromImprovedInitiative` as the issue asks.
3. **Fix CLAUDE.md's stale converter section.**

Both exporters are offered wherever Homebrewery is — see Part 2 for how that surface
changed.

Consequences of dropping the editor mount, worth stating because they undo earlier
planning:

- **No shared export surface.** The issue's "one export surface, two mount points" note
  and its `useCreatureExports` / `<CreatureExportActions>` suggestion existed to keep the
  editor and library in sync. With one mount point there is nothing to keep in sync.
- **No PDF lifting.** `PDF_PAGE_STYLE` and the `useReactToPrint` call stay in
  `creature-actions-menu.tsx`; that refactor only existed to serve the editor.
- **No editor changes at all.** `monster-form.tsx` and `statblock-preview.tsx` are not
  touched, so the #158 render-count guard is not at risk.

One remaining decision, agreed: **the Foundry export is rollable.** `{@attack …}` becomes
a Foundry *attack* activity and `{@save …}` a *save* activity, with a plain descriptive
item as the fallback. The SRD data carries 390 `{@attack}` and 171 `{@save}` composite
tags against only 32 legacy `{@atkr}`, so the structured path covers nearly everything.

### Issue bookkeeping

Item 1 is out of scope, so the issue cannot be closed exactly as written. Before opening
the PR: edit #160 to strike item 1 and its acceptance criterion ("A creature can be
exported from `/editor` without being saved first"), and file that work as its own
follow-up issue — it is a real user-facing gap and the reasoning in #160 is worth
keeping. Items 2, 3 and 4 are all delivered. **Confirm this with the user before editing
the issue.**

## Global Constraints

Copied verbatim from the issue; everything below inherits these.

- New files are exactly `src/services/converters/to-foundry.ts` and
  `src/types/foundry.ts`.
- "Export takes `Monster`, not `StoredMonster`." `ExportMarkdownDialog` already types its
  prop as `Monster` — follow that.
- Converters are the most test-covered area; new tests go under `src/tests/converters/`.
- "Foundry has no importer, so assert against a fixture."
- No schema change, no IndexedDB migration.
- Foundry target shape is the sample actor JSON referenced by the issue — dnd5e system
  **4.3.7**, core **12.331**, `system.source.rules: "2024"`.

Out of scope (from the issue): Roll20/VTTES, multi-creature export, export from the SRD
detail page, single-creature print changes.

## Reference: the Foundry actor shape

Four real actor exports were downloaded and inspected: ghoul (simple), troll, commoner,
ancient white dragon (legendary + lair + save activities). The observed shapes drive the
mapping below — **match the sample field-for-field rather than inventing fields.** Foundry merges an
imported actor against its system template, so a partial `system` is legal; emit what we
have and omit the rest.

Two mappings are exact, and are the reason the rollable path is worth the code:

| Monsterbrew markup | Foundry |
|---|---|
| `{@save con\|con\|…}` → ability keyword DC | `save.dc.calculation: "con"` (Foundry computes 8 + PB + mod) |
| `{@save con\|15\|…}` → flat DC | `save.dc: { calculation: "", formula: "15" }` |
| `{@attack m\|str\|…}` → ability keyword to-hit | `attack.ability: "str"` + item `proficient: 1` |
| `{@attack m\|7\|…}` → flat to-hit | `attack.flat: true, bonus: "7"` |

## Part 1 — the converter

### `src/types/foundry.ts`

Plain TypeScript interfaces, not Zod. Every other type file backs an *importer* and needs
runtime parsing; this format is export-only, so there is nothing to validate.
(`to-markdown.ts` likewise has no type file — this one exists because the issue asks for
it and because the actor shape is large enough to be worth naming.)

Interfaces: `FoundryActor`, `FoundryActorSystem`, `FoundryItem`, `FoundryActivity` (union
of `FoundryAttackActivity` / `FoundrySaveActivity` / `FoundryUtilityActivity`),
`FoundryDamagePart`, plus the id-literal unions (`FoundrySize`, `FoundryCreatureType`,
`FoundryDamageType`, `FoundryCondition`, `FoundryLanguage`, `FoundryActivationType`).

### `src/services/converters/to-foundry.ts`

`monsterToFoundryActor(creature: Monster): FoundryActor` — pure and side-effect free,
like `monsterToHomebrewery`.

**Actor `system`**

| Foundry path | From |
|---|---|
| `abilities.<k>.value` | `ability_scores.<k>` |
| `abilities.<k>.proficient` | `saving_throws.<k>` → `1` / `0` |
| `attributes.ac` | `{ flat: armor_class, calc: "flat" }` — `flat` so the authored number survives exactly |
| `attributes.hp` | `value`/`max` = median HP; `formula` = `<hit_dice>d<size die> + <con mod × count>`. `custom_hp` → parse the leading integer of `hit_points` for value/max, leave `formula` empty |
| `attributes.movement` | `movements`, `units: "ft"`; `0` → `null` (matches samples) |
| `attributes.senses` | `senses`, `units: "ft"`; `is_blind_beyond` → `special: "blind beyond this radius"` |
| `attributes.init.bonus` | `custom_initiative` → `initiative_bonus − dex mod`, else `""` |
| `details.type` | `{ value, subtype: sub_type, custom, swarm: "" }`; unknown `type` → `value: "custom"` + `custom` |
| `details.alignment` | `alignment` |
| `details.cr` | numeric CR — `"1/8"`→`0.125`, `"1/4"`→`0.25`, `"1/2"`→`0.5`, else `Number()` |
| `details.biography.value` | `description`, HTML-escaped, one `<p>` per paragraph |
| `traits.size` | `tiny`→`tiny`, `small`→`sm`, `medium`→`med`, `large`→`lg`, `huge`→`huge`, `gargantuan`/`titanic`→`grg` (Foundry has no titanic) |
| `traits.di/dr/dv` | `damage_modifiers` split by state, filtered to Foundry's 13 damage ids; unrecognised ones join `custom` |
| `traits.di/dr.bypasses` | `nonmagical_attack_modifiers`: `nonmagical`→`["mgc"]`, `silvered`→`["sil"]`, with bludgeoning/piercing/slashing added to `value` |
| `traits.ci.value` | `condition_immunities` — our `CONDITIONS` ids already match Foundry's |
| `traits.languages` | `languages` mapped (`deep-speech`→`deep`, `thieves-cant`→`cant`, rest 1:1); `custom_languages` → `custom`, semicolon-joined |
| `skills.<code>.value` | `skills` → `2` expert, `1` proficient, `0` otherwise, via a skill-name → 3-letter-code map |
| `resources.legact` | `is_legendary` → `{ value: 3, max: 3 }`, else `0/0` |
| `resources.lair.value` | `has_lair` |
| `source` | `{ custom: "Monsterbrew", rules: "2024" }` |

`resources.legres` stays `0/0`: Monsterbrew has no legendary-resistance field, and
inferring one from a trait named "Legendary Resistance" would be a heuristic nobody
asked for.

**Actor `items`** — one per feature, in section order:

| Monster field | `activation.type` |
|---|---|
| `traits` | none (no activity at all, like the dragon's passive "Ice Walk") |
| `actions` | `action` |
| `bonus_actions` | `bonus` |
| `reactions` | `reaction` |
| `legendary_actions` | `legendary` |
| `lair_actions` | `lair` |
| `mythic_actions` | `mythic` |

Gated sections respect their flags exactly as `to-markdown.ts` does: skip
`legendary_actions` unless `is_legendary`, `mythic_actions` unless `is_mythic`,
`lair_actions` unless `has_lair`.

Item type and activity come from the feature's *first* composite tag:

- Contains `{@attack …}` → item `type: "weapon"`, `system.type.value: "natural"`,
  `proficient: 1`, `equipped: true`, one `attack` activity.
  - `attack.type.value` = `melee` / `ranged` from `kind` (`m,r` → `melee`, range still
    carrying both figures).
  - Ability to-hit → `attack.ability`; numeric to-hit → `attack.flat: true` +
    `bonus: "<n>"`.
  - `reach` → `range.reach` (melee) / `range.value` + `range.long` (ranged),
    `units: "ft"`.
  - `dice`/`type` → `damage.parts[0]`; `dice2`/`type2` → `parts[1]`.
- Contains `{@save …}` → item `type: "feat"` with one `save` activity.
  - `save.ability: [<ability>]`.
  - Ability-keyword DC → `dc: { calculation: "<ability>", formula: "" }`; flat DC →
    `dc: { calculation: "", formula: "<n>" }`.
  - `dice`/`type` → `damage.parts[0]`; `onSave` → `"half"` / `"none"` (custom success
    text is not a Foundry enum value, so it degrades to `"none"` and stays readable in
    the description).
- Anything else → item `type: "feat"` with a `utility` activity, or no activity for
  traits.

Every item keeps the full resolved text in `system.description.value` regardless of which
branch it took, so nothing is lost when a tag doesn't parse.

**Damage parts.** `{ number, denomination, bonus, types: [type], custom: { enabled: false
}, scaling: { number: 1 } }`, parsed from the dice expression *after* ability keywords are
resolved to literal numbers against the creature's stats — an exported actor should roll
the numbers the statblock shows. That needs a resolved expression rather than an average,
so **export a small `resolveDiceExpression(dice, ctx)` helper from
`src/lib/statblock-markup.ts`** (`resolveDiceAbilities` + `normalizeSigns`, both already
there and private). An expression with no dice term (`{@damage 4}`) becomes a bonus-only
part.

**Where the parts go** follows the samples rather than convenience: the *primary* damage
sits on the item as `system.damage.base` and the activity opts into it with
`damage.includeBase: true`, leaving `damage.parts` for the "plus N damage" rider only. A
first pass put everything in `parts` with `includeBase: false` — the totals roll the same,
but the weapon's item sheet would have shown no base damage, and it contradicted the
field-for-field rule above. A damageless attack (`{@attack m|str|5}`) omits
`system.damage` and sets `includeBase: false`.

**Ids are deterministic.** Foundry `_id`s are 16 alphanumeric characters. Random ids would
make the fixture test unstable and make re-exporting the same creature produce a different
file each time, so ids come from a small non-crypto hash of
`<creature name>:<section>:<index>` (plus `:activity` for the nested activity id). Same
creature in, same file out.

## Part 1b — the Improved Initiative converter

`src/services/converters/to-improved-initiative.ts` —
`toImprovedInitiative(creature: Monster): ImprovedInitiativeCreature`, against the
existing `src/types/improved-initiative.ts`. No new type file: the schema is already
there, because the importer needs it.

The issue asks for "a round-trip test against `fromImprovedInitiative`", and that is the
right shape of test — but it only passes if the exporter satisfies two quirks of the
format that are easy to miss, both found by reading the importer rather than the schema:

- **There is no `Name` field.** The creature's name goes in `Description`, which is where
  `fromImprovedInitiative` reads it from.
- **Speeds must carry their keyword.** The importer matches on "walk"/"fly"/…, so the
  obvious `formatMovements(...)` is wrong: it emits a bare `"30 ft."` for walk, which the
  importer silently drops to 0.

Everything else follows `to-markdown.ts`: saves are `mod + PB`, skills `mod + PB` (or
`+ 2×PB` for expertise), `{@…}` markup is resolved on the way out, and the legendary /
mythic sections respect their flags.

Deliberately lossy, because the format has nowhere to put them: the flavour `description`,
`sub_type` (written into the `Type` line for display, but not parsed back),
the legendary/mythic preambles, and `custom_initiative`. Lair actions are folded into
`Traits` with a `"Lair Action: "` prefix rather than dropped. `nonmagical_attack_modifiers`
are spelled out into the free-text damage lists ("bludgeoning, piercing, and slashing from
nonmagical attacks"), so they reach an Improved Initiative reader even though they come
back as free-text damage keys rather than the structured field.

One asymmetry worth knowing when reading the round-trip test: the importer infers
expertise from `Modifier >= 2 × PB`, so a merely-proficient skill on a high ability score
can come back as expertise. That is a limit of the importer's heuristic, not of the
exporter; the round-trip fixture picks ability scores that don't trip it.

## Part 2 — library wiring: one export surface

**Revised mid-implementation.** The first pass added a third export icon button beside
Homebrewery and PDF. That left a six-button bar where half the buttons were exports, and
every future format would make it worse. Reverting to a dropdown menu was rejected: #137's
own wording was "make action dropdown in library back to seperate buttons (icon with
tooltip)", so a menu is the one thing explicitly removed before.

What shipped instead: **one `Export` button opening one dialog, with the format chosen
inside it.** The action bar drops to four — Edit · Duplicate · Export · Delete — and
#137's decision stays intact, because the actions are still separate buttons; only the
export *targets* moved behind a single entry point.

`src/app/library/components/export-dialog.tsx` — new, and replaces **both**
`export-markdown-dialog.tsx` and the short-lived `export-foundry-dialog.tsx` (deleted).
Base UI's `Tabs` (already a dependency, no new UI primitive) switches between Homebrewery,
FoundryVTT and PDF. The two text formats share the existing preview + Copy + Save shape
and differ only in the string they produce and the file extension; PDF has nothing to
preview, so it swaps in a short note and a Print button and the footer drops Copy/Save.
Only the selected format is converted, so opening for markdown never pays for the Foundry
mapping. The per-format blurb doubles as the import instructions.

Two implementation notes worth keeping, both found in the browser rather than by tests:

- Base UI keeps inactive `Tabs.Panel`s mounted, so rendering one panel per format left
  multiple textareas in the DOM competing for the same accessible role. A single panel
  whose `value` tracks the selection avoids the whole class of problem.
- Base UI marks the selected tab with **`data-active`**, not `data-selected`. Keying the
  styling off the wrong attribute silently styles nothing — the selection was visible only
  to screen readers. `export-dialog.test.tsx` pins `data-active` for that reason.

`src/app/library/components/creature-actions-menu.tsx` — the three export buttons collapse
to one labelled `Export` (`Download` icon, `size="sm"`). `PDF_PAGE_STYLE` and the
`useReactToPrint` call stay here, since printing needs the on-page statblock ref; the
dialog receives the trigger as an `onPrint` prop. Edit/Duplicate/Delete and the `#137`
comment are untouched.

`creatureFileSlug()` moves to `src/lib/utils.ts` so both download formats name their file
off the same slug.

## Part 3 — CLAUDE.md

Fix the whole pre-#97 block, not just the one line the parent flagged:

- Line 16's single-test example → a path that exists
  (`src/tests/converters/from-5e-tools.test.ts`).
- The converter list → the real kebab-case files: `from-improved-initiative.ts`,
  `from-tetra-cube.ts`, `from-open-5e.ts`, `from-5e-tools.ts`, `from-srd.ts`,
  `to-markdown.ts`, and the new `to-foundry.ts` / `to-improved-initiative.ts`. Improved
  Initiative is the one format that round-trips both ways; note its two traps (the name
  lives in `Description`, and speeds must keep their keyword) so the next person doesn't
  rediscover them.
- `createMarkdownPage` / `window.open()` → `monsterToHomebrewery` surfaced through
  `ExportMarkdownDialog` (copy to clipboard or download `.md`).
- Import wiring path → `src/app/editor/components/import-dialog.tsx`.
- Export wiring → the icon buttons in `creature-actions-menu.tsx` (Homebrewery,
  FoundryVTT, PDF), and drop the reference to `creature-form.tsx`, which no longer exists.
  State plainly that export is library-only, so the next reader doesn't go looking for it
  in the editor.

## Test strategy

TDD where the code is pure: the converter is written test-first.

**Unit — `src/tests/converters/to-foundry.test.ts`** (the bulk)

- Actor identity: name, `type: "npc"`, size code, creature type including the
  unknown-type → `custom` path, numeric CR including the three fractions.
- Abilities + save proficiency flags; skills at `1` and `2`.
- Damage modifiers into `di`/`dr`/`dv`, an unrecognised type into `custom`, and the
  `nonmagical`/`silvered` → `bypasses` mapping.
- Condition immunities; languages including `deep-speech`/`thieves-cant` and customs.
- Senses including `is_blind_beyond`; movement including hover; AC; both HP branches.
- `resources`: legendary and lair flags on and off.
- Items: one per section with the right `activation.type`; gated sections omitted when
  their flag is off; traits carry no activity.
- Attack activity from `{@attack m|str|5|2d8+str|slashing}` — ability, reach, both damage
  parts — and the numeric-to-hit `flat` variant.
- Save activity from `{@save dex|con|…}` — `dc.calculation`, the flat-DC variant, damage
  part, `onSave` half/none.
- Fallback: a feature with untagged prose yields a `feat` carrying that prose in
  `description` and no attack/save activity.
- Determinism: converting the same creature twice deep-equals.

**Unit — `resolveDiceExpression`** added to the existing statblock-markup test file:
ability resolution, sign normalisation (`2d8 + -1` → `2d8 - 1`, `+ 0` dropped), and
pass-through of a plain expression.

**Fixture — `src/tests/converters/to-foundry.fixture.test.ts`**

Input is a real SRD creature pulled through `getSrdMonster` (not an invented shape, per
the repo's fixture rule); output is deep-equalled against a committed
`src/tests/converters/fixtures/foundry-<slug>.expected.json`. Deterministic ids make this
stable. Pick a creature that exercises legendary actions and a breath weapon.

**Component — `src/app/library/components/export-dialog.test.tsx`**

Opens on Homebrewery; switching tabs swaps both the preview and the download extension;
copy writes the *visible* format to a stubbed clipboard; the PDF tab has no textbox and no
copy/save but does fire `onPrint`; the selected tab carries `data-active` (the attribute
the styling keys off, which nothing else here would catch). No router is involved, so no
router provider is needed.

**e2e — extend `e2e/library.spec.ts`**

It already drives the detail page for duplicate and delete. Add one test: open a saved
creature, click the FoundryVTT export button, assert the dialog shows JSON containing the
creature's name and `"type": "npc"`. Full suite runs regardless
(`E2E_PORT=3160`) — shared helpers use structural selectors and the action bar gains a
button.

**Runtime check** (`verify` skill): the detail action bar at 375px and desktop, and each
tab of the export dialog including the download. This is where both Base UI quirks above
surfaced — worth doing rather than trusting the diff. Separately, the Homebrewery render check described in Part 3.

## Open questions / risks

- `activation.type: "mythic"` is used by dnd5e but appeared in none of the downloaded
  samples. Confirm it is a real activation id during implementation; fall back to
  `legendary` if not.
- `resources.legact.max: 3` is an assumption — Monsterbrew has no field for legendary
  actions per round, and 3 is the near-universal value.
- The only true check of "imports into Foundry" is a human dropping the file into a real
  Foundry world. The fixture test pins the shape against real exported actors, which is
  the strongest automated check available; say so plainly in the confidence check rather
  than claiming verified Foundry compatibility.

## Order of work

1. `resolveDiceExpression` helper + test.
2. `src/types/foundry.ts`.
3. `to-foundry.ts` test-first, then the fixture test.
4. `export-dialog.tsx` + test, replacing both previous dialogs; collapse the export
   buttons in `creature-actions-menu.tsx` to one.
5. e2e addition to `library.spec.ts`.
6. CLAUDE.md.
7. Full verification: `pnpm exec vitest run`, `pnpm lint`, `E2E_PORT=3160 pnpm exec
   playwright test`, plus the browser pass.
