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

- (12+) Validate `@Body()`, `@Query()`, and `@Param()` input by passing a Zod schema as `{ schema }`, with `StandardSchemaValidationPipe` registered, for example through `app.useGlobalPipes`. The same schema then feeds the OpenAPI document, so validation and documentation cannot drift apart.
- (12+) Give `ConfigModule` a Zod `validationSchema`, so invalid configuration stops the application at startup instead of failing on first use.

## NestJS logging

In NestJS projects:

- Import `Logger` from `@nestjs/common`.
- Do not use direct `console.log`, `console.error`, `console.warn`, or similar calls.
- Use the appropriate `Logger` method: `log`, `error`, `warn`, `debug`, or `verbose`.
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

- Call `app.enableShutdownHooks()` in applications that hold connections, and close pools, queues, and consumers in `onModuleDestroy` or `beforeApplicationShutdown`. (12+) Lifecycle hooks run by module hierarchy level, so do not rely on the order between sibling modules.
- Prefer default singleton providers. A request-scoped provider makes every provider that injects it request-scoped too, so the whole chain is rebuilt on each request. Use `AsyncLocalStorage` when code needs request context.
- Keep the repository's module format, CommonJS or ESM, when adding files or packages.

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
