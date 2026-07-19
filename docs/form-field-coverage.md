# Form field coverage audit

Tracks how the rebuilt editor forms (Identity, Combat, Defense, Actions) map onto
the canonical `createCreatureSchema` (`src/schema/createCreatureSchema.ts`), and
which schema fields still lack a UI.

> Note: Defense and Actions currently use **local, form-scoped schemas** (not the
> canonical one) while the migration is in progress. Fields marked as covered by
> those forms are covered *conceptually* — the stored shape differs (e.g. skills,
> saving throws, damage modifiers) and still needs reconciling back into
> `createCreatureSchema` + converters + IndexedDB later.

## ✅ Covered

| Form | Schema fields |
|---|---|
| **Identity** | `name`, `type`, `sub_type`, `size`, `alignment`, `senses.*` (blindsight / darkvision / tremorsense / truesight / is_blind_beyond), `languages` |
| **Combat** | `cr` (whole object), `armor_class`, `armor_description`, `hit_points`, `hit_dice`, `ability_scores.*`, `movements.*` (walk / swim / burrow / climb / fly / hover) |
| **Defense** | `saving_throws`, `skill_bonuses` (→ `skills`), `damage_immunities` / `_resistances` / `_vulnerabilities` (→ `damage_modifiers`), `condition_immunities` |
| **Actions** | `traits`, `actions`, `reactions`, `is_legendary` + `legendary_description` + `legendary_actions`, `is_mythic` + `mythic_description` + `mythic_actions` |

## ⚠️ Missing form fields (in schema, no UI yet)

| Field | Type | Belongs in | Notes |
|---|---|---|---|
| `custom_hp` | `boolean` | Combat | Toggle to override computed HP. Combat has the HP/formula inputs but no override switch — HP is derived unless this is set. |
| `nonmagical_attack_immunity` | `boolean?` | Defense | "Immune to nonmagical B/P/S attacks." The old damage-types form folded this into the damage UI. |
| `nonmagical_attack_resistance` | `boolean?` | Defense | "Resistant to nonmagical B/P/S attacks." Same as above. |
| `passive_perception` | `number` | Identity (senses) or Defense | Normally derived from WIS + perception proficiency (see `editor.tsx`), shown as a stat. |
| `custom_passive_perception` | `boolean?` | same as above | Override toggle for the derived passive perception. |
| `description` | `string?` | Identity (or its own section) | Creature flavor/lore text. Not surfaced anywhere. |
| `environment_id` | `string?` | Identity | Environment selector — but likely **vestigial** (no active backend per `CLAUDE.md`); confirm before adding. |

## 🚫 Intentionally excluded (internal/meta — no UI expected)

- `id` — client-generated in `save-dialog.tsx`
- `user_id` — vestigial Supabase field
- `is_public` — sharing flag, handled in the save dialog / `/my-creatures`, not the editor form

## Notes for whoever picks this up

- **Derived-with-override fields** (`passive_perception`, `custom_hp`) only make
  sense once the standalone forms share a single form/state — their derivation
  reads other sections (WIS + perception proficiency, CON + size + hit dice).
  Today each form is an isolated `useForm`, so wiring these up is blocked on the
  consolidation step.
- Suggested order when implementing: start with the plain inputs
  (`custom_hp` toggle, the two `nonmagical_attack_*` flags, `description`), then
  tackle the passive-perception pair alongside the shared-state wiring.
