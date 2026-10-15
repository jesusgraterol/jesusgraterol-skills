import type { ISkillCatalogEntry } from './utilities/skill-catalog/index.ts';

// a plan path in the layout jg-plan writes, shared by the examples that name a plan
const EXAMPLE_PLAN_PATH = 'coding-agent-planning/1787592334_sign-in-flow/plan.md';

/*
 * Site-owned presentation data for every skill under ../skills. Names, descriptions,
 * argument hints, and instructions come from each SKILL.md; the build fails when this
 * catalog and the skill folders disagree.
 */
export const SKILL_CATALOG = {
  'jg-brainstorm': {
    access: 'read-only',
    examples: [
      {
        invocation: 'jg-brainstorm Should we rate-limit the public API per account?',
        outcome:
          'Weighs the options against your codebase, recommends a direction, and lists what is still open.',
      },
    ],
    order: 1,
    searchDescription:
      'An explicit-only agent skill for Claude Code and Codex that weighs options against your codebase and recommends a direction before you plan.',
    searchTitle: 'jg-brainstorm: Brainstorm ideas with Claude Code and Codex',
    stage: 'plan',
    whenToUse:
      'Use it when you have an idea or a question and want to settle the approach before writing a plan.',
  },
  'jg-plan': {
    access: 'planning-files',
    examples: [
      {
        invocation: 'jg-plan',
        outcome:
          'Asks about any decision that is yours to make, turns the change you discussed into an implementation-ready plan under coding-agent-planning/, and stops for your approval.',
      },
    ],
    order: 2,
    searchDescription:
      'An explicit-only agent skill that turns the change you discussed with Claude Code or Codex into an implementation-ready plan you approve.',
    searchTitle: 'jg-plan: Implementation plans for Claude Code and Codex',
    stage: 'plan',
    whenToUse:
      'Use it once a change is agreed in conversation and you want a reviewable plan before any code changes.',
  },
  'jg-challenge-plan': {
    access: 'read-only',
    examples: [
      {
        invocation: 'jg-challenge-plan',
        label: 'Current plan',
        outcome:
          'Returns a verdict, the corrections the plan needs, and numbered decisions in under 1,000 words.',
      },
      {
        invocation: `jg-challenge-plan ${EXAMPLE_PLAN_PATH}`,
        label: 'Named plan',
        outcome:
          'Challenges the plan at that path instead of the one in this conversation, with the same verdict, corrections, and decisions.',
      },
    ],
    order: 3,
    searchDescription:
      'An explicit-only agent skill for Claude Code and Codex that challenges a plan before approval and surfaces material risks, gaps, and decisions.',
    searchTitle: 'jg-challenge-plan: Challenge a plan before approval',
    stage: 'plan',
    whenToUse:
      'Use it on a plan you are about to approve, especially one that touches data, public contracts, or publishing.',
  },
  'jg-breakdown': {
    access: 'planning-files',
    examples: [
      {
        invocation: 'jg-breakdown',
        label: 'Current plan',
        outcome:
          'Writes milestones.md when the plan has real boundaries, or tells you to build it as one scope.',
      },
      {
        invocation: `jg-breakdown ${EXAMPLE_PLAN_PATH}`,
        label: 'Named plan',
        outcome:
          'Splits the plan at that path instead of the one in this conversation, writing milestones.md beside it.',
      },
    ],
    order: 4,
    searchDescription:
      'An explicit-only agent skill for Claude Code and Codex that splits a plan into ordered milestones you can build and review one at a time.',
    searchTitle: 'jg-breakdown: Split plans into reviewable milestones',
    stage: 'plan',
    whenToUse: 'Use it when a plan is too large to build and review as one change.',
  },
  'jg-execute': {
    access: 'changes-code-and-pushes',
    examples: [
      {
        invocation: 'jg-execute',
        label: 'Supervised',
        outcome:
          'Builds the next unfinished milestone of the current plan, runs its checks, and stops so you can review and push it.',
      },
      {
        invocation: 'jg-execute autonomous',
        label: 'Autonomous',
        outcome:
          'Builds each remaining milestone, reviews it until clean, and pushes it before starting the next.',
      },
      {
        invocation: `jg-execute ${EXAMPLE_PLAN_PATH}`,
        label: 'Named plan',
        outcome:
          'Builds the next unfinished milestone of the plan at that path instead of the one in this conversation.',
      },
      {
        invocation: 'jg-execute milestone 2',
        label: 'One milestone',
        outcome:
          'Builds only milestone 2, runs its checks, and stops so you can review and push it.',
      },
      {
        invocation: `jg-execute autonomous ${EXAMPLE_PLAN_PATH} milestone 3`,
        label: 'All options',
        outcome:
          'Builds milestone 3 of the plan at that path, reviews it until clean, pushes it, and stops.',
      },
    ],
    order: 5,
    searchDescription:
      "An explicit-only agent skill for Claude Code and Codex that builds a plan's milestones, supervised by default or autonomously with review and push.",
    searchTitle: 'jg-execute: Build plans supervised or autonomously',
    stage: 'build',
    whenToUse:
      'Use it once a plan is approved: on its own to build the next milestone and stop, or with autonomous to build, review, and push every remaining milestone.',
  },
  'jg-debug': {
    access: 'changes-code',
    examples: [
      {
        invocation: 'jg-debug Checkout totals are off by one cent for some carts.',
        outcome:
          'Reproduces the bug, narrows it to one cause, and fixes it with a regression test that failed first.',
      },
    ],
    order: 6,
    searchDescription:
      'An explicit-only agent skill for Claude Code and Codex that reproduces a bug, finds its cause, and fixes it with a test that fails first.',
    searchTitle: "jg-debug: Find a bug's cause before fixing it",
    stage: 'build',
    whenToUse: "Use it when something is broken and the cause isn't obvious yet.",
  },
  'jg-pause': {
    access: 'read-only',
    examples: [
      {
        invocation: 'jg-pause',
        outcome:
          'Stops at the next safe point, lists what is done and what is half-finished, and waits until you say continue.',
      },
    ],
    order: 7,
    searchDescription:
      'An explicit-only agent skill for Claude Code and Codex that stops the agent at the nearest safe point, reports where things stand, and waits.',
    searchTitle: 'jg-pause: Pause a coding agent at a safe point',
    stage: 'build',
    whenToUse:
      'Use it when you need to step away or check something mid-task without leaving half-changed files unexplained.',
  },
  'jg-review': {
    access: 'read-only',
    examples: [
      {
        invocation: 'jg-review',
        label: 'Task changes',
        outcome:
          "Reviews the task's changes, and how they follow the plan when you are building one, then answers Ready to commit, Not ready, or Review incomplete.",
      },
      {
        invocation: 'jg-review main',
        label: 'Branch',
        outcome:
          'Reviews everything the current branch would merge into main and answers Ready to merge into main, Not ready, or Review incomplete.',
      },
    ],
    order: 8,
    searchDescription:
      "An explicit-only agent skill for Claude Code and Codex that reviews a task's changes against its plan, or a branch, and issues a readiness verdict.",
    searchTitle: 'jg-review: Code review for Claude Code and Codex',
    stage: 'ship',
    whenToUse:
      "Use it before committing a task's changes, or before merging a branch into its target.",
  },
  'jg-push': {
    access: 'commits-and-pushes',
    examples: [
      {
        invocation: 'jg-push',
        outcome:
          "Commits only this task's files with a signed-off, signed commit and pushes the current branch.",
      },
    ],
    order: 9,
    searchDescription:
      "An explicit-only agent skill for Claude Code and Codex that commits only the current task's files with a signed-off, signed commit and pushes.",
    searchTitle: 'jg-push: Signed commits and pushes for coding agents',
    stage: 'ship',
    whenToUse:
      'Use it when a reviewed change is ready to publish, even while other agents work in the same checkout.',
  },
  'jg-feedback': {
    access: 'read-only',
    examples: [
      {
        invocation: 'jg-feedback A reviewer says the retry loop can charge a customer twice.',
        outcome:
          'Checks each claim against the code and recommends what to adopt, reject, or adjust.',
      },
    ],
    order: 10,
    searchDescription:
      'An explicit-only agent skill for Claude Code and Codex that checks feedback against the evidence and recommends what to adopt, reject, or adjust.',
    searchTitle: 'jg-feedback: Assess review feedback with evidence',
    stage: 'context',
    whenToUse:
      'Use it when a reviewer, another agent, or a teammate sends claims you want checked before acting on them.',
  },
  'jg-session': {
    access: 'read-only',
    examples: [
      {
        invocation: 'jg-session rate-limiting What did that session decide about the limit store?',
        outcome:
          'Finds the named Codex or Claude Code session and answers from its latest decisions.',
      },
    ],
    order: 11,
    searchDescription:
      'An explicit-only agent skill that finds a named Claude Code or Codex session and answers questions from its latest decisions and state.',
    searchTitle: 'jg-session: Read past Claude Code and Codex sessions',
    stage: 'context',
    whenToUse: 'Use it when you need what another session decided without rereading it yourself.',
  },
} as const satisfies Record<string, ISkillCatalogEntry>;

// skill names in catalog order, used to build the remove command
const SKILL_NAMES = Object.keys(SKILL_CATALOG);

// canonical metadata, navigation, and commands for every generated page
export const SITE_CONFIG = {
  agenticCodingUrl: 'https://agenticcoding.jesusgraterol.dev/',
  author: {
    name: 'Jesus Graterol',
    // public profiles that identify the author to search engines
    sameAs: [
      'https://github.com/jesusgraterol',
      'https://www.linkedin.com/in/jesus-graterol',
      'https://x.com/jesus__graterol',
      'https://www.kaggle.com/jesusgraterol',
    ],
    twitterHandle: '@jesus__graterol',
    url: 'https://jesusgraterol.dev/',
  },
  // project-scoped commands, run from the repository root
  commands: {
    install: 'npx skills add jesusgraterol/jg-skills --skill "*" -y',
    remove: `npx skills remove ${SKILL_NAMES.join(' ')}`,
    update: `npx skills update -p ${SKILL_NAMES.join(' ')}`,
  },
  defaultDescription:
    'Battle-tested agent skills for Claude Code, Codex, and other coding agents. Brainstorm, plan, build, review, and ship changes like professional developers.',
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
  repositoryUrl: 'https://github.com/jesusgraterol/jg-skills',
  themeColors: {
    dark: '#1e2939',
    light: '#fefdfb',
  },
  url: 'https://jg-skills.jesusgraterol.dev',
} as const;
