import type { ISkillAccess, ISkillStage } from './types.ts';

// exact Codex policy an explicit skill ships so it is never invoked implicitly
export const EXPLICIT_ONLY_OPENAI_POLICY = 'policy:\n  allow_implicit_invocation: false\n';

// exact Codex policy an implicit skill ships so the agent may load it on its own
export const IMPLICIT_OPENAI_POLICY = 'policy:\n  allow_implicit_invocation: true\n';

// stable messages for skill contract violations that must fail the build
export const SKILL_CATALOG_ERROR_MESSAGES = {
  CatalogMismatch: 'Skill catalog does not match the skill folders',
  InvalidSearchMetadata: 'Skill search metadata is outside its limits',
  InvocationMismatch: 'Skill invocation settings do not match its catalog kind',
  NameMismatch: 'Skill name does not match its directory',
} as const;

// display copy for each workflow stage, in landing-page order
export const SKILL_STAGES = {
  plan: { label: 'Plan', summary: 'Agree on what to build before any code changes.' },
  build: { label: 'Build', summary: 'Turn the approved plan into verified code.' },
  ship: { label: 'Ship', summary: 'Check the finished change, then publish it.' },
  context: { label: 'Context', summary: 'Weigh outside input and earlier sessions.' },
  implicit: { label: 'Implicit', summary: 'Loaded by your agent when a task touches their stack.' },
} as const satisfies Record<ISkillStage, { label: string; summary: string }>;

// display labels for what a skill may change, short enough to fit one line of the narrowest card
export const SKILL_ACCESS_LABELS = {
  'changes-code': 'Changes code',
  'changes-code-and-pushes': 'Changes code, can push',
  'commits-and-pushes': 'Commits and pushes',
  'planning-files': 'Writes planning files',
  'read-only': 'Read-only',
  'runs-picked-command': 'Runs a picked command',
} as const satisfies Record<ISkillAccess, string>;
