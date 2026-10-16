---
name: jg-pwa
description: Progressive web app standards for installable web apps, with update-safe service workers, caching, and push notifications. Use when writing, reviewing, or planning web app manifests and install metadata, install prompts, service worker registration, updates, or caching, offline behavior, web push notifications or app badges, or Home Screen web app behavior on iOS and Safari.
---

## Application

The agent loads this skill on its own when a task touches its area. This skill's area is progressive web apps: web app manifests and install metadata, install prompts, service worker registration, updates, and caching, offline behavior, web push notifications and app badges, and Home Screen web app behavior on iOS and Safari.

- It adds domain rules to the task. It never authorizes actions, widens scope, or replaces the workflow or approvals of a skill the developer invoked.
- It ranks with the repository's coding instructions. When they conflict, the coding instructions win, except for the exceptions this skill states for its own area.
- The repository's established conventions win over this skill's naming, layout, and style rules. Its correctness and safety rules, and the exceptions it states for its own area, still apply.
- Check the installed versions first. This skill was written for the web platform as of October 2026, meaning current Chromium browsers, Firefox, and Safari 27 on macOS, iOS, and iPadOS, plus Playwright 1.64, and `sw-builder` 1.2 and `sw-service` 1.2 where installed. An item marked with a minimum version, written like (18+), applies only when that version or a later one is installed. For an older installed version, follow that version's official documentation.
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

- Before adding or changing offline behavior, such as an offline page, offline data, or retrying work after reconnecting, read `references/offline.md`. Navigations fall back to the offline page only when the network request fails, never on an error response.
- Before adding or changing web push notifications, notification permission requests, or app badges, read `references/notifications.md`. Ask for notification permission only from a click on a control that explains what the user will get.

## Scope

- Make a web application installable only when the developer asks for it or an approved plan includes it. An installable app gets the manifest and install metadata below, without a service worker.
- Add a service worker only when the task or an approved plan calls for one, such as for offline use or push, and reuse the repository's established service-worker tooling.
- Propose hosting, CDN, and dependency changes, such as new response headers or a service-worker library, instead of making them.
- Never migrate an existing app's manifest or service worker only to follow this skill.

## Manifest and install metadata

- An installable app has a web app manifest, linked with `<link rel="manifest">` from every HTML entry point, with `id`, `name`, `short_name`, `description`, `start_url`, `scope`, `display: "standalone"`, `theme_color`, and `background_color`.
- Set `id` explicitly and never change it, because browsers treat an app with a different `id` as a different app.
- Provide 192×192 and 512×512 PNG icons with `purpose: "any"`, plus separate `maskable` icons whose content fits the central safe circle, with a radius of 40% of the icon's width. Never combine them as `"any maskable"` in one entry, because the padding a maskable icon needs shrinks it everywhere else.
- Prefer `screenshots` with both `form_factor: "wide"` and `form_factor: "narrow"`, each with a `label`, for Chromium's richer install dialog.
- Add `shortcuts` or `display_override` only for a real need, and never set `orientation` unless the app can't work in another one.
- Serve the manifest as `application/manifest+json` with `Cache-Control: no-cache`, and never let the single-page-app fallback answer its URL with HTML.
- `<meta name="theme-color">` follows the active theme: prefer one tag per `prefers-color-scheme` value, and update it when the user switches the app's theme. (Safari 26+) Safari uses it only for installed web apps.
- Add a 180×180 opaque PNG `apple-touch-icon`, which iOS and iPadOS use on the Home Screen.

## Installability

- Chromium lets users install a site from the browser menu without a service worker (Android 108+, desktop 112+). Its automatic install prompt also needs user engagement and a service worker with a fetch handler.
- Never add a service worker, or an empty fetch handler, only to qualify for the install prompt.
- (iOS and iPadOS 26+) Safari opens every site added to the Home Screen as a web app. Users install through Share, then Add to Home Screen, and on macOS (Safari 17+) through File, then Add to Dock.

## Install experience

- `beforeinstallprompt` is Chromium-only. Capture it with `preventDefault()`, show the app's own install control only while a captured event exists, and call its `prompt()` only from a click.
- Never show a blocking or page-covering install invitation on first load. Prefer a permanent entry in a menu or in settings, plus at most one dismissible invitation after real engagement, and remember the dismissal.
- Detect the installed context with `matchMedia('(display-mode: standalone)')`, and hide install controls on `appinstalled`.
- On iOS and iPadOS, show Add to Home Screen instructions only where installing unlocks something, such as push notifications.

## Service worker requirements

- Never cache or serve dev-server modules. In development, register nothing, or a worker without a caching fetch handler, such as an empty `public/sw.js`, and test the real worker on a production build.
- Serve the worker from the root of its scope, such as `/sw.js`, with the `Service-Worker-Allowed` header for a broader scope, and never rename it per release, because a registration updates only from its own URL.
- Serve the worker script with `Cache-Control: no-cache` or `no-store`. The default `updateViaCache` already fetches the main script past the HTTP cache; prefer `updateViaCache: 'none'` when content loaded through `importScripts()` can change without its URL changing.
- Prefer registering the worker after the `load` event when it precaches, so precaching doesn't compete with the first page load.
- An open page keeps working with the build it loaded: never delete a previous build's cache in `install`, and never call `skipWaiting()` unconditionally when the worker serves HTML or code-split assets.
- Prefix cache names with the app's name and a build version, and in `activate` delete only that prefix's older caches, never caches of other apps on the same origin.
- Precache only content-hashed build output, plus the shell and the offline page when offline use is in scope, never files the app doesn't load, such as manifest screenshots.
- Handle only same-origin `GET` requests, and cache only `ok` responses, never opaque, `206`, `Vary: *`, or error responses.
- Never cache authenticated or personal responses unless the feature is designed for it, and then clear them on sign-out and on account switch. Never cache responses marked `no-store` or `private`.
- Never serve navigation HTML cache-first.
- Keep a recovery path: to remove a worker, deploy a replacement at the same URL that deletes the app's caches and unregisters itself, because deleting `sw.js` leaves the installed worker running.

## Updates and deploys

- Tell users when a new version is ready and let them choose when to reload. Never reload on its own over unsaved input.
- When the worker serves the shell, detect the waiting worker, such as `registration.waiting` or an installed worker after `updatefound`, have it call `skipWaiting()` when the user accepts, and reload once on `controllerchange`, behind a guard so it can't loop.
- When HTML always comes from the network, a plain reload loads the new build.
- Missing-chunk 404s, HTML revalidation, and guarded recovery from failed chunk loads belong to jg-frontend.

## Offline

- Add offline behavior only when the task or an approved plan calls for it.
- Treat `navigator.onLine` as a hint: `false` means offline, but `true` doesn't prove a connection. While offline, show one offline notice instead of an error toast per failed request, and never disable features or hide errors only because of it.

## Using sw-builder and sw-service

When the repository uses `sw-builder` or `sw-service`:

- Run the bundler first and `sw-builder` after it, such as `vite build && sw-builder`, and keep an empty `public/sw.js` for development.
- Give each app on a shared origin its own `cacheNamePrefix`.
- Never add `/` or `index.html` to `includeToPrecache`, and keep `text/html`, `audio/`, and `video/` in `excludeMIMETypesFromCache`.
- `sw-builder` serves runtime requests cache-first and ignores `Cache-Control`, so keep private same-origin responses other than JSON on another origin or excluded by MIME type.
- `sw-builder` has no offline fallback page or navigation preload. When offline use is in scope, propose an addition for approval instead of editing the generated worker.
- `sw-service` reports no waiting worker, so detect new versions in the app, such as by comparing a deployed version file, and apply them with `SWService.updateApp()`.
- `SWService.installer` exists only after a successful registration, so don't rely on it for the install control when registration fails.
- When the worker's response carries a Content Security Policy, allow the `gstatic.com` scripts that the `firebase-fcm` template imports.

## iOS and Safari

- Safari has no `beforeinstallprompt`, Background Sync, Periodic Background Sync, or Background Fetch.
- Home Screen web apps don't share storage or sign-in with Safari, so users sign in again after installing.
- With tracking prevention on, Safari deletes script-writable storage after 7 days of Safari use without interaction with the site. Home Screen web apps keep their own counter, and (Safari 17+) `navigator.storage.persist()` can exempt an origin.
- Home Screen web apps support only the `standalone` and `browser` display modes, and links never open in an installed app.

## When the numbers justify it

- The static routing API, `event.addRoutes()` in the worker's `install` event (Chrome 123+, Safari 27+, not Baseline), sends chosen requests to the network or the cache without starting the worker.
- Tune navigation preload, such as the value of its header, when worker startup measurably delays navigations.

## Verification

- Lighthouse 12 removed the PWA category, so never cite a PWA score. Check installability and the worker in the browser's Application panel instead.
- In Playwright, set `serviceWorkers: 'block'` in tests that use `page.route()`, because requests a worker handles bypass routing.
- Test the real worker on a production build: wait for it with `context.waitForEvent('serviceworker')` or `context.serviceWorkers()`, and for the page to have a controller, before asserting.
- Use `response.fromServiceWorker()` to check which responses the worker served, and `context.setOffline(true)` to test the offline page.
- Test the transition from one deployed build to the next, and check that it never loops on reloads.
