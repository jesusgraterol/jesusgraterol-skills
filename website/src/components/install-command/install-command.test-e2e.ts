import { expect, test } from '@playwright/test';

import { SITE_CONFIG } from '../../site.config.ts';

test.describe('install command', () => {
  test('renders each command exactly, with no extra whitespace', async ({ page }) => {
    await page.goto('/');

    for (const [id, command] of [
      ['hero-install-command', SITE_CONFIG.commands.install],
      ['install-command', SITE_CONFIG.commands.install],
      ['update-command', SITE_CONFIG.commands.update],
      ['remove-command', SITE_CONFIG.commands.remove],
    ] as const) {
      expect(await page.locator(`#${id}`).evaluate((element) => element.textContent)).toBe(command);
    }
  });

  test('names each copy button after the command it copies', async ({ page }) => {
    await page.goto('/');

    for (const [sourceId, name] of [
      ['hero-install-command', 'Copy install all seven command'],
      ['install-command', 'Copy install command'],
      ['update-command', 'Copy update command'],
      ['remove-command', 'Copy remove command'],
    ] as const) {
      await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
        'data-copy-source',
        sourceId,
      );
    }

    await page.goto('/skills/jg-plan/');

    await expect(
      page.getByRole('button', { name: 'Copy Claude Code invocation', exact: true }),
    ).toHaveAttribute('data-copy-source', 'jg-plan-example-claude-code');
    await expect(
      page.getByRole('button', { name: 'Copy Codex invocation', exact: true }),
    ).toHaveAttribute('data-copy-source', 'jg-plan-example-codex');
  });

  test('copy writes the exact command and announces success', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    const copyControl = page.locator('button[data-copy-source="hero-install-command"]');

    await copyControl.click();

    await expect(copyControl).toHaveAttribute('data-copy-state', 'success');
    await expect(copyControl).toContainText('Copied');
    await expect(page.locator('#hero-install-command-copy-status')).toHaveText(
      'Copied to clipboard.',
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      SITE_CONFIG.commands.install,
    );
  });

  test('copy reports a useful failure when the clipboard is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    });
    await page.goto('/');

    const copyControl = page.locator('button[data-copy-source="remove-command"]');

    await copyControl.click();

    await expect(copyControl).toHaveAttribute('data-copy-state', 'error');
    await expect(copyControl).toContainText('Copy failed');
    await expect(page.locator('#remove-command-copy-status')).toHaveText(
      'Copy failed. Select the command and copy it manually.',
    );
  });
});
