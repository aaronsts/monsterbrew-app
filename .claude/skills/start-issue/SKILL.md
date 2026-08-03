---
name: start-issue
description: Kick off work on a GitHub issue end-to-end (branch, plan, implement, test, changelog, PR). Use when the user types /start-issue <number> or writes "Start issue #<number>" / "start working on issue <number>" / "pick up issue <number>".
---

# Starting work on a GitHub issue

Run this workflow the same way every time. The argument is the issue number
(from `/start-issue 132` or "Start issue #132").

## 1. Read the issue

- `gh issue view <number>` and `gh issue view <number> --comments` — read the
  title, body, labels, and any discussion. Comments often contain decisions
  that supersede the body.
- Restate the goal in one or two sentences so the user can catch a
  misunderstanding early.

## 2. Branch from fresh main

- Check `git status` first. If there is uncommitted work or the checkout is on
  another feature branch, stop and ask before touching anything.
- `git fetch origin` and branch from `origin/main`:
  `git checkout -b <type>/issue-<number>[-short-slug] origin/main`
- `<type>` follows the issue label: `enhancement` → `feat`, `bug` → `fix`,
  `chore` → `chore`. No label: judge from the issue content. The slug is
  optional and only for bigger pieces of work (matches existing history:
  `chore/issue-90`, `fix/issue-139`, `feat/issue-136-composite-tag-grammar`).

## 3. Plan before coding

- Explore the relevant code, then post a short plan: files to touch, approach,
  anything the issue leaves open.
- **Always wait for the user's explicit approval of the plan before
  implementing** — even for small, unambiguous issues. No exceptions.

## 4. Implement

- Follow CLAUDE.md conventions (canonical `Monster` schema, `{@…}` markup,
  converter test coverage, shadcn/Tailwind rules).
- When a schema field changes, walk the ripple list from CLAUDE.md: schema +
  default, form section, statblock renderer, converters, IndexedDB migration.

## 5. Verify

- `pnpm exec vitest run` — full test suite, must pass.
- `pnpm lint` — unused imports/vars are errors, so run it even for small diffs.
- For UI-visible changes, use the `verify` skill (isolated dev server +
  Playwright) rather than claiming it works from the diff. From a worktree,
  remember `E2E_PORT` so you never test against the user's own dev server.

## 6. Confidence check

- Present the finished work to the user with an honest confidence assessment:
  - An overall rating (high / medium / low) on whether the feature does what
    the issue asked, with the reasoning behind it.
  - What was actually verified (which tests, what the runtime check showed)
    versus what is assumed from reading the diff.
  - The specific parts you are least sure about — edge cases, interactions
    with other features, styling, migration behavior.
- **Stop here and wait.** The user reviews and may ask for adjustments;
  iterate until they are satisfied. Only then continue to the changelog and
  commit steps.

## 7. Changelog entry

- Use the `changelog-entry` skill to draft the entry in
  `src/content/changelog/unreleased/`, and show it to the user for wording
  tweaks. Skip only if the change is invisible *and* the user agrees.

## 8. Hand off the commit

Committing and pushing are blocked for Claude in this repo (by design).
Instead:

- `git add` the intended files (list them).
- Give the user copy-pasteable commands with a Conventional Commits message
  referencing the issue, e.g.:

  ```
  git commit -m "feat: add general preset dialog for traits and actions (#132)"
  git push -u origin feat/issue-132-preset-dialog
  ```

- Wait for the user to confirm they have committed and pushed.

## 9. Open the PR

- `gh pr create` with a conventional-commit title (commitlint checks the PR
  title and description in CI; body line length is not limited).
- Body: short summary of the change plus `Closes #<number>`.
- Report the PR URL back to the user.
