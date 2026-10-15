---
name: jg-frontend
description: Frontend standards for accessible, responsive, light- and dark-themed UI, UI-package reuse, forms, motion, and Tailwind CSS. Use when writing, reviewing, or planning UI components, pages, layout, styling, CSS or Tailwind, forms, accessibility, responsive or theme behavior, motion, or frontend tests.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is frontend UI: components, pages, layout, styling, CSS and Tailwind, forms, accessibility, responsive and theme behavior, motion, and frontend tests.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Tailwind CSS 4.3. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Web and accessibility guidance

When a task touches frontend code, UI behavior, layout, styling, components, pages, design-system tokens, or frontend tests, always preserve and validate:

- responsive behavior
- accessibility behavior
- light and dark theme behavior

Apply this requirement to new UI, modified UI, frontend bug fixes, refactors, and styling changes. Do not deliver desktop-only, mouse-only, light-mode-only, or inaccessible UI.

### UI package and component reuse

For selecting component ownership in frontend code introduced or materially changed by the current task, this subsection is a specific exception to the codebase-pattern precedence rules in the repository's coding instructions. Existing local duplication, inconsistent usage, or a nearby one-off implementation is not by itself sufficient reason to bypass an official UI or design-system package. Preserve existing public contracts and do not migrate unrelated legacy UI solely for consistency.

Before planning or implementing a new, replaced, or materially changed UI element/component, identify any official UI/design-system package intended for the affected application. Before coding, inspect its smallest relevant public surface: entry points/exports, APIs, variants, docs/examples, and existing usage, including established application-owned compositions. Determine whether an export, primitive, supported composition, or established abstraction already satisfies the need.

- Use official components, primitives, supported compositions, or established application abstractions built on official exports whenever they satisfy the task contract. Import through package public boundaries; preserve variants, tokens, interactions, accessibility, responsiveness, and themes.
- Do not recreate, copy, fork, or independently style equivalent general-purpose components for speed, simplicity, or familiarity.
- Feature-specific components may compose official exports for domain structure, behavior, state, data orchestration, or stable application contracts. Do not add pass-through/styling-only wrappers merely to rename/repackage exports, bypass variants, or replace tokens.
- Before rejecting the closest official option, inspect its props, variants, slots, compositions, and package-owned extension points. Do not deep-import private files or bypass public APIs.
- Create local general-purpose components/primitives only after inspection finds no suitable official export, supported composition, or established application abstraction, or their use violates an explicit requirement or higher-precedence correctness, accessibility, compatibility, or performance constraint. Align justified local implementations with package tokens/conventions.
- Extend the UI package only for genuinely reusable behavior within authorized scope. Otherwise use the smallest justified feature-specific composition or local exception.
- In required plans, name the official component, primitive, composition, or application abstraction to reuse, or explain its absence. In completion summaries, name inspected UI exports/public paths and justify new local general-purpose exceptions.

New or substantially redesigned UI must be polished, contemporary, product-specific, and consistent with established branding/design systems. Before new primitives or one-off styles, inspect/reuse brand guidance, tokens, typography, colors, spacing, icons, variants, the internal UI library, reusable components, and screen patterns. Use intentional hierarchy, typography, spacing, density, composition, and relevant interaction states. Avoid generic library layouts or decoration that harms clarity, accessibility, responsiveness, or performance.

For product explanations/demonstrations, prefer realistic content and actual reusable components or faithful simulations over decorative empty mockups.

When building UI:

- Prefer semantic HTML over generic `div`s.
- Use landmarks when appropriate: `main`, `nav`, `section`, `article`, `header`, `footer`, `aside`.
- Preserve valid heading hierarchy.
- Ensure keyboard accessibility.
- Use correct native elements before falling back to `role`.
- Use ARIA only when needed and ensure it is correct.
- Specify image dimensions explicitly when appropriate.
- Meet WCAG 2.2 AA, including targets of at least 24 by 24 CSS pixels, or spaced as its target-size exceptions allow, and a focused component that sticky headers, footers, or overlays never hide entirely.

```html
<button type="button">
  <span class="some-icon" aria-hidden="true">add</span>
  Add Book
</button>
```

```html
<button type="button" aria-label="Add book">
  <span class="some-icon" aria-hidden="true">add</span>
</button>
```

```html
<img src="/logo.png" width="180" height="25" alt="Company logo" />
```

### Native platform features

When no official UI-package component, supported composition, or established application abstraction covers the need, prefer native platform features over custom JavaScript: `<dialog>` with `showModal()` for modal dialogs, the `popover` attribute for menus and popovers, `inert` to take hidden or background content out of focus and the accessibility tree, and `:has()` for styling that depends on an element's contents. Use a feature only when it is Baseline for the application's supported browsers, or ship a fallback.

### Loading performance

- Give the main above-the-fold image `fetchpriority="high"`, and do not lazy-load it. Give images below the fold `loading="lazy"`.
- Prefer the framework's image component, where one exists, over a raw `<img>`, so responsive sizes and modern formats are generated for you.
- Reserve space for images, embeds, and late-loading content with explicit dimensions or `aspect-ratio`, so the page does not shift as it loads.

### Form state and validation

Before creating or materially changing a form, inspect existing forms, shared components, hooks, schemas, dependencies, and tests for the established form-state/validation system.

- Use an existing application-owned system consistently for registration, state, validation, errors, submission state, and schema/resolver integration. Do not bypass/replace it with browser-only validation, ad hoc component state, or parallel application validation.
- Without an established application-owned form-validation system, native HTML constraint validation is an acceptable client fallback. Add no form library merely to avoid it unless requested behavior or non-trivial application-owned validation justifies one.
- Preserve accurate native attributes for semantics, accessibility, autofill, mobile input, and progressive enhancement. When the application-owned system controls validation feedback/submission, prevent competing browser validation UI, normally with `noValidate` on `<form>`.
- Align client validation with authoritative application/server contracts; it improves UX but never replaces trusted-server validation.
- Set `autocomplete` tokens, `inputmode`, and `enterkeyhint` on inputs, so browsers can autofill them and mobile keyboards match the field.
- (4.1+) Prefer the `user-invalid:` variant over `invalid:` for error styling, so a field shows its error only after the user has interacted with it.

### Form placeholder guidance

Every user-editable frontend form field supporting placeholders must include a realistic example value.

Placeholders must:

- start with `e.g.`
- show the expected input format or kind of value
- use safe generic data, never real user data, secrets, tokens, private URLs, or credentials
- match the field purpose, validation rules, and locale expectations
- remain concise enough to fit on small screens without harming usability

Examples:

- email fields: `e.g. johndoe@gmail.com`
- age fields: `e.g. 25`
- search fields: `e.g. funny movie`
- phone fields: `e.g. +1 555 123 4567`
- name fields: `e.g. Jane Doe`
- URL fields: `e.g. https://example.com`

Placeholders never replace visible labels, accessible names, helper text, validation messages, or required-field indicators.

## Responsive UI requirements

Frontend implementations must be responsive from `320px` wide through large desktop screens.

They must:

- work at `320px` viewport width without horizontal page overflow
- scale across mobile, tablet, laptop, and large desktop layouts
- use mobile-first layouts by default
- on mobile, prefer simple native-feeling hierarchy, not shrunken desktop cards/panels/containers
- on mobile, flatten/remove outer cards, nested panels, redundant borders, shadows, backgrounds, gutters, and vertical spacing without meaningful grouping, containment, elevation, scrolling, selection, or interaction-state purpose
- on mobile, use available width with compact touch-friendly insets; retain panels/generous spacing only for material clarity, usability, or established mobile design
- on mobile, recompose rather than merely stack desktop panels when needed; prefer established edge-to-edge sections, lists, tabs, accordions, drawers, or sheets when more natural
- progressively enhance at configured breakpoints; with unchanged Tailwind defaults, use `sm`, `md`, `lg`, `xl`, and `2xl`
- avoid fixed widths that break narrow screens
- prefer fluid sizing, wrapping, stacking, and flexible grids
- keep text, controls, dialogs, forms, tables, and navigation usable on small screens
- preserve accessibility, keyboard usability, and readable touch targets across supported viewport sizes

Do not assume a component is desktop-first unless explicitly requested.

## Light and dark theme requirements

Frontend implementations must support light and dark modes through the repository's existing theme strategy.

They must:

- use existing tokens, CSS variables, Tailwind theme utilities, or component variants, not hard-coded one-off colors
- preserve sufficient contrast in both themes for text, icons, controls, borders, focus indicators, validation, and disabled states
- keep hover, active, focus-visible, selected, loading, empty, error, success, and disabled states clear in both themes
- avoid color choices that only work in light mode or only work in dark mode
- keep theme behavior consistent across responsive breakpoints and interactive states
- avoid introducing a new theme mechanism unless the requested change explicitly requires it
- set the CSS `color-scheme` property for each theme, so native controls, scrollbars, and form fields follow it

Without an existing theme mechanism, a limitation/follow-up note does not satisfy mandatory dual-theme support. Check whether existing design-system primitives can support both locally. Otherwise explain that a theme mechanism is required and materially expands scope, then ask one focused question before implementation. Do not silently add a broad system or finish single-theme UI.

## Motion and animation guidance

For UI states/transitions, disclosures, loading, dialogs, menus, toasts, drawers, accordions, or feedback, assess whether motion materially improves orientation, perceived responsiveness, or comprehension.

Animate only for clear UX value, with minimal motion and short durations. Avoid decorative, looping, parallax, long-distance, or attention-grabbing motion unless explicitly requested and accessible.

Prefer simple low-cost opacity changes and tiny transforms, such as fades or slight fade-and-slide transitions. Avoid large travel, width/height animation, many simultaneous elements, heavy blur/shadows, and complex custom keyframes unless explicitly requested, performant, and accessible.

For predictably small-height content, use subtle fade plus minimal slide when direction clarifies origin/destination. Avoid height animation without a proven accessible project pattern. Example:

```tsx
<div
  className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none"
>
  ...
</div>
```

Use fade-only entry/exit for unpredictable, user-generated, async-loaded, virtualized, paginated, or potentially large content. Do not slide, expand/collapse, animate height, or use large transforms on substantially growing content; avoid jank, disorientation, and unnecessary rendering. Example:

```tsx
<div
  className="animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none"
>
  ...
</div>
```

With Tailwind and installed/configured `tw-animate-css`, prefer its utilities over custom CSS or new dependencies for simple entry, exit, expand/collapse, and state changes. First check package/lock files, CSS imports, Tailwind configuration, and existing usage.

Do not add `tw-animate-css`, replace animation systems, or migrate existing animations solely for a targeted change unless explicitly requested or the current approach creates a high-impact issue.

Always respect reduced motion. Every new/modified animation must have an equivalent reduced-motion path through Tailwind `motion-reduce:`, existing utilities, or CSS `@media (prefers-reduced-motion: reduce)`. It should remove/substantially reduce motion while preserving information, layout, timing assumptions, focus management, and interaction state.

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

Keep classes readable and intentional, grouping by purpose manually but using the configured official Tailwind Prettier plugin for final ordering.

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
