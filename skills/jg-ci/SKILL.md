---
name: jg-ci
description: GitHub Actions standards for fast, secure, and reusable CI and deployment workflows. Use when writing, reviewing, or planning GitHub Actions workflows under .github/workflows, reusable workflows, composite actions, Dependabot configuration, or CI and deployment changes made in GitHub Actions. Not for other CI systems, such as GitLab CI or Jenkins.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is GitHub Actions workflows, reusable workflows, composite actions, Dependabot configuration, and CI and deployment pipelines built on GitHub Actions.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for GitHub Actions as of October 2026, with `actions/checkout` v7, `actions/setup-node` v7, `actions/cache` v6, `actions/upload-artifact` v7, and `actions/download-artifact` v8. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Changing CI

- CI changes affect every contributor and every deployment, so change workflows only when the task is about them. When other work would benefit from a CI change, propose it instead of making it.
- Never weaken, skip, or disable a check, a required status check, or branch protection to make a run pass.

## Requirements

- Always set the workflow's top-level `permissions` to the minimum, usually `contents: read`, and raise them per job only where that job needs more.
- Always set `timeout-minutes` on every job that runs steps, because the default is 360 minutes. A job that calls a reusable workflow can't take one, so the called workflow's own jobs set it.
- Always pass untrusted event data, such as pull request titles and bodies, branch names, or commit messages, to `run:` scripts through `env:`. Never interpolate it into a script with `${{ }}`, because the value becomes part of the script:

  ```yaml
  - name: Check the pull request title
    env:
      TITLE: ${{ github.event.pull_request.title }}
    run: |
      if [ "${#TITLE}" -gt 72 ]; then
        echo "::error::The title is longer than 72 characters."
        exit 1
      fi
  ```

- Never check out or run a pull request's code in a `pull_request_target` or `workflow_run` workflow, even with read-only permissions, because both run in the base repository's context with its secrets and caches. Use `pull_request` for anything that runs the pull request's code.
- Never print secrets. Mask values derived from them with `::add-mask::` before anything can log them, and keep production secrets in environments with protection rules.
- Never cancel a deployment in progress. In a workflow that both verifies pull requests and deploys, cancel only pull request runs:

  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: ${{ github.event_name == 'pull_request' }}
  ```

- Never restore caches in workflows triggered by releases or tags, or that publish packages: no `actions/cache`, no setup-action caching, and `package-manager-cache: false` on `actions/setup-node`, which otherwise caches on its own when `package.json` names npm as its `packageManager`. A poisoned cache would end up in what gets published. CI and site deploys keep caching.

## Keeping the gate fast

Every job and test added to a pipeline makes each pull request wait longer, so keep the required gate small on purpose. The repository's own CI policy wins over these defaults.

- Prefer a required pull-request gate that checks correctness, such as typecheck, lint, unit and integration tests, package and contract checks, and builds, and finishes in about ten minutes.
- Prefer running browser, end-to-end, visual, and accessibility suites for presentation sites, such as documentation, marketing, and package websites, outside the required gate: on demand with `workflow_dispatch`, on a schedule, or before a release. A product interface keeps a small smoke suite for its critical journeys in the gate.
- Code that publishes irreversibly, such as a UI package released to npm, keeps the browser checks it needs, run in the publishing workflow when its version changes instead of on every pull request.
- Prefer not repeating, in deployment and publishing workflows, the suite the gate already ran on the same tree. Build once, and run only what publishing needs, such as packing and a smoke check of the artifact. Repeat the suite when the merged tree can differ from the one the gate tested, for example when branches don't have to be up to date before merging.
- Before adding a job or a suite to the gate, estimate how long it takes. When a change would push the gate past its budget, propose one of the options under "When the numbers justify it" instead of absorbing the cost.
- Prefer setting `timeout-minutes` near a job's normal duration, about twice its typical run time, so a slowdown fails visibly instead of running unnoticed for most of an hour.

## Defaults

- Prefer cancelling superseded runs with a concurrency group per workflow and ref, such as `${{ github.workflow }}-${{ github.ref }}`.
- Prefer the setup actions' built-in caching, such as `cache: npm` on `actions/setup-node`, which keys the cache by the lockfile. Publishing workflows are the exception the requirements state.
- Prefer installs that keep the lockfile frozen: `npm ci`, or `pnpm install --frozen-lockfile`.
- Prefer installs that run no dependency lifecycle scripts. npm 12 skips scripts its `allowScripts` policy doesn't approve, pnpm 10 skips unapproved builds with a warning, and pnpm 11 fails on them; with npm 11 and older or pnpm 9 and older, pass `--ignore-scripts`. Approve the packages that need their scripts in npm's `allowScripts` or pnpm's `allowBuilds` (10.26+), never with an allow-all flag such as `--dangerously-allow-all-scripts` or `dangerouslyAllowAllBuilds`.
- Prefer testing published packages and CLIs on the lowest runtime their `engines` field allows, as well as on the development runtime.
- Give committed generated files a gate step that runs the generator's check mode, or regenerates them and fails on `git diff --exit-code`, so a stale file can't merge.
- Prefer running fast checks, such as lint, typecheck, and unit tests, before slow ones, with the slow jobs depending on them through `needs`.
- Prefer building once and passing the build to later jobs as an artifact with a short `retention-days`, instead of rebuilding it in each job.
- Prefer sharing whole pipelines through reusable workflows (`workflow_call`) and repeated step sequences through composite actions, instead of copying them between workflows.
- With reusable workflows, prefer letting the caller own concurrency. A called workflow that needs its own group gives it a distinct prefix, because `github.workflow` there is the caller's name, and a group shared with the caller cancels the run. The caller job must grant the permissions its called workflow needs, because a called workflow can only keep or lower them.
- Prefer OIDC (`id-token: write`) for deployments over long-lived cloud or registry secrets.
- Prefer test retries that are bounded and enabled only in CI, and report the tests that passed only on a retry.

## Pinning

- When `.github/workflows/actions.lock` exists, follow it: keep readable tags in `uses:`, regenerate the lockfile with `gh actions-lock` whenever action dependencies change, and never edit it by hand.
- Otherwise, pin third-party actions to a full commit SHA with the version in a same-line comment, such as `# v6.0.0`, keep GitHub's own `actions/*` on major tags, such as `@v7`, and keep pins current with a Dependabot `github-actions` configuration.
- Resolve a SHA from the action's repository, for example with `git ls-remote --tags https://github.com/<owner>/<action>`, and for an annotated tag take the peeled line ending in `^{}`, which holds the commit rather than the tag object. Never write a SHA from memory. When it can't be resolved, use the release tag and list the action in the summary as unpinned.
- A new `uses:` line takes the action's latest release, checked rather than recalled, for example with `gh release view --repo <owner>/<action>`. When the release can't be checked, say so in the summary.
- When the repository has no Dependabot configuration, propose adding one instead of creating it, because it makes a bot open pull requests in the repository. Add it only with the developer's agreement.
- Don't migrate existing workflows, and leave their `uses:` versions to Dependabot. Only newly added `uses:` lines follow these rules.
- Workflow dependency lockfiles are in public preview, so don't propose adopting them.

## When the numbers justify it

Use these only when timings, costs, or failure rates show the need, and name the trade-off when proposing one:

- Matrices, and test sharding with merged reports, when one suite dominates the pipeline's time. Each shard repeats the setup, so sharding pays off only when the suite takes much longer than the setup.
- Affected-only runs in monorepos, such as turbo's `--filter`, which are only as correct as the workspace's dependency graph.
- Skipping work by changed paths through a change-detection job and job-level `if:` conditions, with a gate job that required checks point at. The gate runs with `if: always()` and fails when a job it needs failed or was cancelled, because a skipped job reports success. Never put trigger-level path filters on a required workflow: a run they skip leaves its checks Pending and blocks merging. Classify changes fail-safe: skip a job only when the complete base-to-head diff touches only paths known not to affect it, and run everything for other events, for tags, when the diff can't be read, or when the base is missing, which a shallow checkout causes without `fetch-depth: 0`. The gate also requires the classifier to succeed, each selected job to pass, and each unselected job to be skipped.
- Merge queues with the `merge_group` trigger, which keep the default branch green at the cost of a wait before each merge. Every required workflow must also run on `merge_group`.
- Skipping heavy jobs on draft pull requests, at the cost of later feedback. Add `ready_for_review` to the `pull_request` types, which don't include it by default, so the jobs run once the pull request is ready.
- `queue: max` on a concurrency group when every queued run must run instead of only the latest, at the cost of a growing queue. It can't be combined with `cancel-in-progress: true`.
- Larger or ARM runners: speed against cost.
- Scheduled workflows: frequency against cost.

## Verification

- Run `actionlint`, and `zizmor` for security, when they are installed. Never install them.
- When a task creates or substantially changes workflows in a repository without workflow linting, propose a CI job that runs both on changes under `.github/`. Don't add it without the developer's agreement.
- Without linting, state that the workflow is unverified until it runs.
- When a run exists, read its result with `gh run view` instead of assuming it passed.
