# Issue #153 — "new creature" dialog on the empty editor

Branch: `feat/issue-153-start-from-launcher` (named before the rename below; the code is `new-creature`)

## Global Constraints

Copied verbatim from the issue. Everything below inherits these.

Acceptance:

- `/editor` with no params shows the launcher; `/editor?id=<id>` and the `editCreature` handoff never do.
- Each option lands the user in the editor with the expected starting state, and the SRD option produces the same `Monster` as today's "Copy to editor".
- Dismissing gives today's blank form.
- The SRD JSON chunk is not in the editor's initial load.
- Colocated tests for the launcher; e2e coverage for at least the SRD and blank options.

Implementation constraints:

- "**Loading a monster into the form** should reuse the existing path rather than inventing one. The form consumes `loadedCreature` reactively through RHF's `values:` prop; the SRD and recent lists should feed that, not call `form.reset`."
- "**Watch the bundle.** … An SRD picker in the editor must lazy-load that chunk when option 2 is opened, not at editor mount."
- "**Recent** reads the `creatures` store in `src/services/database.ts`. Touch IndexedDB in effects/handlers only, not during render."
- "**No router `Link`** inside `src/app/editor/components/**`."
- ~~"**No schema change**, no IndexedDB migration, no converter changes."~~ — **agreed deviation, see below.** One optional schema field (`updated_at`) is added so the Recent list can mean what it says. Still no IndexedDB migration and no converter changes.

The four options, in this order:

1. **Blank creature** — what happens today.
2. **Start from an SRD monster** — inline searchable picker over `getSrdMonsters()`, run through `fromSrd`.
3. **Import or paste** — opens the existing `ImportDialog`.
4. **Recent** — the last few saved creatures from IndexedDB, each opening `/editor?id=<id>`.

Out of scope: reskin flow, role-based starters, "paste anything" format sniffing, anything backend-dependent.

## Agreed UX shape (decided with the user, not in the issue)

First built as a full-page launcher with an inline picker; **revised to a dialog for both** after the user saw it running. What ships:

- **The launcher is a dialog** over the editor. The form, preview and action bar mount as normal behind it; dismissing in any way — the blank option, the close button, Escape, or a click outside — starts blank.
- **The SRD picker replaces the options inside that same dialog**, with a "‹ Back" control, rather than opening a second dialog. Two stacked scrims to browse a list reads as a detour.
- **The picker spans both your saved creatures and the SRD bestiary** (added at the user's request). Yours come first, most recently touched first, each row marked `Personal`; a `Source` dropdown narrows to one side. Picking any row — including your own — loads a fresh **unsaved copy** with the stored id stripped by `starterFromEntry`, so saving makes a second creature. That is what separates it from the Recent list, which opens a creature for editing in place.
- **Naming** (settled with the user): `start-from/` → `new-creature/`, `StartFromLauncher` → `NewCreatureDialog`, `SrdPicker` → `CreaturePicker`, and the "door" vocabulary → "option" (`option.tsx`, `StartOption`, `OptionHeading`, `optionSurface`, `RecentCreatures`).
- **The picker filters by name, source, size, type and challenge rating** (added at the user's request after the dialog rework). Three compact single-select dropdowns sit under the search box; an empty result offers "Clear filters". The library's `FilterBar` was not reused: it has no size filter, its CR control is a chip-based multi-select, and its padded bar layout does not fit a 672 px dialog. The option lists are derived locally from `CREATURE_SIZES` / `CREATURE_TYPES` / `CHALLENGE_RATINGS` in `@/lib/constants` rather than importing `library/components/filters.ts` across app sections.
- `filterCreatureEntries` / `hasActiveCreatureFilters` live in `helpers.ts` so the matching rules are unit-testable without rendering. They take a locally-declared `CreatureEntry` rather than importing `SrdEntry` from `@/services/srd` — even a type import there is an invitation for someone to later drop the `type` keyword and pull the bestiary into the editor's initial load.
- **The import option closes the launcher** instead of stacking on it, via `open={showLauncher && !showImport}`. `launcherDismissed` stays false while the import dialog is up, so cancelling brings the options straight back and only a successful import (`onImported`) dismisses them for good. No extra flag, and no dependence on the order the dialog fires its callbacks.
- **Recent list inlines its rows** directly in the card (up to 4, most recent first) — it opens no panel, each row is a button that navigates. If nothing is saved, the option is omitted entirely rather than shown empty and the grid falls back to three options.
- Row hover/focus uses `bg-accent` **plus** `**:text-accent-foreground`, copied from the combobox's highlighted option — without recolouring descendants the muted CR/type text goes low-contrast on the accent fill.

## Agreed deviation: `updated_at` (decided with the user)

The issue forbids schema changes, but "Recent" cannot be honest without a timestamp. `monsterSchema` has no clock; the only one in a stored record is the `generateId()` prefix, which is *creation* time — a creature made in March and edited an hour ago would sort below one made yesterday and never touched.

Verified before agreeing to it: `src/services/creatures.ts:39` is the **only** production write to the store (manual save and auto-save both route through `saveCreature`; `backup.ts` only reads). So the change is:

- `src/schema/monster-schema.ts` — `updated_at: z.number().optional()`. Omitted from `defaultMonster`.
- `src/services/creatures.ts` — `saveCreature` stamps `Date.now()` and returns the **stamped** record, so the React Query caches (`useSaveCreature`, `useAutoSaveCreature`'s `setQueryData`) hold what was actually written.

What it deliberately does *not* touch, and why:

- **No IndexedDB migration, no `DB_VERSION` bump.** The field is optional, so pre-existing records stay valid and simply lack it; they get stamped on their next save.
- **No converter changes.** Import converters emit `Monster`s without the field and `.optional()` accepts that; export converters map named fields, so they never see it. Converter tests compare object shapes that gain no key, so `toEqual` still holds.
- **No form field.** It is written by the repository, never edited by the user.

Auto-save now rewrites `updated_at` on every debounced edit, and `useAutoSaveCreature` echoes that record into the detail cache. The #137 guard in `monster-form.tsx` only re-hydrates when the edited *id* changes, so the echo still cannot reset the open form.

To be recorded in the PR body and as a comment on #153.

## Approach

### Entry condition (`monster-form.tsx`)

The launcher is the fourth branch of the load decision that already exists. Two pieces of state:

```ts
// Read once, during the first render, before useEditCreatureHandoff's effect
// deletes the key. The route is ssr: false, so there is no hydration mismatch.
// All of it keyed on the edited id, and reset when that changes — exactly like
// `hydration` below.
const [launcher, setLauncher] = useState(() => ({
  id: idParam,
  hadHandoff: typeof window !== "undefined" && Boolean(localStorage.getItem("editCreature")),
  dismissed: false,
  starter: null as Monster | null,
}));
if (launcher.id !== idParam) {
  setLauncher({ id: idParam, hadHandoff: false, dismissed: false, starter: null });
}
const showLauncher = !idParam && !launcher.hadHandoff && !launcher.dismissed;
```

`!idParam` is re-evaluated every render, so the Recent list navigating to `/editor?id=<id>` (same route, component stays mounted) closes the launcher on its own.

**Why the whole object is keyed on `idParam`** (found in review): `/editor` is one mount across `/editor` ↔ `/editor?id=` transitions — the header's "Editor" link goes back in place without remounting. Left unkeyed, a `starter` from the SRD option would survive that transition and silently repopulate the form, with `dismissed` still true suppressing the launcher that should have offered a fresh start. `hadHandoff` is false after any in-place id change: every handoff writer navigates to `/editor` with no id, which means leaving this route and remounting. Guarded by an e2e test that walks SRD option → save nudge → header "Editor" link.

All three handoff writers — `srd-detail.tsx:23`, `creature-actions-menu.tsx:93` and `:109` — `setItem` before they navigate, so the lazy initializer always sees the key.

### Feeding a starting monster into the form

`launcher.starter` threads through the existing `values:` prop — no `form.reset`:

```ts
values: hydration.creature ?? launcher.starter ?? defaultMonster,
```

Nothing is dirty while the launcher is up, so `resetOptions: { keepDirtyValues: true }` has nothing to keep and the reset applies cleanly. (Fields the user edited *before* an in-place id change do persist, but that is pre-existing `keepDirtyValues` behaviour — verified against `main` — and is what protects in-progress edits, #137.)

Per option:

| Option | Handler in `monster-form.tsx` |
| --- | --- |
| Blank | `dismissLauncher()` — as does Escape, the close button, or a click outside |
| SRD | `setLauncher({ …, starter: monster, dismissed: true })` + `toast.success("Started from <name>")` |
| Import | `setShowImport(true)`; the launcher's `open` is `showLauncher && !showImport`, so it steps aside rather than stacking scrims. `dismissed` stays false, so cancelling brings the options back; `onImported` dismisses for good. |
| Recent | `navigate({ to: "/editor", search: { id } })` — the existing `?id=` path, so the creature is treated as saved and auto-save arms |

`ImportDialog` gains one optional prop, `onImported?: () => void`, fired next to the existing `toast.success` in `handleImport`. It keeps calling `form.reset` — that is its existing contract for a user-initiated import and not a load path.

### New files — `src/app/editor/components/new-creature/`

- `index.tsx` — `NewCreatureDialog`, the dialog. Owns the options-vs-SRD-picker switch and caps its own height (`max-h-[calc(100dvh-2rem)] overflow-y-auto`) — `DialogContent` is centred with `-translate-y-1/2` and has no max-height, so the tallest dialog in the app would otherwise clip off-screen on a short viewport. **Pure props** (`open`, `onStartBlank`, `onImport`, `onPickSrd(monster)`, `onPickRecent(id)`) — no `useNavigate`, no `useSearch`, so it renders in a colocated test with no router.
- `srd-picker.tsx` — the picker view. Loads the bestiary in an effect with a dynamic `import("@/services/srd")`, keeping the JSON out of the editor's static import graph, with a `.catch` → "Try again" so a failed chunk load doesn't strand the option on a spinner. Filters by name, size, type and CR; rows are `<button>`s showing name / CR / size / type; picking calls `onPick(entry.monster)`.
- `recent-creatures.tsx` — calls `useCreatures()` (React Query, so the IndexedDB read happens in the query fn, never during render), sorts with the helper below, renders up to 4 rows, returns `null` while loading or when there is nothing saved.
- `option.tsx` — the shared card surface. `OptionHeading` takes `as="span"` for `StartOption`, whose whole card is a `<button>`: buttons take phrasing content only, so an `<h3>` in there is invalid HTML and gives screen readers a heading nested in a button.
- `helpers.ts` — `recentCreatures(list, limit)`, sorting on `updated_at ?? Number(id.split("-")[0])` descending; plus `filterCreatureEntries` / `hasActiveCreatureFilters` / `NO_CREATURE_FILTERS` for the picker.

### Files touched

- `src/schema/monster-schema.ts` — `updated_at` (see the deviation section).
- `src/services/creatures.ts` — stamp on write.
- `src/app/editor/components/monster-form.tsx` — entry condition, the id-keyed `launcher` state, the four handlers, the launcher mounted alongside the form.
- `src/app/editor/components/import-dialog.tsx` — `onImported?` prop.
- `src/lib/constants/filter-options.ts` (new) — `TYPE_OPTIONS` / `SIZE_OPTIONS` / `CR_OPTIONS` / `CR_VALUES` / `crFilterLabel`, shared by the library's `FilterBar` and the SRD picker so the two option lists cannot drift.
- `src/app/library/components/filters.ts` — now re-exports from that module, keeping `CR_FILTER_ITEMS` for the library's multi-select.
- `e2e/helpers.ts` — new `gotoBlankEditor(page)`; `saveCreature()` uses it. It waits for the dialog to leave the DOM: Base UI keeps the popup mounted through its exit animation, so the options stay clickable for a beat and the next action can hit a control inside the closing launcher.
- The 9 other `page.goto("/editor")` call sites in `e2e/` (`round-trip`, `derived-math`, `persistence` ×3, `feedback-cta`, `editor`, `auto-save`, `defense`, `import`) — swapped to `gotoBlankEditor`. Mechanical, but it is the whole reason the full e2e suite has to run.

One schema field (`updated_at`, see the deviation section above). No converter changes, no IndexedDB migration.

## Test strategy

Unit (Vitest, colocated, TDD — test first, watch it fail, then implement):

- `src/tests/services/creatures.test.ts` (or the existing database test file) — `saveCreature` stamps `updated_at` and returns the stamped record; a record saved twice gets a later stamp.
- `new-creature/helpers.test.ts` — ordering by `updated_at`, the `id`-prefix fallback for un-stamped records, a mix of both, the limit, non-numeric ids sorting last.
- `new-creature/index.test.tsx` — four options render; Blank/Import fire their callbacks; SRD swaps to the panel and Back returns; the Recent list is absent with nothing saved.
- `new-creature/srd-picker.test.tsx` — `vi.mock("@/services/srd")` with two real entries; search narrows; picking calls `onPick` with the exact `Monster`.
- `new-creature/recent-creatures.test.tsx` — `vi.mock("@/hooks/use-creatures")`; order, cap at 4, `null` when empty.

E2E (`e2e/new-creature.spec.ts`):

- Launcher shows at `/editor`; absent at `/editor?id=<id>` (seeded) and after "Copy to editor" from `/library/srd/$key`.
- Blank option → today's empty form (statblock titled "Example Creature").
- SRD option → search "Owlbear" → pick → statblock shows Owlbear's real stats. Guards "produces the same `Monster` as Copy to editor".
- Recent list → seeded creatures listed most-recent-first → click navigates to `/editor?id=…` and loads it. `seedCreature` writes raw records straight into IndexedDB, bypassing the stamp, so the seeds carry explicit `updated_at` values to make the ordering assertion deterministic.
- **Bundle guard:** record `page.on("request")` URLs; assert nothing matching `/srd-monsters/` is fetched on `/editor`, and that it *is* fetched after the SRD option opens. Works against the dev server the suite uses, so it stays honest in CI.

Plus a one-off `pnpm build` and a look at the emitted editor chunk's imports, reported in the confidence check rather than left as a permanent test.

## Open questions / risks

- `updated_at` lands in the backup JSON (`buildCreatureBackup` spreads whole records) and in any creature the user re-imports from one. Harmless — it is overwritten on the next save — but it does mean backup files taken after this change differ by one key from ones taken before.
- The SRD panel renders all ~331 filtered rows in a scroll container. `library-grid.tsx` already renders that many full cards, so plain rows should be cheaper; if it drags, cap the list and show a "refine your search" hint.
- Every existing e2e editor path now needs one extra click. If a spec turns out to depend on landing on the form synchronously, that shows up in the full-suite run, not in the changed specs.
