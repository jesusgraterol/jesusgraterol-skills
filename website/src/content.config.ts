import { posix } from 'node:path';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { SkillFrontmatterSchema } from './content/index.ts';

// every installable skill lives in the repository's skills directory, outside the website root
const skills = defineCollection({
  loader: glob({
    base: '../skills',
    generateId: ({ entry }) => posix.dirname(entry),
    pattern: '*/SKILL.md',
  }),
  schema: SkillFrontmatterSchema,
});

export const collections = { skills };
