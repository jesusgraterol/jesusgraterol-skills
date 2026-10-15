# Skill guidelines

`/docs` is reserved for essential, durable project concepts and processes. This page explains how skills are created, written, checked, maintained, and retired, and lists every place to update when a skill changes. [`skill-icons.md`](skill-icons.md) covers icons.

## Kinds of skill

- **Explicit skills** are workflows the developer invokes by name, such as `jg-plan` or `jg-push`. They set `disable-model-invocation: true`, ship the explicit-only Codex policy, copy the shared `## Invocation` section word for word, and put the workflow under `## Workflow`. Each one states what it may change.
- **Implicit skills** hold the standards for one stack, library, or version, such as `jg-react` or `jg-zod`. Agents load them on their own when a task matches their triggers. They omit the flag, ship the implicit policy, copy the shared `## Application` section, and put their rules in topic sections.

## Where content belongs

- **The coding instructions** hold rules that apply to every task, or that decide whether work happens at all, such as testing expectations and security. Library-neutral policies stay there even when a skill holds the library's mechanics: validating untrusted input stays in the instructions, while the Zod details live in `jg-zod`.
- **An implicit skill** holds content tied to one stack, library, or version that only matters when a task touches it. Extend the skill for that stack before adding a new one.
- **An explicit skill** holds a repeatable workflow with its own inputs, outputs, and limits.
- **Each rule has one owner.** Point to it from elsewhere instead of repeating it.

## Writing a skill

- **Requirements and defaults.** Use "never", "always", or "must" only for requirements, and "prefer" for defaults that a stated reason can override. Keep techniques with a trade-off in a "when the numbers justify it" section. Don't add rules that get in a developer's way without a reason.
- **Changes that affect others.** Have the skill propose changes such as a bot, a CI job, or a dependency, instead of making them.
- **Versions.** An implicit skill states the versions it was written for in its version bullet, and marks items that need a minimum version, like (4.3+). Verify version-specific facts against primary sources, such as official documentation and release notes, and record the sources in the plan.
- **Self-contained.** Never link to sections of the coding instructions or another document, and never name project-specific symbols. Refer to other skills by bare name, such as `jg-breakdown`, never with a `/` or `$` prefix. A mention is only a pointer: the one runtime dependency is `jg-execute auto`, which reads the `jg-review` and `jg-push` `SKILL.md` files from the neighboring folders.
- **Shared sections.** Copy `## Invocation` or `## Application` word for word. An implicit skill may change only two lines of its Application section: its area sentence, and its version bullet, which may describe a target instead of an installed version, as `jg-bash` does. A change to a shared section changes every skill of that kind in the same commit.
- **Wording.** Keep it plain and specific. Examples are illustrative and never override the installed version's API.

## Adding a skill

- **Folder.** Create `skills/jg-<name>/` with `SKILL.md`, whose `name` matches the directory, and `agents/openai.yaml`.
- **Description.** An explicit skill's description is its card text, below. An implicit skill's description is one summary sentence, then "Use when writing, reviewing, or planning …" with distinct triggers. Avoid triggers that match nearly every task, such as running tests.
- **Catalog entry.** Add one in `website/src/site.config.ts`.
  - An explicit skill needs `access`, `examples`, `stage`, and `whenToUse`. An implicit skill needs an example request with its outcome, a `summary`, and `whenToUse`.
  - Keep `order` contiguous: insert the skill where it belongs and renumber the entries after it.
  - Give it a search title of at most 60 characters that starts with the skill name, and a search description of 70 to 160 characters.
  - Give it an `icon` following [`skill-icons.md`](skill-icons.md), and add its row to that page's table.
- **Card text.** Each card shows one sentence: an explicit skill's `SKILL.md` description, or an implicit skill's `summary`, which also opens its page. Keep it to about 75 to 100 characters, and never repeat the card's badge, such as "Read-only". An explicit description starts with a verb and says what the skill does and produces. An implicit summary lists what the skill covers and ends with its technology. A new access label must fit on one line under the skill name, which the card tests check at 320 and 640 pixels wide.
- **README.** Add a row to the explicit or implicit skills table, and add the name to the update and remove commands in the catalog's key order.
- **Implicit skills only.** Add a line to the `## Implicit skills` index in the local, git-ignored `CANDIDATE.md` under `coding-agent-planning/` when it exists, naming the same triggers as the skill's description. When a protected instructions file, such as `AGENTS.md` or `CLAUDE.md`, carries the same index, don't edit it; report the line it needs instead.

## Checking a change

- **Always.** Run `npm run check` in `website/`. The build fails when:
  - the catalog and the skill folders disagree, or a skill name differs from its directory
  - a skill's frontmatter flag or Codex policy doesn't match its kind in the catalog
  - a search title or description falls outside its limits
  - a shared section differs from the other skills of its kind, outside the two lines an implicit skill may change
  - an implicit skill has no version line
  - a skill links to a section of a document, or names another skill with a `/` or `$` prefix

  The type check fails on a missing or mismatched icon.
- **New or changed triggers.** Check that an implicit skill loads in Claude Code and Codex.
  - Use a throwaway Git repository with every implicit skill in `.claude/skills/` and `.agents/skills/`, and stub `CLAUDE.md` and `AGENTS.md` files holding one neutral line, with no index and no instruction to run tests.
  - Run requests that should load the skill, plus two unrelated ones, in both agents and read-only: `claude -p "<request>" --output-format stream-json --verbose --max-turns 10 --no-session-persistence --permission-mode plan`, and `codex exec --json --ephemeral --sandbox read-only -C <repository> "<request>"`.
  - The requests that should load the skill must load it, and others may load too when a request touches them. The unrelated requests must load none.
  - When the check fails, revise the description and its index line, up to three times, then report.
- **Changed explicit workflows.** Run the skill non-interactively in both agents on a request that exercises the change. Test a pick or a confirmation by resuming the session with a reply: `claude -p "<reply>" --resume <session-id>`, or `codex exec resume <session-id> --json -c sandbox_mode=read-only "<reply>"` from the repository.
- **Rules moving between files.** Back up any git-ignored file first, such as `CANDIDATE.md`, then confirm that every removed rule landed in its destination or was dropped on purpose.
- **Cleanup.** After agent runs, delete the throwaway repository and its logs, plus the session records under `~/.claude/projects/` and `~/.codex/sessions/` and the plan files under `~/.claude/plans/` that the runs left. Leave other sessions' files alone.

## Maintaining a skill

- **Outdated-item issues.** Implicit skills offer to open an issue when an item looks outdated for a newer version. Verify the report against the official documentation, update the item and its version marker, and close the issue with the change.
- **Version lines.** Change a skill's "written for" versions only after reviewing the whole skill against them.
- **Major releases.** Review a skill when its technology ships a new major version.
- **The index.** Keep each `CANDIDATE.md` index line naming the same triggers as its skill's description.

## Renaming or removing a skill

- Search `skills/`, `README.md`, `docs/`, `website/src`, and the local `CANDIDATE.md` for the old name, and update every mention, including other skills that point to it by name.
- Update or remove the skill's row in [`skill-icons.md`](skill-icons.md). When a removed skill was the last one using a technology mark, remove the mark's key, its path data, and its row in [`asset-attribution.md`](asset-attribution.md).
- **Before a skill reaches `main`,** rename or remove it freely.
- **Once it is on `main`,** it is installed in other projects, and `npx skills update` won't find a renamed skill. Leave a stub under the old name in the next merge to `main`: explicit-only, saying what replaced the skill and giving its remove command, so an update replaces the stale copy with the notice. Delete the stub in the merge after that, and say so in both pull requests. The website build doesn't support stub folders yet, so add that with the first stub.
