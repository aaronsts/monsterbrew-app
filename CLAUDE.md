# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (pinned via the `packageManager` field; run `corepack enable` if you don't have it). Do not use `npm`/`yarn` — they'd create a competing lockfile.

- `pnpm install` — install dependencies (`--frozen-lockfile` in CI)
- `pnpm dev` — start the TanStack Start (Vite) dev server on port 3000 (SSR-capable)
- `pnpm build` — production build (Vite → `dist/client` + `dist/server`)
- `pnpm start` — run the built production server (`node dist/server/server.js`)
- `pnpm lint` — ESLint (flat config, `eslint.config.js`); `no-unused-vars` is an **error**, so unused imports/vars fail lint
- `pnpm test` — run Vitest in watch mode
- `pnpm exec vitest run` — run tests once (CI-style)
- `pnpm exec vitest run src/tests/converters/fiveETools.test.ts` — run a single test file
- `pnpm exec vitest run -t "some name"` — run tests matching a name

Path alias: `@/*` → `src/*` (configured in `tsconfig.json`, `vite.config.ts`, and `vitest.config.mts` via `vite-tsconfig-paths`).

pnpm blocks dependency build scripts by default; the ones this project needs (`esbuild`, `unrs-resolver`) are allowlisted in `pnpm-workspace.yaml` under `allowBuilds`. If a build-time tool misbehaves after a dependency change, check whether it needs adding there.

## Commits & releases

Commit messages must follow **Conventional Commits** — enforced locally by a Husky `commit-msg` hook (commitlint) and in CI on PR commits *and* the PR title/description. Releases are fully automated by `semantic-release` on merge to `main` (`fix:` → patch, `feat:` → minor, `feat!:`/`BREAKING CHANGE` → major; `refactor`/`style`/`ci`/`chore`/`docs(README)` also cut patches). The changelog lives at `docs/CHANGELOG.md` and is surfaced in-app at `/changelog`. Do not bump `package.json` version manually — it is `0.0.0-managed.by.semantic.release`.

CI deploys PR previews and production to Vercel. There is no test-run step in CI, so run tests locally before pushing.

## Architecture

Monsterbrew is a **client-side-only** D&D 5e monster statblock builder. **TanStack Start** (TanStack Router on Vite, with SSR) + React 19, but there is no backend and no server functions: all creature data persists to **IndexedDB in the browser** (via `idb`). File-based routes live in `src/routes/` (`__root.tsx` holds the document shell, providers, header/footer, and SEO head/meta); page-specific components still live under `src/app/*/components/`. The marketing routes (`/`, `/privacy`, `/changelog`) server-render for SEO; `/legacy-editor` is marked `ssr: false` because it depends on the browser-only `react-to-print`. Client navigation uses `Link`/`useNavigate`/`useSearch` from `@tanstack/react-router`. Despite `supabase` being a dev dependency, `src/types/database.types.ts` existing, and a `user_id` field in the schema, there is **no active Supabase/server persistence** — treat those as vestigial unless you are deliberately adding a backend.

### The creature model is the center of everything

`src/schema/createCreatureSchema.ts` defines the canonical `createCreatureSchema` (Zod) and `defaultCreature`. `z.infer<typeof createCreatureSchema>` is *the* creature type used across the entire app — the form, IndexedDB values, every import/export converter, and the statblock renderers all speak this one shape. When you change a field, expect ripples through: the schema + default, the matching form section, the statblock renderer, every converter, and possibly the IndexedDB migration.

### Editor data flow

`src/app/editor/components/editor.tsx` is the hub. It creates a single `react-hook-form` form (`zodResolver(createCreatureSchema)`, `defaultValues: defaultCreature`) and renders two live-synced halves inside one `<Form>` provider:

- `creature-form.tsx` — the editing UI, an `Accordion` of section forms under `editor/components/form/*` (general info, movements, senses, languages, skills, damages, conditions, traits, actions, reactions, legendary/mythic). Each section reaches the shared form via `useFormContext()` — they take no props.
- `creature-statblock.tsx` — a live preview built from `editor/components/statblock/*`, plus `pdf-statblock.tsx` for print/PDF (`react-to-print`).

Loading an existing creature: `/editor?id=<id>` reads it from IndexedDB and calls `form.reset(storedCreature)`. As a fallback (no `id`), it hydrates from a `localStorage.editCreature` handoff key (set when navigating "edit" from elsewhere) and then clears it.

Derived values are computed with `useEffect` + `form.setValue` rather than stored as input — e.g. passive perception recomputes from WIS + perception proficiency unless `custom_passive_perception` is set. Game-rule math (ability modifiers, saving throws, HP dice) lives in `src/lib/utils.ts`; reference tables (challenge ratings, sizes, creature types) live in `src/lib/constants.ts`.

### Persistence

`src/services/database.ts` opens the versioned `monsterbrewDB` (object store `creatures`, `keyPath: "id"`). IDs are generated client-side in `save-dialog.tsx` (`Date.now()-<random>`), not by the store. `save-dialog.tsx` only touches IndexedDB inside event handlers (not during render), so it renders fine under SSR. Bumping the DB version means adding a `case` to the `upgrade` switch in `database.ts`. `/my-creatures` lists and manages saved creatures.

### Import / export converters

`src/services/converters/*` translate between the internal creature shape and external tools; each external format has a matching type file in `src/types/*`:

- `improvedInitiative.ts` — `fromImprovedInitiative` / `toImprovedInitiative` (round-trips both ways)
- `tetraCube.ts` — `fromTetacube` (import)
- `open5e.ts` — `fromOpen5e` (import)
- `fiveETools.ts` — `from5ETools` (import)
- `markdown.ts` — `createMarkdownPage` exports Homebrewery V3 markdown, opening it in a `window.open()` popup

Import wiring is in `src/components/import-dialog.tsx`, switching on `ImportTypes` from `src/lib/constants.ts`; export wiring (Homebrewery, Improved Initiative JSON, PDF) is in the dropdown in `creature-form.tsx`. Converters are the most test-covered area (`src/tests/converters/`) — add/adjust tests there when touching them.

### UI conventions

shadcn/ui ("new-york" style) in `src/components/ui/`, Tailwind v4 (config-less, driven by `src/app/globals.css`), Lucide icons. Custom Button `color`/`variant` props (e.g. `color="carrara"`, `variant="filled"`, `"transparant"` — note spelling) come from CVA definitions in `button.tsx`. Toasts use `sonner` (`toast.*`); the `<Toaster>` is mounted in `layout.tsx`. Analytics is Plausible (wrapped in `providers.tsx`); React Query is provided but currently minimal.

Preset trait/action content for quick insertion lives in `src/lib/constants/actionPresets.ts`.
