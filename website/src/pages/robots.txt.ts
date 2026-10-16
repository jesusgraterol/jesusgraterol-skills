import type { APIRoute } from 'astro';

import { SITE_CONFIG } from '../site.config.ts';

/**
 * Returns the crawler rules, built from the site URL so the sitemap address always matches the
 * deployed origin.
 * @returns The plain-text response.
 */
export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${new URL('/sitemap-index.xml', SITE_CONFIG.url).toString()}`,
      '',
    ].join('\n'),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    },
  );
