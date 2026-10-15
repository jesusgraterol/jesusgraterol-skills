import { SITE_CONFIG } from '../../site.config.ts';

import type {
  IBreadcrumbItem,
  IListedPage,
  IStructuredDataOptions,
  IStructuredDataSkill,
} from './types.ts';

const websiteUrl = new URL('/', SITE_CONFIG.url).toString();
const websiteId = `${websiteUrl}#website`;
const licenseUrl = `${SITE_CONFIG.repositoryUrl}/blob/main/LICENSE`;

// author identity shared by every page, linked to the author's public profiles
const author = {
  '@type': 'Person',
  name: SITE_CONFIG.author.name,
  sameAs: [...SITE_CONFIG.author.sameAs],
  url: SITE_CONFIG.author.url,
};

// website reference used to connect page entities to the canonical site
const websiteReference = {
  '@id': websiteId,
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: websiteUrl,
};

// keywords every skill shares; each skill page adds its stage
const SKILL_KEYWORDS = ['Agent Skills', 'Claude Code', 'Codex', 'coding agents'] as const;

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

/** Builds the list of pages a website presents, in display order. */
const buildItemList = (listedPages: readonly IListedPage[]): Record<string, unknown> => ({
  '@id': `${websiteUrl}#skills`,
  '@type': 'ItemList',
  itemListElement: listedPages.map(({ name, path }, index) => ({
    '@type': 'ListItem',
    name,
    position: index + 1,
    url: new URL(path, SITE_CONFIG.url).toString(),
  })),
});

/** Describes the skill a page documents as source code published in the repository. */
const buildSoftwareSourceCode = (
  skill: IStructuredDataSkill,
  canonicalUrl: string,
  description: string,
): Record<string, unknown> => ({
  '@id': `${canonicalUrl}#source`,
  '@type': 'SoftwareSourceCode',
  author,
  codeRepository: SITE_CONFIG.repositoryUrl,
  description,
  keywords: [...SKILL_KEYWORDS, skill.stage],
  license: licenseUrl,
  name: skill.name,
  programmingLanguage: 'Markdown',
  url: canonicalUrl,
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
  listedPages,
  skill,
  title,
  type,
}: IStructuredDataOptions): Record<string, unknown> => {
  if (type === 'website') {
    const website = {
      '@id': websiteId,
      '@type': 'WebSite',
      author,
      description,
      inLanguage: SITE_CONFIG.language,
      name: SITE_CONFIG.name,
      url: websiteUrl,
    };

    if (!listedPages || listedPages.length === 0) {
      return { '@context': 'https://schema.org', ...website };
    }

    return { '@context': 'https://schema.org', '@graph': [website, buildItemList(listedPages)] };
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
  const entities = [
    pageEntity,
    ...(skill ? [buildSoftwareSourceCode(skill, canonicalUrl, description)] : []),
    ...(breadcrumbList ? [breadcrumbList] : []),
  ];

  if (entities.length === 1) {
    return { '@context': 'https://schema.org', ...pageEntity };
  }

  return { '@context': 'https://schema.org', '@graph': entities };
};
