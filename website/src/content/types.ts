import { z } from 'astro/zod';

// closed SKILL.md frontmatter contract; a new key must be a deliberate site change
export const SkillFrontmatterSchema = z.strictObject({
  'argument-hint': z.string().min(1).optional(),
  description: z.string().min(1).max(1024),
  // explicit skills set it; implicit skills omit it so the agent may load them on their own
  'disable-model-invocation': z.literal(true).optional(),
  name: z.string().regex(/^jg-[a-z0-9]+(?:-[a-z0-9]+)*$/u),
});
