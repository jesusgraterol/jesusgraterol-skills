---
name: jg-react
description: React standards for component organization, render performance, React 19 APIs, and React tests. Use when writing, reviewing, or planning React components, hooks, context or providers, React state or data loading, render performance, or React tests.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is React components, hooks, context and providers, React state and data loading, render performance, and React tests.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for React 19.2 and React Router 7. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- When the installed version of the technology is newer than the one this skill was written for, and one of this skill's version-specific items differs from that version's official guidance, follow the official guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## React module organization

- Place each meaningful React component or component module in its own directory.
- Avoid multiple non-trivial components per file. Local subcomponents may remain only when very small, tightly parent-coupled, scannable, and unlikely to be reused. Give meaningful, growing, or reusable subcomponents their own modules.
- Component symbols must use `PascalCase`. Hook symbols use `camelCase` and must start with `use`. Exported context and provider symbols use `PascalCase` with clear `Context` or `Provider` suffixes.
- Component directories must use `kebab-case`.
- Component implementation files must use `kebab-case.component.tsx`, and hook implementation files `kebab-case.hook.ts`.
- The component implementation must live in a dedicated component file, not in `index.ts` or `index.tsx`.
- Use dedicated suffixed files for other React content, such as `.hook.ts`, `.context.tsx`, or `.provider.tsx`.
- Keep `index.ts` as the public import boundary unless the repository already requires `index.tsx`.
- Both `index.ts` and `index.tsx` must be thin public export boundaries without JSX, state, effects, handlers, rendering, hook/context/provider logic, or non-trivial component helpers.
- Re-export each React artifact from its owning file: components from their `.component.tsx` file, hooks from their `.hook.ts` file, providers from their `.provider.tsx` file, and contexts from their `.context.tsx` file.
- A component directory's entry file exports only externally consumed components, hooks, providers, contracts, constants, and other public symbols.

A component module, with only the files it needs:

```txt
some-component/
  index.ts
  some-component.component.tsx
  types.ts
  constants.ts
  utilities.ts
  validations.ts
  some-component.component.test-unit.tsx
  some-component.css
```

Its entry file:

```ts
// types
export type { IOtpDialogProps } from './types.js';

// components
export { OtpDialog } from './otp-dialog.component.js';

// hooks
export { useOtpDialog } from './otp-dialog.hook.js';
```

## React performance and render optimization

Make created or modified React code render-efficient by default, avoiding unnecessary re-renders and render-time work without premature or noisy memoization.

Always:

- Keep components pure. Do not perform side effects during render.
- Move static constants, configuration, literal maps, schemas, column definitions, option lists, and pure helpers outside components when they need no props, state, context, refs, or other reactive values.
- Prefer module-level pure utilities for formatting, filtering, sorting, mapping, validation, and calculations that do not need component reactivity.
- Keep state minimal and colocated; do not store values derivable from props/state during render unless performance requires caching.
- Use `useMemo` for plausibly expensive derivations or genuinely needed stable object, array, context-value, or memoized-child-prop identities. Before memoizing only for a dependency array, prefer simplification or creating the value inside the effect.
- Use `useCallback` for callbacks passed to memoized children, exposed by custom hooks, used by external subscriptions/integrations, or otherwise needing stable identity.
- Use `React.memo` or established memoization for pure components frequently re-rendering with unchanged props, especially expensive list items or children with stable props.
- Use stable keys from domain identifiers. Do not use array indexes as keys for dynamic, sortable, filterable, insertable, or removable lists.
- Stabilize context values with `useMemo`, split broad contexts by update frequency or responsibility, and avoid large-subtree re-renders for small state changes.
- Avoid creating objects, arrays, class instances, `Map`, `Set`, `RegExp`, `Intl.*`, date formatters, options, or inline component types during render unless cheap and irrelevant to child identity or hook dependencies.
- Use lazy state initialization for expensive initial state, such as `useState(() => computeInitialState())`.
- Use refs for mutable values that do not affect rendering instead of state.
- Avoid unnecessary effects: derive output from props/state during render when possible; reserve effects for external-system synchronization.
- For expensive lists, tables, grids, or feeds, use appropriate pagination, windowing, virtualization, incremental loading, or existing list primitives.
- Use `useDeferredValue`, `startTransition`, or framework route/data-loading primitives for expensive non-urgent updates when appropriate and repository-supported.

Do not:

- Add `useMemo`, `useCallback`, or `React.memo` mechanically around every value, function, or component.
- Use memoization to hide impure render logic, stale closures, incorrect dependencies, mutation, or unstable state structure.
- Omit dependencies from hooks to force fewer renders. Fix the dependency source or component structure instead.
- Create nested component definitions inside another component unless the nested component intentionally must be recreated and reset with the parent.
- Introduce custom equality functions unless they are small, safe, and clearly needed; avoid deep comparisons in render paths.

Prefer React Compiler when already enabled and configured. When React Compiler is active, keep components pure and compiler-friendly; use manual `useMemo`, `useCallback`, or `React.memo` only for needed explicit stable references, third-party integration behavior, or measured memoization control.

For non-obvious performance tradeoffs, prioritize correctness/readability and the smallest safe optimization. Report deeper profiling or broader architecture changes as follow-ups, not speculative rewrites.

## React 19 APIs

- (19+) Pass `ref` as a regular prop instead of wrapping a component in `forwardRef`.
- (19+) Render a context with `<SomeContext value={…}>` instead of `<SomeContext.Provider value={…}>`.
- Prefer loading data through the router's loaders or the project's established query layer, where the project has one, over fetching inside `useEffect`.
- (19+) Where the project has no established form system, prefer `<form action={…}>` with `useActionState` and `useFormStatus` for submissions, and `useOptimistic` for optimistic updates.
- (19.2+) Move non-reactive logic that an effect calls into `useEffectEvent` instead of leaving dependencies out of the array. It needs `eslint-plugin-react-hooks` 6.1 or later, so the linter does not add the event to the dependencies.
- (19.2+) Keep the state of hidden UI, such as inactive tabs, with `<Activity mode="hidden">` instead of unmounting it or hiding it while its effects keep running.
- (19+) Pass async functions to `startTransition` for non-urgent updates that wait on work, and wrap state updates that follow an `await` in another `startTransition`.
- Place Suspense and error boundaries per route or per meaningful section, rather than only around the whole app or around every component.

## React testing

When testing React, DOM, browser, and UI behavior:

- Prefer user-visible behavior over implementation details.
- Use Testing Library queries that reflect user and assistive technology interactions, such as role, label text, placeholder text, visible text, and alt text.
- Prefer `userEvent` for realistic interactions when available.
- Avoid testing private component state, internal implementation details, CSS class names, or framework internals unless they are part of a stable public contract.
- Test accessibility behavior that matters, such as keyboard interaction, focus management, disabled states, labels, roles, names, error messages, and conditional content.
- Evaluate tests or manual checks for responsive and light/dark behavior when frontend changes are user-visible or reflected in DOM state.
