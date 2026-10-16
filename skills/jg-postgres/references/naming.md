## PostgreSQL naming conventions

This section governs application-owned PostgreSQL object and SQL-file names, overriding general filesystem naming where applicable.

Contents:

- Scope
- Core rules
- Relations, columns, and routines, with the durable transaction table suffix
- Table abbreviations in owned-object names
- Constraints and indexes
- Triggers, policies, sequences, and statistics
- Roles, SQL query naming, result shapes, and SQL files
- Validation

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

Examples: `member` → `m`, `user_balance` → `ub`, `app_user` → `au`, `app_user_2fa` → `au2`, `partner_commission_payout_tx` → `pcpt`, and `global_analytics_total` → `gat`.

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
