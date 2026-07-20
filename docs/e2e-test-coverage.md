# E2E test coverage & confidence

Tracks the Playwright end-to-end suite added for the migrated editor
(`e2e/*.spec.ts`, config in `playwright.config.ts`), what it actually verifies,
and where the gaps are. Run with `pnpm test:e2e` (Chromium; auto-starts the dev
server).

> Requires `@playwright/test` ≥ 1.53 — 1.52 hangs indefinitely on Node 24, so the
> suite is pinned to `^1.61.1`.

## Confidence: moderate — a smoke test, not a safety net

The suite exercises the real stack (real form → live preview → IndexedDB, in a
real browser), which is exactly what a schema/editor migration is most likely to
break. It reliably catches **"a whole section stopped wiring up"** or
**"persistence is broken."** It would **not** catch **"a saving throw is off by
the proficiency bonus"** or **"one field silently drops on reload."**

## ✅ Covered

| Area                | Tests                                                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Live preview**    | placeholder statblock; Identity fields (name/type/size/alignment) sync; ability-modifier recompute; add/remove trait       |
| **Conditional UI**  | Legendary actions hidden until toggled, then render in the statblock                                                        |
| **Persistence**     | empty-name save warning (no navigation); save → IndexedDB → listed in `/my-creatures`; reload via `/editor?id=` shows name |
| **Round-trip**      | `round-trip.spec.ts` — a richly-filled creature (every section: identity, senses, languages, combat, saves, skills, damage, conditions, traits/actions/reactions/bonus + legendary/mythic/lair) survives save → reload intact |
| **Defense form**    | `defense.spec.ts` — saving-throw proficiency SAVE column; skill tri-state (none→proficient→expert) aria + statblock; damage-modifier cycling into the right statblock row; condition immunities |
| **Derived math**    | `derived-math.spec.ts` — exact numbers: ability modifier (positive + negative branch); saving throw + PB; median HP `75 (10d10 + 20)`; passive perception from WIS + perception proficiency |

## 🔧 Fixes made while adding this coverage

Two derived-math bugs the exact-number tests would otherwise have locked in were
fixed first:

1. **HP notation was malformed.** `calculateHitPoints` (`src/lib/utils.ts`)
   spliced the entire hit-dice field back into the display string, so a formula
   input (or a migrated creature carrying `"28d20 + 252"`) rendered as
   `…(28d20 + 252d20 + …)`. It now reconstructs the notation from
   `parseInt(amount)` and the size-derived die. The new editor's field was also
   relabeled "Hit Dice" / `ex. 21` to match its true meaning (a dice count).
2. **Passive perception stopped deriving.** The migration dropped the
   WIS + perception recompute; the statblock was pinned at `10`. Restored in
   `monster-form.tsx` (respects `custom_passive_perception`).
3. **Proficiency bonus was decoupled from CR.** Selecting a challenge rating
   writes `cr.proficiency_bonus`, but the migrated `monster-statblock.tsx`,
   `defense-form.tsx`, and the restored passive-perception effect read a
   top-level `proficiency_bonus` field that nothing updated — so saves, skills,
   and passive perception were stuck at PB 2 regardless of CR. All three now
   read `cr.proficiency_bonus`, matching `description.tsx`, the standalone
   statblock, the markdown export, and every import converter. The top-level
   `proficiency_bonus` field is now vestigial.

## ⚠️ Gaps & findings (prioritized)

1. ~~**Defense form has zero coverage.**~~ ✅ Covered by `defense.spec.ts`
   (saves, skills, damage modifiers, condition immunities). **Still open:**
   `nonmagical_attack_immunity` / `nonmagical_attack_resistance` exist in the
   schema and render in the statblock but have **no control in
   `defense-form.tsx`** — they're unreachable via the UI (settable only via a
   loaded/imported/migrated record), so no e2e test can drive them today.
2. ~~**The game-rule math is barely tested.**~~ ✅ `derived-math.spec.ts` now
   asserts exact numbers for ability modifiers, saves, median HP, and passive
   perception. (Two underlying bugs were fixed first — see "Fixes made" above.)
3. ~~**Save verifies presence, not fidelity.**~~ ✅ `round-trip.spec.ts` fills
   every section and asserts the reload survives intact.
4. **Untested editor surface:** feature reorder (move up/down) and the
   `/my-creatures` duplicate / delete / legacy-migration flow. (Reactions, bonus
   actions, mythic, lair, senses/languages are now exercised by the round-trip
   test, though not each in isolation.)
5. **Interaction coupling / brittleness:**
   - Combobox selection relies on Base UI internals (ArrowDown-to-open, matching
     the option by **exact title text** because some descriptions contain other
     labels — e.g. Beast's description says "non-humanoid", which naive name
     matching picked up). A Base UI bump may require touch-ups.
   - Free-text entry into the type/size comboboxes is **not** tested (only
     selecting a listed option). Note the committed form value is the option's
     lowercased `value` (`"large"`), not its label (`"Large"`).
   - Some assertions couple to render details (markdown structure,
     CSS-lowercased subtitle text).
6. **Environmental:** Chromium only; not stress-run for flakiness. Each test gets
   an isolated browser context, so IndexedDB is per-test (no cross-test bleed).

## Suggested next steps, in order

1. ✅ ~~Full round-trip test~~ — `round-trip.spec.ts`.
2. ✅ ~~Defense-form coverage~~ — `defense.spec.ts`.
3. ✅ ~~Derived-math assertions with exact expected numbers~~ — `derived-math.spec.ts`.

Remaining, in rough priority:

4. Give `nonmagical_attack_immunity` / `nonmagical_attack_resistance` an editor
   control (they render but can't be set), then cover it.
5. Feature reorder (move up/down) and the `/my-creatures` duplicate / delete /
   legacy-migration flow.
6. Free-text combobox entry (type/size) — only listed-option selection is tested.

## Not wired into CI

Per `CLAUDE.md`, CI has no test-run step and tests are run locally before
pushing. This suite follows that convention — add a CI job deliberately if
desired.
