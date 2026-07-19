# Plan: Hardening the creature → Monster migration

## Context

`creatureToMonster()` (`src/services/migrations/creatureToMonster.ts`) is a pure,
100%-covered transform, but it is only trustworthy for **well-formed** legacy
data. Before a user can safely run a real migration, four gaps identified during
review must be closed — otherwise data can be lost or the migration can crash
partway:

1. **No validation of real stored data.** The converter reads
   `creature.saving_throws.includes(…)`, `for (… of creature.skill_bonuses)`,
   and the three `damage_*` arrays with **no guards**. Every test input is built
   from `defaultCreature`, so it is always complete. Real IndexedDB records can
   predate fields (the store is still v1, never migrated) or come from imports —
   a missing array throws, and a naive batch loop aborts the whole run.
2. **Destructive-only safety.** The only recovery today is the downloadable
   backup (`src/services/backup.ts`). A live migration needs the originals kept
   in-browser too.
3. **All-or-nothing, silent.** No per-record report of what converted vs. what
   was skipped and why.
4. **Never rendered end-to-end.** No converted creature has been shown in the new
   viewer (that viewer is deferred), so "schema-valid" ≠ "displays correctly".

This plan splits the work into what can be built **now** (pure, no app breakage)
and what lands at the **cutover** (needs the DB write path + new viewer). It
builds on `docs/migration-creature-to-monster-plan.md`.

## Scope A — build now (pure service + tests, no wiring)

### A1. Harden `creatureToMonster` against malformed-but-present records
In `src/services/migrations/creatureToMonster.ts`, default the collection reads
so an incomplete record degrades gracefully instead of throwing:

- `creature.saving_throws ?? []`
- `creature.skill_bonuses ?? []`
- `creature.damage_vulnerabilities ?? []` / `damage_resistances` / `damage_immunities`
- `creature.condition_immunities ?? []`, `traits`/`actions`/`reactions`/`legendary_actions`/`mythic_actions ?? []`

The converter stays pure; this is belt-and-suspenders so it never crashes even on
records the validation gate (A2) lets through.

### A2. Batch wrapper with a validation gate + report
New file `src/services/migrations/migrateCreatures.ts`:

```ts
export interface MigrationSkip {
  id?: string;
  name?: string;
  reason: string; // human-readable (zod message or thrown error)
}
export interface MigrationReport {
  total: number;
  migrated: StoredMonster[];
  skipped: MigrationSkip[];
}

// Pure: no IndexedDB access. The caller supplies the records and persists
// `migrated`. Validates each with createCreatureSchema.safeParse():
//   pass -> creatureToMonster(record) into `migrated`
//   fail -> record pushed to `skipped` with the zod error (NEVER converted,
//           never silently mangled)
// Any unexpected throw during conversion is also caught into `skipped`.
export function migrateCreatures(records: unknown[]): MigrationReport;
```

Rationale: skipping (not force-converting) invalid records is safe **only** when
paired with the non-destructive store (B1) — the original stays readable. The
report is what the button surfaces so a user knows exactly what didn't move.

### A3. Tests
- `src/tests/migrations/migrateCreatures.test.ts`:
  - valid records land in `migrated` and satisfy `monsterSchema`;
  - a record failing `createCreatureSchema` (e.g. missing `cr`) lands in
    `skipped` with a reason and is **not** in `migrated`;
  - `total` = migrated + skipped; ids/names captured on skips.
- Extend `src/tests/migrations/creatureToMonster.test.ts`: a record with
  `saving_throws`/`skill_bonuses`/`damage_*` **absent** converts without throwing
  (guards from A1).
- Optional but recommended: drop a **real** exported backup JSON into
  `src/tests/migrations/fixtures/` and assert it migrates with zero skips — the
  closest thing to production data we can test before cutover.

## Scope B — cutover (deferred; needs DB write path + viewer)

### B1. Non-destructive store (decision from the parent plan)
Bump `monsterbrewDB` to **v2** in `src/services/database.ts`, add a
`creatures_v2` object store (`keyPath: "id"`), and **leave `creatures`
untouched**. New app reads `creatures_v2`; old readers keep working against
`creatures` during the transition. Originals remain as in-browser recovery.

### B2. "Migrate my data" button
On `/my-creatures`, next to the existing "Download backup" button:
1. Encourage/trigger `downloadCreatureBackup()` first.
2. `getAllCreatures()` → `migrateCreatures(records)` → write `report.migrated`
   to `creatures_v2`.
3. Show the `MigrationReport` (e.g. "42 migrated, 2 skipped: …") — not a silent
   toast.

### B3. Round-trip render test
Once the new viewer exists (deferred task 3): migrate a fully-populated creature
and assert it **renders** every field in the new statblock, not just that it
parses. This is the gate that turns "schema-valid" into "actually correct".

## Files

- Edit: `src/services/migrations/creatureToMonster.ts` (A1 guards)
- New: `src/services/migrations/migrateCreatures.ts` (A2)
- New: `src/tests/migrations/migrateCreatures.test.ts` (A3)
- Edit: `src/tests/migrations/creatureToMonster.test.ts` (A3 guard cases)
- Cutover: `src/services/database.ts` (B1), `src/app/my-creatures/components/my-creatures.tsx` (B2)

## Reuse
- `createCreatureSchema` (`src/schema/createCreatureSchema.ts`) for the `safeParse` gate.
- `monsterSchema` (`src/schema/monster-schema.ts`) for test conformance.
- `getAllCreatures` / `downloadCreatureBackup` (`src/services/backup.ts`) at the button (B2).

## Verification
- `pnpm exec vitest run src/tests/migrations/` — all green.
- `pnpm exec vitest run --coverage` — converter + wrapper at/near 100%; suite passes.
- `pnpm exec tsc --noEmit` — no new errors in the touched migration files.
- `pnpm exec next lint --file src/services/migrations/migrateCreatures.ts --file src/services/migrations/creatureToMonster.ts` — clean.

## Done criteria for "safe to go live"
Scope A complete **and** B1 (non-destructive store) in place. Until both exist, a
migration should not be offered to users — the backup file must not be the only
lifeline.
