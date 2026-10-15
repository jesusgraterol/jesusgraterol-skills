import { SITE_CONFIG } from '../../site.config.ts';

import { EXPLICIT_ONLY_OPENAI_POLICY, SKILL_CATALOG_ERROR_MESSAGES } from './constants.ts';

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
 * Asserts that a skill's Codex policy disables implicit invocation, whatever its line endings.
 * @param skillName The skill whose policy is checked.
 * @param policyText The contents of the skill's agents/openai.yaml.
 * @throws
 * - Skill does not ship the explicit-only Codex policy
 */
export const assertExplicitOnlyPolicy = (skillName: string, policyText: string): void => {
  if (policyText.replaceAll('\r\n', '\n') !== EXPLICIT_ONLY_OPENAI_POLICY) {
    throw new Error(`${SKILL_CATALOG_ERROR_MESSAGES.ImplicitInvocationAllowed}: ${skillName}`);
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
