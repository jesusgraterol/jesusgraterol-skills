import { SITE_CONFIG } from '../../site.config.ts';

import type { ILlmsSkill } from './types.ts';

/** Escapes text used as a Markdown link label. */
const escapeMarkdownLabel = (label: string): string =>
  label.replaceAll('\\', '\\\\').replaceAll('[', '\\[').replaceAll(']', '\\]');

/** Collapses prose into one concise line for a Markdown list. */
const normalizeDescription = (description: string): string =>
  description.replaceAll(/\s+/gu, ' ').trim();

/**
 * Builds the canonical LLM-readable index from the current skills.
 * @param skills The published skills in catalog order.
 * @returns The llms.txt document.
 */
export const buildLlmsText = (skills: readonly ILlmsSkill[]): string => {
  const skillLinks = skills.map(
    ({ description, name }) =>
      `- [${escapeMarkdownLabel(name)}](${SITE_CONFIG.url}/skills/${name}/): ${normalizeDescription(description)}`,
  );

  return [
    `# ${SITE_CONFIG.name}`,
    '',
    `> ${SITE_CONFIG.defaultDescription}`,
    '',
    'Every skill runs only when the developer invokes it by name: `/jg-plan` in Claude Code or `$jg-plan` in Codex. Each skill defers general engineering standards to the coding instructions of the repository it runs in.',
    '',
    '## Install',
    '',
    '```bash',
    SITE_CONFIG.commands.install,
    '```',
    '',
    '## Skills',
    '',
    ...skillLinks,
    '',
    '## Optional',
    '',
    `- [Source repository](${SITE_CONFIG.repositoryUrl}): The skill folders, this website, and the issue tracker.`,
    `- [Agentic Coding](${SITE_CONFIG.agenticCodingUrl}): The engineering approach these skills put into practice.`,
    `- [Author](${SITE_CONFIG.author.url}): More work by ${SITE_CONFIG.author.name}.`,
    '',
  ].join('\n');
};
