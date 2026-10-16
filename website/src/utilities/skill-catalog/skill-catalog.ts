import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { getCollection } from 'astro:content';

import { SKILL_CATALOG } from '../../site.config.ts';

import { SKILL_CATALOG_ERROR_MESSAGES } from './constants.ts';
import type { ISkill, ISkillReference } from './types.ts';
import {
  assertBareSkillReferences,
  assertCatalogCoverage,
  assertFileBudget,
  assertInvocationSettings,
  assertNoSectionLinks,
  assertReferenceIsLeaf,
  assertReferences,
  assertSearchMetadata,
  assertSharedSections,
  assertSkillName,
  assertVersionLine,
  buildSourceUrl,
} from './utilities.ts';

/** Narrows a skill directory name to a catalog key. */
const isCatalogName = (name: string): name is keyof typeof SKILL_CATALOG =>
  Object.hasOwn(SKILL_CATALOG, name);

/** Reads a content file's size in bytes, failing loudly when the file cannot be read. */
const readFileBytes = async (filePath: string | undefined): Promise<number> =>
  (await readFile(resolve(filePath ?? ''))).byteLength;

/**
 * Groups reference files by the skill directory they belong to, in path order.
 * @returns A promise that resolves to each skill's references, keyed by its directory name.
 */
const loadReferencesBySkill = async (): Promise<Map<string, ISkillReference[]>> => {
  const referencesBySkill = new Map<string, ISkillReference[]>();

  for (const entry of await getCollection('skillReferences')) {
    const [skillName = '', ...pathSegments] = entry.id.split('/');
    const references = referencesBySkill.get(skillName) ?? [];

    references.push({ entry, path: `${pathSegments.join('/')}.md` });
    referencesBySkill.set(skillName, references);
  }

  // code-point order, the same order the build verification lists reference files in
  referencesBySkill.forEach((references) =>
    references.sort((first, second) => (first.path < second.path ? -1 : 1)),
  );

  return referencesBySkill;
};

/**
 * Loads every skill under the repository's skills directory, merged with its catalog entry and
 * its reference files. Fails the build when a skill folder and the site disagree, a skill's
 * invocation settings do not match its kind, its search metadata would be cut off in search
 * results, its shared section drifts from the other skills of its kind, an implicit skill has no
 * version line, a skill or reference file links to a section of a document or names another skill
 * with a / or $ prefix, a skill's reference files and its SKILL.md disagree, a reference names
 * another reference, or a skill file exceeds the size budget.
 * @returns A promise that resolves to the skills in catalog order.
 * @throws
 * - Skill name does not match its directory
 * - Skill catalog does not match the skill folders
 * - Skill invocation settings do not match its catalog kind
 * - Skill search metadata is outside its limits
 * - Implicit skill has no version line
 * - Skill links to a section of another document
 * - Skill refers to another skill with a / or $ prefix
 * - Explicit skill has reference files
 * - Skill mentions a reference file that does not exist
 * - Skill reference file is not mentioned in its SKILL.md
 * - Skill reference file mentions another reference file
 * - Skill file is larger than its size budget
 * - Skill shared section differs from the other skills of its kind
 */
export const loadSkills = async (): Promise<ISkill[]> => {
  const entries = await getCollection('skills');
  const referencesBySkill = await loadReferencesBySkill();

  entries.forEach((entry) => assertSkillName(entry.id, entry.data.name));
  assertCatalogCoverage(
    entries.map(({ id }) => id),
    Object.keys(SKILL_CATALOG),
  );

  // reference files in a folder without a SKILL.md can never be read by an agent
  const orphanedSkill = [...referencesBySkill.keys()].find(
    (skillName) => !entries.some(({ id }) => id === skillName),
  );

  if (orphanedSkill !== undefined) {
    const orphanedPaths = (referencesBySkill.get(orphanedSkill) ?? []).map(({ path }) => path);

    throw new Error(
      `${SKILL_CATALOG_ERROR_MESSAGES.ReferenceUnmentioned}: ${orphanedSkill} (${orphanedPaths.join(', ')})`,
    );
  }

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
      const references = referencesBySkill.get(entry.id) ?? [];

      assertVersionLine(document);
      assertNoSectionLinks(document);
      assertBareSkillReferences(document);
      assertReferences(
        document,
        references.map(({ path }) => path),
      );
      assertFileBudget(entry.id, 'SKILL.md', await readFileBytes(entry.filePath));

      for (const reference of references) {
        const referenceBody = reference.entry.body ?? '';
        const referenceDocument = { body: referenceBody, name: `${entry.id}/${reference.path}` };

        assertReferenceIsLeaf(entry.id, reference.path, referenceBody);
        assertNoSectionLinks(referenceDocument);
        assertBareSkillReferences(referenceDocument);
        assertFileBudget(entry.id, reference.path, await readFileBytes(reference.entry.filePath));
      }

      return {
        ...catalogEntry,
        argumentHint: entry.data['argument-hint'],
        description: entry.data.description,
        entry,
        name: entry.id,
        references,
        sourceUrl: buildSourceUrl(entry.id),
      };
    }),
  );

  assertSharedSections(
    skills.map(({ entry, kind, name }) => ({ body: entry.body ?? '', kind, name })),
  );

  return skills.toSorted((first, second) => first.order - second.order);
};
