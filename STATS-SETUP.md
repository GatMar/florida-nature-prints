# Owner stats setup (GoatCounter)

This branch adds photo and page stats to `metrics.html`. Nothing is counted by
GoatCounter until you do the steps below. No account was created for you.

## What already existed (kept as is)

- `js/visitors.js` records visits on the live site into a Telegraph page
  (`analytics.storePath`) and bumps counters on abacus.jasoncameron.dev
  (`analytics.counterSpace`). It looks up the visitor's city with ipwho.is or
  get.geojs.io.
- `metrics.html` reads that log and shows people, page views, today, this
  week, a 14 day chart, recent visitors, pages, places and sources.
- Limits: no date range, no category or photo filter, no per-photo views.
- Warning: `js/config.js` holds `analytics.storeToken`, a Telegraph access
  token, in a public repo. Anyone can read it and edit the visit log. Consider
  making a new Telegraph account or retiring this log once GoatCounter works.

## What this branch adds

- `js/visitors.js` loads GoatCounter only when
  `SITE_CONFIG.analytics.goatcounterCode` is filled in, only on the live site,
  and never on metrics.html or studio.html.
- Each time a photo is opened or enlarged in the lightbox, a GoatCounter event
  is recorded with the path `photo/<category>/<file>`, for example
  `photo/flowers/red-hibiscus-6661.jpg`.
- `metrics.html` has a new "Page and photo views" section (`js/stats-gc.js`):
  date range, category, photo and traffic source filters; visits, page views,
  photo views, top photos, views by category, pages, traffic sources and
  device type.

## Steps for Mari

1. Make a free account at https://www.goatcounter.com/signup . Pick a site
   code, for example `floridanatureprints`. Your dashboard will be
   `https://floridanatureprints.goatcounter.com`.
2. In `js/config.js`, under `analytics`, set
   `goatcounterCode: "floridanatureprints"` (your code). The site code is not
   a secret.
3. In GoatCounter go to Settings, then API, and create a key with only
   "Read statistics" checked.
4. Open `https://floridanatureprints.com/metrics.html`, scroll to "Page and
   photo views", type the site code and paste the key, then press
   "Save in this browser" and "Load". The key stays in that browser's
   local storage only. Use "Forget key" on shared computers.
5. Never paste the API key into any site file or commit it.

## Honest notes

- metrics.html is `noindex`, blocked in robots.txt and not in the menu, but a
  static page cannot be truly private. Anyone with the address can open it.
  They cannot see numbers without your key.
- GoatCounter counts unique visitors per page, so "page views" means pages
  opened, counted once per visitor per page in the period, not every reload.
- Visits are hidden ("n/a") when a photo filter is on, because photo events are
  not page visits.
- The traffic source filter looks up sources for the top 20 pages or photos in
  the current view, to stay inside GoatCounter's rate limit.
- Device type uses GoatCounter's screen size groups (phones, tablets,
  computers).
- Not yet tested against a real GoatCounter account. If the browser refuses
  the request (a CORS error in the console), the dashboard at
  goatcounter.com still shows the same numbers, including the photo events.
