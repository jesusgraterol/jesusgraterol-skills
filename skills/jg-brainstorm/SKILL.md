---
name: jg-brainstorm
description: Think an idea through before planning, with options, tradeoffs, and a recommended direction.
argument-hint: '[idea or question]'
disable-model-invocation: true
---

## Invocation

This skill runs only when the developer invokes it. Execute its workflow with the available tools. Do not explain it, simulate it, return equivalent shell commands, or ask for confirmation of actions this skill already authorizes.

Treat the text supplied with the invocation as arguments, constraints, or context, and honor qualifications that limit or defer execution.

If repository access or a capability the workflow needs is unavailable, or one of its stopping conditions is reached, report the blocker and stop. Never simulate success.

Release runtime resources and remove disposable scratch output this skill deliberately created, including after a failure, while preserving evidence needed to investigate unresolved failures. Report anything retained within this skill's output format. This cleanup is a narrow exception to the skill's write limits. It does not authorize creating other resources, changing reviewed or pre-existing files, removing unexpected changes, or cleaning up earlier work. Every other write is defined by this skill's workflow.

This skill's own rules about supplied material take precedence over this section.

## Workflow

Think through the idea supplied with this invocation, or the one under discussion, with the developer for as many turns as they want. This skill stays in effect until the developer invokes `jg-plan` or another skill, or explicitly asks for implementation.

This skill is read-only. Do not edit files, create planning files or prototypes, install dependencies, generate artifacts, or change Git or external state. Agreement such as "sounds good" or "yes" is not approval to implement.

When the idea concerns a repository, read the root `README.md` and its project blueprint when present, then the repository's coding instructions (such as `AGENTS.md` or `CLAUDE.md`) and the implicit jg skills that apply to the idea, then only the files needed to judge it. When the codebase is unavailable, say so and keep the advice general.

Reply conversationally and in proportion to the question; a simple follow-up gets a simple answer.

- When a real choice is on the table, recommend a direction and give the realistic options, usually two or three, with what each guarantees, what it costs, and how it fails.
- State false premises, unnecessary complexity, and material risks plainly.
- Judge claims, the developer's and your own earlier ones alike, by evidence rather than confidence, repetition, or authority, and separate verified facts from judgment. Accept valid corrections and push back on unsupported claims, but do not manufacture objections.
- Ask only questions whose answers would change the direction, in one numbered list, each with your recommended answer so a plain yes accepts it. Look facts up yourself instead of asking for them.

When the developer says the idea is settled or asks for a summary, write a **Ready to build** summary in the conversation: the goal, the chosen approach, constraints, exclusions, and open decisions, marking which choices the developer made and which are your own defaults. Do not write the summary to a file. End it with the next step you recommend, and name the other one as the alternative:

- `jg-execute` when all of these hold, stating the approach as the exact change and how to check it, because the summary is the task `jg-execute` builds:
  - the idea is one focused change that touches a few files
  - no decision is left open
  - it changes no user-visible behavior beyond what was agreed
  - it touches no public contract, schema or persisted data, security or authorization, dependency or infrastructure, or anything else hard to undo
- `jg-plan` otherwise.

This skill's output replaces any general completion summary.
