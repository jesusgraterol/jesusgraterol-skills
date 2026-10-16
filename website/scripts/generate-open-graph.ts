import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

import { SKILL_CATALOG } from '../src/site.config.ts';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const templatePath = resolve(scriptDirectory, 'open-graph-template.html');
const outputPath = resolve(scriptDirectory, '../public/og/jg-skills.png');
// the explicit skills in catalog order, which the image lists as the workflow's commands
const EXPLICIT_SKILL_NAMES = Object.entries(SKILL_CATALOG)
  .filter(([, entry]) => entry.kind === 'explicit')
  .toSorted(([, first], [, second]) => first.order - second.order)
  .map(([name]) => name);

/** Generates the deterministic 1200 by 630 social image from the branded HTML template. */
const generateOpenGraphImage = async (): Promise<void> => {
  await mkdir(dirname(outputPath), { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

    await page.goto(pathToFileURL(templatePath).toString());
    await page.evaluate((names) => {
      document.querySelector('.session-list')?.replaceChildren(
        ...names.map((name) => {
          const item = document.createElement('li');
          const prefix = document.createElement('span');

          prefix.textContent = '/';
          item.append(prefix, name);

          return item;
        }),
      );
    }, EXPLICIT_SKILL_NAMES);
    await page.evaluate(async () => document.fonts.ready);
    await page.locator('.canvas').screenshot({ path: outputPath });
  } finally {
    await browser.close();
  }
};

await generateOpenGraphImage();
