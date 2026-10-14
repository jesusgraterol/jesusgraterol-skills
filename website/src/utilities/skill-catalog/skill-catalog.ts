import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { getCollection } from 'astro:content';

import { SKILL_CATALOG } from '../../site.config.ts';

import { SKILL_CATALOG_ERROR_MESSAGES } from './constants.ts';
import type { ISkill } from './types.ts';
import {
  assertCatalogCoverage,
  assertExplicitOnlyPolicy,
  assertSkillName,
  buildSourceUrl,
} from './utilities.ts';

/** Narrows a skill directory name to a catalog key. */
const isCatalogName = (name: string): name is keyof typeof SKILL_CATALOG =>
  Object.hasOwn(SKILL_CATALOG, name);

/**
 * Loads every skill under the repository's skills directory, merged with its catalog entry.
 * Fails the build when a skill folder and the site disagree or a skill could be invoked
 * implicitly by Codex.
 * @returns A promise that resolves to the skills in catalog order.
 * @throws
 * - Skill name does not match its directory
 * - Skill catalog does not match the skill folders
 * - Skill does not ship the explicit-only Codex policy
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

      assertExplicitOnlyPolicy(entry.id, await readFile(policyPath, 'utf8'));

      if (!isCatalogName(entry.id)) {
        throw new Error(`${SKILL_CATALOG_ERROR_MESSAGES.CatalogMismatch}: ${entry.id}`);
      }

      return {
        ...SKILL_CATALOG[entry.id],
        argumentHint: entry.data['argument-hint'],
        description: entry.data.description,
        entry,
        name: entry.id,
        sourceUrl: buildSourceUrl(entry.id),
      };
    }),
  );

  return skills.toSorted((first, second) => first.order - second.order);
};
