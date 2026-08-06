# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (pinned via the `packageManager` field; run `corepack enable` if you don't have it). Do not use `npm`/`yarn` — they'd create a competing lockfile.

- `pnpm install` — install dependencies (`--frozen-lockfile` in CI)
- `pnpm dev` — start the TanStack Start (Vite) dev server on port 3000 (SSR-capable)
- `pnpm build` — production build (Vite 8/Rolldown → Nitro emits `.output/`, a Vercel Build Output)
- `pnpm start` — run the built production server (`node .output/server/index.mjs`)
- `pnpm lint` — ESLint (flat config, `eslint.config.js`); `no-unused-vars` is an **error**, so unused imports/vars fail lint
- `pnpm test` — run Vitest in watch mode
- `pnpm exec vitest run` — run tests once (CI-style)
- `pnpm exec vitest run src/tests/converters/fiveETools.test.ts` — run a single test file
- `pnpm exec vitest run -t "some name"` — run tests matching a name

Path alias: `@/*` → `src/*` (defined in `tsconfig.json`; Vite 8 resolves it natively via `resolve.tsconfigPaths: true` in `vite.config.ts` and `vitest.config.mts`).

pnpm blocks dependency build scripts by default; the ones this project needs (`esbuild`, `unrs-resolver`) are allowlisted in `pnpm-workspace.yaml` under `allowBuilds`. If a build-time tool misbehaves after a dependency change, check whether it needs adding there.

## Commits & releases

Commit messages must follow **Conventional Commits** — enforced locally by a Husky `commit-msg` hook (commitlint) and in CI on PR commits *and* the PR title/description. Releases are fully automated by `semantic-release` on merge to `main` (`fix:` → patch, `feat:` → minor, `feat!:`/`BREAKING CHANGE` → major; `refactor`/`style`/`ci`/`chore`/`docs(README)` also cut patches). Do not bump `package.json` version manually — it is `0.0.0-managed.by.semantic.release`.

The user-facing changelog at `/changelog` is built from markdown files in `src/content/changelog/` (loaded via `import.meta.glob` in `src/lib/releases.ts`). Each PR adds its own file to `unreleased/` (use the `changelog-entry` skill — no version number, one file per PR, so parallel PRs never conflict). On release, `scripts/promote-changelog.mjs` (run by `@semantic-release/exec`) stamps the released version + date and moves the entry to `releases/`; `@semantic-release/git` commits that back to `main` with `[skip ci]`, and the deploy job builds from the release tag so the live site includes it. The raw conventional-commit changelog (`docs/CHANGELOG.md`) is generated in CI and attached to the GitHub release only — it is not tracked in git.

CI deploys PR previews and production to Vercel. It also runs the unit suite (`pnpm test:coverage`) and the e2e suite (`pnpm test:e2e:coverage`) — both **with coverage**, and both on a runner noticeably slower than a dev machine. A test that takes ~1.5s locally under coverage can exceed vitest's default 5s `testTimeout` there, so reproduce with `pnpm test:coverage` (not plain `vitest run`) before pushing, and treat a test that only just fits as a failure waiting to happen.

## Architecture

Monsterbrew is a **client-side-only** D&D 5e monster statblock builder. **TanStack Start** (TanStack Router on Vite, with SSR) + React 19, but there is no backend and no server functions: all creature data persists to **IndexedDB in the browser** (via `idb`). File-based routes live in `src/routes/` (`__root.tsx` holds the document shell, providers, header/footer, and SEO head/meta); page-specific components still live under `src/app/*/components/`. Nearly all routes are **prerendered to static HTML** at build time (the `prerenderPages` list in `vite.config.ts`: marketing pages, guide chapters, all `/library/srd/$key` pages, plus the static shells of the client-only `ssr: false` routes like `/editor` and `/library`); only `/library/$id` (unenumerable per-user ids) and the `/dev/*` routes render on the server at request time. Client navigation uses `Link`/`useNavigate`/`useSearch` from `@tanstack/react-router`. Despite `supabase` being a dev dependency, `src/types/database.types.ts` existing, and a `user_id` field in the schema, there is **no active Supabase/server persistence** — treat those as vestigial unless you are deliberately adding a backend.

### The creature model is the center of everything

`src/schema/monster-schema.ts` defines the canonical `monsterSchema` (Zod), its `Monster` type (`z.infer`), and `defaultMonster`. `Monster` is *the* creature type used across the entire app — the form, IndexedDB values, every import/export converter, and the statblock renderers all speak this one shape. `StoredMonster` is `Monster` plus the storage-only fields (`id` keyPath, optional `is_public`). When you change a field, expect ripples through: the schema + default, the matching form section, the statblock renderer, every converter, and possibly the IndexedDB migration.

Note some structured fields: `damage_modifiers` and `nonmagical_attack_modifiers` are `Record<damageType, "resistant"|"vulnerable"|"immune">`; `saving_throws` and `skills` are ability/skill-keyed records; features (`traits`, `actions`, `reactions`, `bonus_actions`, `lair_actions`, `legendary_actions`, `mythic_actions`) are all `{ name, description }`.

`src/schema/createCreatureSchema.ts` is the **legacy** shape (`createCreatureSchema` / `defaultCreature`) — retained only so old data and handoffs can be normalized. `src/services/migrations/creatureToMonster.ts` (`creatureToMonster`, guarded by `isLegacyCreature` in `creatureFormat.ts`) bridges legacy payloads to `Monster`. Don't build new features on the legacy schema.

### Statblock markup: the `{@…}` tag system

Action/trait `description` strings use 5eTools' `{@…}` tag syntax as Monsterbrew's *native* markup (e.g. `{@atkr m} {@hit str}, reach 5 ft. {@h}{@damage 2d8 + str} slashing damage.`). `src/lib/statblock-markup.ts` (`parseMarkup` / `resolveTag` / `resolveMarkup`) is the single source of truth that turns tagged text into display text — used by every render/export path. Monsterbrew's one extension over 5eTools: where 5eTools writes a number (`{@hit 3}`, `{@dc 15}`, `{@damage 2d8 + 1}`), the same slot also accepts an **ability keyword** (`{@hit str}`, `{@dc con}`, `{@damage 2d8 + str}`) meaning "derive from the creature's stats and recompute live." Because tags live inside the `description` string, they carry lightweight structure (attack type, dice, ability links) with **no schema field and no migration** — see `docs/design/attack-tokens.md` and `docs/roadmap-authoring-tools.md`.

### Editor data flow

`src/app/editor/components/monster-form.tsx` (`MonsterForm`) is the hub. It creates a single `react-hook-form` form (`zodResolver(monsterSchema)`, `values: loadedCreature ?? defaultMonster`) and renders two live-synced halves inside one `<Form>` provider:

- The editing UI: four section components — `IdentityForm`, `CombatForm`, `DefenseForm`, `ActionsForm` (`identity-form.tsx`, `combat-form.tsx`, `defense-form/`, `actions-form.tsx`). Each reaches the shared form via `useFormContext()` — they take no props. `ImportDialog` (`editor/components/import-dialog.tsx`) is mounted here too.
- `src/components/monster-statblock.tsx` (`MonsterStatblock`) — the live preview, fed the watched form value.

Loading an existing creature: `/editor?id=<id>` loads it via the `useCreature(id)` TanStack Query hook, which the form consumes reactively through RHF's `values:` prop (no manual `form.reset`). As a fallback (no `id`), it hydrates once from a `localStorage.editCreature` handoff key (set when navigating "edit"/"copy"/"duplicate" from elsewhere), normalizing any legacy-shaped payload through `creatureToMonster`, then clears the key. Saving goes through `useSaveCreature()` and navigates to `/library/$id`; IDs are generated with `generateId()` (`src/lib/utils.ts`).

Derived values are computed with `useEffect` + `form.setValue` rather than stored as input — e.g. passive perception recomputes from WIS + perception proficiency unless `custom_passive_perception` is set. Game-rule math (ability modifiers, saving throws, HP dice) lives in `src/lib/utils.ts`; reference tables (challenge ratings, sizes, creature types) live in `src/lib/constants.ts`.

### Persistence

`src/services/database.ts` opens the versioned `monsterbrewDB` (object store `creatures`, `keyPath: "id"`). IDs are generated client-side in `save-dialog.tsx` (`Date.now()-<random>`), not by the store. `save-dialog.tsx` only touches IndexedDB inside event handlers (not during render), so it renders fine under SSR. Bumping the DB version means adding a `case` to the `upgrade` switch in `database.ts`. Saved creatures are listed and managed in `/library`; the old `/my-creatures` route is a redirect stub to it.

### SRD monsters

The D&D 2024 SRD bestiary ships as static data in `src/data/srd-monsters.json` (its external shape is `src/types/srd.ts`). `src/services/converters/from-srd.ts` (`fromSrd`) maps each entry onto the canonical `Monster`, and `src/services/srd.ts` (`getSrdMonsters` / `getSrdMonster`) converts + memoizes the list, keyed by the SRD `key`. `/library?source=srd` shows a read-only, filterable grid (the "My creatures" ↔ "SRD monsters" toggle in `library-grid.tsx`); `/library/srd/$key` is the read-only detail with a single "Copy to editor" action that hands the converted monster to the editor via the `localStorage.editCreature` key. Because the JSON is large it code-splits into its own bundle chunk (only loaded on the library route).

### Import / export converters

`src/services/converters/*` translate between the internal creature shape and external tools; each external format has a matching type file in `src/types/*`:

- `improvedInitiative.ts` — `fromImprovedInitiative` / `toImprovedInitiative` (round-trips both ways)
- `tetraCube.ts` — `fromTetacube` (import)
- `open5e.ts` — `fromOpen5e` (import)
- `fiveETools.ts` — `from5ETools` (import)
- `markdown.ts` — `createMarkdownPage` exports Homebrewery V3 markdown, opening it in a `window.open()` popup

Import wiring is in `src/components/import-dialog.tsx`, switching on `ImportTypes` from `src/lib/constants.ts`; export wiring (Homebrewery, Improved Initiative JSON, PDF) is in the dropdown in `creature-form.tsx`. Converters are the most test-covered area (`src/tests/converters/`) — add/adjust tests there when touching them.

### UI conventions

shadcn/ui ("base-lyra" style, on Base UI primitives) in `src/components/ui/`, Tailwind v4 (config-less, driven by `src/app/globals.css`), Lucide icons. The Button has two style axes from CVA definitions in `button.tsx`: `color` (`neutral` | `primary` | `accent` | `destructive`, default `primary`) × `variant` (`filled` | `light` | `outline` | `ghost` | `transparent` | `link`, default `filled`); `link` ignores `color`. A visual inventory of all components lives at `/dev/components` (localhost-only route). Toasts use `sonner` (`toast.*`); the `<Toaster>` is mounted in `layout.tsx`. Analytics is Plausible (wrapped in `providers.tsx`); React Query is provided but currently minimal.

Two non-obvious conventions: write Tailwind theme scale utilities (`text-destructive-500`), never the arbitrary-value var syntax (`text-(--destructive-500)`) — if a scale utility lacks an `@theme` mapping in `globals.css`, that's a bug to fix, not a reason to fall back. And don't use the router's `Link` inside editor form components (`src/app/editor/components/**`): their colocated tests render without a router, so use plain `<a>` anchors there.

Preset trait/action content for quick insertion lives in `src/lib/constants/actionPresets.ts`.

### Error logging (Sentry)

Client-only `@sentry/react` — deliberately **not** the framework SDK `@sentry/tanstackstart-react`, which was still beta (targeting "TanStack Start 1.0 RC") when this was set up in July 2026; its value-add is server-side capture, which is out of scope here. `src/lib/sentry.ts` initializes at module scope (side-effect import in `__root.tsx`) but only when `VITE_SENTRY_DSN` is baked in at build time — the DSN is set in Vercel for the **Production** environment only, so dev and PR previews never report. Router render/loader errors are forwarded via `defaultOnCatch` in `src/router.tsx`. Source maps upload through `@sentry/vite-plugin` in `vite.config.ts`, active only when `SENTRY_AUTH_TOKEN` is present (provided in `release.yml`'s production build step from GitHub secrets/vars `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`); maps are deleted after upload and never deployed. `/dev/sentry` (localhost-only, like `/dev/components`) has buttons for each error path; to send real events locally, put a DSN in `.env.local` — they arrive tagged `development`.
