import { expect, test } from '@playwright/test';

import { SKILL_CATALOG } from '../../site.config.ts';

const PLAN_INVOCATION = SKILL_CATALOG['jg-plan'].example.invocation;
const CHALLENGE_INVOCATION = SKILL_CATALOG['jg-challenge-plan'].example.invocation;

test.describe('session demo', () => {
  test('shows Claude Code invocations by default', async ({ page }) => {
    await page.goto('/');

    const demo = page.locator('[data-session-demo]');
    const invocations = demo.locator('[data-session-demo-invocation]');

    await expect(demo.getByRole('radio', { name: 'Claude Code' })).toBeChecked();
    await expect(demo.locator('[data-session-demo-title]')).toHaveText('Claude Code', {
      useInnerText: true,
    });
    await expect(invocations).toHaveText([`/${PLAN_INVOCATION}`, `/${CHALLENGE_INVOCATION}`], {
      useInnerText: true,
    });
  });

  test('switches to Codex invocations with the keyboard', async ({ page }) => {
    await page.goto('/');

    const demo = page.locator('[data-session-demo]');

    await demo.getByRole('radio', { name: 'Claude Code' }).focus();
    await page.keyboard.press('ArrowRight');

    await expect(demo.getByRole('radio', { name: 'Codex' })).toBeChecked();
    await expect(demo.locator('[data-session-demo-title]')).toHaveText('Codex', {
      useInnerText: true,
    });
    await expect(demo.locator('[data-session-demo-invocation]')).toHaveText(
      [`$${PLAN_INVOCATION}`, `$${CHALLENGE_INVOCATION}`],
      { useInnerText: true },
    );
  });

  test('exposes only the selected agent prefix to assistive technology', async ({ page }) => {
    await page.goto('/');

    const firstInvocation = page.locator('[data-session-demo-invocation]').first();

    await expect(firstInvocation).toMatchAriaSnapshot(`- paragraph: /${PLAN_INVOCATION}`);

    await page.locator('[data-session-demo]').locator('label').filter({ hasText: 'Codex' }).click();

    await expect(firstInvocation).toMatchAriaSnapshot(`- paragraph: $${PLAN_INVOCATION}`);
  });

  test('keeps the session readable without horizontal overflow at 320 pixels', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto('/');

    const overflow = await page
      .locator('[data-session-demo]')
      .evaluate((element) => element.scrollWidth - element.clientWidth);

    expect(overflow).toBeLessThanOrEqual(0);
  });
});
