---
name: jg-seo
description: 'Search and sharing standards for public, indexable websites: page metadata, canonical URLs, sitemaps, robots rules, structured data, social previews, and llms.txt. Use when writing, reviewing, or planning a public site''s titles and meta descriptions, canonical URLs, sitemap.xml, robots.txt, noindex rules, redirects of public URLs, JSON-LD structured data, Open Graph or X card tags, social preview images, llms.txt, or build checks of a site''s search output.'
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is the search and sharing output of public, indexable websites: page metadata, canonical URLs, sitemaps, robots and noindex rules, redirects of public URLs, structured data, social previews, llms.txt, and build checks of that output.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Google Search Central guidance as of October 2026, Astro 7.4 with `@astrojs/sitemap` 3.7, and Next.js 16. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
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

- Before writing or reviewing the search output of an Astro site, such as its sitemap, redirects, or `robots.txt`, read `references/astro.md`. Set `site` to the production origin, so absolute URLs and the sitemap use it.
- Before writing or reviewing the search output of a Next.js app, such as its metadata, sitemap, or `robots.txt`, read `references/nextjs.md`. Missing content calls `notFound()` before streaming starts, so the page returns a real 404.

## Page metadata

- One owner, such as a layout or a metadata function, emits each page's title, description, canonical, robots, Open Graph, and X tags from one record, so they can't disagree. `og:url` equals the canonical URL.
- Give every indexable page a unique title and description. Prefer titles of about 60 characters and descriptions of 70 to 160.
- The page's `h1` states the subject its title names. Headings, element IDs, and new-tab links follow jg-frontend.

## Canonical URLs and URL form

- Every indexable page has exactly one absolute canonical URL in the server-rendered `<head>`, without a query string or fragment.
- Each indexable page is its own canonical, so two indexable pages never share one.
- Prefer leaving the canonical out on `noindex` pages, where it sends a conflicting signal.
- Use one URL form for trailing slashes, the host, and HTTPS, and use it everywhere: in links, canonicals, sitemaps, and redirects.

## Indexing controls

- Utility pages, such as search results and sign-in, and signed-in routes are `noindex`, and stay out of sitemaps and other discovery paths. Never also disallow them in `robots.txt`, because a crawler that can't fetch a page never sees its `noindex`.
- Preview and staging deployments are never indexable: send `noindex`, such as with an `X-Robots-Tag` header, or require authentication.
- Missing pages return a real 404 or 410 status, never a 200 page that says the page wasn't found.
- Everything search depends on, such as the title, canonical, robots rules, main content, and links, is in the initial HTML, not added later by client-side JavaScript.

## Redirects

- Redirect a moved URL permanently with a 301 or 308. On a static host without server redirects, use a page with a 0-second meta refresh and a canonical pointing at the target.
- Return 404 or 410, not a redirect to the home page, when nothing equivalent exists.
- Point internal links at final URLs, never at URLs that redirect.

## Sitemaps and robots.txt

- A sitemap lists exactly the canonical, indexable URLs, generated from the same records as the pages.
- Give `lastmod` only when it is the page's real modification time, with a time zone offset, and leave out `changefreq` and `priority`, which Google ignores.
- Split a sitemap at 50,000 URLs or 50 MB uncompressed, behind a sitemap index.
- Serve `robots.txt` at the root of the host, and name the sitemap in it with an absolute URL.
- Propose submitting the sitemap in Search Console after a deploy that adds it, instead of doing it.

## Structured data

- Generate JSON-LD with one function per page type, and escape `<` in the serialized JSON, so content can't close the script element.
- Describe only content that is visible on the page.
- `BreadcrumbList` mirrors the visible breadcrumb trail.
- Add `WebSite` structured data only to the home page of a domain or subdomain.
- Don't add `FAQPage` or `HowTo` markup for rich results, which Google Search no longer shows.

## Social previews

- Prefer preview images of 1200×630 pixels.
- `og:image` is an absolute HTTPS URL, with `og:image:width`, `og:image:height`, `og:image:type`, and `og:image:alt`, and set `twitter:image:alt` to the same alternative text.
- Generate preview images deterministically, so the same content always produces the same image.
- Mark paid links with `rel="sponsored"` and links in user-generated content with `rel="ugc"`.

## llms.txt

- An `llms.txt` file is optional, and Google doesn't use it. When a site has one, follow the format at llmstxt.org, generate it from the same records as the pages, list only canonical, indexable URLs, and verify its links in the build.

## Multilingual sites

- Link each language version with `hreflang`, including an `x-default`, and give each version a self-referencing canonical.

## Build verification

- Verify search output against the production build, not the dev server.
- Check that every sitemap URL returns 200, is indexable, and is its own canonical, and test under a non-root base path when the site supports one.
- Prefer checking built HTML with an HTML parser over regular expressions, and propose the dependency when the repository has none.
- Date and hydration testing follow jg-testing and jg-react, and links that carry tokens and build-output hygiene follow the repository's coding instructions.
