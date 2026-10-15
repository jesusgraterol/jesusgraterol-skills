import { expect, test } from '@playwright/test';

import { SKILL_CATALOG } from '../../site.config.ts';

test.describe('skill card', () => {
  test("shows each skill's icon before its name, hidden from assistive technology", async ({
    page,
  }) => {
    await page.goto('/');

    for (const [name, { icon }] of Object.entries(SKILL_CATALOG)) {
      const card = page
        .locator('[data-skill-card]')
        .filter({ has: page.getByRole('link', { name, exact: true }) });
      const tile = card.locator('[data-skill-icon]');

      await expect(tile).toHaveAttribute('data-skill-icon', icon);
      await expect(tile).toHaveAttribute('aria-hidden', 'true');
      // a Lucide icon carries its name as a class; a technology mark carries its slug
      await expect(
        tile.locator(`svg.lucide-${icon}, svg[data-skill-brand-mark="${icon}"]`),
      ).toHaveCount(1);
    }
  });

  // the narrowest cards: one column at 320 pixels, and two columns just past the sm breakpoint
  for (const width of [320, 640]) {
    test(`keeps every badge under the skill name on one line at ${width} pixels`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 720 });
      await page.goto('/');
      // measure with the self-hosted font, not a fallback
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      const badges = page.locator('[data-skill-badge]');

      await expect(badges).toHaveCount(Object.keys(SKILL_CATALOG).length);

      const wrapped = await badges.evaluateAll((elements) =>
        elements
          .filter(
            (element) =>
              element.getBoundingClientRect().height >=
              2 * Number.parseFloat(getComputedStyle(element).lineHeight),
          )
          .map((element) => element.textContent?.trim()),
      );

      expect(wrapped).toStrictEqual([]);
    });
  }

  for (const theme of ['light', 'dark'] as const) {
    test(`shows a visible focus ring when reached by keyboard in the ${theme} theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/');

      const link = page.getByRole('link', { name: 'jg-plan', exact: true });
      const card = page.locator('[data-skill-card]').filter({ has: link });

      await link.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(link).toBeFocused();

      const outline = await card.evaluate((element) => {
        const style = getComputedStyle(element);

        return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
      });

      expect(outline.style).not.toBe('none');
      expect(outline.width).toBeGreaterThanOrEqual(2);
    });
  }

  test('leaves the card without an outline when it is not focused', async ({ page }) => {
    await page.goto('/');

    const card = page
      .locator('[data-skill-card]')
      .filter({ has: page.getByRole('link', { name: 'jg-plan', exact: true }) });

    expect(await card.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('none');
  });
});
