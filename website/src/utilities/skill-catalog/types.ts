import type { CollectionEntry } from 'astro:content';

// how a skill starts: only when the developer invokes it, or on its own when a task needs it
export type ISkillKind = 'explicit' | 'implicit';

// workflow stages used to group skills on the landing page; implicit skills share one group
export type ISkillStage = 'plan' | 'build' | 'ship' | 'context' | 'implicit';

// what a skill may change when it runs
export type ISkillAccess =
  | 'read-only'
  | 'planning-files'
  | 'changes-code'
  | 'changes-code-and-pushes'
  | 'commits-and-pushes'
  | 'runs-picked-command';

// a realistic invocation, written without a host prefix, and what it produces
export interface ISkillExample {
  invocation: string;
  outcome: string;
}

// one of several supported invocation cases, labeled by what sets it apart, e.g. "Autonomous"
export interface ISkillCaseExample extends ISkillExample {
  label: string;
}

// a single example, or one labeled example per supported case when a skill takes flags or named arguments
export type ISkillExamples =
  | readonly [ISkillExample]
  | readonly [ISkillCaseExample, ISkillCaseExample, ...ISkillCaseExample[]];

// a realistic developer request that loads an implicit skill, and what the skill adds to the work
export interface ISkillTriggerExample {
  outcome: string;
  request: string;
}

// one or more requests that load an implicit skill
export type ISkillTriggerExamples = readonly [ISkillTriggerExample, ...ISkillTriggerExample[]];

// presentation data every skill has, whatever its kind
interface ISkillCatalogEntryBase {
  order: number;
  // search result description, 70 to 160 characters
  searchDescription: string;
  // search result title, at most 60 characters and starting with the skill name
  searchTitle: string;
  // one or two vendor-neutral sentences on when to reach for the skill
  whenToUse: string;
}

// a skill that runs only when the developer invokes it by name
export interface IExplicitSkillCatalogEntry extends ISkillCatalogEntryBase {
  access: ISkillAccess;
  examples: ISkillExamples;
  kind: 'explicit';
  stage: Exclude<ISkillStage, 'implicit'>;
}

// a skill the agent loads on its own when a task touches its area
export interface IImplicitSkillCatalogEntry extends ISkillCatalogEntryBase {
  examples: ISkillTriggerExamples;
  kind: 'implicit';
  stage: 'implicit';
  // one short sentence for the skill's card; the SKILL.md description is a trigger list for agents
  summary: string;
}

// site-owned presentation data for one skill; the skill folder owns everything else
export type ISkillCatalogEntry = IExplicitSkillCatalogEntry | IImplicitSkillCatalogEntry;

// what the skill folder contributes to a skill
interface ISkillSource {
  argumentHint: string | undefined;
  description: string;
  entry: CollectionEntry<'skills'>;
  name: string;
  sourceUrl: string;
}

// one skill merged from its SKILL.md entry and its catalog entry
export type ISkill = ISkillCatalogEntry & ISkillSource;
