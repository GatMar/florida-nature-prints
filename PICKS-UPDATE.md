# Photo update, branch picks-2026-10-18

Local branch only. Not pushed or deployed.

## Photos

- 147 photos from the "Florida Nature Prints picks" folder replace the old set.
- Web copies: 2000px long side, JPEG quality 82, in `images/prints/`. Small copies: 600px, in `images/prints/thumbs/`. EXIF and GPS removed. Full-size originals are not in the repo.
- 29 old site files were replaced by the full-size original of the same frame. They keep their old filename, title and description.
- Photo `width` and `height` in `js/config.js` are the web copy size, used to avoid layout shift.

| Category | Photos |
|---|---|
| anhinga | 19 |
| beaches | 9 |
| close-ups | 9 |
| flowers | 34 |
| gators | 18 |
| herons | 15 |
| storks | 18 |
| sunsets | 13 |
| turtles | 6 |
| shells | 6 |

## Removed old site images (63)

Moved out with `git rm` on this branch only. Reasons are in "Florida Nature Prints roster.xlsx" in the iCloud picks folder.

- `almost-walked-gator.jpeg`: subject small; dropped for consistency with phase-2 small-subject rejects
- `amber-waves.jpeg`: near-duplicate of kept pick IMG_2204 (Open Water Sunset)
- `anhinga-drying.jpeg`: subject small
- `anhinga-neck.jpeg`: near-duplicate of kept pick IMG_6437 (Anhinga Portrait)
- `another-day-gator.jpeg`: soft (lap 115), subject tiny
- `baby-manatee.jpeg`: subject small and murky; not really a beach image (borderline reject)
- `clouded-gold.jpeg`: low detail, same evening as kept frames
- `egret-curve.jpeg`: near-duplicate of egret-looking-down
- `egret-looking-down.jpeg`: plain dark background
- `egret-on-the-shore.jpeg`: heron trim; site file about 2000px, below the 3000px bar, no full-size original
- `egret-portrait.jpeg`: near-duplicate of kept pick IMG_8219 (Egret by the Water)
- `evening-shore.jpeg`: near-duplicate of kept pick IMG_2173 (Beach Horizon Glow)
- `floating-gator.jpeg`: low detail
- `focused-mister-egret.jpeg`: heron trim; site file about 2000px, below the 3000px bar, no full-size original
- `footprints-at-sunset.jpeg`: near-duplicate of kept pick IMG_2173 (Beach Horizon Glow)
- `gator-bottoms-up.jpeg`: near-duplicate of kept pick IMG_2476
- `gator-egret-breakfast.jpeg`: gator barely visible; weak for the category
- `gator-etiquette.jpeg`: flat water, near-duplicate of IMG_6385
- `gator-from-above.jpeg`: near-duplicate of kept pick IMG_5607 (Gator in Still Water)
- `gator-mid-yawn.jpeg`: resolution: 2048px long side, no full-size original in Photos export
- `gator-on-patrol.jpeg`: subjects small; dropped for consistency
- `gator-road-crossing.jpeg`: subject small, sidewalk in frame
- `gator-surface.jpeg`: low detail
- `golden-hour-heron.jpeg`: subject small
- `great-blue-among-reeds.jpeg`: near-duplicate of kept pick IMG_3986 (Great Blue Heron)
- `great-blue-command.jpeg`: heron trim; site file about 2000px, below the 3000px bar, no full-size original
- `great-egret-morning.jpeg`: plain dark water
- `heron-against-the-sky.jpeg`: large flat sky
- `heron-close-portrait.jpeg`: heron trim; site file about 2000px, below the 3000px bar, no full-size original
- `heron-glow.JPG`: duplicate of heron-close-portrait (phash 0)
- `heron-in-chilled-lake.jpeg`: subject hidden in brush / cut off (visual check)
- `heron-in-clear-water.jpeg`: same bird/session as heron-at-the-shore
- `heron-in-warm-light.jpeg`: near-duplicate of heron-close-portrait
- `heron-morning-bask.jpeg`: very low detail
- `heron-neck-curve.jpeg`: low detail
- `heron-on-the-bank.jpeg`: same bird/spot as heron-along-the-canal
- `heron-rising-sun.jpeg`: near-duplicate of heron-morning-bask
- `heron-silhouette.jpeg`: plain, weak detail
- `heron-stride.jpeg`: near-duplicate of kept pick IMG_8415 (Heron in Evening Grass)
- `horizon-fire.jpeg`: near-duplicate of kept pick IMG_2204 (Open Water Sunset)
- `last-light-on-the-beach.jpeg`: near-duplicate of a kept frame, same evening
- `marsh-at-dusk.jpeg`: low detail
- `more-gators-one.jpeg`: resolution: 2048px long side, no full-size original in Photos export
- `more-gators-three.jpeg`: obscured by reflections
- `more-gators-two.jpeg`: resolution: 2048px long side, no full-size original in Photos export
- `orange-afterglow.jpeg`: near-duplicate of kept pick IMG_1586 (Crimson Marsh)
- `pink-bay-clouds.jpg`: resolution: 2000px long side, no full-size original in Photos export
- `pink-cloud-reflections.jpeg`: very soft; near-duplicate scene of marsh-at-dusk
- `sandhill-crane-elegant.jpeg`: soft tight crop, body cut off
- `sandhill-crane-pair.jpeg`: soft tight crop, body cut off (visual check)
- `sandhill-crane-walk.jpeg`: heron trim; site file about 2000px, below the 3000px bar, no full-size original
- `sea-and-sky.jpeg`: near-duplicate of last-light-on-the-beach (feature match)
- `sky-on-fire.jpeg`: soft, no clear subject (visual check)
- `snowy-egret-hunter.jpeg`: heron trim; site file about 2000px, below the 3000px bar, no full-size original
- `storm-lit-sunset.jpeg`: near-duplicate of last-light-on-the-beach
- `storm-sunset.jpeg`: near-duplicate of kept pick IMG_1586 (Crimson Marsh)
- `sun-over-the-gulf.jpeg`: large flat areas
- `wetland-neighbors.jpeg`: subjects small
- `wood-stork-in-the-marsh.jpeg`: near-duplicate of kept pick IMG_3897 (Wood Stork Foraging)
- `wood-stork-on-the-bank.jpeg`: near-duplicate of wood-stork-standing-tall
- `wood-stork-profile.jpeg`: near-duplicate of kept pick IMG_3882 (Wood Stork Walking)
- `wood-stork-standing-tall.jpeg`: subject small
- `wood-stork-watchful.jpeg`: near-duplicate of kept pick IMG_3882 (Wood Stork Walking)

## Other changes

- New gallery categories: Close-ups, Turtles, Flowers, Shells.
- Match game card lists use current photos; cards use the 600px copies.
- Old Gator Life backgrounds in `js/game.js` and `css/game.css` point to current sunsets (those files are not loaded by any page today).
- Mobile: 44px tap targets, no sideways scroll on name.html, lazy images with srcset and width/height.
- Stats: see STATS-SETUP.md.

## Selling switch (commerce freeze)

Second commit on this branch: "Turn off selling UI (commerce freeze)".

- `js/config.js` has `sellingEnabled: false`. Every selling element carries a `data-sell`
  attribute. Each page starts with `<html class="selling-off">`, so they are hidden by CSS
  before any script runs. Nothing was deleted; set `sellingEnabled: true` to bring it all back.
- `js/selling.js` (loaded right after config.js on every page) sets the page class:
  `selling-on`, `selling-off`, or `selling-preview`.
- Review mode: add `?preview=buy` to any page URL. Selling items show greyed out with a DRAFT
  tag and a dashed outline, and a DRAFT banner sits at the bottom. Clicks and form submits on
  them are blocked, so no order can be sent. The preview lasts for the browser tab;
  `?preview=off` (or the banner link) ends it.

What is hidden while selling is off:

- All pages: "Shop" and "Name" links in the header and footer menus.
- index.html: "Name 3 shark teeth $8" hero button; "Quality prints", "Prints & photo mugs"
  and "Easy ordering" list items; the shark teeth offer card; "Name this print" on Print of
  the day; the gift certificate sentence in the Wildlife Match section; the Shark teeth
  section (jar $20, Add to order, Name them $8); "Give it a name"; the "Shop prints" band.
- gallery.html: "Buy print / mug" and "Name it · $3" on every photo card; the lightbox
  "Buy print / mug" button; the "Buy print / mug" sentence in the intro; Named by You.
- shop.html: the whole page (prints, mugs, prices, souvenirs, naming band, order form,
  payment buttons). A short "The shop is not open yet." notice with Gallery and Match
  buttons shows instead.
- name.html: the whole naming page (paid naming, prices, order form, payment buttons,
  Named by You). Naming is paid at every step, so it could not be split into a free part.
  A short "Naming is not open yet." notice shows instead.
- game.html: the "Win a gift" rule tile, "and gifts" in the subtitle, all gift certificate
  boxes (start, choose, done), the shop print ads and MariCooks ads around the board, and
  the MariCooks note in the footer. Clearing all 15 levels just says
  "You matched every stretch." The game itself is unchanged.
- contact.html: "For orders, you can also use the form on the Shop page."
- studio.html (owner page): the Shop and Name menu links and the footer "Name page" link.
  The studio tools themselves are unchanged.
- Meta descriptions on index, shop, name, game and contact no longer mention prices,
  orders or gifts.

Not changed: the index headline "Florida nature, printed for your walls", the business
name, and the private studio guide text.
