# Monsterbrew

A D&D 5e monster statblock builder for Dungeon Masters. Build homebrew creatures in a form-based editor with a live statblock preview, browse the 2024 SRD bestiary, and import or export to the formats other tools use.

Live at [monsterbrew.app](https://monsterbrew.app).

Everything is stored locally in your browser (IndexedDB). There is no backend and no account. Your creatures never leave your machine unless you export them.

## Features

- Statblock editor with a live preview that updates as you type
- Inline `{@…}` tags in action text (the 5eTools syntax) with a Monsterbrew twist: attack bonuses, DCs, and damage can reference ability scores and recompute when stats change
- The full D&D 2024 SRD bestiary as a read-only library, ready to copy and edit
- Import from 5eTools, Open5e, Improved Initiative, and TetraCube
- Export to Homebrewery V3 markdown, Improved Initiative JSON, or PDF
- A [creature building guide](https://monsterbrew.app/guide) covering CR, traits, and playtesting

## Stack

- [TanStack Start](https://tanstack.com/start) (TanStack Router on Vite, SSR) with React 19
- Tailwind CSS v4 + shadcn/ui
- Zod + react-hook-form for the creature schema and editor
- [idb](https://github.com/jakearchibald/idb) for IndexedDB persistence
- Vitest (unit) and Playwright (e2e)
- semantic-release, deployed on Vercel, analytics via Plausible, errors via Sentry

## Development

This project uses pnpm, pinned via the `packageManager` field. Run `corepack enable` once if you don't have it.

```sh
pnpm install
pnpm dev            # dev server on http://localhost:3000
```

Other useful commands:

```sh
pnpm lint               # ESLint (unused vars are errors)
pnpm test               # Vitest in watch mode
pnpm exec vitest run    # run tests once
pnpm test:e2e           # Playwright e2e tests
pnpm build              # production build
```

CI has no test step, so run tests locally before pushing.

## Commits and releases

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint locally and in CI. Releases are automated with semantic-release on merge to `main`, so don't bump the version manually. The user-facing changelog at [/changelog](https://monsterbrew.app/changelog) is built from markdown entries in `src/content/changelog/`; each PR adds its own entry.

## Legal

Monsterbrew is not affiliated with Wizards of the Coast. SRD content is from the System Reference Document 5.2.1 by Wizards of the Coast LLC, used under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/legalcode).
