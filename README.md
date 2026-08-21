# Florida Nature Prints — Website Guide

A simple, mobile-friendly website for selling Florida nature photography prints.

**You do not need to know how to code.** Most changes happen in one easy file: `js/config.js`.

---

## Where is my website?

Your site lives in this folder:

```
/Users/maricooks/florida-nature-prints
```

### Folder map

| Folder / file | What it is |
|---------------|------------|
| `index.html` | Home page |
| `gallery.html` | Photo gallery |
| `shop.html` | Buy prints, mugs, and a jar of shark teeth |
| `name.html` | Name shark teeth, a hibiscus, or a gallery photo |
| `studio.html` | **Your** naming tracker + 2×3.5 mini-scroll printer (not in the public menu) |
| `game.html` | Wildlife Match (10-level matching game) |
| `offline/gator-life/` | Gator Life hop-runner, saved for later |
| `about.html` | About you |
| `contact.html` | Contact form |
| `css/styles.css` | Look and colors |
| `js/config.js` | **Edit this** for name, email, prices, photos, Stripe, Formspree |
| `js/main.js` | Makes buttons and forms work (usually leave alone) |
| `images/prints/` | **Put your photos here** |
| `images/hibiscus/` | Hibiscus photos for the naming page |
| `images/named/` | Photos of named teeth / flowers (after you shoot them) |
| `metrics.html` | **Your** visitor counts (not in the public menu) |
| `charts, to do, instructions, SOP's/` | **Your** naming SOP PDF (paper, bottle, ribbon, how to fulfill) — not in the public menu |

---

## Wildlife Match (the live game)

The **Match** tab is a 10-level memory game using your real print photos (birds, gators, and other Florida wildlife).

- Level 1 starts with **7 pairs**, then 8, 9, and so on, up to **20 pairs** on level 15.
- Each match scores visible points.
- Finish all 15 levels to earn a gift certificate: a jar of 15 shark teeth, or $8 toward the next order.
- Quiet ads around the board link prints to your shop order form, and cookies/spices to [maricooks.com](https://maricooks.com).

Gator Life (the older hop-runner) is saved here for later work:

```
florida-nature-prints/offline/gator-life/
```

Open `offline/gator-life/index.html` anytime. It is not in the public menu.

---

## Visitor counts

Open **https://floridanatureprints.com/metrics.html** (bookmark it — it is not in the public menu).

That private page shows:

- how many unique people visited
- how many pages they opened
- today and this week
- the nearest city / region for recent visitors
- which pages they opened, and how they arrived (Google, Instagram, typed the address, and so on)

Browsers do not share a visitor’s name. If someone orders or writes through Contact, that email is how you learn who they are.

Counts start from the day this was turned on. Local file previews on your computer are not counted.

---

## How to open the website on your computer

1. Open the folder `florida-nature-prints` in Finder.
2. Double-click `index.html`.
3. It opens in your browser (Chrome, Safari, etc.).

That’s it for previewing. (Forms that send email need Formspree set up — see below.)

---

## Where to put your photos (important)

### Exact folder

Put all print photos here:

```
florida-nature-prints/images/prints/
```

**Full path on your Mac:**

```
/Users/maricooks/florida-nature-prints/images/prints/
```

### Naming tips

- Photos are named after their print title (example: `golden-gulf.jpeg`).
- That makes it easy to find and delete ones you don’t want.
- Allowed types: `.jpg`, `.jpeg`, `.png`, `.webp`
- Landscape photos around **2000 pixels wide** look great and still load fine.

### How to remove a print

1. Look at the gallery title on the website (or the filename in `images/prints/`).
2. Delete that file from `images/prints/` (example: delete `gator-eyes.jpeg`).
3. Open `js/config.js` and delete that photo’s whole `{ file: ..., title: ..., desc: ... },` block.
4. Save and refresh the browser.

## Shark teeth

The shop currently offers one extra item: a jar of 15 fossil shark teeth ($20 plus shipping). It is listed in `js/config.js` under `souvenirs`. The photo is in `images/souvenirs/`.

---

## Name a piece of Florida

Public page: **https://floridanatureprints.com/name.html** (also the **Name** tab).

| Offer | Price | What they get |
|-------|-------|----------------|
| Name 3 shark teeth | $8 + $6 shipping | Three real teeth in a small cork bottle, certificate rolled and tied with a bow, listed in Named by You |
| Name a hibiscus | $4 | Named image by email; optional mini-scroll +$2 |
| Name a gallery photo | $3 digital, or +$3 on a print order | Digital: listed in Named by You only (no personalized file emailed). Or name it when ordering the print. |

Prices and hibiscus photos live in `js/config.js` under `naming`. Put your own hibiscus photos in `images/hibiscus/` and list them there.

### Certificates (one paper size)

Printed SOP (what to buy, what not to buy, step-by-step):  
`charts, to do, instructions, SOP's/Naming-SOP-what-works.pdf`

Every design prints on a **2″ × 3.5″ mini-scroll** — a standard US business card.

- **Paper:** Avery **8371** (inkjet) or **5371** (laser), 10 tear-apart cards per letter sheet. Amazon, Office Depot, Walmart.
- **Bottle:** 50 ml cork bottle, about **4–5″ tall and 1.4″ wide**. Search “50ml glass bottles with cork 4 inch”. Do not buy the short 2″ squat jars — the scroll plus bow will not fit.
- Roll along the 3.5″ side (the scroll is 2″ tall), tie a ⅛″ ribbon bow, cork with the three teeth.

Customers pick one of **ten designs** (fonts, colors, background). You print whatever they picked.

### Behind the scenes

Bookmark **https://floridanatureprints.com/studio.html** (not in the public menu).

1. An order email arrives.
2. Click **New order** and copy in the names.
3. **Lock names / assign IDs** — this gives registry numbers like `FNP-T-2026-0001`.
4. Photograph the teeth (or flower / named print).
5. **Print the mini-scroll**, roll it, tie a bow, bottle it with the teeth.
6. Pack / email, mark **sent**, then **published**.
7. Registry → **Download named-registry.js** and replace `js/named-registry.js`, then upload the site.

Orders save in this browser. Use **Download backup** so you don’t lose the list.

Named photos you take go in `images/named/` (put the filename on the order).

---

### After you add photos — update the list

1. Open `js/config.js` in any text editor (TextEdit is fine; set format to **Plain Text**).
2. Find the `photos:` section.
3. For each photo, add an entry like this:

```js
{
  file: "sunrise-beach.jpg",   // exact filename in images/prints/
  title: "Sunrise Beach",
  desc: "Soft light on the Gulf coast",
},
```

4. You can **delete** the placeholder entries (`placeholder-1.svg`, etc.) once your real photos are listed.
5. Save the file and refresh the browser.

**Example with your own photos:**

```js
photos: [
  {
    file: "morning-mist.jpg",
    title: "Morning Mist",
    desc: "Soft light over a quiet Florida marsh",
  },
  {
    file: "gulf-shore.jpg",
    title: "Gulf Shoreline",
    desc: "Turquoise water meeting pale sand",
  },
],
```

The gallery and shop order dropdown update automatically from this list.

---

## Step 1 — Put your name and email on the site

Open `js/config.js` and change:

```js
yourName: "Your Name",
yourEmail: "you@example.com",
```

to your real name and email. Save and refresh.

---

## Step 2 — Get order & contact emails (Formspree)

Forms need a free service so messages can reach your inbox.

1. Go to [https://formspree.io](https://formspree.io) and create a free account.
2. Create a **new form**.
3. Set the email to the address where you want orders and contact messages.
4. Copy the form ID (it looks like `xyzabcde` — part of the form URL).
5. In `js/config.js`, replace:

```js
formspreeFormId: "YOUR_FORM_ID",
```

with:

```js
formspreeFormId: "xyzabcde",
```

6. Save and test the Contact form and the Shop order form.

You’ll get an email with the customer’s name, email, address, print choice, and size.

---

## Step 3 — Add your Stripe payment link

1. In your Stripe account, create a **Payment Link** for your prints (or one general “Print order” product for now).
2. Copy the full URL (starts with `https://buy.stripe.com/...`).
3. In `js/config.js`, replace:

```js
stripePaymentLink: "https://buy.stripe.com/test_REPLACE_WITH_YOUR_LINK",
```

with your real link.

4. Save. The **Pay securely with Stripe** button on the Shop page will use it.

### Switching payment later

To use PayPal, Venmo, or another link, just put that URL in `stripePaymentLink` instead. No other code changes required. (You can also rename the button text in `shop.html` if you want.)

---

## Changing print sizes and prices

In `js/config.js`, edit the `printSizes` list:

```js
printSizes: [
  { id: "5x7", label: '5" × 7"', price: 18 },
  { id: "8x10", label: '8" × 10"', price: 28 },
  { id: "11x14", label: '11" × 14"', price: 44 },
  // add or remove lines as needed
],
```

---

## Changing about page story

Open `about.html` and edit the paragraphs under “Hello, I’m …”. Keep the surrounding HTML tags; only change the words between them.

---

## Putting the site online (when you’re ready)

Easy free options for beginners:

1. **Netlify Drop** — go to [https://app.netlify.com/drop](https://app.netlify.com/drop) and drag the whole `florida-nature-prints` folder onto the page.
2. **GitHub Pages** or **Cloudflare Pages** — also free; slightly more setup.

After it’s online, Formspree and Stripe will work for real customers.

---

## Quick checklist

- [ ] Put photos in `images/prints/`
- [ ] List each photo in `js/config.js` under `photos`
- [ ] Set `yourName` and `yourEmail` in `js/config.js`
- [ ] Add Formspree form ID in `js/config.js`
- [ ] Add Stripe Payment Link in `js/config.js`
- [ ] Edit About page text if you want
- [ ] Open `index.html` to preview
- [ ] Later: upload the whole folder to Netlify (or similar)

---

## Need help?

If something looks broken:

1. Make sure file names in `config.js` **exactly match** the files in `images/prints/` (including `.jpg` vs `.jpeg`).
2. Use **Plain Text** when editing with TextEdit (Format → Make Plain Text).
3. Hard-refresh the browser: `Cmd + Shift + R` on Mac.
