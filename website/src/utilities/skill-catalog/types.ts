import type { CollectionEntry } from 'astro:content';

// workflow stages used to group skills on the landing page
export type ISkillStage = 'plan' | 'build' | 'ship' | 'context';

// what a skill may change when it runs
export type ISkillAccess =
  | 'read-only'
  | 'planning-files'
  | 'changes-code'
  | 'changes-code-and-pushes'
  | 'commits-and-pushes';

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
  // search result description, 70 to 160 characters
  searchDescription: string;
  // search result title, at most 60 characters and starting with the skill name
  searchTitle: string;
  stage: ISkillStage;
  // one or two vendor-neutral sentences on when to reach for the skill
  whenToUse: string;
}

// one skill merged from its SKILL.md entry and its catalog entry
export interface ISkill extends ISkillCatalogEntry {
  argumentHint: string | undefined;
  description: string;
  entry: CollectionEntry<'skills'>;
  name: string;
  sourceUrl: string;
}
