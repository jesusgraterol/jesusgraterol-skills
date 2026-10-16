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

- Before creating or changing a form or a form field, read `references/forms.md`.
- Before adding or changing animation or transitions, read `references/motion.md`. Every new or modified animation must have an equivalent reduced-motion path.
- Before writing or reviewing Tailwind classes, CSS, or Tailwind configuration, read `references/tailwind-and-css.md`.

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
