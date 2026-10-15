# Skill changes

`/docs` is reserved for essential, durable project concepts and processes. This page lists every place to update when you add, rename, or remove a skill, so the skills, the website, the README, and the local coding instructions stay in step.

## Adding a skill

- **Folder.** Create `skills/jg-<name>/` with `SKILL.md`, whose `name` matches the directory, and `agents/openai.yaml`.
  - An explicit skill sets `disable-model-invocation: true`, ships the explicit-only policy, and copies the shared `## Invocation` section word for word before its `## Workflow`.
  - An implicit skill omits the flag, ships the implicit policy, and copies the shared `## Application` section, changing only its area sentence and its version bullet.
- **Catalog entry.** Add one in `website/src/site.config.ts`.
  - An explicit skill needs `access`, `examples`, `stage`, and `whenToUse`. An implicit skill needs an example request with its outcome, a `summary`, and `whenToUse`.
  - Keep `order` contiguous: insert the skill where it belongs and renumber the entries after it.
  - Give it a search title of at most 60 characters that starts with the skill name, and a search description of 70 to 160 characters.
  - Give it an `icon` following [`skill-icons.md`](skill-icons.md), and add its row to that page's table.
- **Card text.** Each card shows one sentence: an explicit skill's `SKILL.md` description, or an implicit skill's `summary`, which also opens its page. Keep it to about 75 to 100 characters, and never repeat the card's badge, such as "Read-only". An explicit description starts with a verb and says what the skill does and produces. An implicit summary lists what the skill covers and ends with its technology. A new access label must fit on one line under the skill name, which the card tests check at 320 and 640 pixels wide.
- **README.** Add a row to the explicit or implicit skills table, and add the name to the update and remove commands in the catalog's key order.
- **Implicit skills only.** Add a line to the `## Implicit skills` index in the local, git-ignored `CANDIDATE.md` under `coding-agent-planning/` when it exists, naming the same triggers as the skill's description. When a protected instructions file, such as `AGENTS.md` or `CLAUDE.md`, carries the same index, don't edit it; report the line it needs instead.
- **Checks.** Run `npm run check` in `website/`. For an implicit skill, also check that it loads in Claude Code and Codex: run requests that should load it and unrelated requests that shouldn't.

## Renaming or removing a skill

- Search `skills/`, `README.md`, `docs/`, `website/src`, and the local `CANDIDATE.md` for the old name, and update every mention, including other skills that point to it by name.
- Update or remove the skill's row in [`skill-icons.md`](skill-icons.md). When a removed skill was the last one using a technology mark, remove the mark's key, its path data, and its row in [`asset-attribution.md`](asset-attribution.md).
- A skill already on `main` is installed in other projects. Those installs keep the old folder, and `npx skills update` won't find a renamed skill, so say so in the pull request. A skill that isn't on `main` yet can be renamed freely.
