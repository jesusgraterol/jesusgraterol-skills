## UI component libraries

- Ship CSS through `exports` with `style` and `default` conditions, such as `"./styles.css": { "style": "./dist/styles.css", "default": "./dist/styles.css" }`, plus a tokens file that consumers can import on its own.
- Write `@source` paths relative to the shipped stylesheet, so Tailwind finds the library's classes wherever the package is installed.
- Consumers keep exactly one `@import "tailwindcss"`; the library's stylesheets never import Tailwind themselves.
- Keep `react`, `react-dom`, and `tailwindcss` as ranged peer dependencies.
- Expose theming through a documented contract: tokens mapped with `@theme inline`, and dark mode through `@custom-variant dark (&:where(.dark, .dark *))`.
- Never ship a site's identity, such as its logo, its brand colors as defaults, or its product copy.
- Prefix new global identifiers, such as CSS custom properties, keyframes, and data attributes, with the package's own prefix.
- Prefer a subpath per component when the package ships components as source. Otherwise ship a barrel entry with accurate `sideEffects`.
- Type component variants, so an invalid combination fails typechecking.
- Spread native attributes through to the underlying element, and document the supported customization points; everything else is internal.
- Record the source and license of every third-party asset, such as icons and fonts.
- Test that inline SVG output is safe: no scripts, event handlers, or external references.
- When the numbers justify it, gate releases on a consumer app built from the packed tarball.
