import { expect, test } from '@playwright/test';

import { SKILL_CATALOG } from '../../site.config.ts';

// skill names in the catalog order the previous and next links follow
const ORDERED_NAMES = Object.entries(SKILL_CATALOG)
  .toSorted(([, first], [, second]) => first.order - second.order)
  .map(([name]) => name);

test.describe('skill pages', () => {
  for (const [name, catalogEntry] of Object.entries(SKILL_CATALOG)) {
    test(`/skills/${name}/ renders its instructions, its examples, and its source`, async ({
      page,
    }) => {
      await page.goto(`/skills/${name}/`);

      await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();

      const instructions = page.locator('[data-skill-instructions]');

      if (catalogEntry.kind === 'explicit') {
        await expect(
          instructions.getByRole('heading', { level: 2, name: 'Invocation' }),
        ).toBeVisible();
        await expect(
          instructions.getByRole('heading', { level: 2, name: 'Workflow' }),
        ).toBeVisible();
        await expect(instructions).toContainText(
          'This skill runs only when the developer invokes it.',
        );

        await expect(page.locator('[data-skill-usage]')).toHaveText(
          new RegExp(`^/${name}( (\\[|<).+)?$`, 'u'),
        );
        // exact text, because the copy buttons copy it verbatim
        expect(
          await page
            .locator('[data-skill-invocation]')
            .evaluateAll((elements) => elements.map((element) => element.textContent)),
        ).toEqual(catalogEntry.examples.map(({ invocation }) => `/${invocation}`));
        await expect(page.locator('[data-skill-outcome]')).toHaveText(
          catalogEntry.examples.map(({ outcome }) => outcome),
        );
      } else {
        await expect(
          instructions.getByRole('heading', { level: 2, name: 'Application' }),
        ).toBeVisible();
        await expect(instructions).toContainText(
          'The agent loads this skill on its own when a task touches its area.',
        );

        await expect(page.locator('[data-skill-usage]')).toHaveText('Loads automatically');
        // the page opens with the card's summary, not the agent-facing trigger list
        await expect(page.locator('[data-skill-lede]')).toHaveText(catalogEntry.summary);
        await expect(page.getByText('May change', { exact: true })).toHaveCount(0);
        await expect(page.getByRole('heading', { level: 2, name: 'When it loads' })).toBeVisible();
        // exact text, because the copy buttons copy it verbatim
        expect(
          await page
            .locator('[data-skill-request]')
            .evaluateAll((elements) => elements.map((element) => element.textContent)),
        ).toEqual(catalogEntry.examples.map(({ request }) => request));
        await expect(page.locator('[data-skill-outcome]')).toHaveText(
          catalogEntry.examples.map(({ outcome }) => outcome),
        );
      }
      await expect(page.getByRole('heading', { level: 2, name: 'When to use it' })).toBeVisible();
      await expect(page.locator('[data-skill-when-to-use]')).toHaveText(catalogEntry.whenToUse);

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
        `https://github.com/jesusgraterol/jg-skills/blob/main/skills/${name}/SKILL.md`,
      );
      await expect(page.getByRole('link', { name: 'All skills' })).toHaveAttribute(
        'href',
        '/#skills',
      );
    });
  }

  test('labels one example per supported case, each with its own copy button', async ({ page }) => {
    await page.goto('/skills/jg-execute/');
    await expect(page.getByRole('heading', { level: 2, name: 'Examples' })).toBeVisible();
    await expect(
      page.getByText('it should consider. Each example shows one supported case.'),
    ).toBeVisible();

    for (const [index, { label }] of SKILL_CATALOG['jg-execute'].examples.entries()) {
      const sourceId = `jg-execute-invocation-${index + 1}`;
      const terminal = page
        .locator('[data-terminal]')
        .filter({ has: page.locator(`#${sourceId}`) });

      await expect(terminal.locator('figcaption')).toContainText(label);
      await expect(page.locator(`button[data-copy-source="${sourceId}"]`)).toHaveAccessibleName(
        `Copy ${label.toLowerCase()} invocation`,
      );
    }

    await page.goto('/skills/jg-pause/');
    await expect(
      page.getByRole('heading', { exact: true, level: 2, name: 'Example' }),
    ).toBeVisible();
    await expect(page.locator('[data-terminal] figcaption')).toContainText('Example');
    await expect(page.getByText('Each example shows one supported case.')).toHaveCount(0);
  });

  test('shows the usage line with and without an argument hint', async ({ page }) => {
    await page.goto('/skills/jg-pause/');
    await expect(page.locator('[data-skill-usage]')).toHaveText('/jg-pause');

    await page.goto('/skills/jg-execute/');
    await expect(page.locator('[data-skill-usage]')).toHaveText(
      '/jg-execute [auto] [plan-path] [milestone N]',
    );
  });
});
