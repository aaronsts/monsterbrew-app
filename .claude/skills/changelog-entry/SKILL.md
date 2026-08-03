---
name: changelog-entry
description: Draft a new in-app changelog entry for Monsterbrew's /changelog page in the established voice. Use when wrapping up a feature/fix/chore before opening a PR, when the user types /changelog-entry, or they ask to "add a changelog entry" / "write release notes" for the current branch's work.
---

# Writing a Monsterbrew changelog entry

Monsterbrew's user-facing changelog is a set of markdown files under
`src/content/changelog/`. It is **not** the raw conventional-commit changelog —
entries are short, benefit-first release notes written in a consistent voice.

Each PR adds its **own new file** to `src/content/changelog/unreleased/` — no
shared file is edited, so concurrent PRs never conflict, and no version number
is chosen at PR time. When the release pipeline runs on `main`,
`scripts/promote-changelog.mjs` stamps the real released version and date into
each pending entry and moves it to `src/content/changelog/releases/`, where the
`/changelog` page picks it up (entries landing in the same release are merged
into one card).

## Steps

1. **Gather the changes on this branch.** Run these and read the output:
   - `git log --no-merges origin/main..HEAD --pretty=format:'%s%n%b'` — the
     commits (and bodies) not yet on `main`. If that range is empty (work is
     still uncommitted), fall back to `git diff --stat main...HEAD` plus
     `git status` and `git diff` to see what actually changed.
   - Focus on **what changed for the user**, not the mechanics. Read the diff
     enough to describe the behavior, not just the commit subjects.

2. **Read two or three recent entries** in `src/content/changelog/releases/`
   for orientation. When they conflict with the Voice rules below, the rules
   win: older entries run longer and chattier than the current voice.

3. **Write the entry** to `src/content/changelog/unreleased/<slug>.md`, where
   `<slug>` is a short kebab-case name for the change (e.g. `export-returns.md`,
   `srd-monsters.md`). Format:

   ```md
   ---
   title: Short punchy name
   badge: Major
   ---

   One or two plain sentences on what changed.

   - Concrete, user-facing bullet
   - Another concrete bullet
   ```

   - The frontmatter block is **optional** and both keys are optional:
     `title` only for a notable feature worth naming; `badge: Major` only on a
     major release. Most entries have neither — then skip the frontmatter
     entirely.
   - Do **not** add `version` or `date` — the release pipeline stamps those.
   - Body = the 1-2 sentence summary first, then `- ` bullets for the changes
     list. Keep each bullet on a single line.

4. **Show the entry to the user** and let them tweak the wording. Do not treat
   the draft as final — the whole point is a curated starting point, not an
   auto-published note.

You can preview the entry locally: `pnpm dev` → `/changelog` shows pending
entries at the top under "Unreleased".

## Voice

Study the existing entries and match them. The rules that produce that voice:

- **Benefit-first and second-person.** Lead with what the user can now do, not
  the implementation. "You can now...", "shows up in the statblock automatically."
- **Plain language.** No jargon, no internal component names, no ticket/PR
  numbers. A player who's never seen the code should understand it.
- **Dry and short.** The **summary** is 1-2 matter-of-fact sentences saying
  what changed. No scene-setting, no sales pitch. The **bullets** are 1-5
  short, simple specifics, one plain clause each.
- **No em dashes.** Use commas, periods, or parentheses instead.
- **Be honest about invisible work.** For refactors/build/tooling releases, say
  so plainly: "An under-the-hood change... No visible changes." Don't oversell.
- **`title`** only when there's a headline feature worth naming (e.g. "SRD
  monsters", "Dynamic attack tokens"). Omit it for patches and small changes.
- **`badge`** is reserved for major releases ("Major"). Most entries have none.

## Notes

- One file per PR. If the branch bundles several loosely-related changes, still
  write one entry with multiple bullets.
- If several PRs merge before a release happens, all their entries get the same
  version and render as one merged release card — that's expected.
- Curly quotes are fine and used in existing entries. Frontmatter values are
  plain unquoted strings.
