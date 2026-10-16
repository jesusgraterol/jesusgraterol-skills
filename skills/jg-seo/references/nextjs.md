## Next.js apps

- Set each page's canonical through `alternates.canonical` in its metadata, with `metadataBase` set to the production origin, so the URL is absolute.
- Generate the sitemap with `app/sitemap.ts`, splitting a large one with `generateSitemaps`, and `robots.txt` with `app/robots.ts`.
- Call `notFound()` for missing content before any streaming starts, such as before a `<Suspense>` boundary renders, so the page returns a real 404 status. Once streaming has started, the response keeps its 200 status and Next.js only adds a `noindex` tag.
