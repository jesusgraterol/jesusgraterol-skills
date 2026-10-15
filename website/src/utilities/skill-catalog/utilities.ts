import { SITE_CONFIG } from '../../site.config.ts';
import { SEARCH_TEXT_LIMITS } from '../seo/index.ts';

import {
  EXPLICIT_ONLY_OPENAI_POLICY,
  IMPLICIT_OPENAI_POLICY,
  SKILL_CATALOG_ERROR_MESSAGES,
} from './constants.ts';
import type { ISkillKind } from './types.ts';

// the frontmatter flag and Codex policy each kind of skill must ship
const INVOCATION_SETTINGS = {
  explicit: { disableModelInvocation: true, policy: EXPLICIT_ONLY_OPENAI_POLICY },
  implicit: { disableModelInvocation: undefined, policy: IMPLICIT_OPENAI_POLICY },
} as const satisfies Record<
  ISkillKind,
  { disableModelInvocation: true | undefined; policy: string }
>;

/**
 * Asserts that a skill's frontmatter name matches the directory it is installed from.
 * @param directoryName The skill's directory name.
 * @param frontmatterName The `name` declared in the skill's SKILL.md frontmatter.
 * @throws
 * - Skill name does not match its directory
 */
export const assertSkillName = (directoryName: string, frontmatterName: string): void => {
  if (directoryName !== frontmatterName) {
    throw new Error(`${SKILL_CATALOG_ERROR_MESSAGES.NameMismatch}: ${directoryName}`);
  }
};

/**
 * Asserts that a skill's frontmatter flag and Codex policy match its catalog kind, whatever the
 * policy's line endings: explicit skills disable model invocation in both agents, and implicit
 * skills omit the flag and allow implicit invocation.
 * @param skillName The skill whose settings are checked.
 * @param kind The skill's kind in the site catalog.
 * @param disableModelInvocation The `disable-model-invocation` value in its SKILL.md frontmatter.
 * @param policyText The contents of the skill's agents/openai.yaml.
 * @throws
 * - Skill invocation settings do not match its catalog kind
 */
export const assertInvocationSettings = (
  skillName: string,
  kind: ISkillKind,
  disableModelInvocation: true | undefined,
  policyText: string,
): void => {
  const expected = INVOCATION_SETTINGS[kind];

  if (
    disableModelInvocation !== expected.disableModelInvocation ||
    policyText.replaceAll('\r\n', '\n') !== expected.policy
  ) {
    throw new Error(`${SKILL_CATALOG_ERROR_MESSAGES.InvocationMismatch}: ${skillName}`);
  }
};

/**
 * Asserts that a skill's search title leads with its name and that its title and description fit
 * in search results.
 * @param skillName The skill whose search metadata is checked.
 * @param searchTitle The page title shown in search results.
 * @param searchDescription The meta description shown in search results.
 * @throws
 * - Skill search metadata is outside its limits
 */
export const assertSearchMetadata = (
  skillName: string,
  searchTitle: string,
  searchDescription: string,
): void => {
  if (
    !searchTitle.startsWith(skillName) ||
    searchTitle.length > SEARCH_TEXT_LIMITS.titleMaxLength ||
    searchDescription.length < SEARCH_TEXT_LIMITS.descriptionMinLength ||
    searchDescription.length > SEARCH_TEXT_LIMITS.descriptionMaxLength
  ) {
    throw new Error(`${SKILL_CATALOG_ERROR_MESSAGES.InvalidSearchMetadata}: ${skillName}`);
  }
};

/**
 * Asserts that the site catalog describes exactly the skills that exist on disk.
 * @param skillNames The skill directory names found in the repository.
 * @param catalogNames The skill names described by the site catalog.
 * @throws
 * - Skill catalog does not match the skill folders
 */
export const assertCatalogCoverage = (
  skillNames: readonly string[],
  catalogNames: readonly string[],
): void => {
  const missing = skillNames.filter((name) => !catalogNames.includes(name)).toSorted();
  const extra = catalogNames.filter((name) => !skillNames.includes(name)).toSorted();

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `${SKILL_CATALOG_ERROR_MESSAGES.CatalogMismatch}: missing from catalog [${missing.join(', ')}], missing from skills [${extra.join(', ')}]`,
    );
  }
};

/**
 * Builds the public source URL of one skill's instructions.
 * @param name The skill name, which is also its directory name.
 * @returns The GitHub URL of the skill's SKILL.md on the main branch.
 */
export const buildSourceUrl = (name: string): string =>
  `${SITE_CONFIG.repositoryUrl}/blob/main/skills/${name}/SKILL.md`;
