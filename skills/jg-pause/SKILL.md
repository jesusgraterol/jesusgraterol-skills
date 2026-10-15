---
name: jg-pause
description: Stop at the nearest safe point, report where things stand, and wait until you say continue.
disable-model-invocation: true
---

## Invocation

This skill runs only when the developer invokes it. Execute its workflow with the available tools. Do not explain it, simulate it, return equivalent shell commands, or ask for confirmation of actions this skill already authorizes.

Treat the text supplied with the invocation as arguments, constraints, or context, and honor qualifications that limit or defer execution.

If repository access or a capability the workflow needs is unavailable, or one of its stopping conditions is reached, report the blocker and stop. Never simulate success.

Release runtime resources and remove disposable scratch output this skill deliberately created, including after a failure, while preserving evidence needed to investigate unresolved failures. Report anything retained within this skill's output format. This cleanup is a narrow exception to the skill's write limits. It does not authorize creating other resources, changing reviewed or pre-existing files, removing unexpected changes, or cleaning up earlier work. Every other write is defined by this skill's workflow.

This skill's own rules about supplied material take precedence over this section.

## Workflow

Pause the work in progress at the nearest safe point, report where it stands, and wait.

1. **Start nothing new.** Make no edits, and run no commands, commits, pushes, installs, or external actions. Quick read-only checks such as `git status` are fine for the report. Leave background commands, such as a test run or a dev server, running, and report them.
2. **Leave half-finished work as it is.** Do not make more edits to bring files into line.
3. **Report briefly:**
   - what is done
   - what is half-finished: the exact files, and what still has to change to match
   - uncommitted changes and unpushed commits
   - anything still running
   - the next step
4. **Wait.** Answer questions, but do no work until the developer says to continue or gives a new direction.
5. **On continue,** first check whether the files you were working on changed during the pause, mention any changes, then carry on.

This skill undoes nothing and never touches `jg-execute` status lines, so a paused run continues where it stopped. This output replaces any general completion summary.
