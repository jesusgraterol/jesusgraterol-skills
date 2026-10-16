## Notifications and badges

- Request notification permission only from a click on a control that explains what the user will get. Never ask again after `denied`; explain instead how to turn notifications back on in the browser's settings.
- Subscribe with `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`.
- In the `push` handler, show a notification for every push: await `registration.showNotification()` inside `event.waitUntil()`, because Safari revokes subscriptions whose pushes show nothing. Show notifications from pages with `registration.showNotification()` too.
- On `notificationclick`, close the notification, resolve its target to a same-origin URL, and focus an open window on it or open a new one.
- (iOS and iPadOS 16.4+) Push works only for web apps added to the Home Screen. (Safari 18.4+) Declarative Web Push delivers notifications without a service worker.
- Revoke the device's push subscription on sign-out, and keep sensitive data out of push payloads.
- Badging, with `navigator.setAppBadge()` and `navigator.clearAppBadge()`, works only for installed apps, so feature-detect it and treat it as optional.
