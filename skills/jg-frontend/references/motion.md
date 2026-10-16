## Motion and animation guidance

For UI states/transitions, disclosures, loading, dialogs, menus, toasts, drawers, accordions, or feedback, assess whether motion materially improves orientation, perceived responsiveness, or comprehension.

Animate only for clear UX value, with minimal motion and short durations. Avoid decorative, looping, parallax, long-distance, or attention-grabbing motion unless explicitly requested and accessible.

Prefer simple low-cost opacity changes and tiny transforms, such as fades or slight fade-and-slide transitions. Avoid large travel, width/height animation, many simultaneous elements, heavy blur/shadows, and complex custom keyframes unless explicitly requested, performant, and accessible.

For predictably small-height content, use subtle fade plus minimal slide when direction clarifies origin/destination. Avoid height animation without a proven accessible project pattern. Example, with `tw-animate-css` utilities, which apply only when it is installed:

```tsx
<div
  className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none"
>
  ...
</div>
```

Use fade-only entry/exit for unpredictable, user-generated, async-loaded, virtualized, paginated, or potentially large content. Do not slide, expand/collapse, animate height, or use large transforms on substantially growing content; avoid jank, disorientation, and unnecessary rendering. Example, again with `tw-animate-css` utilities:

```tsx
<div
  className="animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none"
>
  ...
</div>
```

With Tailwind and installed/configured `tw-animate-css`, prefer its utilities over custom CSS or new dependencies for simple entry, exit, expand/collapse, and state changes. First check package/lock files, CSS imports, Tailwind configuration, and existing usage.

Do not add `tw-animate-css`, replace animation systems, or migrate existing animations solely for a targeted change unless explicitly requested or the current approach creates a high-impact issue.

Always respect reduced motion. Every new/modified animation must have an equivalent reduced-motion path through Tailwind `motion-reduce:`, existing utilities, or CSS `@media (prefers-reduced-motion: reduce)`. That path removes or substantially reduces the motion while preserving information, layout, timing assumptions, focus management, and interaction state.
