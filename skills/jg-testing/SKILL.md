---
name: jg-testing
description: Vitest and Playwright standards for deterministic, fast tests. Use when writing, reviewing, or planning Vitest or Playwright tests, test configuration, end-to-end or browser tests, flaky or intermittent tests, test timeouts or retries, or fake timers and clocks.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is Vitest and Playwright tests, their configuration, and flaky-test handling.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Vitest 4.1 and 5.0, and Playwright 1.64. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- When the installed version of the technology is newer than the one this skill was written for, and one of this skill's version-specific items differs from that version's official guidance, follow the official guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Repository rules first

Exception to this skill's precedence: the repository's testing guidelines and established test conventions win over every rule in this skill, including its correctness rules. For example, follow a repository's retry setup or suite tags even where they differ from the defaults below. This skill holds the runner mechanics behind the testing rules in the repository's coding instructions.

## Waiting and locating

- Wait on assertions that retry until their condition holds, never on fixed sleeps such as `page.waitForTimeout()` or `setTimeout`.
- In Playwright, prefer web-first assertions such as `await expect(locator).toBeVisible()`. Use `expect.poll()` for values outside the page; it retries for 5 seconds by default.
- Give `toPass()` an explicit `timeout`. Its default is 0, so it otherwise retries until the test itself times out. The config can set one for all tests with `expect: { toPass: { timeout } }`.
- In Vitest, `expect.poll()` and `vi.waitFor()` retry for 1 second by default, every 50 milliseconds. `vi.waitFor()` advances fake timers on its own.
- Avoid `waitUntil: 'networkidle'`, which Playwright discourages, and the deprecated `waitForNavigation()`; use `waitForURL()`. Replace `waitForSelector()` with locators and assertions.
- Locate elements the way users find them, in this order: `getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`, `getByAltText`, `getByTitle`, and `getByTestId` only when nothing user-facing is stable. Never locate by CSS structure, generated class names, or position.
- Locators are strict, so an action on one that matches several elements fails. Narrow it with `filter({ hasText, has })` or a more specific role and name.

## Time, environment, and isolation

- In Playwright, call `page.clock.install()` (1.45+) before `page.goto()` and before any other clock call, then prefer `page.clock.setFixedTime()`. Use `runFor()` or `fastForward()` only when the test needs time to pass.
- In Vitest, `vi.useFakeTimers()` fakes timers and dates, and `vi.setSystemTime()` sets the date with or without them. When timers are scheduled from promises, advance them with the async variants, such as `vi.advanceTimersByTimeAsync()` or `vi.runAllTimersAsync()`.
- Stub environment variables and globals with `vi.stubEnv()` and `vi.stubGlobal()`, with `unstubEnvs: true` and `unstubGlobals: true` in the config so each test starts clean. A value assigned directly to `process.env` or a global can't be restored automatically.
- Playwright's `timezoneId` and `locale` options affect only the browser. Set the `TZ` environment variable for the test runner itself.
- Turn on reduced motion with `contextOptions: { reducedMotion: 'reduce' }` before asserting on anything that animates. `toHaveScreenshot()` already disables animations and hides the caret.
- Make per-worker data unique with `testInfo.workerIndex`, and per-test data with `testInfo.testId`. `parallelIndex` is reused when a worker restarts, so it can collide.
- Prefer isolated tests to serial mode. When tests must share setup, put it in a fixture.
- Inside `test.concurrent`, use the `expect` from the test context, so assertions report against the right test.

## Repeat runs

The coding instructions require repeat runs for new or changed end-to-end and integration tests. Run each repetition with retries off, so a retry can't hide a failure:

- Playwright: `--repeat-each=3 --retries=0` on the test files.
- Vitest 5.0.3+: `--repeats=2 --retry=0`. `--repeats` counts runs after the first, so this gives three. Earlier 5.0 releases could hide a failed repeat when retries were on.
- Vitest 4: run the test file three times. Its per-test `repeats` option would have to stay in the test code, which the instructions forbid.

## Timeouts

Use the narrowest scope that covers the slow operation:

- One assertion or action: its own `timeout` option.
- One test: in Playwright, `test.setTimeout()` or `test.slow()` inside the test; in Vitest, the test's `timeout` option.
- One hook: in Playwright, `test.setTimeout()` inside `beforeAll` or `afterAll` sets that hook's timeout, while inside `beforeEach` it sets the test's, because `beforeEach` shares the test's timeout. `test.slow()` isn't allowed in `beforeAll` or `afterAll`. In Vitest, pass the timeout as the hook's last argument; the default `hookTimeout` is 10 seconds.
- One suite: `test.describe.configure({ timeout })` in Playwright, or the `describe` block's `timeout` option in Vitest. Both set the timeout of each test in the suite, not one budget for the whole suite.

## Retries and flaky reporting

- In Playwright, configure retries for CI only, such as `retries: process.env.CI ? 2 : 0`, with `trace: 'on-first-retry'`, or `'retain-on-failure-and-retries'` (1.59+) to keep a trace of every failed attempt.
- To fail a CI run that has flaky passes, set `failOnFlakyTests: !!process.env.CI` (1.52+). Add it only when the repository wants that policy.
- In Vitest, `retry` takes a number, or `{ count, delay, condition }` (4.1+) for retries with a delay or only on matching errors.

## Vitest specifics

- Tests that need no DOM run in the default `node` environment. Add `// @vitest-environment node` only when the project's default differs, and `// @vitest-environment jsdom` for behavior a simulated DOM can verify. Keep the comment's exact syntax.
- Browser Mode is not an environment; it needs a project with `browser` configured. Use it, or the end-to-end runner, for behavior that needs a real browser.
- `test.each` titles support `%s`, `%d`, `%i`, `%f`, `%j`, `%o`, `%O`, `%c`, `%%`, `%#` for the 0-based index, `%$` for the 1-based index, and `$name` for properties of object cases. `%p` is not supported and prints as is.
- Vitest 4 removed the `workspace` option and the `vitest.workspace` file; use `projects` in the config. It also removed `poolOptions`, whose settings are now top-level options, and `environmentMatchGlobs` and `poolMatchGlobs`, which are now projects with their own settings.
- Vitest 5 changes behavior that older tests rely on:
  - `clearMocks` defaults to true.
  - `vi.mock()` and `vi.hoisted()` must be at the top level of the file.
  - An un-awaited `resolves` or `rejects` assertion fails the test.
  - `toHaveTextContent()` requires an exact match; use `toMatchTextContent()` for partial or regex matches.
  - `expect.poll()` rejects on timeout.
