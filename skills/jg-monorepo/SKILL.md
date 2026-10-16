---
name: jg-monorepo
description: 'Turborepo and pnpm workspace standards for correct task graphs, cache keys, and workspace dependencies. Use when writing, reviewing, or planning turbo.json files, Turborepo tasks, filters, or caching, pnpm-workspace.yaml settings, workspace: or catalog: dependency ranges, shared configuration packages, or adding, moving, or removing workspace packages. Not for Nx, Lerna, or npm and Yarn workspaces.'
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is Turborepo and pnpm workspaces: `turbo.json` task graphs, caching, and filters, `pnpm-workspace.yaml` settings, workspace and catalog dependency ranges, shared configuration packages, and adding, moving, or removing workspace packages.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Turborepo 2.11 and pnpm 12, and its pnpm items also hold for pnpm 11. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Changing the workspace

- Settings in the root `turbo.json` and in `pnpm-workspace.yaml`, such as global inputs, `allowBuilds`, and release-age rules, affect every package and every contributor. Propose changes to them instead of making them, unless the task is about them.

## Task graph

- `build` depends on `^build`, and so does every task that reads its dependencies' build output, such as a `typecheck` that resolves dependencies' types from `dist`.
- Integration and end-to-end tasks also depend on their own package's `build`.
- Prefer a transit node, a task without a command that depends on `^transit`, over `^lint` or `^typecheck`, so a task's hash follows its dependencies' sources without waiting for their checks.
- Declare every cross-package need in `dependsOn`. Never rely on the order in which tasks are listed or started, or on concurrency, to sequence them.
- Keep the package graph acyclic.

## Caching and hashing

- Never cache a task that reads external state or has side effects, such as a deploy, a database migration, or a publish: give it `cache: false`.
- A task that produces only logs declares `outputs: []`.
- Give persistent tasks, such as dev servers, `cache: false`, because `persistent: true` doesn't turn caching off.
- Start every custom `inputs` list with `$TURBO_DEFAULT$`, so it keeps the package's tracked files and only adds or removes globs.
- Prefer (2.5+) `$TURBO_ROOT$` over `../` paths for files outside the package, such as a root configuration file.
- List the `.env` files a task reads in its `inputs`, because they are usually ignored by Git and so missing from the default inputs.
- In a package's `turbo.json`, extend the root with `extends: ["//"]`, and (2.7+) add to inherited arrays with `$TURBO_EXTENDS$` instead of repeating them.
- Declare the environment variables a task reads in `env`, those every task reads in `globalEnv`, and those that must reach a task without changing its hash in `passThroughEnv`.
- Keep `envMode` strict, the default since 2.0, so undeclared variables never reach tasks.
- Never set environment variables inside package scripts to change a task's behavior, because Turborepo can't see them when it hashes the task.

## Running tasks

- Select packages with `--filter`: `pkg...` adds its dependencies, `...pkg` adds its dependents, `^` leaves out the package itself, `!` excludes, `./path` selects by directory, and `[ref]` selects packages changed since a Git ref.
- Use `--only`, which skips the tasks a task depends on, only when their outputs are already in place.
- Run tasks that share state, such as one database or a port, with `--concurrency=1`, and never run separate `turbo` invocations against shared state in parallel.
- Prefer the (2.3+) `--cache` syntax, such as `--cache=local:r,remote:r`, over the deprecated `--no-cache`, `--remote-only`, and `--remote-cache-read-only` flags. Run sidecar tasks with (2.5+) `with` instead of `--parallel`.

## Workspace dependencies

- A published package depends on its workspace siblings with `workspace:^`, never `workspace:*`, which publishes an exact version. Private apps may use `workspace:*`.
- When files or packages move, review everything that selects them by path, such as `--filter` paths, `inputs` globs, and the package globs in `pnpm-workspace.yaml`.
- Share versions that several packages use through `catalog:` ranges defined in `pnpm-workspace.yaml`.

## pnpm settings

- Approve the dependencies that need build scripts in (10.26+) `allowBuilds`, with `strictDepBuilds: true`, the default from pnpm 11, so an unreviewed build fails the install. Never allow every build, such as with `dangerouslyAllowAllBuilds`.
- Keep `minimumReleaseAge` (10.16+), in minutes and 1440 by default from pnpm 11. Give each exception in `minimumReleaseAgeExclude` an exact version, (10.19+) such as `pkg@1.2.3`, and a comment with its reason.
- Pin the package manager with `packageManager`, or with (pnpm 11+) `devEngines.packageManager`.

## Shared configuration

- Prefer shared configuration packages that export factory functions, such as `createVitestConfig()`, kept in one place, unit tested, and declared as an input of every task that reads them.

## Images from a workspace

- Prefer building a container image from a pruned workspace, with `turbo prune <app> --docker` or `pnpm deploy --prod`, which on pnpm 11 needs `inject-workspace-packages=true`. The Dockerfile itself follows jg-docker.

## When the numbers justify it

- Remote caching, weighed against access control for the shared cache and the risk of poisoned entries.
- (2.1+) `--affected` in CI, which is only as accurate as the base ref it compares against.
- (2.10+) Deferred `inputs` modes, `jit` and `dependencyOutputs`, and local cache limits with `cacheMaxAge` and `cacheMaxSize` in the root `turbo.json`.
- (2.4+) `turbo boundaries`, still experimental, to enforce which packages may import which.

## Verification

- Check a task-graph change with `turbo run <task> --dry=json`, and why a task hit or missed the cache with `--summarize`. Run `turbo boundaries` when the repository configures it.
