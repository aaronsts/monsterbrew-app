# Roadmap: Creature Authoring Power Tools

Status: proposed · Owner: — · Last updated: 2026-07-22

A cluster of features that turn Monsterbrew from a statblock *typewriter* into a
statblock *workbench* — tools that understand the creature's math and help you
balance it. They compose into one story:

> The **estimator** tells you the creature's real CR → **scale-by-CR** retargets
> it to the CR you want → **templates** layer thematic complexity on top.

## Core insight: make the CR table run backwards

Monsterbrew already ships the DMG _Monster Statistics by Challenge Rating_ table
(`CHALLENGE_RATINGS` in `src/lib/constants.ts`) — HP range, damage/round, attack
bonus, save DC, AC for every CR. Today it flows **one direction only**: the user
picks a CR (`cr.challenge_rating`) and those reference values are copied into the
`cr` object (`challengeRatingSchema` in `src/schema/monster-schema.ts`).

Nothing ever reads the _actual_ statblock back. Every feature below is a
variation on reversing that lookup.

## Decision: rely on `{@…}` markup, do NOT add structured damage (for now)

The offensive side of CR needs damage-per-round. The tempting-but-expensive move
is adding structured damage fields to actions. We're **not** doing that yet.

**Why we don't need it:** actions store their damage as `{@damage 2d8 + str}`
tags inside the `description` string, and `src/lib/statblock-markup.ts` already
parses those tags and computes their average via `averageDice()`. That gives us
a semi-structured, already-unit-tested damage signal for free. Extracting
`{@damage}` tags is far more reliable than regex-on-freeform-prose, and it costs
**zero** schema change — no ripple through the form, statblock, converters, or
IndexedDB migration (the blast radius CLAUDE.md warns about).

**The tradeoff we accept:** hand-typed actions that never use `{@damage}` tags
contribute no damage to the estimate. We handle that with an editable
damage-per-round the estimate reads (see §1), keeping a human in the loop rather
than pretending to parse prose. Structured damage stays on the table as a
_later, optional_ accuracy upgrade — see §5 — not a prerequisite.

---

## 1. CR Estimator  ·  flagship, no schema change

Compute a **suggested** CR from the creature and surface it next to the CR
picker, clearly labelled as an estimate.

### Method (DMG "Creating a Monster")

- **Defensive CR** ← effective HP + AC.
  - Effective HP = the real HP we already compute (the `hit_points` numeric,
    same math as `calculateHitPoints`), multiplied for resistances/immunities
    (`damage_modifiers`, `nonmagical_attack_modifiers` — both structured records,
    so this is direct). Rule of thumb: broad resistance ≈ ×2 effective HP over
    the low-CR band, narrower at high CR.
  - Snap effective HP to the `hit_points_range` column, then nudge the CR up/down
    when AC deviates from that row's `armor_class` (±2 AC ≈ ±1 CR).
  - **This side is essentially free** — every input is already a structured field.
- **Offensive CR** ← damage-per-round + to-hit / save DC.
  - Damage/round from the `{@damage}` tags (see §1 mechanics below).
  - Snap damage to the `damage_per_round` column, then nudge for attack bonus vs
    the row's `attack_bonus` / save DC vs `save_dc` (±2 ≈ ±1 CR).
- **Final CR** = average of defensive and offensive CR, snapped to the nearest
  `CHALLENGE_RATINGS` row. Show both halves so the user sees _why_.

### Damage-per-round extraction (the honest part)

1. Walk `actions` (and optionally `legendary_actions`, `bonus_actions`); for each
   feature, `parseMarkup(description)` and sum `averageDice()` over its
   `{@damage}` tags → a per-action damage number.
2. **Multiattack is the genuinely hard bit** — frequency lives in prose
   ("makes two claw attacks"). v1 does _not_ do NLP:
   - Show a per-action **damage breakdown** with checkboxes ("counts toward DPR")
     and a small multiplier field, pre-filled by summing single-use tags.
   - Let the user tick which actions represent a typical round and set a
     multiattack multiplier. The estimate reads that editable number.
   - This keeps the tool honest and still saves the user the arithmetic.
3. Recharge / limited-use nuance (DMG averages big attacks over 3 rounds) is a
   later refinement; v1 treats a ticked action as once/round.

### Where it lives

- Pure math module `src/lib/cr.ts` (+ `cr.test.ts`) — no React, fully unit
  tested against known SRD monsters (`src/data/srd-monsters.json` via `fromSrd`)
  as fixtures: feed a real statblock, assert the estimate lands within ~1 CR.
- UI: an "Estimated CR" panel in the CR section of the form (a `useMemo` over the
  watched `Monster`), with a "use this CR" button that writes the matching
  `CHALLENGE_RATINGS` row into `cr` (same action the picker already performs).

### Effort: **Medium.** No schema change. Defensive side is quick; the offensive
breakdown UI is the bulk of the work.

---

## 2. Scale by CR  ·  builds directly on §1

Retarget an existing creature to a chosen CR: given a target row in
`CHALLENGE_RATINGS`, adjust HP (`hit_dice` count / `con`), AC, and — where damage
is tag-driven — suggest scaled dice/bonuses so offense lands in the new
`damage_per_round` band. To-hit and save DC follow the target row's PB.

- Reuses the same `src/lib/cr.ts` primitives (the forward table lookup + the
  effective-HP/DPR math from §1).
- Honest about limits: it can retarget the _structured_ knobs (HP, AC, PB, DC)
  precisely and _suggest_ damage changes; it won't rewrite prose. Present it as
  "here's what to change," applied on confirm.
- Natural pairing: estimate → "this is CR 4 but you wanted CR 6" → one click to
  scale.

### Effort: **Medium**, mostly shared with §1.

---

## 3. Templates  ·  independent, low risk

One-click thematic mutations that layer onto a `Monster`: e.g. _Undead_,
_Fiendish_, _Elemental_, _Zombie_.

- Pure structured mutations over the schema: add entries to `damage_modifiers` /
  `condition_immunities`, set `type`, append preset `traits`/`actions`.
- Reuses the existing preset-content pattern (`src/lib/constants/actionPresets.ts`)
  — templates are basically named bundles of presets + field patches.
- No new subsystems, no schema change, independently shippable. Good "first win"
  if we want momentum before the estimator.

### Effort: **Low–Medium.**

---

## 4. Stretch ideas (not scheduled)

- **Random generator / "surprise me"** — seed from `type` + target CR, pull
  standard ability arrays and preset actions. Marketing-friendly, medium effort.
- **Spellcasting block builder** — structured spell list → formatted trait text
  (with `{@spell …}` tags). New sub-form; medium–high effort.
- **Encounter-side reuse** — the effective-HP / DPR math in `src/lib/cr.ts` is
  exactly what an encounter difficulty calculator would need later (ties into
  the broader roadmap's "encounter builder" direction).

---

## 5. Structured damage — the deferred accuracy upgrade

If/when the `{@damage}`-tag approach proves too lossy (hand-typed actions,
multiattack frequency), add **optional** structured damage to `featureSchema`
(e.g. `attacks?: { to_hit, reach/range, damage_dice, damage_type, count }[]`).

- Unlocks exact offensive CR, precise scaling, and richer rendering.
- But it ripples through schema + form + statblock + every converter +
  IndexedDB migration — the whole blast radius. Optional/back-compat is
  mandatory (old creatures have no `attacks`).
- **Explicitly out of scope for v1.** Ship §1–§3 on the markup first; let real
  usage tell us whether this is worth the cost.
- §6 (composite line tags) makes this even less necessary: the composite tag
  already holds attack type, dice, modifier, and damage type as structured args
  — a schema field would duplicate what the markup carries.

---

## 6. Token Inspector + composite line tags  ·  DECIDED: Option B

Turn rendered statblock tokens into **hover-highlight → click → structured
popover** editors, and introduce composite "line" tags so one token = one full
attack/save line = one popover with every field.

### Decision

Chosen **Option B (composite line tags)** over Option A (a group-aware inspector
over the existing atomic tags). Option A would have to infer line boundaries and
map loose prose ("reach 5 ft.", "slashing damage") back to fields — fragile.
Option B makes the whole line one structured token.

**Both representations coexist in the resolver:** composite tags are the
_authoring/editing_ unit; the atomic 5eTools tags (`@atkr`, `@hit`, `@damage`,
`@dc`, `@actSave`, …) stay fully supported so imports render untouched. This is
the cost we accept: `statblock-markup.ts`, the exporters, and their tests must
handle two representations.

### Composite tag grammar (Monsterbrew extension)

Pipe-separated args; each bonus/damage slot accepts a **flat number _or_ an
ability keyword** (same extension philosophy as the atomic tags — no inference
needed on import).

```
{@attack m|str|reach 5 ft.|2d8+str|slashing}
→ Melee Attack Roll: +7, reach 5 ft. Hit: 13 (2d8 + 4) Slashing damage.

{@save dex|con|3d6|fire|half}
→ Dexterity Saving Throw: DC 15, ... Failure: 10 (3d6) Fire damage. Success: Half damage.
```

- `@attack` args: type (`m`/`r`/`m,r`) · to-hit (ability|number) · reach/range
  text · damage dice (`2d8+str`) · damage **type**.
- `@save` args: tested ability · DC source (ability|number) · damage dice ·
  damage type · save-effect (`half`/`none`/…).
- **Damage type becomes a structured arg** (the second half of this feature). The
  resolver emits the "Slashing damage." suffix itself, so the loose trailing
  prose disappears. Also allow the type as an optional arg on the atomic tag
  (`{@damage 2d8+str|slashing}`) for finer control / multi-instance damage.

### The inspector, generalized

- **Chip/span rendering (the real prerequisite).** Today `resolveMarkup()`
  collapses tags to a plain string. To make a token hoverable/clickable, render
  tags as `<span>` chips that remember their source offset — this is the "v2
  styled chips" already anticipated in `docs/design/attack-tokens.md` §2. **This
  feature is the reason to build it.**
- **Per-tag editor registry** — a map from tag name → a small field schema +
  renderer (`attack`→type/hit/reach/dice/mod/damage-type; `save`→ability/DC/
  dice/type/effect; `dc`/`actSave`→ability picker; `hit`→ability|number;
  `damage`→count/die/mod/type). Adding a new editable token later = one entry.
  This registry is what makes it "general" across attacks, saves, and future
  token types.
- **Round-trip serialization** — parse the clicked tag's args → bind to popover
  fields → re-emit the `{@…}` string → splice back at the tracked offset in the
  RHF `description` value. Multiple identical tags are disambiguated by offset.

### Import & migration

- 5eTools imports keep their atomic tags and render correctly — **no forced
  conversion, no inference.**
- For editing an imported line, offer a one-time **"convert to editable attack"**
  action: structural parts (melee/ranged, dice, type-if-present) are explicit;
  the flat `+7` / `2d8+1` simply stay flat (the composite slot accepts flats).
- **No schema change, no IndexedDB migration** — composite tags live in the
  `description` string like every other tag. Old saved creatures keep working.

### Not covered by a single tag: spellcasters

A spell list isn't one line, so spellcasting stays a **dedicated builder** (§4)
that emits a trait full of `{@spell …}` tags — not a composite line tag. The
token inspector can still make individual `{@spell}` chips editable.

### Effort: **Medium–High.** Chip rendering + composite parser/serializer +
the editor-registry UI + export audit + two-representation tests.

---

## Suggested sequencing

1. **`src/lib/cr.ts` core** — forward table lookup + effective-HP + `{@damage}`
   extraction, with SRD-fixture tests. No UI, no visible change.
2. **CR Estimator panel** (§1) — the headline feature.
3. **Scale by CR** (§2) — small addition on the same core.
4. **Templates** (§3) — parallelizable; can land anytime (or first for momentum).
5. **Token Inspector + composite tags** (§6) — its own track. Order within it:
   chip rendering → composite `@attack`/`@save` parse+resolve+serialize → editor
   registry & popover → "convert imported line" action → export/round-trip tests.
6. _Later, only if warranted:_ structured damage (§5), then generator /
   spellcasting (§4).

Steps 1–2 deliver the differentiated "it knows your creature's real CR" moment;
3–4 round out the workbench; §6 is the standout authoring UX and can proceed in
parallel since it shares no code with the CR estimator.

## Open questions

- **Multiattack frequency:** editable multiplier (v1) vs. parsing the Multiattack
  action's prose for count + referenced action names (fuzzy). Start manual.
- **Resistance HP multiplier:** which CR bands, and how to treat
  `nonmagical_attack_modifiers` (very common, band-dependent value).
- **Which action buckets feed DPR:** actions only, or also legendary/bonus/lair?
  Probably actions + a fraction of legendary; make it visible and adjustable.
- **Estimate accuracy bar:** what "within ~1 CR on N SRD monsters" pass rate do
  we consider good enough to ship the label without a "beta" caveat?
- **Composite tag grammar (§6):** exact arg order and which are optional; how to
  represent multi-instance damage ("2d8 slashing plus 1d6 fire") — repeatable
  damage args vs. a second atomic `{@damage …|type}` after the composite.
- **Reach vs. range (§6):** free-text (`reach 5 ft.`) vs. structured
  (`reach|5`) so the popover can offer a number field.
- **Composite grammar versioning (§6):** tags are persisted in saved creatures,
  so the arg order is effectively a stored format — pin it and keep the resolver
  backward-compatible if it ever changes.
