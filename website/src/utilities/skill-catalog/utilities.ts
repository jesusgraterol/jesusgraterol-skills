import { SITE_CONFIG } from '../../site.config.ts';
import { SEARCH_TEXT_LIMITS } from '../seo/index.ts';

import {
  APPLICATION_AREA_PREFIX,
  APPLICATION_VERSION_MARKER,
  EXPLICIT_ONLY_OPENAI_POLICY,
  IMPLICIT_OPENAI_POLICY,
  SHARED_SECTION_HEADINGS,
  SKILL_CATALOG_ERROR_MESSAGES,
} from './constants.ts';
import type { ISkillDocument, ISkillKind } from './types.ts';

// a link to a heading anchor, which a self-contained skill never needs
const SECTION_LINK_PATTERN = /\]\(#[^)]*\)/u;

// a skill name written with a slash-command or mention prefix, but not a path such as skills/jg-x
const PREFIXED_SKILL_REFERENCE_PATTERN = /(?:^|[\s`('"])([/$]jg-[a-z0-9-]+)/mu;

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
 * Extracts the text of one level-two section from a skill body.
 * @param body The SKILL.md body without its frontmatter.
 * @param heading The section heading, without the leading `## `.
 * @returns The lines between the heading and the next level-two heading, trimmed at the end, or
 * undefined when the section is missing.
 */
export const extractSection = (body: string, heading: string): string | undefined => {
  const lines = body.replaceAll('\r\n', '\n').split('\n');
  const start = lines.indexOf(`## ${heading}`);

  if (start === -1) {
    return undefined;
  }

  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));

  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trimEnd();
};

/**
 * Sets aside the lines a skill may change in its shared section: an implicit skill's area sentence
 * and version bullet. An explicit skill's section is compared exactly.
 * @param kind The skill's kind.
 * @param section The text of the skill's shared section.
 * @returns The section with its changeable lines replaced by fixed placeholders.
 */
const normalizeSharedSection = (kind: ISkillKind, section: string): string =>
  kind === 'explicit'
    ? section
    : section
        .split('\n')
        .map((line) => {
          if (line.startsWith(APPLICATION_AREA_PREFIX)) {
            return '<area>';
          }

          return line.startsWith('- ') && line.includes(APPLICATION_VERSION_MARKER)
            ? '- <version>'
            : line;
        })
        .join('\n');

/**
 * Asserts that every skill of a kind carries the same shared section: `## Invocation` for explicit
 * skills and `## Application` for implicit ones, apart from the two lines an implicit skill may
 * change. The skills that differ from the most common version, or lack the section, are named.
 * @param skills The name, kind, and SKILL.md body of every skill.
 * @throws
 * - Skill shared section differs from the other skills of its kind
 */
export const assertSharedSections = (skills: readonly ISkillDocument[]): void => {
  const differing = (['explicit', 'implicit'] as const).flatMap((kind) => {
    const sections = skills
      .filter((skill) => skill.kind === kind)
      .map(({ body, name }) => {
        const section = extractSection(body, SHARED_SECTION_HEADINGS[kind]);

        return {
          name,
          normalized: section === undefined ? undefined : normalizeSharedSection(kind, section),
        };
      });
    const counts = new Map<string, number>();

    sections.forEach(({ normalized }) => {
      if (normalized !== undefined) {
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      }
    });

    const reference = [...counts.entries()].toSorted(
      (first, second) => second[1] - first[1],
    )[0]?.[0];

    return sections
      .filter(({ normalized }) => normalized === undefined || normalized !== reference)
      .map(({ name }) => name);
  });

  if (differing.length > 0) {
    throw new Error(
      `${SKILL_CATALOG_ERROR_MESSAGES.SharedSectionMismatch}: ${differing.toSorted().join(', ')}`,
    );
  }
};

/**
 * Asserts that an implicit skill states the versions it was written for in its Application
 * section.
 * @param skill The skill's name, kind, and SKILL.md body.
 * @throws
 * - Implicit skill has no version line
 */
export const assertVersionLine = ({ body, kind, name }: ISkillDocument): void => {
  if (kind === 'explicit') {
    return;
  }

  const section = extractSection(body, SHARED_SECTION_HEADINGS.implicit) ?? '';
  const hasVersionLine = section
    .split('\n')
    .some((line) => line.startsWith('- ') && line.includes(APPLICATION_VERSION_MARKER));

  if (!hasVersionLine) {
    throw new Error(`${SKILL_CATALOG_ERROR_MESSAGES.MissingVersionLine}: ${name}`);
  }
};

/**
 * Asserts that a skill never links to a heading anchor, because skills are self-contained and must
 * not depend on the sections of a particular instructions file.
 * @param skill The skill's name and SKILL.md body.
 * @throws
 * - Skill links to a section of another document
 */
export const assertNoSectionLinks = ({
  body,
  name,
}: Pick<ISkillDocument, 'body' | 'name'>): void => {
  const match = SECTION_LINK_PATTERN.exec(body);

  if (match) {
    throw new Error(`${SKILL_CATALOG_ERROR_MESSAGES.SectionLink}: ${name} (${match[0]})`);
  }
};

/**
 * Asserts that a skill names other skills bare, such as jg-plan, never as a host command like
 * /jg-plan or $jg-plan, so the same text works in every agent.
 * @param skill The skill's name and SKILL.md body.
 * @throws
 * - Skill refers to another skill with a / or $ prefix
 */
export const assertBareSkillReferences = ({
  body,
  name,
}: Pick<ISkillDocument, 'body' | 'name'>): void => {
  const match = PREFIXED_SKILL_REFERENCE_PATTERN.exec(body);

  if (match) {
    throw new Error(
      `${SKILL_CATALOG_ERROR_MESSAGES.PrefixedSkillReference}: ${name} (${match[1]})`,
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
