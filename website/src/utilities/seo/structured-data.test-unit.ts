// @vitest-environment node
import { describe, expect, test } from 'vitest';

import { buildStructuredData } from './structured-data.ts';

// website reference every page entity points back to
const WEBSITE_REFERENCE = {
  '@id': 'https://jg-skills.jesusgraterol.dev/#website',
  '@type': 'WebSite',
  name: 'JG Skills',
  url: 'https://jg-skills.jesusgraterol.dev/',
};

describe('buildStructuredData', () => {
  test('describes the canonical website without fabricated page fields', () => {
    expect(
      buildStructuredData({
        canonicalUrl: 'https://jg-skills.jesusgraterol.dev/',
        description: 'Explicit-only skills for Claude Code and Codex.',
        title: 'JG Skills',
        type: 'website',
      }),
    ).toStrictEqual({
      '@context': 'https://schema.org',
      '@id': 'https://jg-skills.jesusgraterol.dev/#website',
      '@type': 'WebSite',
      author: {
        '@type': 'Person',
        name: 'Jesus Graterol',
        url: 'https://jesusgraterol.dev/',
      },
      description: 'Explicit-only skills for Claude Code and Codex.',
      inLanguage: 'en',
      name: 'JG Skills',
      url: 'https://jg-skills.jesusgraterol.dev/',
    });
  });

  test('describes a skill page with a separate breadcrumb entity', () => {
    expect(
      buildStructuredData({
        breadcrumbs: [
          { name: 'Skills', path: '/' },
          { name: 'jg-plan', path: '/skills/jg-plan/' },
        ],
        canonicalUrl: 'https://jg-skills.jesusgraterol.dev/skills/jg-plan/',
        description: 'Create or revise an implementation-ready plan.',
        title: 'jg-plan',
        type: 'webpage',
      }),
    ).toStrictEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@id': 'https://jg-skills.jesusgraterol.dev/skills/jg-plan/#webpage',
          '@type': 'WebPage',
          breadcrumb: { '@id': 'https://jg-skills.jesusgraterol.dev/skills/jg-plan/#breadcrumb' },
          description: 'Create or revise an implementation-ready plan.',
          inLanguage: 'en',
          isPartOf: WEBSITE_REFERENCE,
          name: 'jg-plan',
          url: 'https://jg-skills.jesusgraterol.dev/skills/jg-plan/',
        },
        {
          '@id': 'https://jg-skills.jesusgraterol.dev/skills/jg-plan/#breadcrumb',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              item: 'https://jg-skills.jesusgraterol.dev/',
              name: 'Skills',
              position: 1,
            },
            {
              '@type': 'ListItem',
              item: 'https://jg-skills.jesusgraterol.dev/skills/jg-plan/',
              name: 'jg-plan',
              position: 2,
            },
          ],
        },
      ],
    });
  });

  test.each([
    ['no breadcrumbs', undefined],
    ['a single breadcrumb', [{ name: 'Skills', path: '/' }]],
  ])('omits the breadcrumb graph for a web page with %s', (_caseName, breadcrumbs) => {
    expect(
      buildStructuredData({
        breadcrumbs,
        canonicalUrl: 'https://jg-skills.jesusgraterol.dev/missing/',
        description: 'Page not found.',
        title: 'Not found',
        type: 'webpage',
      }),
    ).toStrictEqual({
      '@context': 'https://schema.org',
      '@id': 'https://jg-skills.jesusgraterol.dev/missing/#webpage',
      '@type': 'WebPage',
      description: 'Page not found.',
      inLanguage: 'en',
      isPartOf: WEBSITE_REFERENCE,
      name: 'Not found',
      url: 'https://jg-skills.jesusgraterol.dev/missing/',
    });
  });
});
