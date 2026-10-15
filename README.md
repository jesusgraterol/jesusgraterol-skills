# jesusgraterol-skills

Solid, battle-tested Agent Skills for planning, reviewing, and shipping changes with coding agents, used by professional software developers in their daily work. Every skill runs only when you invoke it by name, and each one defers general engineering standards to the coding instructions of the repository you use it in.

Browse the skills, their full instructions, and an example session at [jg-skills.jesusgraterol.dev](https://jg-skills.jesusgraterol.dev).

## Install

Run this from your repository's root:

```bash
npx skills add jesusgraterol/jesusgraterol-skills --skill "*" -y
```

The command uses the [skills CLI](https://github.com/vercel-labs/skills) through `npx`, so it needs Node.js. It installs the skills into the project for the coding agents you use there, so you can commit them and share the same workflow with your team.

## Use

Discuss a change with your coding agent, then invoke a skill by name, followed by any text it should take into account:

```text
/jg-plan
```

The skills never load on their own. Each one sets `disable-model-invocation: true` in its frontmatter and ships an `agents/openai.yaml` policy that disables implicit invocation, so it enters the conversation only when you call it. This is verified with Claude Code and Codex.

## Update and remove

Run these from your repository's root:

```bash
npx skills update -p
```

```bash
npx skills remove jg-plan jg-challenge-plan jg-breakdown jg-review jg-push jg-feedback jg-session
```

Remove the skills by name so other skills in the project stay installed.

## Skills

| Skill               | What it does                                                                                  | What it may change                                                                |
| ------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `jg-plan`           | Creates or revises an implementation-ready plan for the change under discussion.              | Writes `plan.md` under `coding-agent-planning/`; removes a stale `milestones.md`. |
| `jg-challenge-plan` | Challenges a plan before approval and surfaces material risks, gaps, and decisions.           | Nothing.                                                                          |
| `jg-breakdown`      | Splits a plan into ordered, reviewable milestones when it has real implementation boundaries. | Writes or removes `milestones.md` next to the plan.                               |
| `jg-review`         | Reviews uncommitted changes, or the current branch against a target, and issues a verdict.    | No files. With a target branch, it may refresh that branch's remote-tracking ref. |
| `jg-push`           | Commits the complete worktree with a signed-off, signed commit and pushes the current branch. | Stages every change, creates at most one commit, and pushes the current branch.   |
| `jg-feedback`       | Assesses feedback independently and recommends what to adopt, reject, or adjust.              | Nothing.                                                                          |
| `jg-session`        | Finds a named Codex or Claude Code session and answers questions about it.                    | Nothing.                                                                          |

## A typical run

1. Talk the change through with your agent, then run `jg-plan`. It turns the discussion into a plan under `coding-agent-planning/` and asks for approval.
2. `jg-challenge-plan` returns a verdict, any required corrections, and numbered decisions.
3. `jg-plan` with your answers and the corrections revises the same plan.
4. `jg-breakdown` writes `milestones.md` when the plan has real milestone boundaries.
5. A plain message such as "Approved, implement milestone 1" starts the work. Each milestone needs its own approval.
6. `jg-review` checks the uncommitted change and answers `Ready to commit`, `Not ready`, or `Review incomplete`.
7. `jg-push` creates a signed-off, signed commit and pushes the current branch.

## Website

The site in `website/` is a static Astro and Tailwind CSS project. It reads every `skills/*/SKILL.md` at build time, so the published names, descriptions, and instructions always match what gets installed.

Requirements: Node.js `24.15` or newer within Node 24, and npm `11.12` or newer within npm 11. Run these from `website/`:

```bash
npm ci
npx playwright install chromium
npm run dev
```

| Command                   | Purpose                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Start the Astro development server. If an edit under `skills/` does not appear, restart it.         |
| `npm run build`           | Generate the site in `dist/` and verify every skill page, metadata, link, and `llms.txt`.           |
| `npm run preview`         | Serve the current production build locally.                                                         |
| `npm run check`           | Run unit tests, typechecking, linting, formatting, the build, integration tests, and browser tests. |
| `npm test`                | Run the unit, integration, and end-to-end test categories.                                          |
| `npm run format`          | Format the website files.                                                                           |
| `npm run assets:generate` | Regenerate the committed open-graph image from its HTML template.                                   |

The build fails when the site catalog in `website/src/site.config.ts` and the skill folders disagree, when a skill name differs from its directory, or when a skill does not ship the explicit-only Codex policy. When you add a skill, add its catalog entry with an example invocation.

### Deployment

`.github/workflows/pages.yml` verifies every pull request and deploys `main` to GitHub Pages. The site expects to be served at the root of `https://jg-skills.jesusgraterol.dev`, so before the first deployment:

1. Set the repository's GitHub Pages source to GitHub Actions.
2. Add the custom domain `jg-skills.jesusgraterol.dev`.
3. Create a DNS `CNAME` record pointing `jg-skills.jesusgraterol.dev` to `jesusgraterol.github.io`.

Until then, the deploy job fails, or the site is served under a path where its root-relative links and assets break.

## Project blueprint

```text
.
├── .github/workflows/       # site verification and GitHub Pages deployment
├── docs/                    # concise, durable project concepts and processes
├── skills/
│   └── jg-<name>/
│       ├── SKILL.md         # frontmatter and the skill's instructions
│       └── agents/
│           └── openai.yaml  # Codex invocation policy
├── website/
│   ├── public/              # favicon, robots.txt, and the generated open-graph image
│   ├── scripts/             # open-graph generation and build-artifact verification
│   ├── src/
│   │   ├── components/      # focused Astro presentation modules
│   │   ├── content/         # SKILL.md frontmatter schema
│   │   ├── layouts/         # shared metadata, navigation, theme, and footer shell
│   │   ├── pages/           # home, one page per skill, 404, and llms.txt
│   │   ├── styles/          # Tailwind entry point and branded semantic tokens
│   │   ├── utilities/       # skill catalog loading, SEO, theme, and llms.txt behavior
│   │   └── site.config.ts   # site metadata, commands, and the skill catalog
│   └── vitest/              # test-category discovery configuration
├── LICENSE
└── README.md
```

- Every skill directory name matches the `name` in its `SKILL.md` frontmatter.
- Every skill is explicit-only in both agents: its frontmatter sets `disable-model-invocation: true`, and its `agents/openai.yaml` sets `policy.allow_implicit_invocation: false`. Keep both when adding a skill.
- Every skill is self-contained. Its `## Invocation` section holds the rules all skills share, and it never links to sections of a specific `AGENTS.md`. Skills refer to each other by bare name, such as `jg-breakdown`, never with a `/` or `$` prefix.
- The website shares its design tokens, Ubuntu Sans typography, and tooling with Agentic Coding and jesusgraterol.dev. [`docs/asset-attribution.md`](docs/asset-attribution.md) records where its brand mark comes from.
- Local coding instructions (`AGENTS.md`, `CANDIDATE.md`) and `coding-agent-planning/` are git-ignored and never published.
- `/docs` is reserved for concise, quickly scannable documentation of essential, durable project concepts and processes. API and HTTP endpoint documentation, if the project ever needs it, belongs outside `/docs`.

## License

[MIT](LICENSE)
