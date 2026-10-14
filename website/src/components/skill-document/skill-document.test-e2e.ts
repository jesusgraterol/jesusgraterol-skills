import { expect, test } from '@playwright/test';

import { SKILL_CATALOG } from '../../site.config.ts';

test.describe('skill pages', () => {
  for (const [name, { example }] of Object.entries(SKILL_CATALOG)) {
    test(`/skills/${name}/ renders its instructions, both invocations, and its source`, async ({
      page,
    }) => {
      await page.goto(`/skills/${name}/`);

      await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();

      const instructions = page.locator('[data-skill-instructions]');

      await expect(
        instructions.getByRole('heading', { level: 2, name: 'Invocation' }),
      ).toBeVisible();
      await expect(instructions.getByRole('heading', { level: 2, name: 'Workflow' })).toBeVisible();
      await expect(instructions).toContainText(
        'This skill runs only when the developer invokes it.',
      );

      await expect(page.locator(`#${name}-example-claude-code`)).toHaveText(
        `/${example.invocation}`,
      );
      await expect(page.locator(`#${name}-example-codex`)).toHaveText(`$${example.invocation}`);
      await expect(page.getByText(example.outcome)).toBeVisible();

      await expect(page.getByRole('link', { name: 'View SKILL.md on GitHub' })).toHaveAttribute(
        'href',
        `https://github.com/jesusgraterol/jesusgraterol-skills/blob/main/skills/${name}/SKILL.md`,
      );
      await expect(page.getByRole('link', { name: 'All skills' })).toHaveAttribute(
        'href',
        '/#skills',
      );
    });
  }
});
