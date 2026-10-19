# Owner stats setup (GoatCounter)

GoatCounter is the only visitor counter on the site. It counts on GoatCounter's own
server. Reading the numbers needs your API key, which you type into metrics.html and
which stays only in that browser (localStorage). Nothing is counted until you do the
steps below. No account was created for you.

## October 19, 2026: old visitor log removed

- The old counter wrote visits from each visitor's browser into a public Telegraph page,
  bumped public abacus.jasoncameron.dev counters, and looked up each visitor's city with
  ipwho.is or get.geojs.io. Its write key was readable in the site code, so anyone could
  edit or fake the counts.
- That key was revoked on October 19, 2026 and no longer works. The code and the key were
  removed from the site. The key is still in old git history, but it is dead.
- The old history (August 18 to October 19, 2026) was saved as
  "old visitor log backup.xlsx" in the iCloud "Florida Nature Prints picks" folder.
  Last values: 192 page views and 59 visitors in the log; abacus counters views 204 and
  people 66. Treat them as approximate.
- The site no longer sends anything to telegra.ph, abacus.jasoncameron.dev, ipwho.is or
  get.geojs.io.

## What the site does now

- `js/goatcounter.js` loads GoatCounter only when `SITE_CONFIG.analytics.goatcounterCode`
  is filled in, only on the live site, never for bots, and never on metrics.html or
  studio.html.
- Each time a photo is opened or enlarged in the lightbox, a GoatCounter event is
  recorded with the path `photo/<category>/<file>`, for example
  `photo/flowers/red-hibiscus-6661.jpg`.
- `metrics.html` shows "Page and photo views" (`js/stats-gc.js`): date range, category,
  photo and traffic source filters; visits, page views, photo views, top photos, views by
  category, pages, traffic sources and device type.

## Steps for Mari

1. Make a free account at https://www.goatcounter.com/signup . Pick a site code, for
   example `floridanatureprints`. Your dashboard will be
   `https://floridanatureprints.goatcounter.com`.
2. In `js/config.js`, under `analytics`, set `goatcounterCode: "floridanatureprints"`
   (your code). The site code is not a secret.
3. In GoatCounter go to Settings, then API, and create a key with only
   "Read statistics" checked.
4. Open `https://floridanatureprints.com/metrics.html`, scroll to "Page and photo views",
   type the site code and paste the key, then press "Save in this browser" and "Load".
   Use "Forget key" on shared computers.
5. Never paste the API key into any site file or commit it.

## Honest notes

- metrics.html is `noindex`, blocked in robots.txt and not in the menu, but a static page
  cannot be truly private. Anyone with the address can open it. They cannot see numbers
  without your key.
- GoatCounter counts unique visitors per page, so "page views" means pages opened,
  counted once per visitor per page in the period, not every reload.
- Visits show "n/a" when a photo filter is on, because photo events are not page visits.
- The traffic source filter looks up sources for the top 20 pages or photos in the
  current view, to stay inside GoatCounter's rate limit.
- Device type uses GoatCounter's screen size groups (phones, tablets, computers).
- Not yet tested against a real GoatCounter account. If the browser refuses the request
  (a CORS error in the console), the dashboard at goatcounter.com shows the same numbers,
  including the photo events.
