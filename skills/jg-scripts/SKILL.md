---
name: jg-scripts
description: Portable, safe developer scripts and filesystem code. Use when writing, reviewing, or planning developer scripts, CLIs, build tooling, process spawning, filesystem code, path handling, or archive extraction.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is developer scripts, CLIs, build tooling, spawned processes, filesystem code, path handling, and archive extraction.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Node.js 24. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Portability and safety

For developer-facing scripts, this skill's portability rules are a specific exception to the codebase-pattern and repository-tooling precedence rules in the repository's coding instructions. Unless the task contract or an explicit repository platform contract in documentation or configuration limits the supported host platforms, treat Windows, macOS, and Linux as supported. Preserve non-portable legacy scripts when they are outside the authorized scope, but do not extend them merely because they already exist.

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
- Give network calls and spawned processes a deadline by passing `AbortSignal.timeout(milliseconds)` as their `signal`.
