## Native platform features

When no official UI-package component, supported composition, or established application abstraction covers the need, prefer native platform features over custom JavaScript: `<dialog>` with `showModal()` for modal dialogs, the `popover` attribute for menus and popovers, `inert` to take hidden or background content out of focus and the accessibility tree, and `:has()` for styling that depends on an element's contents. Use a feature only when it is Baseline for the application's supported browsers, or ship a fallback.

## Dialogs and overlays

- When a dialog stays in the DOM while closed, reset its scroll container to the top each time it opens.
- Initial focus goes to the first focusable control. Focus the dialog's title, with `tabindex="-1"`, instead when focusing a control would scroll the start of the content out of view, and the least destructive action in a destructive confirmation. On close, focus returns to the control that opened the dialog.
- Prefer closing dialogs that outlive a route when a navigation commits, cancelling their work rather than confirming it. Don't add a history entry only for opening a dialog unless it has its own URL.
- Render menus, popovers, and tooltips that sit inside dialogs or overflow containers in the top layer, with `popover`, or through the UI library's portal, so they aren't clipped. Inside a native modal `<dialog>`, keep them in the dialog's DOM, because `showModal()` makes everything outside it inert.
- Prefer backdrop-click dismissal only for informational and selection dialogs. Keep it off for dialogs that hold user input, confirm destructive actions, or have pending work, and always keep a visible close or cancel control; `closedby="any"` isn't Baseline.
- Prefer one action order across dialogs and forms: cancel before the primary action in DOM order, with the primary at the end of the row. When actions stack full-width on narrow screens, the primary may move to the top.
- Every dialog takes its accessible name from its visible title. A destructive confirmation uses `role="alertdialog"`, with `aria-describedby` pointing at its message.
- Prefer `overscroll-contain` on the scrolling body of a dialog or drawer, so scrolling past its end doesn't move the page behind it.
