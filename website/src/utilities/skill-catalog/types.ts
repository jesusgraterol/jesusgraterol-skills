import type { CollectionEntry } from 'astro:content';

// workflow stages used to group skills on the landing page
export type ISkillStage = 'plan' | 'ship' | 'context';

// what a skill may change when it runs
export type ISkillAccess = 'read-only' | 'planning-files' | 'commits-and-pushes';

// coding agents whose explicit invocation syntax the site documents
export type ISkillHost = 'claude-code' | 'codex';

// a realistic invocation, written without a host prefix, and what it produces
export interface ISkillExample {
  invocation: string;
  outcome: string;
}

// site-owned presentation data for one skill; the skill folder owns everything else
export interface ISkillCatalogEntry {
  access: ISkillAccess;
  example: ISkillExample;
  order: number;
  stage: ISkillStage;
}

// one skill merged from its SKILL.md entry and its catalog entry
export interface ISkill extends ISkillCatalogEntry {
  argumentHint: string | undefined;
  description: string;
  entry: CollectionEntry<'skills'>;
  name: string;
  sourceUrl: string;
}
