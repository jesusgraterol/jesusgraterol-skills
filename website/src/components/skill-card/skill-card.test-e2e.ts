import { expect, test } from '@playwright/test';

test.describe('skill card', () => {
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
