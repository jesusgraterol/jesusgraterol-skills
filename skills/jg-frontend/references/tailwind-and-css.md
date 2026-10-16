## Tailwind CSS guidance

When Tailwind CSS is available, use it as the default styling approach for UI implementation.

Follow the installed Tailwind CSS version’s official documentation and the repository’s Tailwind configuration.

Use canonical Tailwind utility classes exactly as Tailwind defines them.

Do not invent Tailwind-like class names, design tokens, variants, colors, spacing values, or component classes unless they already exist in the project configuration, theme variables, design system, or documented UI conventions.

Prefer Tailwind utilities directly on styled HTML/JSX elements for layout, spacing, sizing, typography, color, borders, shadows, effects, transitions, responsiveness, dark mode, and state variants.

Do not extract class lists into constants, arrays, objects, variables, or module-level maps merely to shorten/clean markup or hide long attributes. Extract only exact lists, maps, or variant definitions reused across elements/components, or styling already owned by a project abstraction such as shared variants, `cva`, or a design-system primitive. No one-use Tailwind constants.

Keep one-off conditions on the styled element with the established inline composition helper; reserve reusable maps for repeated conditional variants.

Prefer readable one-off markup; duplicated utilities are acceptable when not truly shared and extraction adds indirection without maintainability benefit.

Prefer project theme utilities/tokens. Use arbitrary values only when intentional, uncommon, absent from the theme, and clearer than new CSS; repeated values must not substitute for reusable tokens.

Use configured Tailwind responsive variants instead of custom media queries unless Tailwind cannot express the behavior cleanly. Unchanged defaults map `sm:`, `md:`, `lg:`, `xl:`, `2xl:` to `40rem`, `48rem`, `64rem`, `80rem`, `96rem`.

Use Tailwind state and feature variants such as `hover:`, `focus-visible:`, `disabled:`, `aria-*`, `data-*`, and `dark:` when they match the required behavior.

Do not dynamically construct classes Tailwind cannot statically detect; prefer explicit conditional class maps.

Use the established composition helper, e.g. `cn`, `clsx`, `cva`, or `tailwind-merge`. Resolve possible conflicts with the established merge utility, not accidental class order.

Use canonical class names from the installed Tailwind CSS version and configuration.

Keep classes readable and intentional, grouping by purpose manually but leaving final ordering to the configured official Tailwind Prettier plugin:

- Let the plugin sort classes and remove duplicate Tailwind classes and extra whitespace (0.6+), and don't reorder classes in ways that fight it.
- On Tailwind CSS v4, the sort matches the project's theme and utilities only when the plugin's `tailwindStylesheet` option points at the CSS entry file (0.6.9+).
- Class strings inside helpers such as `clsx` or `cva` are sorted only when the plugin's `tailwindFunctions` option lists those helpers.
- The plugin must load last in Prettier's `plugins` list.
- Don't add or configure the plugin for a targeted change unless the task includes formatting-tooling setup.

Do not use `@apply` for ordinary components; allow it only for an established clear design-system pattern or meaningful deduplication that preserves visible structure.

Do not create custom CSS for clear Tailwind-expressible styling. Use it only where Tailwind is insufficient, for browser fixes, complex animations, third-party overrides, or documented design-system primitives.

Use available `tw-animate-css` utilities before custom CSS for eligible low-cost animations, especially fades and small fade-and-slide transitions. Keep them on the element unless exact reuse or established variant ownership justifies extraction.

For React components, keep Tailwind styling in the dedicated component implementation file, not in the module entry file.

Generated/modified UI must work in both themes and responsive layouts. Include needed `dark:`, responsive, and state variants for introduced colors, layout, focus, disabled, hover, active, selected, loading, error, success, or validation states.

In Tailwind 4 projects:

- Define design tokens with `@theme` in CSS rather than in a `tailwind.config.js`, unless the project already uses a JavaScript configuration.
- Prefer `@utility` over `@layer components` with `@apply` for a reusable custom utility, and `@custom-variant` for project variants, such as a class-based `dark` variant.
- Reference CSS variables with the `bg-(--token)` shorthand rather than `bg-[var(--token)]`.
- Without `tw-animate-css`, prefer the `starting:` variant for CSS-only entry transitions of elements that appear, such as popovers and dialogs, over animating them from JavaScript.
- Use container queries, `@container` with variants such as `@md:`, for components whose layout depends on the slot they sit in rather than on the viewport.
- Prefer logical-direction utilities, such as `ps-*` and `ms-*`, over left and right ones when the layout should follow the text direction.
- (4.3+) Style scrollbars with the `scrollbar-*` utilities instead of custom CSS.
- Use the Tailwind 4 names, not the version 3 ones: `shadow-xs` and `rounded-xs` for version 3's `shadow-sm` and `rounded-sm`, `shadow-sm` and `rounded-sm` for its bare `shadow` and `rounded`, `outline-hidden` for its `outline-none`, and `bg-linear-to-r` for its `bg-gradient-to-r`.

## CSS comments

CSS follows the same commenting principles as the repository's other code.

Use concise `/* ... */` comments for CSS because CSS does not support `//`.

Prefer CSS comments for:

- non-obvious layout decisions
- browser-specific workarounds
- accessibility constraints
- design-system constraints
- responsive behavior
- light/dark theme behavior
- intentional specificity, cascade, or inheritance decisions

Do not comment every declaration or restate selectors/properties.
