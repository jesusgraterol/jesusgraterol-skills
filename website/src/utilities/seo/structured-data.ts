import { SITE_CONFIG } from '../../site.config.ts';

import type { IBreadcrumbItem, IStructuredDataOptions } from './types.ts';

const websiteUrl = new URL('/', SITE_CONFIG.url).toString();
const websiteId = `${websiteUrl}#website`;

// author identity shared by every page
const author = {
  '@type': 'Person',
  name: SITE_CONFIG.author.name,
  url: SITE_CONFIG.author.url,
};

// website reference used to connect page entities to the canonical site
const websiteReference = {
  '@id': websiteId,
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: websiteUrl,
};

/** Builds a breadcrumb entity from the same hierarchy shown on the page. */
const buildBreadcrumbList = (
  breadcrumbs: readonly IBreadcrumbItem[],
  canonicalUrl: string,
): Record<string, unknown> => ({
  '@id': `${canonicalUrl}#breadcrumb`,
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map(({ name, path }, index) => ({
    '@type': 'ListItem',
    item: new URL(path, SITE_CONFIG.url).toString(),
    name,
    position: index + 1,
  })),
});

/**
 * Builds accurate JSON-LD for the supported public page category.
 * @param options The page values the structured data must describe.
 * @returns The page-level JSON-LD object.
 */
export const buildStructuredData = ({
  breadcrumbs,
  canonicalUrl,
  description,
  title,
  type,
}: IStructuredDataOptions): Record<string, unknown> => {
  if (type === 'website') {
    return {
      '@context': 'https://schema.org',
      '@id': websiteId,
      '@type': 'WebSite',
      author,
      description,
      inLanguage: SITE_CONFIG.language,
      name: SITE_CONFIG.name,
      url: websiteUrl,
    };
  }

  const breadcrumbList =
    breadcrumbs && breadcrumbs.length >= 2
      ? buildBreadcrumbList(breadcrumbs, canonicalUrl)
      : undefined;
  const pageEntity = {
    '@id': `${canonicalUrl}#webpage`,
    '@type': 'WebPage',
    ...(breadcrumbList ? { breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` } } : {}),
    description,
    inLanguage: SITE_CONFIG.language,
    isPartOf: websiteReference,
    name: title,
    url: canonicalUrl,
  };

  if (!breadcrumbList) {
    return {
      '@context': 'https://schema.org',
      ...pageEntity,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [pageEntity, breadcrumbList],
  };
};
