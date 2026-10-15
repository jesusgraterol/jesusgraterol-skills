---
name: jg-postgres
description: PostgreSQL standards for naming, constraints, queries, transactions, indexes, and migrations. Use when writing, reviewing, or planning SQL, migrations or other schema changes, table, column, constraint, or index names, database queries or transactions, or the PostgreSQL persistence of money, credits, or other value-bearing data.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is PostgreSQL schemas, SQL, queries, transactions, indexes, and migrations.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for PostgreSQL 18 and node-postgres 8. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- When the installed version of the technology is newer than the one this skill was written for, and one of this skill's version-specific items differs from that version's official guidance, follow the official guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## PostgreSQL naming conventions

This section governs application-owned PostgreSQL object and SQL-file names, overriding general filesystem naming where applicable.

### Scope

Apply these rules to new application-owned PostgreSQL objects and objects intentionally renamed by the requested change.

Do not rename legacy objects solely for consistency. Preserve a valid established convention unless the requested behavior, a collision, or a production-impacting issue requires otherwise.

Confirm the supported PostgreSQL major version from repository configuration/docs before version-specific use. Use `nn_` for operationally managed not-null constraints only with PostgreSQL 18+, where `NOT NULL` is a full `pg_constraint` entry.

### Core rules

- Use lowercase ASCII `snake_case` and unquoted identifiers.
- Use precise domain terms; avoid `data`, `value`, `record`, `item`, `object`, or `thing` unless exact domain terms.
- Avoid redundant prefixes such as `tbl_` and `col_`, and names requiring quotes, spaces, punctuation, case preservation, or reserved words.
- Explicitly name owned indexes, constraints, triggers, policies, views/materialized views, managed sequences, and extended statistics. Do not rename generated internal objects, including identity sequences, unless direct management is required.
- Keep explicitly named constraints unique across the schema and other objects unique in their PostgreSQL namespace.
- Preserve definition order when columns or expressions appear in a name.
- Never use arbitrary numeric suffixes to avoid collisions.

### Relations, columns, and routines

| Object | Convention | Examples |
| --- | --- | --- |
| Table | Singular domain noun; use `_tx` only for durable value-bearing transaction tables described below | `app_user`, `project_member` |
| Durable value-bearing transaction | Singular domain transaction noun ending in `_tx` | `partner_commission_payout_tx` |
| Association table | Natural domain or ownership order; do not alphabetize mechanically | `project_member` |
| Partition | `<parent_table>_<stable_qualifier>` | `app_user_event_2026_07`, `app_user_event_default` |
| View | `vw_<subject>` | `vw_active_partner` |
| Materialized view | `mvw_<subject>` | `mvw_daily_analytics` |
| Custom type or domain | Descriptive domain noun; add `_type` or `_domain` only for clarity or collision avoidance | `partner_status`, `email_address` |

#### Durable transaction table suffix

Use `_tx` only for owned tables recording durable financial or other value-bearing business transactions whose balance effects can change a balance.

- Apply each `_tx` balance effect exactly once. Support idempotent retries/duplicate delivery using established transactions, deterministic identifiers, idempotency keys, unique constraints, or conflict handling.
- `*_applied_at` may record application time. Qualify the effect when `applied_at` is ambiguous, e.g. `balance_applied_at`.
- Do not use `_tx` for analytics, ordinary audit/history, or requests/commands unable to affect financial or other stored value.
- Public copy, API descriptions, and other contracts may omit `_tx`, e.g. “Commission payout” for `partner_commission_payout_tx`, unless the physical identifier is required.

Use descriptive column names and `id` for a table's ordinary primary identifier. Use these semantic forms when accurate: `_id`, `_at`, `_date`, `_time`, `_duration_<unit>`, `_amount`, `_count`, `_hash`, `_lower`, and boolean prefixes `is_`, `has_`, or `can_`.

Foreign keys normally use `<referenced_entity>_id`; clear role names such as `created_by` are allowed. Do not encode storage types unless domain-significant (`preferences`, not `preferences_jsonb`).

Name functions with verbs for calculations/lookups/transformations (e.g. `calculate_partner_revenue`) and procedures imperatively for side effects (e.g. `archive_expired_requests`). Parameters use descriptive `snake_case`, not `arg1`-style positions.

A function used by one trigger ends in `_trigger`; a shared trigger function describes the reusable operation.

### Table abbreviations in owned-object names

For indexes, constraints, triggers, policies, managed sequences, and extended statistics, abbreviate tables with each underscore-delimited token’s first character, preserving identifying digits. `_tx` contributes only `t`.

Examples: `user` → `u`, `user_balance` → `ub`, `app_user` → `au`, `app_user_2fa` → `au2`, `partner_commission_payout_tx` → `pcpt`, and `global_analytics_total` → `gat`.

Use:

```txt
<kind>_<table_abbreviation>__<subject>[_<qualifier>]
```

| Kind | Prefix | Format or example |
| --- | --- | --- |
| Primary key | `pk` | `pk_<table_abbreviation>__<columns>` |
| Foreign key | `fk` | `fk_<table_abbreviation>__<referencing_columns>[_<referenced_abbreviation>]` |
| Unique constraint | `uq` | `uq_<table_abbreviation>__<columns>` |
| Check constraint | `chk` | `chk_<table_abbreviation>__<subject>_<rule>` |
| Exclusion constraint | `excl` | `excl_<table_abbreviation>__<subject>_<rule>` |
| Named not-null constraint | `nn` | `nn_<table_abbreviation>__<column>` |
| Non-unique index | `idx` | `idx_<table_abbreviation>__<keys>[_<qualifiers>]` |
| Unique index | `uidx` | `uidx_<table_abbreviation>__<keys>[_<qualifiers>]` |
| Trigger | `trg` | `trg_<table_abbreviation>__<timing>_<events>_<purpose>` |
| RLS policy | `pol` | `pol_<table_abbreviation>__<command>_<role_or_rule>` |
| Managed sequence | `seq` | `seq_<table_abbreviation>__<column_or_purpose>` |
| Extended statistics | `stat` | `stat_<table_abbreviation>__<columns_or_expressions>` |

Abbreviations need not be globally unique when complete names differ. Resolve name collisions first with semantic predicate/expression/operation/behavior qualifiers. For colliding table abbreviations, use the shortest clear deterministic expansion of table-name tokens.

### Constraints and indexes

Name every new primary, foreign, unique, check, and exclusion constraint. Ordinary inline `NOT NULL` may stay unnamed unless directly addressed by migrations/operations.

Foreign-key subjects use referencing columns; add the referenced-table abbreviation only to distinguish otherwise identical names.

Check/exclusion names must express a concise rule such as `positive`, `non_negative`, `valid_range`, `chronological`, `global`, or `mutually_exclusive`, not SQL expressions/operators.

Use `uq` when uniqueness belongs to the table’s logical contract, applies to complete column values, may be foreign-key-referenced, or requires deferrable behavior. Included payloads alone do not require `uidx`; unique constraints support `INCLUDE`.

Use `uidx` for expression/partial-predicate uniqueness or features normal unique constraints cannot express. Do not call constraints `uidx`, indexes `uq`, or duplicate primary/unique-constraint indexes.

For indexes:

- List key columns exactly as written and in definition order.
- Use a concise semantic name for an expression, such as `lower_email`.
- Omit the default `btree`; include a non-default method such as `gin`, `gist`, or `brin` when material.
- Include intentional non-default behavior such as `desc` or `nulls_first` when it distinguishes the index.
- Represent included columns as `include_<columns>`; do not mix them into the key portion.
- End every partial-index name with a predicate descriptor such as `pending`, `active`, or `unused`.
- Order qualifiers as access method, key behavior, `include_<columns>`, then predicate.

Examples: `pk_gat__id`, `fk_pm__project_id`, `uq_pm__project_id_app_user_id`, `chk_ab__balance_non_negative`, `uidx_u__lower_email`, `idx_is__search_vector_gin`, and `uidx_pr__app_user_id_pending`.

### Triggers, policies, sequences, and statistics

Trigger timing is `before`, `after`, or `instead_of`; combined events follow `insert`, `update`, `delete`, `truncate` order. Name the effect, not the table, e.g. `trg_u__before_insert_update_normalize_email`.

Policy commands are `select`, `insert`, `update`, `delete`, or `all`; use `all` only for intentional every-command coverage, e.g. `pol_u__update_self`.

Do not manually name or manage an identity-column sequence unless direct management is required. Preserve definition order in extended-statistics names.

### Roles, SQL query naming, result shapes, and SQL files

Name owned roles `<service_or_domain>_<access_level>`, e.g. `analytics_read_only` or `migration_owner`, describing responsibility rather than people, secrets, or credentials.

Avoid SQL aliases. Do not alias tables, columns, expressions, or outputs for brevity, casing, or convenience. Use actual lowercase unquoted `snake_case` names, qualifying when needed (e.g. `app_user.id`); do not alias columns to `camelCase`.

Raw SQL results and supporting TypeScript types may retain matching `snake_case`. When existing domain, DTO, or API contracts require `camelCase`, transform after retrieval rather than renaming in SQL.

Allow SQL aliases only when syntax requires them or ambiguous, duplicate, or unusable output cannot be fixed by selecting fewer columns or restructuring. Keep unavoidable aliases descriptive, explicit, and narrowly scoped; never use `au`, `pm`, `a1`, `x`, or `tmp`-style abbreviations.

Name CTEs after their result, e.g. `active_partners` or `monthly_revenue`. Each name describes the resulting relation instead of abbreviating it.

Preserve the repository's SQL filename convention:

```txt
<10-digit-order>-<concise-snake_case-object-subject>.sql
<unix-milliseconds>-<concise-snake_case-change-description>.sql
```

Keep the complete SQL filename, including ordering token, separator, subject, and `.sql`, within 64 characters. If necessary, use the shortest clear deterministic `snake_case` subject preserving applicable object kind, distinguishing terms, and uniqueness in its SQL directory. Do not shorten the PostgreSQL identifier for filename fit or rely on truncation/arbitrary counters.

Migration descriptions must identify the schema change; avoid placeholders such as `changes`, `update_database`, or `fix_sql`.

### Validation

Before creating an owned PostgreSQL object, verify format, clear domain terms, definition order, namespace uniqueness, and normally at most 55 bytes (8 below the 63-byte limit). Use 56–63 bytes only for necessary clarity/collision prevention. Resolve collisions through semantic qualifiers, then deterministic table-abbreviation expansion, then careful shortening preserving kind, abbreviation, `__`, and key subject terms. Never rely on truncation, generated fallback names, or arbitrary counters.

## Keys, generated columns, and constraint features

- Keep an existing table's key type. For new integer keys, prefer `bigint GENERATED ALWAYS AS IDENTITY` over `serial` or `bigserial`: identity columns are standard SQL, belong to their table, and reject accidental manual values.
- (18+) For new UUID keys, prefer `DEFAULT uuidv7()` over random version 4 UUIDs, because time-ordered values keep B-tree inserts local. Generate a UUIDv7 in the application only when the ID must exist before the insert, such as an ID the client sends with its first request.
- (18+) Generated columns are virtual by default: computed on read and not indexable. Declare a generated column `STORED` when it is indexed or expensive to compute.
- (15+) When a nullable column must still allow only one row without a value, declare the unique constraint `NULLS NOT DISTINCT` instead of adding a partial unique index.
- (18+) For ranges that must not overlap per key, such as bookings or validity periods, prefer a `PRIMARY KEY` or `UNIQUE` constraint `WITHOUT OVERLAPS`, and `PERIOD` foreign keys, over a hand-written exclusion constraint. They rely on the `btree_gist` extension for the non-range columns, so check that it is available first.

## Constraint and validation ownership

Do not mirror every API, DTO, Zod, provider, or user-input rule in PostgreSQL. Before adding/tightening constraints, classify each rule:

1. **Hard invariant** — enforce in PostgreSQL when violation could cause a security or privacy failure, broken authorization, invalid ownership, referential-integrity problems, corruption, incorrect value-bearing state, an impossible state transition, unsafe concurrency, or an ambiguous persisted record.
2. **Structural safeguard** — enforce minimally with deliberate bounded headroom when PostgreSQL needs a stable storage envelope or structural property but not the application's exact current policy.
3. **Application policy** — validate in the API or application layer when the rule concerns current provider formats or limits, user-facing validation, presentation, detailed or evolving JSON contracts, defaults, compatibility normalization, or policy that can change without altering the stored row's fundamental meaning or integrity.
4. **Business decision** — clarify before adding a constraint when the durable rule has not been established.

If classification ambiguity materially affects compatibility, security, integrity, or schema evolution, ask one focused question before implementing. Migrations, automation, or coding assistance do not justify stricter constraints; persisted-data integrity must justify each. Flexibility never overrides security, privacy, integrity, authorization, or production correctness.

- Use column types as storage envelopes with deliberate headroom, especially for external identifiers/payloads, not exact current provider maxima. Bound headroom where unbounded values risk index size, performance, abuse, or operations.
- For external identifiers, prefer stable `NOT NULL`, universally valid non-empty checks, required uniqueness, and generous capacity. Keep current provider length/format policy in integration/API validation unless a durable database invariant.
- For `json`/`jsonb`, enforce only structures PostgreSQL relies on (e.g. object/array). Keep exact keys, evolving values, defaults, and compatibility normalization in application schemas unless queries or durable invariants depend on them.
- Enforce exact ranges, allowed values, and uniqueness for security/durable business semantics, including authorization boundaries, singleton privileged roles, non-negative balances, and valid value-bearing transaction states.

## Querying, integrity, and value-bearing flows

- Select columns explicitly when querying data.
- Use relation names directly instead of table aliases.
- Preserve selected PostgreSQL column names in raw SQL result shapes; do not use `AS` solely to change casing or shorten names.
- When an application-facing contract requires `camelCase`, map the `snake_case` database row in application code through a focused transformer.
- Before adding SQL casts solely to shape application values, inspect the active database driver's type-parser configuration and relevant integration tests.
- Do not cast top-level `BIGINT`/`INT8` IDs or foreign keys to `text` for JavaScript strings when the driver already returns safe strings, e.g. node-postgres’s default `INT8` parser.
- Retain SQL text conversion when representation must survive before driver parsing, including `BIGINT` and exact `NUMERIC` inside server-built `json`/`jsonb`, which the driver parses with `JSON.parse`.
- For new/changed PostgreSQL reads/writes, inspect affected access patterns and existing indexes. Index creation, adjustment, replacement, or removal with material benefits supported by repository/workload evidence, existing telemetry, or safe representative query plans counts as supporting work for the change, not an optional related improvement, when the repository's coding instructions treat it as in scope; otherwise recommend it instead of making it. Implement it only through the migration workflow below, and report the schema change in the plan or completion summary.
- Design indexes for actual filters, joins, ordering, conflicts, and uniqueness, considering selectivity, key order, predicates, included columns, write amplification, storage, locking, and migration cost. Avoid speculative/redundant/duplicate indexes. Before replacement/removal, establish no constraint/invariant dependence and continued query coverage; absent code references do not prove disuse. Recommend rather than change when repository/workload evidence cannot establish safe removal.
- Do not run `EXPLAIN ANALYZE` on mutating, lock-heavy, or potentially expensive production/shared queries without explicit authorization. Prefer sufficient plain `EXPLAIN`, existing telemetry, or representative local/test data.
- Prefer simple queries over complex ones.
- Consider simpler designs or precomputed values when queries become hard to scale.
- Use transactions when multiple database writes must succeed or fail as one logical operation.
- Keep transactions small and focused.
- Avoid slow external network calls inside database transactions unless clearly required.
- Make retries safe with idempotency keys, unique constraints, deterministic identifiers, or explicit conflict handling.
- Use database constraints for the hard invariants and structural safeguards classified above.
- Handle expected constraint violations intentionally and translate them into clear application errors.
- Be explicit about ordering, pagination, and limits when returning lists.
- In cursor-pagination queries, qualify `ORDER BY` columns with their source relation so selected aliases or expressions cannot change the intended sort semantics.
- For keyset pagination, back the query with a composite index in the same column order and direction as its `ORDER BY`. When every sort column runs in the same direction and none is nullable, compare the complete sort key as a row value, such as `WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC`. Otherwise write the comparison out per column, such as `WHERE priority < $1 OR (priority = $1 AND id > $2) ORDER BY priority DESC, id ASC`, and handle nulls explicitly, with a `NULLS FIRST` or `NULLS LAST` that the comparison matches.
- Prefer one query with `WHERE id = ANY($1)` and an array parameter over one query per item.
- Prefer `INSERT … ON CONFLICT (…) DO UPDATE … RETURNING …` over a read followed by an insert or update, which races under concurrency. (18+) `RETURNING` can name `OLD` and `NEW` when the caller needs the values before and after the change.
- For value-bearing changes, prefer a conditional update that checks the invariant in the same statement, such as `UPDATE … SET balance = balance - $1 WHERE id = $2 AND balance >= $1`, and treat zero affected rows as the failure. Use `SELECT … FOR UPDATE` when the decision needs more than one statement.
- Workers claim rows from a queue table with one statement that also marks them claimed, such as `UPDATE job SET status = 'running', claimed_at = now() WHERE id IN (SELECT id FROM job WHERE status = 'pending' ORDER BY id LIMIT $1 FOR UPDATE SKIP LOCKED) RETURNING id`, or by selecting `FOR UPDATE SKIP LOCKED` and marking the rows in the same transaction on one client. A row lock ends with its transaction, so a plain `SKIP LOCKED` select lets another worker claim the same row as soon as it returns. Give each claim an expiry, such as a `claimed_at` older than the job's timeout, so rows a crashed worker held become claimable again, and keep processing idempotent, because a job can run more than once.
- With node-postgres, run single statements through the pool. Check out a client with `pool.connect()` only for a transaction or session state, and always release it in `finally`, so a failure never leaks a connection.

For an `_tx` record, commit the balance mutation and the state that prevents reapplication in the same database transaction when both are stored in PostgreSQL. A retry or duplicate delivery must resolve to the already-applied result without changing the balance again.

## Migrations

- Before implementing an index change identified under the query guidance, inspect the root `README.md` and all relevant database-migration documentation. Treat a migration system as properly documented only when repository-owned documentation clearly establishes the system or workflow; use repository scripts, configuration, and nearby migrations to confirm its tooling and conventions, not to substitute for missing documentation.
- When a properly documented migration system exists, try to create the justified index change as a migration through that system. Follow its established tooling, filename and ordering conventions, transaction and concurrency rules, rollout and rollback practices, and verification commands. Review every generated migration artifact or SQL statement and ensure it contains only the intended database changes. When the migration is created, always tell the developer in the completion summary and identify the migration artifact or artifacts, their purpose, the affected database objects, and whether they were only generated, executed locally, or otherwise verified. If creation cannot be completed safely, report the blocker and recommended database change instead of falling back to unmanaged SQL.
- When no properly documented migration system exists, do not implement an index change discovered as supporting work, invent a migration workflow, apply an ad hoc schema change, or create an unmanaged SQL file. Instead, tell the developer which index or related performance-oriented database changes could improve the affected queries, why they may help, and the relevant read, write, storage, locking, and rollout tradeoffs.
- Do not apply migrations to production, shared, or remote environments unless explicitly requested and authorized by the project workflow. When migration verification requires execution, use the project's established disposable local or test environment when available and report exactly what was run.
- Prefer backwards-compatible migrations and separate expand and contract phases when old and new code must coexist.
- Before adding or tightening column types, capacity, nullability, defaults, ranges, uniqueness, foreign keys, checks, or JSON structure, inspect existing rows and representative values for violations and compatibility. Use approved read-only telemetry, project-provided diagnostics, or local/test data; do not access production or shared data unless explicitly authorized.
- Expand capacity or accepted formats before deploying code that may persist new values. Do not narrow storage or rely on a new format before all affected writers and readers are compatible.
- Backfill and normalize data intentionally, deterministically, and idempotently before tightening constraints.
- For eligible PostgreSQL foreign-key and check constraints, use `NOT VALID` when appropriate, make existing rows compliant, and run `VALIDATE CONSTRAINT` separately. Use the repository's established low-lock or concurrent pattern for other high-cost schema operations.
- Avoid destructive schema changes unless explicitly requested and safely planned. Do not drop columns, tables, constraints, or data without a clear migration strategy and explicit approval. Where index work counts as supporting work, an index may be replaced or removed without separate scope confirmation when it directly supports an in-scope query change, a properly documented migration system exists, repository evidence shows the old index is redundant or obsolete, it does not back a constraint or durable invariant, retained query paths remain adequately covered, and the migration is safe and reversible. Otherwise, report the recommendation without changing the schema.
- Consider rollback implications, deployment ordering, table size, write traffic, lock duration, nullability, defaults, and constraint-validation cost.
- Apply index changes intentionally and consider query patterns, uniqueness, write overhead, and migration cost.
- Keep migrations deterministic and independent of application runtime state.
- Name every new application-owned PostgreSQL object according to the PostgreSQL naming conventions above. Do not rely on generated names or identifier truncation.
- Set a short `lock_timeout` before DDL on tables in active use, so a migration that cannot get its lock fails fast instead of queueing every other query behind it.
- Create indexes on tables in active use with `CREATE INDEX CONCURRENTLY`. It cannot run inside a transaction block, so use the migration tool's mechanism for a non-transactional migration. When it fails, drop the invalid index it leaves behind before retrying.
- (18+) To add `NOT NULL` to a populated column, add the constraint `NOT VALID`, make the existing rows compliant, then run `VALIDATE CONSTRAINT` separately, as with foreign-key and check constraints.
