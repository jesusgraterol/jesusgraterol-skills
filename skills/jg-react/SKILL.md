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
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## React module organization

- Place each meaningful React component or component module in its own directory.
- Avoid multiple non-trivial components per file. Local subcomponents may remain only when very small, tightly parent-coupled, scannable, and unlikely to be reused. Give meaningful, growing, or reusable subcomponents their own modules.
- Component symbols must use `PascalCase`.
- Component directories must use `kebab-case`.
- Component implementation files must use `kebab-case.component.tsx`.
- The component implementation must live in a dedicated component file, not in `index.ts` or `index.tsx`.
- Use dedicated suffixed files for other React content, such as `.hook.ts`, `.context.tsx`, or `.provider.tsx`.
- Keep `index.ts` as the public import boundary unless the repository already requires `index.tsx`.
- Both `index.ts` and `index.tsx` must be thin public export boundaries without JSX, state, effects, handlers, rendering, hook/context/provider logic, or non-trivial component helpers.

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
- Load data through the router's loaders or the project's established query layer, not by fetching inside `useEffect`.
- (19+) Where the project has no established form system, prefer `<form action={…}>` with `useActionState` and `useFormStatus` for submissions, and `useOptimistic` for optimistic updates.
- (19.2+) Move non-reactive logic that an effect calls into `useEffectEvent` instead of leaving dependencies out of the array. It needs `eslint-plugin-react-hooks` 6 or later, so the linter does not add the event to the dependencies.
- (19.2+) Keep the state of hidden UI, such as inactive tabs, with `<Activity mode="hidden">` instead of unmounting it or hiding it while its effects keep running.
- (19+) Pass async functions to `startTransition` for non-urgent updates that wait on work.
- Place Suspense and error boundaries per route or per meaningful section, rather than only around the whole app or around every component.

## React testing

When testing React, DOM, browser, and UI behavior:

- Prefer user-visible behavior over implementation details.
- Use Testing Library queries that reflect user and assistive technology interactions, such as role, label text, placeholder text, visible text, and alt text.
- Prefer `userEvent` for realistic interactions when available.
- Avoid testing private component state, internal implementation details, CSS class names, or framework internals unless they are part of a stable public contract.
- Test accessibility behavior that matters, such as keyboard interaction, focus management, disabled states, labels, roles, names, error messages, and conditional content.
- Evaluate tests or manual checks for responsive and light/dark behavior when frontend changes are user-visible or reflected in DOM state.
