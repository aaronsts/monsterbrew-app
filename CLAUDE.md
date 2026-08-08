# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (pinned via the `packageManager` field; run `corepack enable` if you don't have it). Do not use `npm`/`yarn` — they'd create a competing lockfile.

- `pnpm install` — install dependencies (`--frozen-lockfile` in CI)
- `pnpm dev` — start the TanStack Start (Vite) dev server on port 3000 (SSR-capable)
- `pnpm build` — regenerates `public/sitemap.xml`, then a production build (Vite 8/Rolldown → Nitro emits `.output/`, a Vercel Build Output)
- `pnpm start` — run the built production server (`node .output/server/index.mjs`)
- `pnpm lint` — ESLint (flat config, `eslint.config.ts`); `@typescript-eslint/no-unused-vars` is an **error** (with an `^_` ignore pattern), so unused imports/vars fail lint
- `pnpm typecheck` — `tsc --noEmit`. Vite and Vitest both transpile *without* typechecking, so nothing else catches a type error locally; run it alongside `pnpm lint` before pushing. Note the two disagree occasionally — ESLint's `no-unnecessary-type-assertion` has called an assertion redundant that `tsc` then required (`screen.getByRole` returning `HTMLElement`); prefer a typed generic over a cast so both are satisfied
- `pnpm test` — Vitest in watch mode; `pnpm exec vitest run` runs once, `pnpm test:coverage` runs once with coverage
- `pnpm exec vitest run src/tests/converters/from-5e-tools.test.ts` — run a single test file
- `pnpm exec vitest run -t "some name"` — run tests matching a name
- `pnpm test:e2e` / `pnpm test:e2e:ui` — Playwright e2e suite (`e2e/`); `pnpm test:e2e:coverage` swaps in a production build + the monocart V8-coverage reporter and is much slower

Unit tests live in **two** places, both matched by vitest's `src/**/*.{test,spec}.{ts,tsx}` include: colocated next to the code (`src/lib/cr-calculator.test.ts`, `src/app/editor/components/**/*.test.tsx`) and under `src/tests/` for converters, services, migrations, and content parsing. New tests should sit next to the code they cover unless they belong to one of those `src/tests/` groups. The two services tests that hit IndexedDB import `fake-indexeddb/auto` themselves; `vitest.setup.ts` only handles testing-library cleanup and jsdom shims (PointerEvent, `matchMedia`, `scrollIntoView`) that Base UI controls need.

Playwright reads `E2E_PORT` (default 3000) and has `reuseExistingServer` on locally — **always set `E2E_PORT` to something unique** (e.g. `E2E_PORT=3123 pnpm exec playwright test editor`), or the run silently reuses whatever `pnpm dev` server is already on 3000 and tests the wrong checkout. See the `verify` skill for the full runtime-verification recipe.

Path alias: `@/*` → `src/*` (defined in `tsconfig.json`; Vite 8 resolves it natively via `resolve.tsconfigPaths: true` in `vite.config.ts` and `vitest.config.mts`).

pnpm blocks dependency build scripts by default; the ones this project needs are allowlisted in `pnpm-workspace.yaml` under `allowBuilds`. If a build-time tool misbehaves after a dependency change, check whether it needs adding there.

CI runs `pnpm lint` and `pnpm typecheck` first (both seconds-long, in the same job as the unit suite so they fail fast), then the unit suite (`pnpm test:coverage`) and the e2e suite (`pnpm test:e2e:coverage`) — both suites **with coverage**, and both on a runner noticeably slower than a dev machine. A test that takes ~1.5s locally under coverage can exceed vitest's default 5s `testTimeout` there, so reproduce with `pnpm test:coverage` (not plain `vitest run`) before pushing, and treat a test that only just fits as a failure waiting to happen. CI also deploys PR previews and production to Vercel.

## Commits & releases

Commit messages must follow **Conventional Commits** — enforced locally by a Husky `commit-msg` hook (commitlint) and in CI on PR commits *and* the PR title/description. Releases are fully automated by `semantic-release` on merge to `main` (`fix:` → patch, `feat:` → minor, `feat!:`/`BREAKING CHANGE` → major; `refactor`/`style`/`ci`/`chore`/`docs(README)` also cut patches — see `release.config.mjs`). Do not bump `package.json` version manually — it is `0.0.0-managed.by.semantic.release`.

The user-facing changelog at `/changelog` is built from markdown files in `src/content/changelog/` (loaded via `import.meta.glob` in `src/lib/releases.ts`, which parses `key: value` frontmatter plus a body where paragraphs become `summary` and `- ` bullets become `changes`). Each PR adds its own file to `unreleased/` (use the `changelog-entry` skill — no version number, one file per PR, so parallel PRs never conflict). On release, `scripts/promote-changelog.mjs` (run by `@semantic-release/exec`) stamps the released version + date and moves the entry to `releases/`; `@semantic-release/git` commits that back to `main` with `[skip ci]`, and the deploy job builds from the release tag so the live site includes it. The raw conventional-commit changelog (`docs/CHANGELOG.md`) is generated in CI and attached to the GitHub release only — it is not tracked in git.

## Architecture

Monsterbrew is a **client-side-only** D&D 5e monster statblock builder. **TanStack Start** (TanStack Router on Vite, with SSR) + React 19, but there is no backend and no server functions: all creature data persists to **IndexedDB in the browser** (via `idb`). File-based routes live in `src/routes/` (`__root.tsx` holds the document shell, providers, header/footer, `<Toaster>`, and SEO head/meta); page-specific components live under `src/app/*/components/`. Client navigation uses `Link`/`useNavigate`/`useSearch` from `@tanstack/react-router`. Despite `src/types/database.types.ts`-era leftovers and a `user_id` field in the legacy schema, there is **no active server persistence** — treat those as vestigial unless you are deliberately adding a backend.

### The creature model is the center of everything

`src/schema/monster-schema.ts` defines the canonical `monsterSchema` (Zod), its `Monster` type (`z.infer`), and `defaultMonster`. `Monster` is *the* creature type used across the entire app — the form, IndexedDB values, every import/export converter, the CR calculator, and the statblock renderers all speak this one shape. `StoredMonster` is `Monster` plus the storage-only fields (`id` keyPath, optional `is_public`). When you change a field, expect ripples through: the schema + default, the matching form section, the statblock renderer, every converter, and possibly the IndexedDB migration.

Note some structured fields: `damage_modifiers` and `nonmagical_attack_modifiers` are `Record<damageType, "resistant"|"vulnerable"|"immune">`; `saving_throws` and `skills` are ability/skill-keyed records (`skills` values are `"proficient" | "expert"`); features (`traits`, `actions`, `reactions`, `bonus_actions`, `lair_actions`, `legendary_actions`, `mythic_actions`) are all `{ name, description }`.

`src/schema/createCreatureSchema.ts` is the **legacy** shape (`createCreatureSchema` / `defaultCreature`) — retained only so old data and handoffs can be normalized, and because the `Languages` enum still lives there. `src/services/migrations/creatureToMonster.ts` (`creatureToMonster`, guarded by `isLegacyCreature` in `creatureFormat.ts`) bridges legacy payloads to `Monster`. Don't build new features on the legacy schema.

Game-rule math (ability modifiers, saving throws, HP dice, `generateId`, `debounce`) lives in `src/lib/utils.ts`; reference tables live in `src/lib/constants.ts` (challenge ratings, creature types), `src/lib/abilities.ts`, `src/lib/skills.ts`, `src/lib/creature-sizes.ts`, and `src/lib/constants/filter-options.ts`.

### Statblock markup: the `{@…}` tag system

Action/trait `description` strings use 5eTools' `{@…}` tag syntax as Monsterbrew's *native* markup. `src/lib/statblock-markup.ts` (`parseMarkup` / `resolveTag` / `resolveMarkup`, plus `KNOWN_TAG_NAMES` and the arg validators) is the single source of truth that turns tagged text into display text — used by every render/export path, and by the damage estimator.

Two extensions over 5eTools:

- **Stat-linked values.** Where 5eTools writes a number (`{@hit 3}`, `{@dc 15}`, `{@damage 2d8 + 1}`), the same slot also accepts an **ability keyword** (`{@hit str}`, `{@dc con}`, `{@damage 2d8 + str}`) meaning "derive from the creature's stats and recompute live."
- **Composite line tags.** `{@attack m|str|5|1d6+str|slashing}` and `{@save dex|con|2d6|fire|half}` each render a whole attack or saving-throw line from structured args (`parseAttackArgs` / `serializeAttackArgs` and the `save` equivalents). Atomic 5eTools tags keep working — composites are an authoring convenience layered on top.

Because tags live inside the `description` string, they carry lightweight structure (attack type, dice, ability links) with **no schema field and no migration** — see `docs/design/attack-tokens.md`, `docs/design/token-inspector.md`, and `docs/roadmap-authoring-tools.md`.

### The markup editor (CodeMirror 6)

Feature descriptions are edited in a CodeMirror 6 field, not a textarea: `src/app/editor/components/actions-form/markup/`. `markup-editor.tsx` owns the CM instance (autocomplete over `TAG_CATALOG`, history with `isolateHistory` so each snippet insert is one undo step, and decorations that collapse *valid* composite tags into clickable chips showing their resolved text). `markup-field.tsx` wraps it with the tag-insert buttons and the token editor dialog. Supporting modules:

- `src/lib/tag-catalog.ts` — the insertable tag list (snippet + label + hint)
- `src/lib/markup-lint.ts` — the CM linter: unclosed tags, unknown tag names, composite arg problems (`compositeProblems` is shared with the decoration builder, so an invalid composite stays raw and keeps its squiggle)
- `src/lib/token-keys.ts` — keys editable tags as `name:occurrence` so an open editor dialog survives keystrokes (offsets shift; "the 2nd `{@attack}`" doesn't)
- `src/app/editor/components/token-editors/` — the registry (`TOKEN_EDITORS`) of structured dialog editors, currently `AttackEditor` and `SaveEditor`

Dialog field edits dispatch **straight into CodeMirror** via `replaceRange` on the editor handle rather than round-tripping through the controlled value — a whole-doc replace remaps the selection and closed the dialog mid-edit.

### Editor data flow

`src/app/editor/components/monster-form.tsx` (`MonsterForm`) is the hub. It creates a single `react-hook-form` form (`zodResolver(monsterSchema)`, `values:` fed from the loaded creature) and renders live-synced halves inside one `<Form>` provider:

- The editing UI: four section components — `IdentityForm`, `CombatForm`, `DefenseForm`, `ActionsForm` (each a directory under `editor/components/` with an `index.tsx`). They reach the shared form via `useFormContext()` and take no props.
- `statblock-preview.tsx` (`StatblockPreview`) — the live preview, wrapping `MonsterStatblock` and `MonsterDescription`.
- `CrCalculator`, `NewCreatureDialog`, `ImportDialog`, `AutoSaveIndicator`, and the headless `DerivedValues` are mounted here too.

**Keep form-value subscriptions out of `MonsterForm`.** It renders `<Form {...form}>` — react-hook-form's `FormProvider` — which builds a new context value on every render, so anything that re-renders `MonsterForm` re-renders every `useFormContext()` consumer beneath it; `React.memo` on the sections cannot stop that. A whole-form `useWatch` there put a full editor re-render on every keystroke (#158). `StatblockPreview` therefore owns its own `useWatch` and defers it (`useDeferredValue` + memoized children), and `DerivedValues` (`derived-values.tsx`) is a headless leaf that renders nothing and owns the passive-perception derivation for the same reason. This is enforced two ways: `statblock-preview.test.tsx` guards the preview with a render count, and `eslint.config.ts` has a file-scoped `no-restricted-syntax` rule banning `useWatch(...)` and `.watch(...)` inside `monster-form.tsx` (use `form.subscribe` for side effects instead).

Loading an existing creature: `/editor?id=<id>` loads it via the `useCreature(id)` TanStack Query hook (`staleTime: Infinity`, no focus refetch — IndexedDB is the source of truth and the editor is the only writer, so a background refetch must never overwrite the open form). The form consumes it reactively through RHF's `values:` prop plus a small hydration state, never a manual `form.reset`. As a fallback (no `id`), `useEditCreatureHandoff` hydrates once from a `localStorage.editCreature` handoff key (set when navigating "edit"/"copy"/"duplicate" from elsewhere), normalizing any legacy-shaped payload through `creatureToMonster`, then clears the key.

With no `id` and no handoff, `NewCreatureDialog` (`editor/components/new-creature/`) opens first, offering a blank creature, an import, a recently edited creature, or an SRD monster to start from.

Saving goes through `useSaveCreature()` and navigates to `/library/$id`. Once a creature has an id, `useAutoSave` (`src/hooks/use-auto-save.ts`) debounce-persists valid form changes through `useAutoSaveCreature()` — which writes into the detail query cache with `setQueryData` rather than invalidating, so the save doesn't resync and re-render the open form. Auto-save deliberately stays inert until the first manual save so half-filled creatures never spawn junk records; `useSaveNudge` surfaces the "save to turn on auto-save" alert until then.

Derived values are computed with `useEffect` + `form.setValue` rather than stored as input — e.g. passive perception recomputes from WIS + perception proficiency unless `custom_passive_perception` is set.

### CR benchmarking

`src/lib/cr-calculator.ts` compares a creature against the Lazy GM benchmark table in `src/lib/constants/cr-benchmarks.ts` — AC, save DC, HP, attack bonus, best ability modifier, and damage per round each classified `low` / `on-par` / `high` within a tolerance. The benchmark **table**, not the guide's quick formulas, is the source of every target number; the formulas only inform the tolerances (there's a cross-check test for the divergence at CR extremes).

Damage per round is estimated in `src/lib/damage-per-round.ts` by reading `{@damage}` / composite tags back out of the feature descriptions — which is why the markup parser and the CR math are coupled. A creature whose features carry no readable damage tag yields `null` rather than a wrong number.

The UI lives in `src/app/editor/components/cr-calculator/`: the collapsible panel, per-field hints (`field-hint.tsx`, rendered inline in the form sections), a recharts delta chart, and a "recommended stats" dialog. `use-cr-suggestions-enabled.ts` gates all of it behind the toolbar toggle.

### Persistence

`src/services/database.ts` opens the versioned `monsterbrewDB` (object store `creatures`, `keyPath: "id"`, currently `DB_VERSION = 2`; v1→v2 rewrites legacy-shaped records in place, guarded by `isLegacyCreature` so it's idempotent). Bumping the DB version means adding a `case` to the `upgrade` switch there.

`src/services/creatures.ts` is the **repository** — the only module that touches the database — and `src/hooks/use-creatures.ts` wraps it in TanStack Query hooks (`useCreatures`, `useCreature`, `useSaveCreature`, `useAutoSaveCreature`, `useDeleteCreature`, plus the `creatureKeys` key factory). Components go through the hooks, never through `idb` directly, so swapping the storage backend later means rewriting one file. `saveCreature` stamps `updated_at`; ids come from `generateId()` in `src/lib/utils.ts`.

`src/services/backup.ts` exports the whole library to a self-describing JSON envelope (`downloadCreatureBackup`), wired to the library grid.

### SRD monsters

The D&D 2024 SRD bestiary ships as static data in `src/data/srd-monsters.json` (~660 KB; its external shape is `src/types/srd.ts`). `src/services/converters/from-srd.ts` (`fromSrd`) maps each entry onto the canonical `Monster`, and `src/services/srd.ts` (`getSrdMonsters` / `getSrdMonster`) converts + memoizes the list, keyed by the SRD `key`. `/library?source=srd` shows a read-only, filterable grid (the "My creatures" ↔ "SRD monsters" toggle in `library-grid.tsx`); `/library/srd/$key` is the read-only detail with a "Copy to editor" action that hands the converted monster over via the `localStorage.editCreature` key. Because the JSON is large it is deliberately code-split — `creature-picker.tsx` imports `@/services/srd` dynamically for the same reason.

### Import / export

**Import** is auto-detecting. `src/services/converters/detect-import-format.ts` sniffs the pasted/uploaded JSON into an `ImportFormat`, and `import-to-monster.ts` (`convertImport`) routes it to the matching converter:

- `from-improved-initiative.ts` — `fromImprovedInitiative`
- `from-tetra-cube.ts` — `fromTetraCube`
- `from-open-5e.ts` — `fromOpen5e`
- `from-5e-tools.ts` — `from5eTools`

Each external format has a matching type file in `src/types/*`, and `monster-mappers.ts` holds the shared field mappers (abilities, saves, skills, damage modifiers, languages, senses, CR lookup). `prose-to-tags.ts` (`proseToTags` / `tagMonsterFeatures`) parses plain attack/damage/save prose into `{@…}` tags on import, so imported creatures get stat-linked markup rather than frozen numbers. The dialog is `src/app/editor/components/import-dialog.tsx`; the user can override the detected format. (`ImportTypes` in `src/lib/constants.ts` predates auto-detection and is now unused — `ImportFormat` is the live type.)

**Export** hangs off the library detail page. `creature-actions-menu.tsx` has a single **Export** button opening `export-dialog.tsx`, which tabs between four targets: Homebrewery V3 markdown (`to-markdown.ts`, `monsterToHomebrewery`), a FoundryVTT `dnd5e` NPC actor (`to-foundry.ts`, `monsterToFoundryActor`), an Improved Initiative statblock (`to-improved-initiative.ts`, `toImprovedInitiative`), and PDF via `react-to-print` with a print stylesheet that forces the two-column statblock layout. The three text formats share one preview/copy/download shape; PDF keeps `useReactToPrint` and `PDF_PAGE_STYLE` in `creature-actions-menu.tsx`, since printing needs a ref to the on-page statblock, and receives the trigger as an `onPrint` prop. One dialog rather than a button per format keeps the action bar from growing with every new target — and don't reintroduce a dropdown *menu*, since #137 deliberately replaced one with separate buttons. Export is **library-only**; #162 tracks offering it in the editor too.

Improved Initiative is the one format that round-trips both ways, guarded by a round-trip test. Two traps: it has no `Name` field, so the creature's name lives in `Description`; and speeds must keep their keyword (`walk 30 ft.`), because the importer matches on it — `formatMovements` emits a bare `30 ft.` for walk, which would be silently dropped. Foundry is export-only, so `src/types/foundry.ts` holds the actor shape as plain interfaces rather than Zod: nothing parses it back. `{@attack}` / `{@save}` features become *rollable* Foundry attack/save activities (the atomic `{@atkr}` / `{@hit}` form too, which `prose-to-tags.ts` falls back to); anything else becomes a descriptive `feat`. Item ids are derived deterministically, so re-exporting a creature is byte-identical. Shared export helpers live in `export-helpers.ts` (hit points, initiative, skill and save modifiers) — the mirror of `monster-mappers.ts` on the import side.

Converters are the most test-covered area. Unit tests live in `src/tests/converters/` (one `.test.ts` per converter plus a `-markup.test.ts` covering the prose→tag pass), and `e2e/import.spec.ts` is **fixture-driven**: dropping a real export into `e2e/fixtures/<format>/` automatically generates an end-to-end import test, with optional exact-output snapshots via `UPDATE_EXPECTED=1` (see `e2e/fixtures/README.md`).

### Content: guide and changelog

Both are markdown under `src/content/`, loaded with `import.meta.glob` and parsed at module scope — no CMS, no loaders.

`src/content/guide/NN-slug.md` files become the `/guide/$slug` chapters via `src/lib/guide.ts`, which strips the numeric prefix for the slug, reads `title` / `shortTitle` / `description` frontmatter, and extracts `##` headings into anchor ids (`slugify`) for the sidebar and for the editor's "read about this" links. The slug derivation is duplicated in `scripts/site-pages.mjs` for prerendering and locked to `guide.ts` by `src/tests/guide/guide.test.ts` — change one, change both.

### Prerendering & SEO

`scripts/site-pages.mjs` exports `staticPages`, `guideChapterPages` (from the guide filenames), and `srdPages` (from the SRD JSON). Both `vite.config.ts`'s prerender list and `scripts/generate-sitemap.mjs` import it, so the sitemap and the prerendered routes can't drift. Nearly everything is prerendered to static HTML at build time — marketing pages, guide chapters, all `/library/srd/$key` pages, plus the static shells of the client-only `ssr: false` routes (`/editor`, `/library`). Only `/library/$id` (unenumerable per-user ids) and the `/dev/*` routes render at request time. `/error` is prerendered but `noindex`, which is why it sits in the vite list rather than the shared sitemap list.

`src/lib/seo.ts` (`seo({ title, description, path, noindex })`) builds the head meta for each route's `head()`. `/my-creatures` is a redirect stub to `/library`.


### UI conventions

shadcn/ui ("base-lyra" style, on Base UI primitives) in `src/components/ui/`, Tailwind v4 (config-less; `src/app/globals.css` is the entry and imports `colors.css` for the palette and `typeset.css` for prose), Lucide icons. Theming is `next-themes` with `attribute="data-theme"`, so the dark variant is a custom one: `@custom-variant dark (&:is([data-theme="dark"] *))`.

The Button has two style axes from CVA definitions in `button.tsx`: `color` (`neutral` | `primary` | `accent` | `destructive`, default `primary`) × `variant` (`filled` | `light` | `outline` | `ghost` | `transparent` | `link`, default `filled`); `link` ignores `color`. A visual inventory of all components lives at `/dev/components` (localhost-only, guarded by `redirectUnlessLocalhost` in `src/lib/dev-route.ts`).

Toasts use `sonner` (`toast.*`); the `<Toaster>` is mounted in `__root.tsx`. Providers are `next-themes` + TanStack Query only (`src/components/providers/providers.tsx`) — there is no analytics script. The feedback dialog posts to Web3Forms and only arms itself when `VITE_WEB3FORMS_ACCESS_KEY` is set.

Two non-obvious conventions: write Tailwind theme scale utilities (`text-destructive-500`), never the arbitrary-value var syntax (`text-(--destructive-500)`) — if a scale utility lacks an `@theme` mapping in `globals.css`, that's a bug to fix, not a reason to fall back. And don't use the router's `Link` inside editor form components (`src/app/editor/components/**`): their colocated tests render without a router, so use plain `<a>` anchors there.

Preset trait/action content for quick insertion lives in `src/lib/constants/actionPresets.ts`.

### Error logging (Sentry)

Client-only `@sentry/react` — deliberately **not** the framework SDK `@sentry/tanstackstart-react`, whose value-add is server-side capture, which is out of scope here. `src/lib/sentry.ts` keeps the SDK off the critical path: `initSentryWhenIdle()` (called from `__root.tsx`) dynamically imports and initializes it on `requestIdleCallback`, and `captureError()` pulls it in on demand for anything thrown before that fires. Only `init` and `captureException` are ever destructured off the dynamic import — holding the module namespace would defeat tree-shaking and drag replay/tracing/feedback into the lazy chunk.

Both are no-ops unless `VITE_SENTRY_DSN` is baked in at build time; the DSN is set in Vercel for the **Production** environment only, so dev and PR previews never report. Router render/loader errors are forwarded via `defaultOnCatch` in `src/router.tsx`. Source maps upload through `@sentry/vite-plugin` in `vite.config.ts`, active only when `SENTRY_AUTH_TOKEN` is present (provided in `release.yml` from GitHub secrets/vars `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`); maps are deleted after upload and never deployed. `/dev/sentry` (localhost-only, like `/dev/components`) has buttons for each error path; to send real events locally, put a DSN in `.env.local` — they arrive tagged `development`.
