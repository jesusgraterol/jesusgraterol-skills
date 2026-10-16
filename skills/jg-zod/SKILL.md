---
name: jg-zod
description: Zod 4 standards for validating boundary data with schemas. Use when writing, reviewing, or planning Zod schemas, request, response, or event validation, parsing external or untrusted data, environment or configuration validation, form validation schemas, schema-derived types, or JSON Schema generation.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is Zod schemas, boundary validation, parsing external data, and schema-derived types and JSON Schema.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Zod 4.6. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Parsing at boundaries

- Follow the installed Zod version's API. The examples here are illustrative, and behavior also changes between 4.x minor releases.
- Prefer `safeParse` at boundaries and map its result to the application's error contract. Use `parseAsync` or `safeParseAsync` when any refinement or transform is async; the synchronous methods throw on them.
- Name schemas in `PascalCase`, such as `UserResponseSchema`, and derive their types with `z.infer<typeof Schema>`.

## Objects and strictness

The coding instructions choose strictness for compatibility. In Zod:

- Use `z.strictObject(...)` for closed, stable contracts whose unknown properties mean invalid input, a programming error, or unsupported behavior.
- Use `z.object(...)` for tolerant contracts, such as responses, events, and contracts shared by independently deployed producers and consumers. It strips unknown keys, so use it only when dropping them is acceptable.
- To keep unknown keys, use `z.looseObject(...)` or `.catchall(schema)`.
- Use `z.discriminatedUnion(...)` for tagged unions, and `z.xor(...)` (4.3+) when exactly one option must match.
- In a union of `z.object` options, make the narrower option strict. Stripping lets a payload meant for one option also pass another.

```ts
import { z } from 'zod';

// closed command contract that rejects unsupported properties
export const UpdateUserCommandSchema = z.strictObject({
  displayName: z.string().nullable(),
});

// additively evolving response contract shared across deployed app versions
export const UserResponseSchema = z.object({
  id: z.string().meta({ description: 'The stable unique user id.' }),
  email: z.email().meta({ description: 'The user email address.' }),
  displayName: z.string().nullable(),
});

export type IUpdateUserCommand = z.infer<typeof UpdateUserCommandSchema>;
export type IUserResponse = z.infer<typeof UserResponseSchema>;
```

## Types and metadata

- `z.infer` is the output type. Use `z.input` for the type a schema accepts before its transforms run.
- Keep `.meta({ description })` text meaningful, because descriptions can feed prompts, model tool definitions, generated JSON Schema, and OpenAPI. `.describe()` is shorthand for a description.
- Call `.meta()` on the outermost schema. Wrappers such as `.optional()`, `.nullable()`, `.default()`, `.transform()`, `.pipe()`, and `.array()` return a new schema that doesn't carry it, so JSON Schema output can drop the description or attach it to a nested branch. Refinements and checks such as `.refine()` keep it (4.3+).
- `z.toJSONSchema()` emits `additionalProperties: false` for `z.object` only in its default output mode. Choose the `io` option deliberately when others consume the schema, because input mode leaves additional properties open.
- Give each schema with an `id` in its metadata a unique id, because duplicates make JSON Schema conversion throw.

## Errors

- Customize messages with the `error` parameter, as a string or a function. `message` still works but is deprecated.
- Zod 4 removed `required_error`, `invalid_type_error`, and `errorMap`. `required_error` is silently ignored, so code that still passes it loses its message without warning.
- Format errors with `z.treeifyError` for nested data, `z.flattenError` for flat forms, and `z.prettifyError` for logs. `error.format()` and `error.flatten()` are deprecated.
- Keep the `reportInput` option off where input may be sensitive, because it copies the input into issues.

## Values and formats

- Use the top-level string formats, such as `z.email()`, `z.url()`, and `z.uuid()`. The method forms, such as `z.string().email()`, are deprecated.
- `z.uuid()` checks the RFC variant bits. Use `z.guid()` for any UUID-shaped identifier.
- `z.iso.datetime()` rejects offsets unless `{ offset: true }`, and requires seconds (4.5+) unless `{ precision: -1 }`.
- Prefer `z.stringbool()` over `z.coerce.boolean()` for environment-style booleans. Coercion treats any non-empty string, including `"false"`, as true.
- `.default(value)` short-circuits on `undefined`, so its value must match the output type. `.prefault(value)` is parsed, so its value must match the input type.
- `.exactOptional()` (4.3+) allows a missing key but rejects an explicit `undefined`.
- Use `z.codec(...)` (4.1+) for a transform that must also run in reverse, such as a date string decoded on input and encoded on output.

## Composition

- `.pick()` and `.omit()` (4.3+) throw on objects that have refinements.
- `.extend()` (4.3+) throws when it overwrites keys of a refined schema. Use `.safeExtend()` there.
- `.merge()` is deprecated and throws (4.4+) when the receiver has refinements. Prefer `.extend()` or spreading `.shape`.

## Zod 3 habits to avoid

Replace these when writing or rewriting a schema:

- `.strict()`, `.passthrough()`, and `.strip()`: use `z.strictObject()`, `z.looseObject()`, or `z.object()`.
- `.merge()`: use `.extend()` or `.safeExtend()`.
- `z.string().email()` and the other method formats: use the top-level formats.
- `z.nativeEnum()`: use `z.enum()`, which accepts TypeScript enums.
- `required_error`, `invalid_type_error`, `errorMap`, and `.formErrors`: use the `error` parameter and the error-formatting functions.
- Single-argument `z.record(valueSchema)`: pass the key schema first.
