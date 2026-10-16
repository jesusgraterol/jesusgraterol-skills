## Single-page-app delivery

- A lazy chunk from an older deploy can disappear while a tab is open. Handle Vite's `vite:preloadError` with `preventDefault()`, then show a persistent Reload prompt whenever unsaved input could be lost. Otherwise, either show that prompt or reload once per build with a guard against reload loops. Skip both while `navigator.onLine` is false.
- Serve the HTML shell with `Cache-Control: no-cache`, so every visit revalidates it, and prefer a long `max-age` with `immutable` for fingerprinted assets.
- Exclude the asset directory from the single-page-app fallback rewrite, so a missing chunk returns 404 instead of the app's HTML.
- Service-worker headers, caching, and offline behavior belong to jg-pwa.
