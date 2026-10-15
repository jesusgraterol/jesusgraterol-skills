---
name: jg-execute
description: Execute an agreed task, a plan, or its milestones. Supervised by default; autonomous adds a review and push after each milestone.
argument-hint: '[autonomous] [plan-path] [milestone N]'
disable-model-invocation: true
---

## Invocation

This skill runs only when the developer invokes it. Execute its workflow with the available tools. Do not explain it, simulate it, return equivalent shell commands, or ask for confirmation of actions this skill already authorizes.

Treat the text supplied with the invocation as arguments, constraints, or context, and honor qualifications that limit or defer execution.

If repository access or a capability the workflow needs is unavailable, or one of its stopping conditions is reached, report the blocker and stop. Never simulate success.

Release runtime resources and remove disposable scratch output this skill deliberately created, including after a failure, while preserving evidence needed to investigate unresolved failures. Report anything retained within this skill's output format. This cleanup is a narrow exception to the skill's write limits. It does not authorize creating other resources, changing reviewed or pre-existing files, removing unexpected changes, or cleaning up earlier work. Every other write is defined by this skill's workflow.

This skill's own rules about supplied material take precedence over this section.

## Workflow

Carry out an agreed task, a plan, or the milestones of a plan. Supervised mode builds one unit, runs its checks, and stops so the developer can review and publish it. Autonomous mode also reviews and pushes each unit, then continues with the next one.

1. **Mode.** Use autonomous mode when the first word of the supplied text is `autonomous`. Otherwise use supervised mode, including when that word is missing or misspelled.
2. **Target.** Never pick a plan by recency or search other planning directories.
   - The plan is the one named in the invocation, otherwise the current plan in this conversation. If its directory contains `milestones.md`, the units are its milestones; otherwise the whole plan is one unit.
   - Without a plan file, a task agreed in this conversation is one unit. Restate its scope in a few lines before starting.
   - When the invocation names a milestone, run only that milestone. Otherwise, supervised mode runs the next unfinished milestone or the single unit, and autonomous mode runs every remaining milestone or the single unit.
   - A milestone is finished once it has a `**Status:** done` line directly under its heading. Never remove a status line.
   - If the target is ambiguous, ask one question and stop.
3. **Authority.** Invoking this skill approves running those units: their implementation, their checks, and their status lines in `milestones.md`. In autonomous mode it also approves reviewing and pushing each unit. This skill never deletes plan files.
4. **Preflight.** Before changing anything:
   - Confirm the plan still matches the repository. Stop and report if it doesn't.
   - Look for blockers you can spot up front, such as missing access, checks that cannot run, or unmet dependencies on earlier milestones.
   - In autonomous mode:
     - `jg-review` and `jg-push` are explicit-only skills, so don't invoke them. Read their `SKILL.md` files from the folders next to this skill's own folder, and stop with an install hint if either file is missing. Following either file from this skill counts as the developer invoking it.
     - If milestones already marked done still have uncommitted changes, list them with your preflight questions. Once the developer confirms, review and push them first as their own unit; otherwise stop, because later units would be published without the work they build on.
     - If the branch has unpushed commits, list them with your preflight questions, and publish them only after the developer confirms, by following `jg-push`'s `SKILL.md` with an empty task scope, which only pushes. If the developer doesn't want them published, stop, because every later push would publish them too.
   - If the next milestone already has uncommitted work, list those files, ask the developer to confirm them, and continue from that work instead of redoing it. Confirmed files join the unit's scope.
   - If the next milestone has no uncommitted work and its acceptance criteria already hold, write its status line and move on.
   - Ask every question in one message.
5. **Each unit.**
   - Implement it following the plan and the repository's coding instructions (such as `AGENTS.md` or `CLAUDE.md`).
   - Run the checks the plan lists for it. When it lists none, run the repository's tests for the affected boundary. Fix the failures the work caused.
   - Before calling the unit finished, check each of its acceptance criteria, or what was agreed for a task, against evidence. Where you can, run the changed behavior itself; passing tests alone don't show it works.
   - The files the unit changed, plus any the developer confirmed, are its task scope for review and push.
   - Clean up as `## Invocation` describes before reviewing.
6. **Supervised mode.** Run the unit. When it is a milestone and its acceptance criteria are met, write its status line. Then stop and report the files changed, the checks and their results, anything left undone, and the next commands: `jg-review`, `jg-push`, or `jg-execute` for the next milestone. Do not review, commit, or push.
7. **Autonomous mode.** For each unit, in order:
   1. Run it.
   2. Follow `jg-review`'s `SKILL.md` on the unit's scope, including files changed by review fixes. Fix the blocking findings and review again until it reports `Ready to commit`; list non-blocking findings in the report instead of fixing them.
   3. When review fixes changed the unit, recheck its acceptance criteria, then follow `jg-push`'s `SKILL.md` on the same scope.
   4. When the unit is a milestone, write its status line. Report the commit and continue with the next unit.

   Reuse a passing check whose inputs haven't changed instead of rerunning slow suites on every review pass.
8. **Stopping.** In either mode, stop and report when the work needs the developer:
   - a decision or a review finding you shouldn't settle alone
   - a change to the agreed scope
   - a destructive action the plan doesn't call for
   - a check that cannot run
   - the same failure or blocking finding survives three fix attempts
   - a review that ends in `Review incomplete`, or three review rounds that still report blocking findings
   - a merge conflict, or a rejected or failed push
   - changes in scope that nobody can account for

   Never weaken a test, check, or finding to get past it. A stopped unit has no status line, so the next run picks it up through preflight.
9. **Output.** Report each unit as it finishes: its files, checks, review rounds, commit, and push, plus the decisions you made on your own, each with its reason, and anything you noticed but left alone because it was outside the scope. End with a short summary of the completed units, where the run stopped and why, and anything left uncommitted or running. Where planning files are tracked, status edits are not part of any unit's scope, so list them as uncommitted. This output replaces any general completion summary.
