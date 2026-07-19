# Plan: Per-creature legacy migration flow

## Context

Instead of a bulk "migrate everything" button, migration happens **lazily, per
creature, at the moment the user opens one**. The IndexedDB `creatures` store
will hold a **mix** of legacy (`createCreatureSchema`) and new
(`monsterSchema`) records. On My Creatures the user sees both; legacy rows carry
a **"Legacy" badge**. Opening a legacy creature prompts a migrate dialog; the
user migrates (in place, with a success/failure report) or cancels. Editing a
legacy creature routes to `/legacy-editor` (the old editor); once migrated, it
works in the new editor.

Builds on `docs/migration-creature-to-monster-plan.md` (the `creatureToMonster`
converter, already built + 100% covered) and supersedes the bulk-button idea in
`docs/migration-hardening-plan.md` (its validation-gate and guard ideas are
folded in below).

### Decisions taken while planning
- **Detection: by shape** (no stored discriminator). A legacy record has
  `saving_throws` as an **array**; a new record has it as an **object**. That
  single structural check is O(1) and unambiguous for the two known shapes.
- **On migrate: overwrite in place** (same `id`) in the `creatures` store. The
  downloadable backup (`src/services/backup.ts`) is the safety net — so the
  dialog nudges "download a backup first", and migration only overwrites **after**
  the record validates (a record that fails validation is never overwritten).
- **Scope: the legacy layer only.** Detection, badge, dialog, report, and edit
  routing. The following are **prerequisites**, not built here (see Sequencing).

## Scope — build here

### 1. Format detection (pure)
New file `src/services/migrations/creatureFormat.ts`:

```ts
export type CreatureFormat = "legacy" | "monster";

// Legacy stores saving_throws as string[]; the new shape stores an object.
export function getCreatureFormat(record: unknown): CreatureFormat {
  return Array.isArray((record as { saving_throws?: unknown })?.saving_throws)
    ? "legacy"
    : "monster";
}

export function isLegacyCreature(record: unknown): boolean {
  return getCreatureFormat(record) === "legacy";
}
```
Central to the list, the dialog gate, and edit routing. Tested against a
`defaultCreature` (→ legacy) and a `defaultMonster` (→ monster).

### 2. Per-creature migrate (pure)
New file `src/services/migrations/migrateCreature.ts`:

```ts
import { StoredMonster } from "./creatureToMonster";

export type MigrateResult =
  | { status: "ok"; creature: StoredMonster }
  | { status: "error"; reason: string };

// createCreatureSchema.safeParse(record) gate:
//   pass -> creatureToMonster(parsed) => { status: "ok" }
//   fail -> { status: "error", reason: <zod message> }  (record left untouched)
export function migrateCreature(record: unknown): MigrateResult;
```
Pure — no IndexedDB. The caller persists on `ok`. This is the safety gate that
makes "overwrite in place" acceptable: a malformed legacy record returns
`error` and is **never** converted or overwritten.

Also fold in the hardening guards: default the array reads in
`creatureToMonster.ts` (`saving_throws ?? []`, `skill_bonuses ?? []`, the three
`damage_* ?? []`, `condition_immunities ?? []`, feature arrays `?? []`) so a
record that passes the gate but has odd gaps can't throw.

### 3. My Creatures list — mixed shapes + badge
Edit `src/app/my-creatures/components/my-creatures.tsx`:
- Loosen the list item type (records are now a union; read as `unknown`/a light
  wrapper and branch on `getCreatureFormat`).
- Render a **`<Badge variant="…">Legacy</Badge>`** next to the name when
  `getCreatureFormat(creature) === "legacy"` (reuse existing `Badge`).
- Legacy rows: opening the row triggers the **migrate dialog** (below) instead of
  the inline `StandaloneStatblock`.
- New rows: render via the Monster statblock (prerequisite; guard so an
  unexpected new record can't crash the list before that renderer exists).
- Refresh the list (`getLocalCreatures()`) after a successful migrate so the row
  loses its badge.

### 4. Migrate dialog + report
New file `src/app/my-creatures/components/migrate-dialog.tsx` (reuse the shared
`Dialog`):
- Trigger: opening a legacy creature. Copy: *"This creature uses the legacy
  format and must be migrated to open in the new editor."* Plus a subtle
  "Download a backup first" link → `downloadCreatureBackup()`.
- Buttons: **Migrate** and **Cancel**.
  - **Cancel** → close, nothing changes. (Legacy creature remains; still openable
    via Edit → `/legacy-editor`.)
  - **Migrate** → `migrateCreature(record)`:
    - `ok` → `db.put("creatures", result.creature)` (overwrite in place, same
      `id`), then show a **success report** ("Migrated <name>. It's ready in the
      new editor."), refresh list on close.
    - `error` → show a **failure report** with the reason and a "Open in legacy
      editor" affordance (→ `/legacy-editor`); the record is left as-is.
  - Wrap the DB write in `toast.promise` / try-finally with `db.close()`, matching
    the existing patterns in this file.

### 5. Edit routing by format
In the row's dropdown "Edit" action (`loadCreatureIntoEditor`), branch on
`getCreatureFormat`: legacy → `router.push("/legacy-editor")`, new →
`router.push("/editor")` (both still hand off via `localStorage.editCreature`, as
today).

## Prerequisites (not built here — must exist for the loop to fully work)
1. **`/legacy-editor` route** hosting the current old `Editor` (createCreatureSchema).
   Recommended: move `<Editor/>` out of `src/app/editor/page.tsx` into
   `src/app/legacy-editor/page.tsx`, leaving `/editor` as the new `MonsterForm`.
2. **New editor SAVE path** writing `monsterSchema` records to `creatures` — until
   this exists, no new-format records exist (so every current row is legacy, which
   is fine, but the "both formats" experience can't be exercised).
3. **Monster statblock renderer** (a `monsterSchema` counterpart to
   `StandaloneStatblock`) to display new/migrated creatures in the list + viewer.

## Files
- New: `src/services/migrations/creatureFormat.ts` (+ test)
- New: `src/services/migrations/migrateCreature.ts` (+ test)
- Edit: `src/services/migrations/creatureToMonster.ts` (defensive guards)
- Edit: `src/app/my-creatures/components/my-creatures.tsx` (mixed list, badge, routing, refresh)
- New: `src/app/my-creatures/components/migrate-dialog.tsx`

## Reuse
- `creatureToMonster` / `StoredMonster` — `src/services/migrations/creatureToMonster.ts`
- `createCreatureSchema` (gate) / `monsterSchema` (test conformance) — `src/schema/*`
- `downloadCreatureBackup`, `getAllCreatures` — `src/services/backup.ts`
- `Badge`, `Dialog`, `monsterbrewDB`, `toast` — existing components/services

## Tests
- `creatureFormat.test.ts`: `defaultCreature` → "legacy", `defaultMonster` → "monster"; missing/garbage → "monster" (safe default, since only legacy records get the destructive path).
- `migrateCreature.test.ts`: valid legacy → `ok` with a `monsterSchema`-valid creature; a record missing required legacy fields → `error` with a reason and **no** conversion; `id` preserved.
- Extend `creatureToMonster.test.ts`: absent `saving_throws`/`skill_bonuses`/`damage_*` convert without throwing (guards).

## Verification
- `pnpm exec vitest run src/tests/migrations/` — green; `pnpm exec vitest run --coverage` — migration services at/near 100%.
- `pnpm exec tsc --noEmit` — no new errors in touched files.
- `pnpm exec next lint --file <the two new services> --file src/app/my-creatures/components/migrate-dialog.tsx` — clean.
- Manual (once prereqs land): seed a legacy creature → My Creatures shows the Legacy badge → open → dialog → Cancel leaves it legacy; Edit → `/legacy-editor`; Migrate → success report → badge gone → Edit → `/editor`.

## Sequencing
1. This plan's Scope (detection, migrate helper, badge, dialog, routing) — safe to
   land now; on current data every row is legacy and behaves correctly.
2. Prereq 1 (`/legacy-editor`) — so the Cancel/Edit path has a destination.
3. Prereqs 2 & 3 (new save + Monster statblock) — unlock new-format rows and the
   post-migrate viewer, completing the "both formats" experience.
