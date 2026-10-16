import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { getCollection } from 'astro:content';

import { SKILL_CATALOG } from '../../site.config.ts';

import { SKILL_CATALOG_ERROR_MESSAGES } from './constants.ts';
import type { ISkill } from './types.ts';
import {
  assertBareSkillReferences,
  assertCatalogCoverage,
  assertInvocationSettings,
  assertNoSectionLinks,
  assertSearchMetadata,
  assertSharedSections,
  assertSkillName,
  assertVersionLine,
  buildSourceUrl,
} from './utilities.ts';

/** Narrows a skill directory name to a catalog key. */
const isCatalogName = (name: string): name is keyof typeof SKILL_CATALOG =>
  Object.hasOwn(SKILL_CATALOG, name);

/**
 * Loads every skill under the repository's skills directory, merged with its catalog entry.
 * Fails the build when a skill folder and the site disagree, a skill's invocation settings do not
 * match its kind, its search metadata would be cut off in search results, its shared section
 * drifts from the other skills of its kind, an implicit skill has no version line, or a skill links
 * to a section of a document or names another skill with a / or $ prefix.
 * @returns A promise that resolves to the skills in catalog order.
 * @throws
 * - Skill name does not match its directory
 * - Skill catalog does not match the skill folders
 * - Skill invocation settings do not match its catalog kind
 * - Skill search metadata is outside its limits
 * - Implicit skill has no version line
 * - Skill links to a section of another document
 * - Skill refers to another skill with a / or $ prefix
 * - Skill shared section differs from the other skills of its kind
 */
export const loadSkills = async (): Promise<ISkill[]> => {
  const entries = await getCollection('skills');

  entries.forEach((entry) => assertSkillName(entry.id, entry.data.name));
  assertCatalogCoverage(
    entries.map(({ id }) => id),
    Object.keys(SKILL_CATALOG),
  );

  const skills = await Promise.all(
    entries.map(async (entry): Promise<ISkill> => {
      const policyPath = resolve(dirname(entry.filePath ?? ''), 'agents', 'openai.yaml');

      if (!isCatalogName(entry.id)) {
        throw new Error(`${SKILL_CATALOG_ERROR_MESSAGES.CatalogMismatch}: ${entry.id}`);
      }

      const catalogEntry = SKILL_CATALOG[entry.id];

      assertInvocationSettings(
        entry.id,
        catalogEntry.kind,
        entry.data['disable-model-invocation'],
        await readFile(policyPath, 'utf8'),
      );

      assertSearchMetadata(entry.id, catalogEntry.searchTitle, catalogEntry.searchDescription);

      const document = { body: entry.body ?? '', kind: catalogEntry.kind, name: entry.id };

      assertVersionLine(document);
      assertNoSectionLinks(document);
      assertBareSkillReferences(document);

      return {
        ...catalogEntry,
        argumentHint: entry.data['argument-hint'],
        description: entry.data.description,
        entry,
        name: entry.id,
        sourceUrl: buildSourceUrl(entry.id),
      };
    }),
  );

  assertSharedSections(
    skills.map(({ entry, kind, name }) => ({ body: entry.body ?? '', kind, name })),
  );

  return skills.toSorted((first, second) => first.order - second.order);
};
