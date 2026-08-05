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

## 2. Branch in an isolated worktree

Issue work always happens in its own worktree, so the user's main checkout
stays clean and several issues can run in parallel.

- Check for existing work on this issue first: `git worktree list`,
  `git branch -a | grep "issue-<number>"` and
  `gh pr list --state all --search "<number>"`. If a worktree, branch or PR
  already exists, stop and ask whether to resume it instead of starting fresh.
- `git fetch origin`, then create the worktree and branch together off
  `origin/main`:

  ```
  git worktree add .claude/worktrees/issue-<number> \
    -b <type>/issue-<number>[-short-slug] origin/main
  ```

  `.claude/worktrees/` is gitignored (`.gitignore` line 46), so the worktree
  never shows up as untracked files in the parent checkout.

- `<type>` follows the issue label: `enhancement` → `feat`, `bug` → `fix`,
  `chore` → `chore`. No label: judge from the issue content. The slug is
  optional and only for bigger pieces of work (matches existing history:
  `chore/issue-90`, `fix/issue-139`, `feat/issue-136-composite-tag-grammar`).
- Worktrees do not share `node_modules` — run `pnpm install` inside the new
  worktree before anything else, and run every later command from there.
- Pick a unique `E2E_PORT` for this worktree (e.g. 3123, 3124, …) and use it
  for every Playwright command. Port 3000 with `reuseExistingServer` silently
  tests the user's own dev server in the _parent_ checkout — see the `verify`
  skill.

## 3. Plan before coding

- Explore the relevant code, then write the plan to
  `docs/plans/issue-<number>.md`: files to touch, approach, test strategy
  (including whether e2e coverage is needed), anything the issue leaves open.
  A file rather than a chat message — it survives context compaction and a
  restarted session, and it ships with the PR. Keep it short for small issues;
  a handful of bullets is fine.
- Summarise it in chat and **always wait for the user's explicit approval
  before implementing** — even for small, unambiguous issues. No exceptions.

## 4. Implement

- Follow CLAUDE.md conventions (canonical `Monster` schema, `{@…}` markup,
  converter test coverage, shadcn/Tailwind rules).
- When a schema field changes, walk the ripple list from CLAUDE.md: schema +
  default, form section, statblock renderer, converters, IndexedDB migration.
- **Test fixtures come from real data, never invented shapes.** For 5eTools /
  bestiary parsing, copy the record out of
  `/Users/rnsts/code/personal/5etools-src/data/bestiary/` and note the source
  file and creature name in a comment above the fixture. Import round-trips get
  a real export dropped into `e2e/fixtures/<format>/` (see that folder's
  README — no code changes needed, the spec picks it up). Before writing a
  parser for a field, survey how that field actually varies across the bestiary
  sources, including 2024-format vs classic, and show the user the variant list
  before coding against it.

## 5. Verify

Run all four, and report what the commands actually printed — never assert a
suite is green without having run it to completion.

- `pnpm exec vitest run` — full unit suite, not a subset.
- `pnpm lint` — unused imports/vars are errors, so run it even for small diffs.
- `E2E_PORT=<port> pnpm exec playwright test` — the **full** e2e suite, on
  every issue. Not just the specs that look related: shared helpers in `e2e/`
  use structural selectors, so a DOM or markup change anywhere can break specs
  that have nothing to do with the feature. This has reached CI before.
- For UI-visible changes, also drive it in a browser via the `verify` skill
  (isolated dev server + Playwright script) rather than claiming it works from
  the diff.

If something fails, fix it and re-run. Don't describe a failure as pre-existing
or unrelated without checking it against `origin/main` first.

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
  tweaks. Skip only if the change is invisible _and_ the user agrees.

## 8. Hand off the commit

Committing and pushing are blocked for Claude in this repo (by design).
Instead:

- `git add` the intended files (list them) — including the plan doc.
- Give the user copy-pasteable commands with a Conventional Commits message
  referencing the issue. They run from the worktree, so lead with the `cd`:

  ```
  cd .claude/worktrees/issue-132
  git commit -m "feat: add general preset dialog for traits and actions (#132)"
  git push -u origin feat/issue-132-preset-dialog
  ```

- Wait for the user to confirm they have committed and pushed.

## 9. Open the PR

- `gh pr create` with a conventional-commit title (commitlint checks the PR
  title and description in CI; body line length is not limited).
- Body: short summary of the change plus `Closes #<number>`.
- **Not a draft.** The `code-review` skill in step 10 skips draft PRs outright,
  so `--draft` would silently cancel the review.
- Report the PR URL back to the user.

## 10. Code review the PR

Once the PR is open, hand it to a reviewer with fresh eyes.

- Spawn a subagent with the Agent tool (`general-purpose`) and tell it to invoke
  the `code-review:code-review` skill on the PR number. Keep the brief thin —
  the skill carries its own methodology (parallel reviewers over CLAUDE.md
  adherence, bugs, git history, prior PR comments, and code comments, then a
  confidence pass that drops anything scoring under 80).
- Run it in a subagent rather than inline: the review fans out over a lot of
  agents, and none of that output needs to land in this session's context.
- It posts its findings as a comment on the PR. That is a public write on the
  repo, so mention it to the user before spawning if they haven't asked for the
  review themselves.
- When it comes back, summarise the findings for the user and say which ones you
  think are real. Fixes go through step 8 again — stage, hand over the commit
  and push commands, and let CI re-run.
- If it reports nothing, say so plainly rather than treating silence as a pass;
  the skill only surfaces high-confidence issues and stays quiet below that bar.
