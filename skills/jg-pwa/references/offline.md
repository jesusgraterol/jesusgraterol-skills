## Offline behavior

- Navigations go network-first and fall back to the precached offline page only when the network request throws, never on a 4xx or 5xx response, which the app's own error page handles.
- Enable navigation preload and use `event.preloadResponse` in the navigation handler, so starting the worker doesn't delay the request.
- Never answer a `Range` request with a cached full `200` response. Keep media out of the cache unless the worker serves `206` slices.
- Store offline data in IndexedDB, and let the client data cache decide what persists, as jg-react describes.
- Call `navigator.storage.persist()` only after the user opts in to offline use, check the space left with `navigator.storage.estimate()`, and handle `QuotaExceededError`. Never treat browser storage as the only copy of user data.
- Background Sync is Chromium-only, so also retry queued work on the `online` event or at the next launch.
