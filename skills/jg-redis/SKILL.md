---
name: jg-redis
description: Redis standards for key names, expiry, scanning, round trips, data structures, and locks. Use when writing, reviewing, or planning code that uses Redis, such as its keys, caching, distributed locks, rate limits, streams or queues, or pub/sub.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is code that uses Redis, such as its keys, caching, locks, rate limits, streams, queues, and pub/sub.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for Redis 8 and node-redis 5. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
- Before relying on one of this skill's version-specific items, check it against the current official guidance when the installed version of the technology is newer than the one this skill was written for, or when the version bullet gives a review month for something without an installed version, such as a hosted service or browser behavior, and that month is more than six months before the current date. Where an item differs from that guidance, follow the guidance. Version-specific items are API, syntax, and feature recommendations, and anything marked with a minimum version. This skill's conventions and requirements, such as its naming, layout, style, reuse, and safety rules, keep their usual precedence even where official guidance suggests otherwise. Report each item that looks outdated in the summary, with the installed version and what the current guidance says, and offer there to open an issue on the jg-skills repository, `https://github.com/jesusgraterol/jg-skills`:
  - Never pause or stop a run for the offer, including an autonomous run. When no one can answer, include the pre-filled link described below instead of asking.
  - First search the repository's open issues, and skip the offer when one already covers the item. When the search can't run, say so next to the link, so the developer checks the existing issues before submitting.
  - Open an issue only after the developer agrees, because it is public. Title it `<skill>: <item> looks outdated on <technology> <version>`, and include only the skill name, the outdated item, the installed version, and a link to the official documentation, never code, file paths, or project details. Add no label.
  - Use `gh issue create` when `gh` is installed and signed in. Otherwise give the developer a pre-filled link, `https://github.com/jesusgraterol/jg-skills/issues/new?title=…&body=…`, with both values URL-encoded.
- This skill isn't a complete list. Where it says nothing, follow the official guidance for the installed version, and in new code the task touches, prefer the features that guidance currently recommends over older ones that do the same job, unless the repository has an established pattern for that job. Before using a newer approach instead of one this skill gives, confirm it in that version's official documentation, never from memory alone, and report the item as outdated as described above. When that documentation can't be reached, keep this skill's approach and report that the newer approach couldn't be confirmed, without pausing the run.
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

In Redis Cluster, a hash tag in braces, such as `{user:123}:profile`, puts related keys in the same hash slot. The tag is part of the key name, so choose it when the key is designed.

These conventions apply to new keys. Never rename a live key as a side effect of other work: the cached data under the old name is stranded, and instances on the old and new code read different keys during a rollout.

## Writes and expiry

Set a key's expiry in the same command that writes it, such as `SET key value EX seconds`, not in a separate `EXPIRE` afterwards that a crash can skip.

## Memory, eviction, and caching

- Eviction is configured per server, so a policy that suits a cache endangers everything else stored there. When locks, rate limits, replay-protection keys, or sessions share the instance, propose `noeviction` or a separate cache instance, never an `allkeys-*` or `volatile-*` policy, which can drop those keys under memory pressure. `maxmemory 0` means no limit.
- Under `noeviction`, a full server rejects writes. Skip a failed cache write and carry on, but fail closed when a security write, such as a lock, a rate-limit counter, or a replay key, fails.
- Prefer capping the size of each cached entry, so one large value can't fill the server.
- Prefer coalescing concurrent cache misses for the same key within a process: share one in-flight load per key, and delete it once it settles, so a failure isn't kept. When the numbers justify it, cap the number of callers waiting on one load.

## Reading and scanning

- Never use `KEYS` outside a throwaway local instance: it blocks the server while it walks the whole keyspace. Use `SCAN` with `MATCH` and `COUNT`, or node-redis `scanIterator`, which yields batches of keys in node-redis 5 that you can pass to `mGet` or `unlink` after skipping empty batches.
- Prefer `UNLINK` over `DEL` for large or many values, so the memory is reclaimed in the background instead of blocking the server.

## Round trips and atomicity

- Prefer one `MGET` or `MSET` over a loop of single reads or writes. `MSET` cannot set an expiry, so for keys that expire, send their `SET … EX` commands together instead, for example with `Promise.all`, so the client pipelines them.
- In Redis Cluster, multi-key commands such as `MGET` and `MSET`, `MULTI` transactions, and Lua scripts fail with a `CROSSSLOT` error unless every key they touch is in the same hash slot. An explicit `multi()` or `execAsPipeline()` batch also runs on a single node, so keep its keys in one hash slot too. Group keys used together under one hash tag, or split the commands by slot.
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
- Always attach an `error` listener to every client, including each one from `duplicate()`, which doesn't copy listeners. A client without one crashes the process on its first error.
- Prefer `disableOfflineQueue: true` on clients that send non-idempotent commands, so a command issued while disconnected is rejected instead of queued and sent later. (5.6+) The `commandOptions.timeout` option limits only how long a command waits before it is written to the socket, not the round trip.
