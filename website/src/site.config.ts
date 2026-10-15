import type { ISkillCatalogEntry } from './utilities/skill-catalog/index.ts';

/*
 * Site-owned presentation data for every skill under ../skills. Names, descriptions,
 * argument hints, and instructions come from each SKILL.md; the build fails when this
 * catalog and the skill folders disagree.
 */
export const SKILL_CATALOG = {
  'jg-plan': {
    access: 'planning-files',
    example: {
      invocation: 'jg-plan',
      outcome:
        'Turns the change you just discussed into an implementation-ready plan, saves it under coding-agent-planning/, and stops for your approval.',
    },
    order: 1,
    stage: 'plan',
  },
  'jg-challenge-plan': {
    access: 'read-only',
    example: {
      invocation: 'jg-challenge-plan',
      outcome:
        'Returns a verdict, the corrections the plan needs, and numbered decisions in under 1,000 words.',
    },
    order: 2,
    stage: 'plan',
  },
  'jg-breakdown': {
    access: 'planning-files',
    example: {
      invocation: 'jg-breakdown',
      outcome:
        'Writes milestones.md when the plan has real boundaries, or tells you to build it as one scope.',
    },
    order: 3,
    stage: 'plan',
  },
  'jg-review': {
    access: 'read-only',
    example: {
      invocation: 'jg-review',
      outcome:
        'Reports findings first, then the checks it ran, and answers Ready to commit, Not ready, or Review incomplete.',
    },
    order: 4,
    stage: 'ship',
  },
  'jg-push': {
    access: 'commits-and-pushes',
    example: {
      invocation: 'jg-push',
      outcome:
        'Stages every change, creates one signed-off, signed commit, and pushes only the current branch.',
    },
    order: 5,
    stage: 'ship',
  },
  'jg-feedback': {
    access: 'read-only',
    example: {
      invocation: 'jg-feedback A reviewer says the retry loop can charge a customer twice.',
      outcome:
        'Checks each claim against the code and recommends what to adopt, reject, or adjust.',
    },
    order: 6,
    stage: 'context',
  },
  'jg-session': {
    access: 'read-only',
    example: {
      invocation: 'jg-session rate-limiting What did that session decide about the limit store?',
      outcome:
        'Finds the named Codex or Claude Code session and answers from its latest decisions.',
    },
    order: 7,
    stage: 'context',
  },
} as const satisfies Record<string, ISkillCatalogEntry>;

// skill names in catalog order, used to build the remove command
const SKILL_NAMES = Object.keys(SKILL_CATALOG);

// canonical metadata, navigation, and commands for every generated page
export const SITE_CONFIG = {
  agenticCodingUrl: 'https://agenticcoding.jesusgraterol.dev/',
  author: {
    name: 'Jesus Graterol',
    url: 'https://jesusgraterol.dev/',
  },
  // project-scoped commands, run from the repository root
  commands: {
    install: 'npx skills add jesusgraterol/jesusgraterol-skills --skill "*" -y',
    remove: `npx skills remove ${SKILL_NAMES.join(' ')}`,
    update: 'npx skills update -p',
  },
  defaultDescription:
    'Solid, battle-tested skills for planning, reviewing, and shipping changes with coding agents, used by professional software developers in their daily work.',
  language: 'en',
  license: 'MIT',
  name: 'JG Skills',
  navigation: [
    { href: '/#skills', label: 'Skills' },
    { href: '/#workflow', label: 'How it works' },
    { href: '/#install', label: 'Install' },
  ],
  openGraph: {
    height: 630,
    image: '/og/jg-skills.png',
    imageAlt: 'JG Skills: battle-tested skills for coding agents',
    imageType: 'image/png',
    locale: 'en_US',
    width: 1200,
  },
  repositoryUrl: 'https://github.com/jesusgraterol/jesusgraterol-skills',
  themeColors: {
    dark: '#1e2939',
    light: '#fefdfb',
  },
  url: 'https://jg-skills.jesusgraterol.dev',
} as const;
