## Client data caching

These rules hold for any client data cache. TanStack Query 5 APIs appear only as examples; use the equivalent in the project's data layer.

### Keys and reads

- A cache key includes every input its request depends on, starts with a domain prefix, such as `['projects', …]`, and prefers including the signed-in identity, so one account's data never serves another. Secrets never go in keys or URLs, and private free text, such as a search query, stays out of URLs and persisted keys.
- Abort or ignore superseded requests: pass the abort signal the cache provides, such as the query function's `signal`, to `fetch`.
- Never show another scope's data after the signed-in identity or the viewed resource changes. Within one scope, such as the next page of the same list, show the previous result only while it is marked as out of date, such as with `isPlaceholderData`.
- Never fill an editable form from cached data that may be stale: wait for a read made after mount, such as `isFetchedAfterMount`, fill the form once, and never overwrite the user's edits with a later refetch.

### Polling

- Poll only while the page is visible, the device is online, and the last read succeeded; stop on an error, for example with a function `refetchInterval` that returns `false`.
- Data that can't change gets no polling interval and never goes stale, such as with (TanStack Query 5.79+) `staleTime: 'static'`. Leave `refetchOnMount` at its default, and tune `staleTime` instead.
- Prefer refreshing only the newest page when polling a paged or infinite list, rather than refetching every loaded page.

### Writes

- An optimistic update cancels in-flight reads of the same data, shows the change as pending, rolls back to the last confirmed value on failure, and refetches after it settles. Prefer running writes to the same record one at a time, such as with a (TanStack Query 5.31+) mutation `scope`.
- Consequential writes, such as payments, sends, and deletions, never retry on their own, never wait in an offline queue, and are never applied optimistically. In TanStack Query, set `networkMode: 'always'` on them, because the default `online` mode pauses a mutation while offline and resumes it once the device reconnects. An explicit retry reuses the same idempotency key, and after an uncertain outcome, such as a timeout, read the server's state before offering to try again.

### Persistence and sign-out

- A persisted cache has a buster, such as the build or schema version, and a maximum age, with `gcTime` at least that age. Queries opt in to persistence one by one. Never persist secrets or identity bootstrap data, such as the session, and filter mutations out, such as with `shouldDehydrateMutation: () => false`, because paused mutations are persisted by default.
- On sign-out, wait for any cache restore in progress, call `queryClient.clear()`, then `persister.removeClient()`, before rendering the signed-out screen.
