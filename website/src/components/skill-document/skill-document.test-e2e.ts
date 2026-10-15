import { expect, test } from '@playwright/test';

import { SKILL_CATALOG } from '../../site.config.ts';

// skill names in the catalog order the previous and next links follow
const ORDERED_NAMES = Object.entries(SKILL_CATALOG)
  .toSorted(([, first], [, second]) => first.order - second.order)
  .map(([name]) => name);

test.describe('skill pages', () => {
  for (const [name, { example, whenToUse }] of Object.entries(SKILL_CATALOG)) {
    test(`/skills/${name}/ renders its instructions, its example, and its source`, async ({
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

      await expect(page.locator('[data-skill-usage]')).toHaveText(
        new RegExp(`^/${name}( (\\[|<).+)?$`, 'u'),
      );
      await expect(page.locator(`#${name}-invocation`)).toHaveText(`/${example.invocation}`);
      await expect(page.locator('[data-skill-outcome]')).toHaveText(example.outcome);
      await expect(page.getByRole('heading', { level: 2, name: 'When to use it' })).toBeVisible();
      await expect(page.locator('[data-skill-when-to-use]')).toHaveText(whenToUse);

      const position = ORDERED_NAMES.indexOf(name);
      const pager = page.getByRole('navigation', { name: 'Previous and next skills' });

      for (const [rel, neighbor] of [
        ['prev', ORDERED_NAMES[position - 1]],
        ['next', ORDERED_NAMES[position + 1]],
      ] as const) {
        const link = pager.locator(`a[rel="${rel}"]`);

        if (neighbor) {
          await expect(link).toHaveAttribute('href', `/skills/${neighbor}/`);
          await expect(link).toContainText(neighbor);
        } else {
          await expect(link).toHaveCount(0);
        }
      }

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

  test('shows the usage line with and without an argument hint', async ({ page }) => {
    await page.goto('/skills/jg-pause/');
    await expect(page.locator('[data-skill-usage]')).toHaveText('/jg-pause');

    await page.goto('/skills/jg-execute/');
    await expect(page.locator('[data-skill-usage]')).toHaveText(
      '/jg-execute [autonomous] [plan-path] [milestone N]',
    );
  });
});
