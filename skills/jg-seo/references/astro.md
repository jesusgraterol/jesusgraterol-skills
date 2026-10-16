## Astro sites

- Set `site` to the production origin, and set `base` and `trailingSlash` to match the site's one URL form, so canonicals built from `Astro.site` and the sitemap use them.
- Limit `@astrojs/sitemap` to canonical, indexable pages with its `filter` option, and set per-page values, such as a real `lastmod`, in `serialize`.
- Keep each sitemap file within the size limits with `entryLimit`.
- In a static build, `redirects` become pages with a meta refresh, `noindex`, and a canonical to the target, which is absolute only when `site` is set. Use the host's redirects instead where it supports permanent ones.
- Generate `robots.txt` and `llms.txt` from endpoint files, such as `src/pages/robots.txt.ts`, so they use the configured `site`.
- Never set the integration's top-level `lastmod`, which gives every page the same date.
