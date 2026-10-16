## Feedback and errors

- Prefer one feedback slot per flow: a new outcome replaces the flow's previous toast, and leaving or resetting the flow clears it. Don't add a local toast when a global notice already reports the outcome.
- Report a failed action where it happened: next to the form for a submission, keeping what the user entered, or as a toast for a one-off action. A failed background read stays inline in its section with a Retry control and keeps the data already shown, marked as possibly out of date.
- Never show raw exception text, stack traces, or unvetted server messages. Map stable error codes to reviewed copy, with a fallback message for each operation, and keep the diagnostics in logs.
- A failed read never renders as an empty or zero result; show its error state instead.
- Give app-level notices that can repeat, such as offline, new-version, or live-update failures, one stable identity, so they replace each other instead of stacking. A decision the user must make never lives only in a toast that dismisses itself.
- An empty state says what is empty and offers the next action where one exists. When it appears after a search or filter update, announce it as a status message with `role="status"`.
- Announce outcomes that appear without moving focus, such as saved, a result count, or a failure, through a live region that exists before its text changes. Use `role="status"` by default and `role="alert"` only for errors that need immediate attention.
- While an action is pending, ignore repeat activation and show progress in the button's label or a nearby status message. Prefer `aria-disabled="true"` over `disabled` while the button has focus, so focus isn't lost, and put `aria-busy` on the region being updated, not on the button.
