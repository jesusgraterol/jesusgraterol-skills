// @vitest-environment node
import { describe, expect, test } from 'vitest';

import { buildLlmsText } from './llms-text.ts';

describe('buildLlmsText', () => {
  test('builds the required llms.txt structure with the install command and ordered skills', () => {
    const text = buildLlmsText([
      {
        description: 'Create or revise a plan.\nSave it for approval.',
        name: 'jg-plan',
      },
      {
        description: 'Review the uncommitted change.',
        name: 'jg-[review]',
      },
    ]);

    expect(text).toMatch(/^# JG Skills\n\n> .+\n/u);
    expect(text).toContain(
      '## Install\n\n```bash\nnpx skills add jesusgraterol/jesusgraterol-skills --skill "*" -y\n```\n',
    );
    expect(text).toContain(
      '- [jg-plan](https://jg-skills.jesusgraterol.dev/skills/jg-plan/): Create or revise a plan. Save it for approval.',
    );
    expect(text).toContain(
      '- [jg-\\[review\\]](https://jg-skills.jesusgraterol.dev/skills/jg-[review]/): Review the uncommitted change.',
    );
    expect(text.indexOf('/skills/jg-plan/')).toBeLessThan(text.indexOf('/skills/jg-[review]/'));
    expect(text).toMatch(/\n## Optional\n/u);
    expect(text.endsWith('\n')).toBe(true);
  });

  test('keeps the required sections when no skills are published', () => {
    const text = buildLlmsText([]);

    expect(text).toContain('\n## Skills\n\n\n## Optional\n');
  });
});
