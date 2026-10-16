---
name: jg-postgres
description: PostgreSQL standards for naming, constraints, queries, transactions, connection pools and timeouts, indexes, and migrations. Use when writing, reviewing, or planning SQL, migrations or other schema changes, table, column, constraint, or index names, database queries or transactions, connection pools or timeouts, or the PostgreSQL persistence of money, credits, or other value-bearing data.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is PostgreSQL schemas, SQL, queries, transactions, connection pools and timeouts, indexes, and migrations.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for PostgreSQL 18 and node-postgres 8. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Reference files

These files belong to this skill and hold rules that apply only to some work. Read each one before the work it covers:

- Before naming, renaming, or reviewing the names of tables, columns, constraints, indexes, or other database objects, read `references/naming.md`. Never use arbitrary numeric suffixes or names that need quotes.
- Before writing, reviewing, or planning a migration or other schema change, read `references/migrations.md`, and `references/naming.md` for every object it creates. Never edit a migration that has run outside your own local database.

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

- Use column types as storage envelopes with deliberate headroom, especially for external identifiers/payloads, not exact current provider maxima. Bound headroom where unbounded values risk index size, performance, abuse, or operations. Size an encrypted or encoded column from the plaintext maximum plus the encoding's worst-case growth, never from the lengths of observed ciphertext.
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
- Workers claim rows from a queue table with one statement that also marks them claimed, such as `UPDATE job SET status = 'running', claimed_at = now() WHERE id IN (SELECT id FROM job WHERE status = 'pending' OR (status = 'running' AND claimed_at < now() - $2::interval) ORDER BY id LIMIT $1 FOR UPDATE SKIP LOCKED) RETURNING id`, or by selecting `FOR UPDATE SKIP LOCKED` and marking the rows in the same transaction on one client. A row lock ends with its transaction, so a plain `SKIP LOCKED` select lets another worker claim the same row as soon as it returns. Give each claim an expiry longer than the job's timeout, as the `claimed_at` check does, so rows a crashed worker held become claimable again, and keep processing idempotent, because a job can run more than once.
- With node-postgres, run single statements through the pool. Check out a client with `pool.connect()` only for a transaction or session state, and always release it in `finally`, so a failure never leaks a connection.

For an `_tx` record, commit the balance mutation and the state that prevents reapplication in the same database transaction when both are stored in PostgreSQL. A retry or duplicate delivery must resolve to the already-applied result without changing the balance again.

### Connections and timeouts

- Give the pool a `connectionTimeoutMillis`, so a request waiting for a free connection fails instead of hanging, and set `idle_in_transaction_session_timeout`, so a session left open inside a transaction can't hold its locks indefinitely.
- Set a default `statement_timeout`, with a lower `lock_timeout`, in the pool's connection config, so every session starts with both.
- node-postgres's `query_timeout` only stops the client from waiting; the server keeps running the query. Set it above the server's `statement_timeout`, and when it fires on a checked-out client, release that client with `release(true)`, so the pool destroys it instead of reusing it.
- Raise limits for known heavy work only inside its transaction, with `SET LOCAL` or `set_config(…, true)`, never with a plain `SET` on a pooled connection, where it outlives the transaction. A statement that can't run inside a transaction, such as `CREATE INDEX CONCURRENTLY`, raises them with a plain `SET` on a dedicated migration connection that is closed afterwards.
- Treat a client-side timeout, or a connection lost during `COMMIT`, as an unknown outcome: read the state back, or rely on idempotency, before retrying.
- (17+) Set `transaction_timeout` above the per-transaction budgets, as a backstop.
- Never set `idle_session_timeout` for the roles a pool connects as, because the server then closes idle pooled connections.
- Register `pool.on('error')` for errors on idle clients, and `client.on('error')` while a client is checked out, because an unhandled `error` event crashes the process.
- Prefer transaction-scoped advisory locks, `pg_advisory_xact_lock`, which release when the transaction ends, over session-level locks, which can outlive a failure on a pooled connection.
- Keep the pool's `max`, times the processes per service, times the services sharing the database, below `max_connections` minus the reserved slots. Propose server-side changes, such as raising `max_connections` or adding a connection pooler, instead of making them.
