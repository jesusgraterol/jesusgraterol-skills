import { expect, test } from '@playwright/test';

test.describe('session demo', () => {
  test('shows a terminal session that discusses, plans, reviews, and pushes a change', async ({
    page,
  }) => {
    await page.goto('/');

    const demo = page.locator('[data-session-demo]');

    await expect(demo.locator('[data-terminal]')).toBeVisible();
    await expect(demo.locator('[data-session-line="shell"]')).toContainText('claude');
    await expect(demo.locator('[data-session-line="you"]')).toContainText([
      "Let's rate-limit the public API per account.",
      '/jg-plan',
      '/jg-review',
      '/jg-push',
    ]);
    await expect(demo.locator('[data-session-line="agent"]')).toHaveCount(4);
  });

  test('labels every line for assistive technology without reading the prompt glyphs', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByRole('list', { name: 'Example session with a coding agent' }))
      .toMatchAriaSnapshot(`
      - list "Example session with a coding agent":
        - listitem: "Shell: claude"
        - listitem: "You: Let's rate-limit the public API per account."
        - listitem: "Agent: Agreed. A sliding window per account in Redis fits your middleware."
        - listitem: "You: /jg-plan"
        - listitem: "Agent: Plan saved. Approve it to start building."
        - listitem: "You: /jg-review"
        - listitem: "Agent: Ready to commit"
        - listitem: "You: /jg-push"
        - listitem: "Agent: Pushed to main"
    `);
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
