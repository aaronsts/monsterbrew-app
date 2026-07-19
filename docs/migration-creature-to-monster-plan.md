# Plan: Legacy → Monster migration converter

## Context

The Base-UI migration introduced a new canonical creature shape, `monsterSchema`
(`src/schema/monster-schema.ts`), which diverges structurally from the shape
currently persisted in IndexedDB, `createCreatureSchema`
(`src/schema/createCreatureSchema.ts`). Before the new form/viewer can become the
source of truth, existing saved creatures must be transformable into the new
shape. There is **no backend and no rollback** — IndexedDB is the only store —
so the risky part is the transform itself.

Decisions taken while planning:

- **Trigger: user-initiated** — a "Migrate my data" button, built later at the UI
  cutover. Not part of this pass.
- **Scope now: converter + tests only** — build and fully unit-test the pure
  `creatureToMonster()` transform (the part that can silently corrupt data), and
  wire the trigger later.

This pass therefore adds **no DB version bump, no button, and touches none of the
old readers** (`editor.tsx`, `StandaloneStatblock`, the `to*`/`from*` converters,
`save-dialog.tsx`, `my-creatures.tsx`). The currently-working app is unaffected.

## What we build now

A pure, tested function that maps one stored legacy creature to the new shape.

**New file: `src/services/migrations/creatureToMonster.ts`**

```ts
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import { Monster } from "@/schema/monster-schema";

type LegacyCreature = z.infer<typeof createCreatureSchema>;

// IndexedDB keyPath is "id"; Monster has none, so storage keeps identity fields.
export type StoredMonster = Monster & { id: string; is_public?: boolean };

export function creatureToMonster(creature: LegacyCreature): StoredMonster;
```

### Field mapping

| Legacy field(s) | Monster field | Rule |
| --- | --- | --- |
| `name`,`type`,`size`,`sub_type`,`alignment`,`senses`,`languages`,`cr`,`armor_class`,`armor_description`,`hit_points`,`hit_dice`,`custom_hp`,`ability_scores`,`movements`,`condition_immunities`,`passive_perception`,`custom_passive_perception`,`nonmagical_attack_immunity`,`nonmagical_attack_resistance`,`traits`,`actions`,`reactions`,`is_legendary`/`legendary_*`,`is_mythic`/`mythic_*` | same name | direct copy (shapes already identical after the schema update) |
| `description` (`string \| null`) | `description` | `?? undefined` (null → undefined) |
| `cr.proficiency_bonus` | `proficiency_bonus` (new top-level) | copy from `cr.proficiency_bonus` |
| `saving_throws: string[]` (`"str"`,`"dex"`,…) | `saving_throws: {str?:bool,…}` | for each of str/dex/con/int/wis/cha present in the array, set `true`; omit the rest |
| `skill_bonuses: {skill_name,is_proficient?,is_expert?}[]` | `skills: Record<name,"proficient"\|"expert">` | `is_expert` → `"expert"`, else `is_proficient` → `"proficient"`, else skip the entry |
| `damage_immunities` / `damage_resistances` / `damage_vulnerabilities: string[]` | `damage_modifiers: Record<type,"immune"\|"resistant"\|"vulnerable">` | merge all three into one record; **precedence when a type repeats: immune > resistant > vulnerable** |
| — (no legacy source) | `bonus_actions` | `[]` |
| — (no legacy source) | `has_lair`/`lair_description`/`lair_actions` | `false` / `""` / `[]` |
| `id` | `id` (storage) | copy; if absent, generate `${Date.now()}-${random}` (matches `save-dialog.tsx`) |
| `is_public` | `is_public` (storage) | copy if present |
| `user_id`, `environment_id` | — | **dropped** (vestigial per `docs/form-field-coverage.md`) |

### Reuse / references
- Ability key list: derive from `abilityScoresSchema.keyof()` (monster-schema) rather than hardcoding.
- Output shape must satisfy `monsterSchema` (+ an `id`) — asserted in tests via `monsterSchema.parse()`.
- ID-generation style mirrors `generateUniqueId()` in `src/components/save-dialog.tsx`.

## Tests

**New file: `src/tests/migrations/creatureToMonster.test.ts`** (Vitest, mirrors
the style in `src/tests/converters/`). Build inputs by spreading `defaultCreature`
and overriding fields. Cases:

1. **Full happy path** — a richly populated creature; assert every mapped field, then `monsterSchema.parse({ ...result })` succeeds (schema-conformance guard).
2. `saving_throws` array → boolean object; unknown/garbage strings are ignored.
3. `skill_bonuses`: expert wins over proficient; entries with neither flag are dropped; `skill_name` preserved as key.
4. `damage_modifiers`: each array maps to its state; **repeat-type precedence** (immune > resistant > vulnerable) verified with a type present in two arrays.
5. `proficiency_bonus` copied from `cr.proficiency_bonus`.
6. New-only fields defaulted: `bonus_actions: []`, `has_lair: false`, `lair_description: ""`, `lair_actions: []`.
7. `description: null` → `undefined`; empty optionals handled.
8. Identity: `id` preserved; missing `id` gets generated; `user_id`/`environment_id` absent from output.

Run: `pnpm exec vitest run src/tests/migrations/creatureToMonster.test.ts`.

## Explicitly deferred (cutover, not this pass)

- The **"Migrate my data" button** + report UI (likely on `/my-creatures`, next to the existing "Download backup" button), forcing/encouraging a backup first.
- Whether the button writes **non-destructively** (new `creatures_v2` store, old store retained for undo) or bumps the DB version — decide at cutover.
- A reverse `monsterToCreature` (only if old readers must keep working post-migration).
- Restore-from-backup-file (import counterpart to the existing `downloadCreatureBackup`).

## Verification

- `pnpm exec vitest run src/tests/migrations/creatureToMonster.test.ts` — all green.
- `pnpm exec tsc --noEmit` — no **new** errors in `creatureToMonster.ts` / its test (repo has pre-existing migration-branch errors in unrelated files).
- `pnpm exec next lint --file src/services/migrations/creatureToMonster.ts --file src/tests/migrations/creatureToMonster.test.ts` — clean.
