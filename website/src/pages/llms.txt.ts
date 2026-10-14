import type { APIRoute } from 'astro';

import { loadSkills } from '../utilities/skill-catalog/index.ts';
import { buildLlmsText } from '../utilities/llms-text/index.ts';

/**
 * Returns the curated LLM-readable index for the public website.
 * @returns A promise that resolves to the plain-text response.
 */
export const GET: APIRoute = async () => {
  const skills = await loadSkills();
  const text = buildLlmsText(skills.map(({ description, name }) => ({ description, name })));

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
