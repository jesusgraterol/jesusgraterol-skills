---
name: jg-npm-package
description: Standards for authoring, testing, and publishing npm packages and UI component libraries. Use when writing, reviewing, or planning a published package's exports, files, or peer and engine ranges, library builds and declaration output, packed-tarball or public-API tests, version bumps, release or npm publish workflows, provenance or trusted publishing, or a UI component library shipped to npm.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is published npm packages: their manifests, exports, files, and dependency ranges, library builds and declaration output, package tests, versioning, release and publishing workflows, and UI component libraries shipped to npm.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for npm CLI 11 and 12, Node.js 22, 24, and 26, TypeScript 6.0, pnpm 11 workspaces, and Tailwind CSS 4.3. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Reference files

These files belong to this skill and hold rules that apply only to some work. Read each one before the work it covers:

- Before changing how packages in a monorepo depend on, version, tag, or publish one another, read `references/monorepos.md`. The packed manifest of a published package never holds a `workspace:` range.
- Before writing or reviewing a UI component library shipped to npm, including its CSS, tokens, theming, or Tailwind integration, read `references/ui-component-libraries.md`. The library never ships a site's identity.

## Scope and exceptions

- Exception to the repository's coding instructions, which prefer exact versions: a published library's `dependencies` use caret ranges, such as `^2.4.0`, so consumers can deduplicate them and receive fixes. Keep `devDependencies` exact.
- These rules apply to new packages and to the parts of a manifest a task changes. Never rewrite an existing package's manifest only to follow them.
- Adding `exports` to an existing package, or narrowing its `files`, is a breaking change, so release it as a major version.

## Manifest

- Prefer ESM-only packages with `"type": "module"`.
- Declare every entry point in `exports`, with the `types` condition first and `default` last, never `import` alone, which consumers that `require()` the package can't resolve. Keep `main` and `types` as fallbacks for older tools.
- Never expose internals through wildcard subpaths, such as `"./*": "./dist/*"`.
- A package that only ships a command-line tool declares `"exports": {}`, so nothing can be imported from it, and uses `#` subpath imports internally.
- List what ships in a `files` allowlist, never in `.npmignore`.
- Set `sideEffects` accurately, listing stylesheets, such as `["*.css"]`, so bundlers never drop an imported stylesheet.
- Set `publishConfig.access`, and an exact `repository.url`, with `repository.directory` for a package inside a monorepo.

## Build output and types

- Emit JavaScript with `tsc` or a bundler, and declarations with `tsc`, checked under `module: nodenext`.
- Build in order: clean the output directory, then bundle, then emit declarations, so stale files never ship.
- Don't minify library output; the consumer's bundler does that.
- Source maps embed `sourcesContent`. Ship `declarationMap` only together with the sources it points to.
- Typecheck each runtime target, such as browser and Node.js code, against only its own globals, and keep `@types/node` at the `engines` floor.
- Avoid publishing both CommonJS and ESM unless consumers need it, and never use top-level `await` in an entry that `require()` can load.

## Dependencies

- Keep `peerDependencies` ranges as broad as the versions you test, and mark optional peers with `optional: true` in `peerDependenciesMeta`.
- Set `engines.node` to the lowest Node.js version you test consumers on.
- Use `npm-shrinkwrap.json` only for command-line tools, never for libraries.

## Testing the package

- Test the build output, not the source: import every `exports` subpath through the package's own name.
- Keep a test of the packed file list from `npm pack --dry-run --json`, so a file that shouldn't ship, or a missing one, fails the test.
- Smoke-test the packed tarball in a temporary project installed with `--ignore-scripts`, and check that an unexported path fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- Run CI on the `engines` floor and on the latest Node.js LTS release.
- When consumers implement the package's interfaces, prefer shipping an optional conformance kit on a `./testing` subpath.
- Propose `publint` and `attw --pack` checks instead of adding them.

## Versioning and releases

- Decide whether a change needs a release from the packed file list, not from the diff: a change that alters no shipped file needs no new version.
- CI rejects a release whose version isn't higher than the published one, and the publish step skips a version that is already on the registry.
- Removing or narrowing anything public is a major version. Deprecate it in a minor release first.
- Keep release notes for every version, and propose a changelog where there is none.
- Deprecate a broken version with `npm deprecate` rather than unpublishing it.
- The README is the package's npm page for each version, so update it in the release that changes what it documents.

## Publishing

- Publish the exact tarball the tests ran against.
- Prefer trusted publishing over long-lived tokens: npm 11.5.1+, Node.js 22.14+, a supported CI provider, and `id-token: write` on the publishing job.
- The first publish of a new package is manual, with two-factor authentication. Then configure its trusted publisher, (npm 11.15.0+) for example with `npm trust`, and set its publishing access to "Require two-factor authentication and disallow tokens".
- Create the release tag and publish in separate jobs, never move a tag once pushed, and decide what to publish from the registry's state rather than from tags.
- Never force `--tag latest` when publishing a prerelease or a fix for an older major; give it its own dist-tag.
- Workflow security, such as permissions and pinned actions, follows jg-ci.

## When the numbers justify it

- Testing every supported runtime and peer version as a matrix.
- Strict consumer installs, such as pnpm's isolated `node_modules`, to catch undeclared dependencies.
- A consumer typecheck fixture under both `moduleResolution: nodenext` and `bundler`.
- (npm 11.15.0+) Staged publishing with `npm stage publish`, so a release reaches the registry only after someone approves it with two-factor authentication.
- `isolatedDeclarations`, for faster declaration builds.

## Verification

- Run the package's build and tests, `npm pack --dry-run`, and `publint` and `attw --pack` when they are installed. Never publish to check a package.
