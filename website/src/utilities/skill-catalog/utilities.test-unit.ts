// @vitest-environment node
import { describe, expect, test } from 'vitest';

import {
  assertCatalogCoverage,
  assertExplicitOnlyPolicy,
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
      'https://github.com/jesusgraterol/jesusgraterol-skills/blob/main/skills/jg-push/SKILL.md',
    );
  });
});
