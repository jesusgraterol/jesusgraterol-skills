// @vitest-environment node
import { describe, expect, test } from 'vitest';

import { SkillFrontmatterSchema } from './types.ts';

// frontmatter of a valid explicit-only skill
const VALID_FRONTMATTER = {
  'argument-hint': '[task or amendments]',
  description: 'Create or revise an implementation-ready plan.',
  'disable-model-invocation': true,
  name: 'jg-plan',
};

describe('SkillFrontmatterSchema', () => {
  test('accepts explicit-only frontmatter with and without an argument hint', () => {
    expect(SkillFrontmatterSchema.parse(VALID_FRONTMATTER)).toStrictEqual(VALID_FRONTMATTER);

    const withoutArgumentHint = {
      description: VALID_FRONTMATTER.description,
      'disable-model-invocation': true,
      name: VALID_FRONTMATTER.name,
    };

    expect(SkillFrontmatterSchema.parse(withoutArgumentHint)).toStrictEqual(withoutArgumentHint);
  });

  test.each([
    ['model invocation enabled', { ...VALID_FRONTMATTER, 'disable-model-invocation': false }],
    [
      'the explicit-only flag missing',
      { ...VALID_FRONTMATTER, 'disable-model-invocation': undefined },
    ],
    ['an unknown key', { ...VALID_FRONTMATTER, 'user-invocable': true }],
    ['a name without the jg- prefix', { ...VALID_FRONTMATTER, name: 'plan' }],
    ['an uppercase name', { ...VALID_FRONTMATTER, name: 'jg-Plan' }],
    ['an empty description', { ...VALID_FRONTMATTER, description: '' }],
    ['a description over 1024 characters', { ...VALID_FRONTMATTER, description: 'a'.repeat(1025) }],
    ['an empty argument hint', { ...VALID_FRONTMATTER, 'argument-hint': '' }],
  ])('rejects frontmatter with %s', (_caseName, frontmatter) => {
    expect(SkillFrontmatterSchema.safeParse(frontmatter).success).toBe(false);
  });
});
