## Server rendering and hydration

These rules apply to apps that server-render or prerender React, including static prerendering at build time.

- The first client render must produce the same output as the server HTML. During it, never read storage, `matchMedia`, layout measurements, or the current time, and never branch on `typeof window`. Read them after hydration, through `useSyncExternalStore` with a `getServerSnapshot` that returns the server's value, or in an effect.
- Prefer CSS media and container queries over measured values for layout that changes with the viewport, so the server HTML is already right.
- Generate IDs for labels and ARIA attributes with `useId`, never with counters or random values.
- Server-rendered dates and numbers never depend on the server's or build machine's locale or time zone: pass an explicit locale and time zone, or format them on the client after hydration. Render dates in `<time dateTime="…">` with a machine-readable value.
- Apply a stored theme before the first paint with an inline script that holds only constants, carries the page's CSP nonce, and falls back to the system theme when nothing is stored. Put `suppressHydrationWarning` only on the root element whose attributes the script changes, and keep a `prefers-color-scheme` fallback in CSS for when the script doesn't run.
- Create the client data cache once per server request, never once per module, so one request's data never reaches another; in TanStack Query, create a new `QueryClient` for each request.
