---
name: jg-node
description: Portable, safe Node.js scripts and filesystem code. Use when writing, reviewing, or planning Node.js developer scripts, CLIs, build tooling, process spawning, filesystem code, path handling, or archive extraction.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is Node.js developer scripts, CLIs, build tooling, spawned processes, filesystem code, path handling, and archive extraction.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Node.js 24. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Portability and safety

For developer-facing scripts, this skill's portability rules are a specific exception to the codebase-pattern and repository-tooling precedence rules in the repository's coding instructions. Unless the task contract or an explicit repository platform contract in documentation or configuration limits the supported host platforms, treat Windows, macOS, and Linux as supported. Code that runs only on Linux because of where it runs, such as a container entrypoint, a server job, or a CI step, is limited to Linux by that context, and shell scripts for it follow jg-bash. Preserve non-portable legacy scripts when they are outside the authorized scope, but do not extend them merely because they already exist.

For scripts and filesystem code:

- Use the runtime's path and filesystem APIs instead of hard-coded separators, drive letters, home-directory paths, temporary-directory paths, or manual path concatenation.
- Distinguish native filesystem paths from URLs, import specifiers, archive entry names, object-storage keys, and other logical slash-delimited identifiers, and use the appropriate API for each path kind.
- Resolve paths from an explicit project, workspace, or script root unless current-working-directory behavior is an intentional part of the command contract.
- Treat external and user-controlled path values as untrusted input rather than ready-to-use filesystem paths.
- When the contract expects a filename or root-relative path, reject absolute paths, Windows drive-relative paths, UNC paths, device-namespace paths, and traversal segments after any required decoding and before filesystem access.
- Resolve each candidate against a trusted root and use the runtime's platform-aware path semantics to verify that the normalized target remains within that root before reading, writing, moving, copying, deleting, or extracting it. Do not use raw string-prefix checks or `isAbsolute` alone as a containment check, and do not allow destructive operations to target the trusted root itself unless explicitly required.
- For archive extraction, reject symlink or hard-link entries unless their targets are explicitly supported and verified to remain within the extraction root. For ordinary filesystem operations where containment matters, do not follow links across the trusted boundary.
- Prefer existing cross-platform repository tooling or a script written in the repository's primary runtime over platform-specific shell syntax for workflows expected to run on multiple operating systems.
- Do not rely on shell glob expansion, inline POSIX environment-variable assignment, POSIX-only commands, executable bits, symlink support, POSIX permission semantics, or case-sensitive filesystems unless that platform dependency is explicitly required and documented.
- When spawning a process, pass the executable and arguments separately without a shell unless shell behavior is required. Guard and document unavoidable platform-specific behavior, and make platform-specific commands fail early with a clear message on unsupported systems.
- On Windows, `npm`, `npx`, and other package-manager commands are `.cmd` shims, which Node refuses to spawn without a shell. Run the package manager's JavaScript entry point with `process.execPath` instead, such as the path in `process.env.npm_execpath` when the script runs from a package script. Otherwise, on `win32` only, pass one fixed command string with `shell: true` and no arguments array, and never put an external value in it.
- Never interpolate external or user-controlled values into a shell command string. When shell execution is unavoidable, keep the command structure fixed and pass variable data through arguments to a fixed script, standard input, or environment variables that the script does not re-evaluate as shell syntax.
- Do not expose or document a platform-specific script as a generic cross-platform command.

Before finishing a filesystem or script change, run existing Windows and POSIX verification when available. When only one host operating system is available, use platform-independent tests for non-trivial application-owned path logic when they provide meaningful confidence and report any runtime portability that could not be verified. Do not claim cross-platform compatibility from current-host-only execution, and do not add or expand CI solely for this verification without authorization.

## Node.js scripts

- Import built-in modules with the `node:` prefix, such as `node:fs/promises`.
- In ES modules, resolve script-relative paths from `import.meta.dirname` instead of rebuilding `__dirname` from `import.meta.url`.
- Parse command-line flags with `util.parseArgs` instead of slicing `process.argv` by hand. Its default strict mode rejects unknown options, and positional arguments unless `allowPositionals: true` is set.
- To check that a target stays inside a trusted root, resolve both and compute `path.relative(root, target)`. Accept the target only when the result is not absolute and is neither `..` nor starts with `..` followed by `path.sep`. An empty result means the target is the root itself.
- When other processes read a file in place, write it atomically: write a temporary file in the same directory, then `rename` it over the target, so a reader never sees a partial file. On Windows, retry the rename on `EPERM` or `EACCES`, which another process holding the file open can cause.
- Stream large files with `pipeline` from `node:stream/promises` instead of reading them whole. It forwards errors and closes every stream in the chain.
- Set `process.exitCode = 1` and return instead of calling `process.exit(1)`, so pending output and cleanup can finish.
- Give network calls and spawned processes a deadline by passing `AbortSignal.timeout(milliseconds)` as their `signal`. Combine it with a caller's signal through `AbortSignal.any()`. For one deadline across several retries, use an `AbortController` with a `setTimeout` that you `clearTimeout()` when the work ends.
- (24.2+) Prefer disposing of a spawned child with `using`, which sends it SIGTERM when the scope ends but doesn't stop the child's own children. Deprecation DEP0209 discourages using `signal` to clean up long-lived resources, so keep `signal` for cancellation and deadlines.
- Stop a spawned process tree, not only the direct child: on POSIX, spawn it with `detached: true` and signal its group with `process.kill(-child.pid, 'SIGTERM')`, then `'SIGKILL'` after a grace period; on Windows, run `taskkill /pid <pid> /T /F`. Stop the tree before the script exits.
- Count the bytes of output buffered from a child, and stop the child once they pass a limit.
- Accept only the exit codes a tool documents; treat any other code as a failure.
- A wrapper that runs a child forwards SIGINT and SIGTERM to it. After a forwarded signal, it reports failure even when the child exits 0, discards partial stdout, and exits with 128 plus the signal number.
- Prefer exit code 0 for a clean result, 1 for problems found, and 2 or higher when the check couldn't run. Never report an inconclusive check as passed. Machine-readable output goes alone on stdout, with a `schemaVersion` field.
- Bound decompression: pass `maxOutputLength` to zlib's buffer methods, count bytes when streaming, and cap the number of archive entries, each entry's size, and the total size as bytes are written, never from sizes the archive declares.
- Prefer multi-file rewrites that compute every change first, confirm before writing that each file is unchanged since it was read, and on failure restore only the writes they made.
- (24.0+) Prefer `glob` from `node:fs/promises` over a glob package in new scripts.
- (24.3+) Prefer running TypeScript scripts directly with `node script.ts`. Node only strips types, so:
  - keep `tsc --noEmit` for type checking;
  - set `erasableSyntaxOnly` (TypeScript 5.8+) and `verbatimModuleSyntax`, so the code uses only syntax Node can strip;
  - import relative files with their `.ts` extension, through `rewriteRelativeImportExtensions` (TypeScript 5.7+), or `allowImportingTsExtensions` with `noEmit`;
  - use `#` subpath imports from `package.json` instead of tsconfig `paths`, which Node ignores;
  - keep shipping compiled JavaScript in published packages, because Node doesn't strip types inside `node_modules`.
