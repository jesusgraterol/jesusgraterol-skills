## Loading performance

- Give the main above-the-fold image `fetchpriority="high"`, and do not lazy-load it. Give images below the fold `loading="lazy"`.
- Prefer the framework's image component, where one exists, over a raw `<img>`, so responsive sizes and modern formats are generated for you.
- Reserve space for images, embeds, and late-loading content with explicit dimensions or `aspect-ratio`, so the page does not shift as it loads.
