---
name: jg-react
description: React standards for component organization, render performance, React 19 APIs, routing and URL state, server rendering and hydration, client data caching, and React tests. Use when writing, reviewing, or planning React components, hooks, context or providers, React state or data loading, routes, search params, or navigation, server rendering or hydration, client-side data caching, polling, or mutations, render performance, or React tests.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is React components, hooks, context and providers, React state and data loading, routing and URL state, server rendering and hydration, client data caching and mutations, render performance, and React tests.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for React 19.2 and React Router 7. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
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

- Before writing or reviewing code in a React app that server-renders or prerenders, read `references/server-rendering.md`. The first client render must match the server HTML.
- Before writing or reviewing client-side data fetching, caching, polling, optimistic updates, or mutations, read `references/client-data.md`. Consequential writes never retry on their own, wait in an offline queue, or apply optimistically.

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
otp-dialog/
  index.ts
  otp-dialog.component.tsx
  otp-dialog.hook.ts
  types.ts
  constants.ts
  utilities.ts
  validations.ts
  otp-dialog.component.test-unit.tsx
  otp-dialog.css
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
- (19+) Where the project has no established form system, prefer `<form action={…}>` with `useActionState` and `useFormStatus` for submissions, and `useOptimistic` for optimistic updates. React resets a form's uncontrolled fields after its action finishes, even when the action returns errors through `useActionState`, so keep the user's input after a failed submission by returning the submitted values and rendering them as `defaultValue`, or by using controlled fields.
- (19.2+) Move non-reactive logic that an effect calls into `useEffectEvent` instead of leaving dependencies out of the array. It needs `eslint-plugin-react-hooks` 6.1 or later, so the linter does not add the event to the dependencies.
- (19.2+) Keep the state of hidden UI, such as inactive tabs, with `<Activity mode="hidden">` instead of unmounting it or hiding it while its effects keep running.
- (19+) Pass async functions to `startTransition` for non-urgent updates that wait on work, and wrap state updates that follow an `await` in another `startTransition`.
- Place Suspense and error boundaries per route or per meaningful section, rather than only around the whole app or around every component.

## URL state and routing

- Prefer keeping shareable view state, such as filters, sort order, the open tab, and the page, in search params, parsed with a schema that falls back to defaults on missing or invalid values, so links, reloads, and Back restore the same view.
- A change to search params alone keeps the page and its scroll position: pass `preventScrollReset: true` to `setSearchParams` or the `Link`.
- Key the region that shows filtered data by the parsed filters, so its local state, such as a selection or an expanded row, resets when they change.
- Merge several param changes into one `setSearchParams` call, because calls in the same tick don't build on each other.
- Prefer loading a route's data in parallel with its code: start requests in loaders, or prefetch through the data layer, such as TanStack Query's `ensureQueryData`, and have a lazy route import its loader and component together, such as with `Promise.all`, rather than fetching after the component mounts. `HydrateFallback` covers only the first load; show later navigations' pending state with `useNavigation`.
- Build in-app paths through shared functions that encode each dynamic segment, never by joining strings. React Router 7's `generatePath` encodes `:param` values but inserts a splat value as-is, so encode each segment of a splat yourself.
- A route guard on a session that resolves asynchronously handles four states: while resolving it shows a loading state and never redirects; signed out redirects with `replace` and a same-origin return path; signed in renders the route; and a failed check offers Retry and Sign out.
- On in-app navigations, prefer moving focus to the new page's `h1`, rendered with `tabIndex={-1}` and focused with `preventScroll`, and starting the new page at the top, while Back and Forward restore the previous scroll position. Prefer the router's scroll restoration, such as `<ScrollRestoration>`, over custom code.
- Each route sets a unique, descriptive document title, for example by rendering (19+) `<title>` in the route component or through the route's `meta` export. On public, indexable pages, the title and other head tags follow jg-seo.

## React testing

When testing React, DOM, browser, and UI behavior:

- Prefer user-visible behavior over implementation details.
- Use Testing Library queries that reflect user and assistive technology interactions, such as role, label text, placeholder text, visible text, and alt text.
- Prefer `userEvent` for realistic interactions when available.
- Avoid testing private component state, internal implementation details, CSS class names, or framework internals unless they are part of a stable public contract.
- Test accessibility behavior that matters, such as keyboard interaction, focus management, disabled states, labels, roles, names, error messages, and conditional content.
- Evaluate tests or manual checks for responsive and light/dark behavior when frontend changes are user-visible or reflected in DOM state.
