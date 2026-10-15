---
name: jg-redis
description: Redis standards for key names, expiry, scanning, round trips, data structures, and locks. Use when writing, reviewing, or planning Redis keys, caching in Redis, distributed locks, rate limits, streams or queues, or pub/sub.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is Redis keys, caching in Redis, locks, rate limits, streams, queues, and pub/sub.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Redis 8 and node-redis 5. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Rules that say "prefer" are defaults: departing from one with a stated reason is fine. Rules that say "never", "always", or "must" are requirements.
- Nothing in this skill requires adding a dependency, enabling a compiler or tool, upgrading, or migrating existing code.

## Key conventions

Use stable, predictable Redis key names made of lowercase kebab-case segments separated by colons, in the form `<domain>:<id>:<facet>`. Keep the identifiers inside a key exactly as they are, such as numeric IDs and UUIDs.

```txt
wearables:providers-database

user:123:profile
product:456:details
order:789:items

chats:70aab698-313b-42cb-8b43-f2c31d42e398
chats:70aab698-313b-42cb-8b43-f2c31d42e398:context
```

These conventions apply to new keys. Never rename a live key as a side effect of other work: the cached data under the old name is stranded, and instances on the old and new code read different keys during a rollout.

## Writes and expiry

Set a key's expiry in the same command that writes it, such as `SET key value EX seconds`, not in a separate `EXPIRE` afterwards that a crash can skip.

## Reading and scanning

- Never use `KEYS` outside a throwaway local instance: it blocks the server while it walks the whole keyspace. Use `SCAN` with `MATCH` and `COUNT`, or node-redis `scanIterator`, which yields batches of keys in node-redis 5 that you can pass to `mGet` or `unlink` after skipping empty batches.
- Prefer `UNLINK` over `DEL` for large or many values, so the memory is reclaimed in the background instead of blocking the server.

## Round trips and atomicity

- Prefer one `MGET` or `MSET` over a loop of single reads or writes.
- node-redis pipelines commands issued in the same tick, so send independent commands together, for example with `Promise.all`, instead of awaiting each one in turn.
- Use `MULTI` only when the commands must apply together. To batch commands without a transaction, use `execAsPipeline()`.
- For read-modify-write logic that must be atomic, prefer one Lua script over a read, a decision in application code, and a write.

## Data structures

- Use a hash for an object whose fields are read or updated separately. (7.4+) Give individual fields their own expiry with `HEXPIRE` instead of splitting them into separate keys only to expire them. (8.0+) Write fields and their expiry together with `HSETEX`, because `HSET` on a field clears its expiry.
- Use a sorted set for rankings, time windows, and sliding rate limits.
- Use a stream with consumer groups when messages must survive a restart or a slow consumer, and acknowledge each message after it is processed. Use pub/sub only for fire-and-forget messages that may be lost.

## Locks

- Take a lock with `SET key token NX PX milliseconds`, using a random token, and release it only when the stored token still matches, in one Lua script or, (8.4+), with `DELEX key IFEQ token`, so one holder never releases another's lock.
- A Redis lock is advisory and can expire mid-operation. When correctness depends on mutual exclusion, such as for value-bearing changes, rely on PostgreSQL transactions, row locks, or constraints instead.

## node-redis 5

- Close a client with `close()`, which waits for pending replies, or `destroy()`, which drops them. They replace `quit()` and `disconnect()`.
- Give subscribers their own connection, for example from `client.duplicate()`, so a subscription never blocks ordinary commands.
- Use `createClientPool()` for blocking commands, such as `BLPOP` or `XREADGROUP` with `BLOCK`, and for transactions that need a connection to themselves.
