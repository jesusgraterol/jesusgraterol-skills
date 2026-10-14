import { z } from 'astro/zod';

// closed SKILL.md frontmatter contract; a new key must be a deliberate site change
export const SkillFrontmatterSchema = z.strictObject({
  'argument-hint': z.string().min(1).optional(),
  description: z.string().min(1).max(1024),
  'disable-model-invocation': z.literal(true),
  name: z.string().regex(/^jg-[a-z0-9]+(?:-[a-z0-9]+)*$/u),
});
