# MABRIG App Performance Agent

The private founder dashboard is at **`/admin/performance`**. It is accessible
only after successful MABRIG admin authentication. It polls for new metrics every
30 seconds while the browser tab is visible.

## Real measurements versus unconnected apps

- **Page views** are accepted events from connected websites.
- **Visitor sessions** are *anonymous browser-tab sessions*, not distinct people.
  Reopening another tab, blocking analytics or using privacy mode affects counts.
- **Recently active** means a tracked page view was received within five minutes.
  It is an estimate, **not** a WebSocket online presence count.
- **Health** uses a cached HTTP HEAD reachability probe for curated websites.
  "Responding" does **not** mean purchases, login, databases or AI features work.
  A failed probe does **not** prove the app is offline.
- An app with no recorded events displays **Awaiting data / —**, not fake zero
  visits. No old Google Analytics or Cloudflare data are retroactively imported.

## Install on each app

Open the founder dashboard, locate the relevant app card, and click
**Copy tracker code**. Add the snippet to the application's public root layout
or HTML template, after the page content.

For example, to track CampusVerse:

```html
<script defer src="https://mabrigkorie.org/public/js/performance-tracker.js"
  data-app="campusverse" data-collector="https://mabrigkorie.org"></script>
```

For React/Next.js applications, use a client-side integration that loads the
script once with these same attributes; do not assume an external script loaded
via React JSX will execute correctly in every build. Test navigation and the
browser's Network panel. For a strict Content Security Policy, permit the
collector domain for `script-src` and `connect-src`. Verify the script
downloads and that the `/api/performance/event` POST receives HTTP 204.

The portfolio itself is instrumented through its shared public footer.
**Only apps that send events appear as tracked.** Connected apps that get no
visits during the chosen window show zero views for that window, as expected.

## Adding more apps

A new site can be registered by adding it to the admin-managed Works catalogue
(category: `app`, with an HTTPS URL and an ASCII URL slug). The performance
dashboard discovers it automatically and offers its public embed snippet.
There is no need to add database credentials to a client website. Apps sharing
one hostname may use separate IDs as long as their URLs are unique.

## Security and privacy

- The dashboard summary endpoint requires an authenticated admin cookie.
- Public collector events are checked against the application's registered
  HTTPS origin and its app ID, limited to a 1 KB request body, and throttled by
  a best-effort in-memory limiter. Origin checks help reject accidental or
  unauthorized browser submissions but **are not proof against a malicious
  scripted client that forges its Origin header**.
- Only app ID, anonymous tab session ID, pathname without query parameters, and
  server-recorded timestamp are persisted. No emails, IP addresses, referrers,
  user agents, names, cookies or form values go into the analytics database.
- MongoDB automatically expires these events after approximately 60 days using
  a TTL index. TTL cleanup is asynchronous; deletion may be slightly delayed.
- A browser's Global Privacy Control / Do Not Track preference disables the
  provided tracker. Some visitors will also be uncounted due to blockers.
- Website owners are responsible for providing an appropriate privacy notice
  and meeting any applicable consent, disclosure and data protection obligations.
- Site URLs in the curated catalogue are hardcoded; arbitrary admin-entered
  URLs do **not** trigger server-side health fetches, avoiding SSRF.
- No third-party AI model, Cloudflare analytics token, Google Analytics key,
  GitHub secret or provider integration is required. The "agent" produces
  deterministic, evidence-based performance insights.

## Operations

1. Ensure the portfolio's `MONGODB_URI`, `JWT_SECRET` and admin credentials
   are configured on the deployment. Do not put them in client scripts.
2. Deploy the portfolio backend and confirm `/admin/performance` requires login.
3. Open a public portfolio page, then check the app card for its first event.
4. Deploy tracking snippets to the other public apps and verify event ingestion.
5. Run `npm test` for dashboard integration and privacy validation.

Refresh is near-live polling, not streaming or historical backfill. MongoDB
indexes are created through Mongoose. The app registry includes known published
products plus websites registered through the Works admin catalogue.
