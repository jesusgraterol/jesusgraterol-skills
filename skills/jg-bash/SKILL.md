---
name: jg-bash
description: Bash and POSIX sh standards for safe, consistent shell scripts on Linux. Use when writing, reviewing, or planning shell scripts, .sh files, bash or sh code, container entrypoints, Dockerfile RUN instructions, CI run steps, Makefile recipes, cron jobs, or server provisioning scripts.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is bash and POSIX `sh` scripts for Linux, and shell code inside Dockerfiles, CI steps, and Makefiles. It doesn't cover zsh, fish, or PowerShell scripts.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the target's versions first: the oldest bash or `sh` the script must run on, not the one on this machine. Without a stated target, assume bash 5.1, the version in Ubuntu 22.04. This skill was written for Bash 5.3 and POSIX.1-2024 `sh`. An item marked with a minimum version, written like (5.2+), applies only when the target has that version or a later one. For an older target, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Choosing the shell

- Shell is for glue: scripts that mostly run other programs, with simple control flow. Once a script passes about 100 lines, or needs data structures, real parsing, or more than simple flags, write it in the repository's primary language instead.
- Write a shell script for code that runs on Linux because of where it runs, such as in a container, on a server, or in a CI job. Also write one in a repository whose documentation or coding instructions say its scripts run only on Linux. When a developer-facing script must run on developers' own machines and the repository states no such limit, write it in the repository's primary language instead, as jg-node describes.
- When the repository has no primary language besides shell, write bash, and say in the script's header comment that it runs only on Linux. When such a script outgrows the threshold above, say so in the summary instead of adding a language.
- Write POSIX `sh` (`#!/bin/sh`) where bash may be missing: Alpine and other BusyBox-based images, minimal container entrypoints, and installers meant for any Linux system. Write bash (`#!/usr/bin/env bash`) everywhere else.
- Never use bash features in code that `sh` runs. Shell-form Dockerfile `RUN` instructions and Makefile recipes run `/bin/sh` unless they set another shell, and `/bin/sh` is dash on Debian and Ubuntu and BusyBox `ash` on Alpine.

## Script files

These rules apply to script files, not to shell code inside other files.

- Start with the shebang and a comment saying what the script does and how to call it.
- In bash, always start with `set -euo pipefail` and `shopt -s inherit_errexit`, so a failure inside `$(…)` also stops the script. In `sh`, start with `set -eu`, and add `set -o pipefail` only when every target `sh` supports it. Debian 12's dash doesn't, so without it never rely on a pipeline's exit status.
- `set -e` doesn't stop the script inside `if`, `while`, and `until` conditions, in `&&` and `||` lists except for their last command, or anywhere in a function called from those places. `local`, `export`, `readonly`, and `declare` also report their own status, hiding the status of a `$(…)` they assign. Check commands whose failure matters explicitly, and declare a variable before assigning it from `$(…)`.
- Put `readonly` constants at the top, then functions, then `main "$@"` as the last line. Use a `main` function whenever the script defines another function.
- Name functions and variables in `lower_snake_case`, and constants and exported variables in `UPPER_SNAKE_CASE`. Declare variables inside functions with `local`. Indent with 2 spaces, never tabs.
- `-h` and `--help` print usage to stdout and exit 0. An unknown option or a missing argument prints usage to stderr and exits 2. Other failures exit 1, except that a script that checks something exits 1 only for problems it found, and 2 or higher when it couldn't run the check, such as for a missing tool. Parse options with a `while` loop over `case` and `shift`, or with `getopts` when every option is short.
- Write data to stdout, and messages and errors to stderr through a `die` helper. Use `printf` rather than `echo` for anything that includes a variable.
- Check required tools up front with `command -v`, and fail with a message that names the missing tool.
- Resolve script-relative paths from the script's own directory, from `BASH_SOURCE` in bash or `readlink -f "$0"` in `sh`, not from the caller's working directory, unless the working directory is part of the script's contract.
- Create temporary files with `mktemp`, and set an `EXIT` trap that removes them right after. In `sh`, also trap `INT` and `TERM` to `exit 130` and `exit 143`, because dash skips the `EXIT` trap when a signal kills it.
- Commit scripts meant to run directly as executable, with `git add --chmod=+x`.

A bash script starts from this shape:

```bash
#!/usr/bin/env bash
# Archives the repository's uploads directory into a gzipped tarball.
# Usage: archive-uploads.sh [-h] <archive-path>
set -euo pipefail
shopt -s inherit_errexit

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
readonly UPLOADS_DIR="$SCRIPT_DIR/../uploads"

usage() {
  printf 'Usage: %s [-h] <archive-path>\n' "${0##*/}"
}

die() {
  printf '%s: %s\n' "${0##*/}" "$*" >&2
  exit 1
}

main() {
  while (($# > 0)); do
    case "$1" in
      -h | --help)
        usage
        exit 0
        ;;
      --)
        shift
        break
        ;;
      -*)
        usage >&2
        exit 2
        ;;
      *) break ;;
    esac
  done
  if (($# != 1)); then
    usage >&2
    exit 2
  fi

  command -v tar >/dev/null || die "tar is required but not installed"

  local archive_path="$1"
  [[ -d "$UPLOADS_DIR" ]] || die "not a directory: $UPLOADS_DIR"
  tar -czf "$archive_path" -C "$UPLOADS_DIR" .
}

main "$@"
```

## Quoting and input

These rules apply to all shell code.

- Quote every expansion: `"$var"`, `"$(…)"`, and `"$@"`. When an expansion stays unquoted on purpose, add a comment saying why.
- In bash, build argument lists as arrays and expand them with `"${args[@]}"`. Never build a command in a string.
- Put `--` before paths and other operands that might start with `-`.
- File names can contain spaces, newlines, and leading dashes. In bash, loop over `find … -print0` with `while IFS= read -r -d ''`, or use `find … -exec … {} +`. Never parse `ls`.
- Read lines with `while IFS= read -r`. A loop that sets variables reads from a file or from `< <(…)`, never from a pipe, because a piped loop runs in a subshell.
- Use `[[ ]]` in bash and `[ ]` in `sh`, and `$(…)` rather than backticks. Keep the default `IFS`.
- Never run external or user-controlled values as code: no `eval`, no `sh -c` or `bash -c` with interpolated values, and no `ssh host "… $value"`. Pass values as arguments, as in `sh -c '… "$1"' sh "$value"`, on stdin, or quoted with `printf '%q'` for a remote bash.

## Safety

These rules apply to all shell code.

- Guard destructive commands on paths built from variables with `${var:?}`, so an empty or unset variable stops the script instead of widening the target.
- In scripts that delete or overwrite data, prefer a `--dry-run` flag that prints what would change.
- Never pass a secret as a command-line argument, because other users can read the process list. Pass it through an environment variable, a file, or stdin. Never print it, and keep it out of `set -x` output.
- Download with `curl -fsSL --retry 3`, and verify a published checksum or signature before using the file. Never pipe a download into a shell.
- Setup and provisioning scripts must be safe to run again: use `mkdir -p` and `ln -sfn`, and check before appending to a file.
- Prefer `flock` for scheduled jobs that must not overlap.
- Container entrypoints must `exec` the final process, so it replaces the shell and receives the container's stop signals directly.

## Shell inside other files

- The choosing, quoting, and safety rules apply. The script-file rules don't.
- Know which shell runs the snippet:
  - A shell-form Dockerfile `RUN` runs `/bin/sh -c` unless a `SHELL` instruction changes it.
  - A GitHub Actions `run:` step on Linux runs `bash -e` without `pipefail`, unless it sets `shell: bash`, which adds `-o pipefail`.
  - Make runs each recipe line in its own `/bin/sh`, unless `.ONESHELL` or `SHELL` is set.
- A Dockerfile `RUN` whose pipe must fail on error sets `SHELL ["/bin/bash", "-o", "pipefail", "-c"]` when the image has bash. Otherwise it doesn't rely on the pipe's status.
- Prefer moving a snippet with its own logic, such as loops, functions, or more than a few commands, into a script file that the step runs, so it can be checked and run locally.

## Verification

- Always check syntax with `bash -n`, or with `dash -n` or `busybox sh -n` for an `sh` script, using whichever is installed.
- Run `shellcheck` and `shfmt -d` when they're installed, passing `-i 2 -ci` to `shfmt` unless the repository's `.editorconfig` sets shell formatting. Never install them.
- Run a script that changes files only in a temporary directory or with `--dry-run`, never against real data.
- Add `bats` tests only when the repository already uses `bats`.
- Report what couldn't be verified, such as a missing linter, or a target shell or distribution that isn't available here.
