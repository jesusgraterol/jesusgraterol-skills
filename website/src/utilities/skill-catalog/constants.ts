import type { ISkillAccess, ISkillStage } from './types.ts';

// exact Codex policy every skill ships so it is never invoked implicitly
export const EXPLICIT_ONLY_OPENAI_POLICY = 'policy:\n  allow_implicit_invocation: false\n';

// stable messages for skill contract violations that must fail the build
export const SKILL_CATALOG_ERROR_MESSAGES = {
  CatalogMismatch: 'Skill catalog does not match the skill folders',
  ImplicitInvocationAllowed: 'Skill does not ship the explicit-only Codex policy',
  NameMismatch: 'Skill name does not match its directory',
} as const;

// display copy for each workflow stage, in landing-page order
export const SKILL_STAGES = {
  plan: { label: 'Plan', summary: 'Agree on what to build before any code changes.' },
  build: { label: 'Build', summary: 'Turn the approved plan into verified code.' },
  ship: { label: 'Ship', summary: 'Check the finished change, then publish it.' },
  context: { label: 'Context', summary: 'Weigh outside input and earlier sessions.' },
} as const satisfies Record<ISkillStage, { label: string; summary: string }>;

// display labels for what a skill may change
export const SKILL_ACCESS_LABELS = {
  'changes-code': 'Changes code, pushes when autonomous',
  'commits-and-pushes': 'Commits and pushes',
  'planning-files': 'Writes planning files',
  'read-only': 'Read-only',
} as const satisfies Record<ISkillAccess, string>;
