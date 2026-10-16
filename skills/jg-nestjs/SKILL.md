---
name: jg-nestjs
description: NestJS standards for module organization, validation, configuration, logging, lifecycle, and tests. Use when writing, reviewing, or planning NestJS modules, controllers, providers, guards, pipes, interceptors, configuration, logging, or NestJS tests.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is NestJS modules, controllers, providers, guards, pipes, interceptors, configuration, logging, and NestJS tests.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for NestJS 12. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## NestJS module organization

- Place each NestJS module in its own directory.
- Use framework artifact suffixes such as `.module.ts`, `.service.ts`, `.controller.ts`, and `.guard.ts`; use the module-prefixed role files below for supporting singletons.
- Do not place NestJS module, service, controller, guard, interceptor, pipe, filter, resolver, or provider classes directly in a parent directory when they represent a meaningful module unit.
- A domain module that owns orchestration or business logic must have exactly one primary service: `<module>.service.ts` containing `<Module>Service`.
- Do not add role-qualified services within the same module, e.g. `<module>-cache.service.ts`, `<module>-model.service.ts`, or `<module>-validations.service.ts`.
- Name supporting injectable/stateful singletons by role without `Service`: `<module>.model.ts` / `<Module>Model`, `<module>.cache.ts` / `<Module>Cache`, and `<module>.validations.ts` / `<Module>Validations`.
- Allow a separately named service only for an independent domain or integration responsibility, in its own child module with the normal primary-service convention.
- Role terms in domain names do not alter this convention: `ApiAdminCacheService` is correct for an `ApiAdminCache` module; an `Admin` module’s cache singleton is `AdminCache` in `admin.cache.ts`, not `AdminCacheService`.
- `<module>.validations.ts` may own the injectable `<Module>Validations` singleton; unprefixed `validations.ts`, `utilities.ts`, and `transformers.ts` must contain only pure functions.
- Name tests for supporting singletons after the artifact, such as `<module>.cache.test-unit.ts`, `<module>.model.test-integration.ts`, and `<module>.validations.test-unit.ts`.
- Keep `index.ts` as a thin public import boundary. Export supporting singletons only when they are genuinely consumed outside the module.
- A module directory's entry file exports only externally consumed NestJS modules, providers, services, controllers, guards, contracts, and other public symbols, each re-exported from its owning file: primary services from `<module>.service.ts`, and supporting singletons from `<module>.model.ts`, `<module>.cache.ts`, or `<module>.validations.ts`.
- Exception to the repository's coding instructions: do not add comments or JSDoc above NestJS artifact class declarations, such as modules, services, controllers, and guards. Document non-obvious contracts on their members or in module documentation instead.

A module, with only the artifacts it needs. The supporting singleton and pure-function files are optional:

```txt
example/
  index.ts
  example.module.ts
  example.service.ts
  example.controller.ts
  example.guard.ts
  example.model.ts
  example.cache.ts
  example.validations.ts
  example.exception.ts
  types.ts
  constants.ts
  utilities.ts
  transformers.ts
  validations.ts
  example.service.test-unit.ts
  example.cache.test-unit.ts
  example.model.test-integration.ts
  example.validations.test-unit.ts
  example.exception.test-unit.ts
```

## Controllers and validation

Keep controllers thin and validate their input at the edge with the schema that defines it:

```ts
@Controller('goals')
class GoalsController {
  public constructor(private readonly goalsService: GoalsService) {}

  @Delete(':id')
  public deleteGoal(
    @Param('id', { schema: z.coerce.number().int().positive() }) id: number,
  ): Promise<void> {
    return this.goalsService.deleteGoal(id);
  }
}
```

- (12+) Validate `@Body()`, `@Query()`, and `@Param()` input by passing a Zod schema as `{ schema }`, with `StandardSchemaValidationPipe` registered, for example through `app.useGlobalPipes`. With `@nestjs/swagger` and Zod 4.2 or later, or a configured `standardSchemaConverter`, the same schema also feeds the OpenAPI document, so validation and documentation cannot drift apart.
- (12+) Give `ConfigModule` a Zod `validationSchema`, so invalid configuration stops the application at startup instead of failing on first use.
- Verify webhook signatures over the raw request bytes, never over a re-serialized parsed body: create the application with `rawBody: true` and read `req.rawBody` through `RawBodyRequest`, or use a `raw()` body parser on the webhook route only, and give the parser an explicit body `limit`.
- Send `Cache-Control: no-store` on responses that carry credentials, tokens, capability URLs, or personal data, and prefer it for every API that browsers call. Decide it by what the response contains, not by whether a guard protects the route.
- Set Express's `trust proxy` to the exact number of proxy hops or the proxies' addresses, never `true`, which trusts the left-most `X-Forwarded-For` entry that a client can forge.
- A custom throttler `getTracker` must group IPv6 addresses by subnet itself, such as by /64. (`@nestjs/throttler` 6.7+) Only the built-in tracker groups them, and the package exports `normalizeIp()` for custom trackers.
- With several replicas, propose shared throttler storage, such as Redis, instead of the default in-memory storage, which counts each process separately.

## NestJS logging

In NestJS projects:

- Import `Logger` from `@nestjs/common`.
- Do not use direct `console.log`, `console.error`, `console.warn`, or similar calls.
- Use the appropriate `Logger` method: `log`, `error`, `warn`, `debug`, `verbose`, or `fatal`.
- In services, define a private readonly logger with the service class name as context.

```ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly __logger = new Logger(MyService.name);

  public doSomething(): void {
    this.__logger.log('Doing something...');
  }
}
```

(12+) Pass log context as structured parameters after the message, such as `this.__logger.log('Goal deleted', { goalId })`, instead of interpolating it into the message.

## Lifecycle and providers

- Call `app.enableShutdownHooks()` in applications that hold connections, and close pools, queues, and consumers in `onModuleDestroy` or `beforeApplicationShutdown`. (12+) Within a module, a provider's lifecycle hooks run after those of the providers it depends on, and teardown runs in reverse. Do not rely on the order between providers at the same level or between sibling modules.
- Prefer default singleton providers. A request-scoped provider makes every provider that injects it request-scoped too, so the whole chain is rebuilt on each request. Use `AsyncLocalStorage` when code needs request context.
- Keep the repository's module format, CommonJS or ESM, when adding files or packages.

## Scheduled jobs

- `@Interval()` runs on `setInterval`: its first run comes one interval after startup, runs can overlap, and `@nestjs/schedule` clears it only in `beforeApplicationShutdown`. Keep the guards inside the method: skip a run while the previous one is active, and start no run once shutdown begins. Await the active run in `onModuleDestroy`. For `@Cron()`, (`@nestjs/schedule` 5.0.1+) `waitForCompletion: true` skips ticks while a run is active.
- Bound each run to a batch of the oldest due rows, and isolate failures between its stages, so one failing stage doesn't stop the others.
- `@nestjs/schedule` runs its jobs in every replica. Run each job in one designated process, or behind a lock shared by all replicas. For the lock, propose the official `@nestjs/locks` (0.0.3, pre-1.0) with a shared store, rather than adding it; its default in-memory store doesn't coordinate replicas.

## NestJS test module lifecycle

Use `Test.createTestingModule(...)` from `@nestjs/testing` when tests require NestJS modules or dependency injection.

Requirements:

- create the module with `await Test.createTestingModule({...}).compile()`
- store the compiled module in a `TestingModule` variable
- call `await module.init()` after compile
- call `await module.close()` during teardown
- prefer `beforeAll` / `afterAll` when the module is shared across the suite
- do not bypass dependency injection with ad-hoc manual instantiation when the class relies on NestJS providers, dependency injection, or lifecycle hooks
- do not omit `module.init()` or `module.close()`
- when a dependency should be mocked, override its provider with `useValue`
- in integration tests, keep behavior-relevant owned dependencies real and apply the repository's test-double rules; do not replace the interaction or infrastructure behavior the test must verify
- retrieve the class under test with `module.get(...)`
- never mock the class under test itself
- keep necessary mocks minimal but compatible with used methods/properties

For NestJS `HttpService` dependencies, compile with real-setup-compatible HTTP imports/providers: include `HttpModule` in `imports` unless intentionally overridden or mocked.

```ts
// @vitest-environment node
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, test } from 'vitest';

describe('MyService', () => {
  let module: TestingModule;
  let service: MyService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [MyService],
    }).compile();

    await module.init();

    service = module.get(MyService);
  });

  afterAll(async () => {
    await module.close();
  });

  test('performs the expected behavior', async () => {
    // test meaningful application behavior
  });
});
```
