// @vitest-environment node
import { describe, expect, test } from 'vitest';

import {
  assertCatalogCoverage,
  assertExplicitOnlyPolicy,
  assertSearchMetadata,
  assertSkillName,
  buildSourceUrl,
} from './utilities.ts';

describe('assertSkillName', () => {
  test('accepts a frontmatter name equal to its directory', () => {
    expect(() => assertSkillName('jg-plan', 'jg-plan')).not.toThrow();
  });

  test.each([
    ['jg-plan', 'jg-planner'],
    ['jg-plan', 'JG-PLAN'],
    ['jg-plan', ''],
  ])('assertSkillName(%s, %s) -> throws', (directoryName, frontmatterName) => {
    expect(() => assertSkillName(directoryName, frontmatterName)).toThrow(
      `Skill name does not match its directory: ${directoryName}`,
    );
  });
});

describe('assertExplicitOnlyPolicy', () => {
  test.each([
    ['LF line endings', 'policy:\n  allow_implicit_invocation: false\n'],
    [
      'CRLF line endings from a Windows checkout',
      'policy:\r\n  allow_implicit_invocation: false\r\n',
    ],
  ])('accepts the explicit-only policy with %s', (_caseName, policyText) => {
    expect(() => assertExplicitOnlyPolicy('jg-push', policyText)).not.toThrow();
  });

  test.each([
    ['implicit invocation allowed', 'policy:\n  allow_implicit_invocation: true\n'],
    ['the policy key missing', 'interface:\n  display_name: jg-push\n'],
    ['an empty file', ''],
    [
      'extra settings beside the policy',
      'policy:\n  allow_implicit_invocation: false\ninterface:\n  display_name: jg-push\n',
    ],
  ])('rejects a policy with %s', (_caseName, policyText) => {
    expect(() => assertExplicitOnlyPolicy('jg-push', policyText)).toThrow(
      'Skill does not ship the explicit-only Codex policy: jg-push',
    );
  });
});

describe('assertSearchMetadata', () => {
  const description = 'A search description that is long enough to describe the skill properly.';

  test('accepts a title that leads with the skill name and fits both limits', () => {
    expect(() =>
      assertSearchMetadata('jg-plan', 'jg-plan: Implementation plans', description),
    ).not.toThrow();
  });

  test.each([
    ['a title without the skill name', 'Implementation plans with jg-plan', description],
    ['a 61-character title', `jg-plan: ${'x'.repeat(52)}`, description],
    ['a 69-character description', 'jg-plan: Plans', 'x'.repeat(69)],
    ['a 161-character description', 'jg-plan: Plans', 'x'.repeat(161)],
  ])('assertSearchMetadata(%s) -> throws', (_caseName, searchTitle, searchDescription) => {
    expect(() => assertSearchMetadata('jg-plan', searchTitle, searchDescription)).toThrow(
      'Skill search metadata is outside its limits: jg-plan',
    );
  });

  test('accepts the exact boundary lengths', () => {
    expect(() =>
      assertSearchMetadata('jg-plan', `jg-plan: ${'x'.repeat(51)}`, 'x'.repeat(70)),
    ).not.toThrow();
    expect(() => assertSearchMetadata('jg-plan', 'jg-plan: Plans', 'x'.repeat(160))).not.toThrow();
  });
});

describe('assertCatalogCoverage', () => {
  test('accepts the same names in any order', () => {
    expect(() =>
      assertCatalogCoverage(
        ['jg-plan', 'jg-push', 'jg-review'],
        ['jg-review', 'jg-plan', 'jg-push'],
      ),
    ).not.toThrow();
  });

  test.each([
    [
      'a skill folder without a catalog entry',
      ['jg-plan', 'jg-push'],
      ['jg-plan'],
      'Skill catalog does not match the skill folders: missing from catalog [jg-push], missing from skills []',
    ],
    [
      'a catalog entry without a skill folder',
      ['jg-plan'],
      ['jg-plan', 'jg-push'],
      'Skill catalog does not match the skill folders: missing from catalog [], missing from skills [jg-push]',
    ],
    [
      'drift in both directions',
      ['jg-plan', 'jg-session', 'jg-feedback'],
      ['jg-plan', 'jg-review', 'jg-push'],
      'Skill catalog does not match the skill folders: missing from catalog [jg-feedback, jg-session], missing from skills [jg-push, jg-review]',
    ],
    [
      'an empty skills directory',
      [],
      ['jg-plan'],
      'Skill catalog does not match the skill folders: missing from catalog [], missing from skills [jg-plan]',
    ],
  ])('assertCatalogCoverage(%s) -> throws', (_caseName, skillNames, catalogNames, message) => {
    expect(() => assertCatalogCoverage(skillNames, catalogNames)).toThrow(message);
  });
});

describe('buildSourceUrl', () => {
  test('points at the skill instructions on the main branch', () => {
    expect(buildSourceUrl('jg-push')).toBe(
      'https://github.com/jesusgraterol/jg-skills/blob/main/skills/jg-push/SKILL.md',
    );
  });
});
