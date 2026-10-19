/**
 * ============================================================
 *  EASY SETTINGS  - edit this file to customize your website
 * ============================================================
 *  You only need to change the values below (keep the quotes).
 *  After saving, refresh your browser to see the changes.
 */

// Attached to window so every page script can read it reliably
var SITE_CONFIG = window.SITE_CONFIG = {
  // ---- Selling switch (commerce freeze) ----
  // false = every buy, order, price, paid naming, gift certificate and shop ad is hidden.
  // Add ?preview=buy to any page URL to see them greyed out as DRAFT (no orders possible).
  // ?preview=off ends the preview. Set to true only when Mari is ready to sell.
  sellingEnabled: false,

  // ---- Your info ----
  businessName: "Florida Nature Prints",
  tagline: "Calm moments from the Sunshine State",
  yourName: "Florida Nature Prints", // public name on About/Contact (not a personal name)
  yourEmail: "hello@floridanatureprints.com",

  // Optional: your cell for display on the site (leave blank to hide)
  yourPhone: "",

  // ---- Contact & order forms (email) ----
  // Orders/contact go to yourEmail via FormSubmit (no extra account needed).
  // FIRST time: check hello@… inbox and click FormSubmit’s confirmation link.
  // After that, messages arrive automatically.
  // Optional Formspree form ID (overrides FormSubmit if set):
  formspreeFormId: "",

  // ---- Text / SMS alerts when someone orders ----
  // Easiest free option: carrier email-to-text (you get a short text on your phone).
  // Put your number + carrier gateway email below, e.g.:
  //   "5551234567@vtext.com"     Verizon
  //   "5551234567@tmomail.net"   T-Mobile
  //   "5551234567@txt.att.net"   AT&T
  //   "5551234567@messaging.sprintpcs.com"  Sprint (legacy)
  // Leave blank ("") to only get email (no text).
  smsAlertEmail: "",

  // Also CC any extra email (assistant, spouse, Gmail, etc.) - blank = none
  orderCcEmail: "",

  // ---- Website visitors (private page: metrics.html) ----
  // Counts unique people and page views. The metrics page also lists
  // recent visitors by city/region (browsers do not share a name).
  analytics: {
    // GoatCounter site code, e.g. "floridanatureprints" for floridanatureprints.goatcounter.com.
    // Blank = GoatCounter stays off. See STATS-SETUP.md. Never put an API key here.
    goatcounterCode: "",
  },

  // ---- Payment options ----
  // Create Payment Links in Stripe Dashboard → Payment links
  // Use one general “Florida Nature Prints order” product, or separate links.
  stripePaymentLink: "https://buy.stripe.com/test_REPLACE_WITH_YOUR_LINK",
  // Optional second Stripe link just for mugs (if empty, uses stripePaymentLink)
  stripeMugPaymentLink: "",
  // Optional alternate payments (leave "" to hide that button)
  paypalPaymentLink: "", // e.g. https://paypal.me/YourName
  venmoPaymentLink: "", // e.g. https://venmo.com/u/YourName  or  venmo://paycharge?txn=pay&recipients=YourName
  // Shown under payment buttons
  paymentNote:
    "After you submit the order form, pay with one of the secure options. I’ll match your payment to your order email.",

  // ---- Print sizes & prices ----
  // Regular sizes are ready to order. Larger sizes are custom (made to order).
  printSizes: [
    { id: "5x7", label: '5" × 7" print', price: 18 },
    { id: "8x10", label: '8" × 10" print', price: 28 },
    { id: "11x14", label: '11" × 14" print', price: 44 },
    {
      id: "16x20",
      label: '16" × 20" print',
      price: 68,
      custom: true,
      desc: "Custom order · made to size",
    },
    {
      id: "20x30",
      label: '20" × 30" print',
      price: 100,
      custom: true,
      desc: "Custom order · made to size",
    },
  ],

  // ---- Mugs (standard 12 oz blanks for Circuit / mug press printing) ----
  // Printed with the same Florida gallery scenes using your mug printer.
  mugStyles: [
    {
      id: "12oz-ceramic",
      label: "12 oz ceramic mug",
      price: 18,
      desc: "Standard 12 oz blank · your chosen scene printed on a Circuit mug press",
    },
  ],

  // ---- Souvenirs (shark teeth only for now) ----
  souvenirs: [
    {
      id: "shark-tooth",
      label: "Jar of 15 Florida shark teeth",
      price: 20,
      file: "shark-tooth-jar.jpg",
      desc: "Fifteen fossil shark teeth of various sizes in a small glass jar. $20 plus shipping.",
      giftKind: "shark-tooth",
    },
  ],

  /**
   * ---- Name a piece of Florida ----
   * Public page: name.html
   * Behind-the-scenes tracker + certificate printer: studio.html
   * Certificates print on one size: 2" × 3.5" mini-scrolls
   * (US business-card size). Roll with a ribbon into a small bottle.
   */
  naming: {
    paper: {
      id: "2x3.5",
      label: '2" × 3.5" mini scroll (Avery 8371 business card)',
      widthIn: 2,
      heightIn: 3.5,
      avery: "8371",
      why:
        "US business-card size, the small card you can actually buy. Avery 8371 (inkjet) or 5371 (laser), 10 tear-apart cards per letter sheet, at Amazon, Office Depot, or Walmart. Roll along the 3.5\" side so the scroll is 2\" tall, tie a thin ribbon bow.",
    },
    bottle: {
      label: '50 ml tall cork bottle, about 4 to 5" high and 1.4" wide',
      search: "50ml glass bottles with cork 4 inch",
      why:
        "This is the common bottle that actually fits a 2\" scroll, a bow, and three teeth. Skip the short squat 50 ml jars (about 2\" tall). The scroll will not fit.",
    },
    products: [
      {
        id: "teeth",
        label: "Name 3 Shark Teeth",
        price: 8,
        namesNeeded: 3,
        physical: true,
        file: "named-trio-sample.jpg",
        folder: "souvenirs",
        kicker: "You name them. You keep them.",
        lede:
          "You name them, you pay for them, you keep them. Three real Florida shark teeth for $8.",
        body:
          "These are genuine teeth found along the shores of Southwest Florida. You choose the three names, we photograph each tooth with its name, and we mail all three in a small glass bottle, the certificate rolled and tied with a little bow.",
        galleryNote: "Your named teeth will also appear in our rotating gallery.",
        closing: "Three little pieces of Florida, now yours.",
      },
      {
        id: "hibiscus",
        label: "Name a Hibiscus",
        price: 4,
        namesNeeded: 1,
        physical: false,
        file: "sunrise-blush.jpg",
        folder: "hibiscus",
        kicker: "A flower with a name",
        lede: "For $4 you can give a name to one Florida hibiscus.",
        body:
          "Choose a name and we’ll add it to a beautiful photo of the flower. You’ll receive the named image, and it will join our gallery of named hibiscus.",
        galleryNote: "",
        closing: "All hibiscus are loved by the sun… but only some have names.",
      },
      {
        id: "photo",
        label: "Name a Gallery Photo",
        price: 3,
        namesNeeded: 1,
        physical: false,
        file: "golden-gulf.jpeg",
        folder: "prints",
        kicker: "Name what you love",
        lede:
          "For $3 you can name a gallery photo digitally. It stays in Named by You under your chosen name.",
        body:
          "Pick a bird, alligator, shell, sunset, or any image you love. Digital only: we do not email a personalized file. The photo is kept in our gallery under the name you choose. Want it on your wall? Add the name for an extra $3 when you order the print.",
        galleryNote: "",
        closing:
          "You can’t keep a free-flying bird or a wild alligator, but you can give it a name that stays forever.",
      },
    ],
    hibiscus: [
      {
        id: "sunrise-blush",
        file: "sunrise-blush.jpg",
        title: "Sunrise Blush",
        desc: "Pale peach petals, a deep rose throat",
      },
      {
        id: "crimson-gulf",
        file: "crimson-gulf.jpg",
        title: "Crimson Gulf",
        desc: "A velvety red Florida bloom",
      },
      {
        id: "coral-dawn",
        file: "coral-dawn.jpg",
        title: "Coral Dawn",
        desc: "Soft coral and peach in morning light",
      },
      {
        id: "moon-white",
        file: "moon-white.jpg",
        title: "Moon White",
        desc: "Creamy white with a magenta heart",
      },
      {
        id: "sun-gold",
        file: "sun-gold.jpg",
        title: "Sun Gold",
        desc: "Golden yellow, bright as a Florida noon",
      },
    ],
    shipping: {
      teeth: {
        methodTitle: "Small padded mailer (bottle of teeth + rolled certificate)",
        packaging: 2,
        postage: 4,
        total: 6,
      },
      card: {
        methodTitle: "First-class envelope (mini certificate)",
        packaging: 0.5,
        postage: 1.5,
        total: 2,
      },
      digital: {
        methodTitle: "Digital only, named in the gallery",
        packaging: 0,
        postage: 0,
        total: 0,
      },
    },
    printNameAddOn: 3,
  },

  // Sister bakery (cookies + pantry spices) - used as quiet ads around the match game
  sisterSite: {
    name: "MariCooks",
    url: "https://maricooks.com",
    orderUrl: "https://maricooks.com/order.html",
    menuUrl: "https://maricooks.com/menu.html",
    blurb: "Homemade cookies, spice mixes, and pantry jars",
  },

  // Wildlife Match gift after all 15 levels
  matchReward: {
    creditAmount: 8,
    storageKey: "fnpMatch_v1",
  },

  /**
   * ---- Shipping & packaging ----
   * Customer pays a FLAT FEE (not a live rate calculator).
   * Carrier assumption: USPS Priority Mail.
   *
   * Tube: one uniform 3" × 24" kraft with end caps for every print size
   * (roll along the shorter edge). Under 30" long helps avoid the steep
   * USPS nonstandard-length fee.
   *
   * Tube cost reality (approx., early 2026):
   *   - Bulk (Uline carton ~25): ~$1.50 to $3.50 each (thin vs heavy wall)
   *   - Small packs / Amazon singles: often ~$5 to $10 each
   * packaging below assumes small-pack buying (~$5 tube + wrap/label ~$1 = $6).
   * totals = flat fee charged to customer (packaging + postage buffer).
   * Edit any number anytime - shop page reads this automatically.
   */
  shipping: {
    region: "Continental U.S.",
    carrier: "USPS Priority Mail",
    methodTitle: "Hard mailing tube (rolled print)",
    feeLabel: "Flat shipping fee",
    tube: {
      label: '3" × 24" kraft mailing tube with end caps',
      diameterIn: 3,
      lengthIn: 24,
      packageCost: 6,
      why:
        "Hard tubes are the standard way to mail unframed prints. They protect against creases better than a flat mailer, especially for 16×20 and 20×30. One tube size for every print: rolled along the shorter edge, tissue-wrapped, then capped. Packaging cost assumes a real-world small-pack tube (~$5) plus wrap and label (~$1), not bulk warehouse pricing.",
    },
    // packaging + estimated USPS Priority postage → flat fee (total) charged to customer
    printRates: [
      {
        sizeId: "5x7",
        packaging: 6,
        postage: 8,
        total: 14,
      },
      {
        sizeId: "8x10",
        packaging: 6,
        postage: 9,
        total: 15,
      },
      {
        sizeId: "11x14",
        packaging: 6,
        postage: 10,
        total: 16,
      },
      {
        sizeId: "16x20",
        packaging: 6,
        postage: 11,
        total: 17,
      },
      {
        sizeId: "20x30",
        packaging: 6,
        postage: 13,
        total: 19,
      },
    ],
    mug: {
      methodTitle: "Padded box with bubble wrap",
      packaging: 4,
      postage: 8,
      total: 12,
    },
    souvenir: {
      methodTitle: "Padded mailer",
      packaging: 3,
      postage: 5,
      total: 8,
    },
    note:
      "These are flat fees (not a live quote). Ships via USPS Priority Mail with tracking within the continental U.S. Alaska, Hawaii, and international: message me for a quote.",
  },

  /**
   * ---- Gallery categories ----
   * Front of the gallery shows one cover photo per category.
   * id must match photo.category values below.
   * cover = filename in images/prints/ used as the category picture
   */
  categories: [
    {
      id: "sunsets",
      label: "Sunsets",
      cover: "crimson-marsh.jpeg",
      blurb: "Skies on fire over Florida water",
    },
    {
      id: "beaches",
      label: "Beaches",
      cover: "golden-gulf.jpeg",
      blurb: "Soft sand, gulf light, quiet shores",
    },
    {
      id: "gators",
      label: "Gators",
      cover: "adult-seven-foot-gator.jpeg",
      blurb: "Scaly neighbors of the wetlands",
    },
    {
      id: "herons",
      label: "Herons",
      cover: "great-blue-heron.jpeg",
      blurb: "Herons, egrets, and tall waders",
    },
    {
      id: "anhinga",
      label: "Anhinga",
      cover: "anhinga-3511.jpg",
      blurb: "Snakebirds sunning by the water",
    },
    {
      id: "storks",
      label: "Storks",
      cover: "wood-stork-by-the-palm.jpeg",
      blurb: "Wood storks of the marsh",
    },
    {
      id: "close-ups",
      label: "Close-ups",
      cover: "alligator-close-up-5663.jpg",
      blurb: "Faces and details up close",
    },
    {
      id: "turtles",
      label: "Turtles",
      cover: "gopher-tortoise-9671.jpg",
      blurb: "Gopher tortoises and turtles",
    },
    {
      id: "flowers",
      label: "Flowers",
      cover: "red-hibiscus-6661.jpg",
      blurb: "Hibiscus and other blooms",
    },
    {
      id: "shells",
      label: "Shells",
      cover: "egg-cases-and-horseshoe-crab-molt-5173.jpg",
      blurb: "Shells and beach finds",
    },
  ],

  /**
   * ---- Your photos ----
   * Web copies (2000px) live in images/prints/, small copies (600px) in images/prints/thumbs/.
   * Full-size originals stay off the site (see the iCloud picks folder).
   * file / title / desc / category (one of the category ids above)
   */
  photos: [
    // --- Featured (also on home) ---
    {
      file: "golden-gulf.jpeg",
      title: "Golden Gulf",
      desc: "Sun on the horizon over calm Florida waters",
      category: "beaches",
      width: 1500,
      height: 2000,
    },
    {
      file: "crimson-marsh.jpeg",
      title: "Crimson Marsh",
      desc: "Fiery sky reflected in still water",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-portrait.JPG",
      title: "Anhinga Portrait",
      desc: "Close-up of a diving bird against blue water",
      category: "close-ups",
      width: 1500,
      height: 2000,
    },
    // --- Sunsets ---
    {
      file: "sunset-4115.jpg",
      title: "Sunset 1",
      desc: "Photographed August 2024",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "sunset-4513.jpg",
      title: "Sunset 2",
      desc: "Photographed August 2024",
      category: "sunsets",
      width: 1500,
      height: 2000,
    },
    {
      file: "sunset-8101.jpg",
      title: "Sunset 3",
      desc: "Photographed November 2024",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "sunset-2891.jpg",
      title: "Sunset 4",
      desc: "Photographed January 2025",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "sunset-2986.jpg",
      title: "Sunset 5",
      desc: "Photographed January 2025",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "sunset-4596.jpg",
      title: "Sunset 6",
      desc: "Photographed June 2025",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "sunset-1515.jpg",
      title: "Sunset 7",
      desc: "Photographed September 2025",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "open-water-sunset.jpeg",
      title: "Open Water Sunset",
      desc: "Wide horizon of orange and blue",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "sunset-9640.jpg",
      title: "Sunset 8",
      desc: "Photographed December 2025",
      category: "sunsets",
      width: 1500,
      height: 2000,
    },
    {
      file: "sunset-1443.jpg",
      title: "Sunset 9",
      desc: "Photographed August 2026",
      category: "sunsets",
      width: 2000,
      height: 1500,
    },
    {
      file: "sunset-5295.jpg",
      title: "Sunset 10",
      desc: "Photographed September 2026",
      category: "sunsets",
      width: 1500,
      height: 2000,
    },
    {
      file: "sunset-5371.jpg",
      title: "Sunset 11",
      desc: "Photographed September 2026",
      category: "sunsets",
      width: 1500,
      height: 2000,
    },
    // --- Beaches ---
    {
      file: "beach-5199.jpg",
      title: "Beach 1",
      desc: "Photographed December 2023",
      category: "beaches",
      width: 2000,
      height: 1500,
    },
    {
      file: "beach-0120.jpg",
      title: "Beach 2",
      desc: "Photographed May 2024",
      category: "beaches",
      width: 2000,
      height: 1500,
    },
    {
      file: "beach-5115.jpg",
      title: "Beach 3",
      desc: "Photographed February 2025",
      category: "beaches",
      width: 1500,
      height: 2000,
    },
    {
      file: "beach-8485.jpg",
      title: "Beach 4",
      desc: "Photographed June 2025",
      category: "beaches",
      width: 2000,
      height: 1500,
    },
    {
      file: "beach-7510.jpg",
      title: "Beach 5",
      desc: "Photographed August 2025",
      category: "beaches",
      width: 2000,
      height: 1500,
    },
    {
      file: "beach-horizon-glow.jpeg",
      title: "Beach Horizon Glow",
      desc: "Warm light over a quiet shoreline",
      category: "beaches",
      width: 2000,
      height: 1500,
    },
    {
      file: "beach-3010.jpg",
      title: "Beach 6",
      desc: "Photographed October 2025",
      category: "beaches",
      width: 2000,
      height: 1500,
    },
    {
      file: "driftwood-on-the-beach-2066.jpg",
      title: "Driftwood on the beach",
      desc: "Photographed April 2026",
      category: "beaches",
      width: 2000,
      height: 1500,
    },
    // --- Gators ---
    {
      file: "alligator-0377.jpg",
      title: "Alligator 1",
      desc: "Photographed May 2024",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-0869.jpg",
      title: "Alligator 2",
      desc: "Photographed January 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-1484.jpg",
      title: "Alligator 3",
      desc: "Photographed January 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-3378.jpg",
      title: "Alligator 4",
      desc: "Photographed February 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-5393.jpg",
      title: "Alligator 5",
      desc: "Photographed February 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-8825.jpg",
      title: "Alligator 6",
      desc: "Photographed March 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-0964.jpg",
      title: "Alligator 7",
      desc: "Photographed April 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-1423.jpg",
      title: "Alligator 8",
      desc: "Photographed April 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-4090.jpg",
      title: "Alligator 9",
      desc: "Photographed May 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-0575.jpg",
      title: "Alligator 10",
      desc: "Photographed December 2025",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-6385.jpg",
      title: "Alligator 11",
      desc: "Photographed January 2026",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-7042.jpg",
      title: "Alligator 12",
      desc: "Photographed January 2026",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-2476.jpg",
      title: "Alligator 13",
      desc: "Photographed April 2026",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "gator-in-the-green.jpeg",
      title: "Gator in the Green",
      desc: "An alligator resting in algae-rich water",
      category: "gators",
      width: 1500,
      height: 2000,
    },
    {
      file: "young-gator.jpeg",
      title: "Young Gator",
      desc: "A smaller alligator in clear shallows",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "gator-in-still-water.jpeg",
      title: "Gator in Still Water",
      desc: "Top-down view of a resting alligator",
      category: "gators",
      width: 1500,
      height: 2000,
    },
    {
      file: "adult-seven-foot-gator.jpeg",
      title: "Seven-Foot Adult",
      desc: "A definitive adult Florida alligator",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-1339.jpg",
      title: "Alligator 14",
      desc: "Photographed August 2026",
      category: "gators",
      width: 2000,
      height: 1500,
    },
    // --- Herons ---
    {
      file: "great-blue-on-the-path.jpeg",
      title: "Great Blue on the Path",
      desc: "A heron pausing beside a Florida trail",
      category: "herons",
      width: 1500,
      height: 2000,
    },
    {
      file: "great-egret.jpeg",
      title: "Great Egret",
      desc: "Pure white among green marsh grass",
      category: "herons",
      width: 1500,
      height: 2000,
    },
    {
      file: "heron-in-tall-grass.jpeg",
      title: "Heron in Tall Grass",
      desc: "Soft light on a watchful bird",
      category: "herons",
      width: 1500,
      height: 2000,
    },
    {
      file: "heron-along-the-canal.jpeg",
      title: "Heron Along the Canal",
      desc: "A great blue walking the grassy edge",
      category: "herons",
      width: 1500,
      height: 2000,
    },
    {
      file: "egret-by-the-water.jpeg",
      title: "Egret by the Water",
      desc: "Elegant white bird near green cover",
      category: "herons",
      width: 2000,
      height: 1500,
    },
    {
      file: "heron-in-evening-grass.jpeg",
      title: "Heron in Evening Grass",
      desc: "Sunlit plumes at the shoreline",
      category: "herons",
      width: 2000,
      height: 1500,
    },
    {
      file: "heron-at-golden-hour.jpeg",
      title: "Heron at Golden Hour",
      desc: "Soft sun lighting every feather",
      category: "herons",
      width: 2000,
      height: 1500,
    },
    {
      file: "sandhill-crane.jpeg",
      title: "Sandhill Crane",
      desc: "A crane feeding along the water’s edge",
      category: "herons",
      width: 1500,
      height: 2000,
    },
    {
      file: "great-blue-heron.jpeg",
      title: "Great Blue Heron",
      desc: "Tall and still on a marshy shore",
      category: "herons",
      width: 2000,
      height: 1500,
    },
    {
      file: "heron-at-the-shore.jpeg",
      title: "Heron at the Shore",
      desc: "Blue-gray feathers and a sharp gaze",
      category: "herons",
      width: 2000,
      height: 1500,
    },
    {
      file: "heron-and-palm.jpeg",
      title: "Heron and Palm",
      desc: "A great blue framed by fronds and water",
      category: "herons",
      width: 1500,
      height: 2000,
    },
    {
      file: "heron-looking-down.jpeg",
      title: "Heron Looking Down",
      desc: "Quiet moment at the water’s edge",
      category: "herons",
      width: 1500,
      height: 2000,
    },
    {
      file: "farewell-egret.jpeg",
      title: "Farewell Egret",
      desc: "A watchful great egret on the trail",
      category: "herons",
      width: 1500,
      height: 2000,
    },
    {
      file: "great-blue-heron-in-lily-pads-1504.jpg",
      title: "Great blue heron in lily pads",
      desc: "Photographed August 2026",
      category: "herons",
      width: 2000,
      height: 1500,
    },
    {
      file: "sandhill-crane-lakeside.jpg",
      title: "Sandhill Crane Lakeside",
      desc: "Photographed October 2026",
      category: "herons",
      width: 2000,
      height: 1500,
    },
    // --- Anhinga ---
    {
      file: "anhinga-1001.jpg",
      title: "Anhinga 1",
      desc: "Photographed June 2024",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-1884.jpg",
      title: "Anhinga 2",
      desc: "Photographed January 2025",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-2423.jpg",
      title: "Anhinga 3",
      desc: "Photographed January 2025",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-3511.jpg",
      title: "Anhinga 4",
      desc: "Photographed February 2025",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-7082.jpg",
      title: "Anhinga 5",
      desc: "Photographed March 2025",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-6430.jpg",
      title: "Anhinga 6",
      desc: "Photographed November 2025",
      category: "anhinga",
      width: 1500,
      height: 2000,
    },
    {
      file: "anhinga-on-the-branch.jpeg",
      title: "Anhinga on the Branch",
      desc: "A sunning anhinga perched by the water",
      category: "anhinga",
      width: 1500,
      height: 2000,
    },
    {
      file: "anhinga-2753.jpg",
      title: "Anhinga 7",
      desc: "Photographed December 2025",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-4580.jpg",
      title: "Anhinga 8",
      desc: "Photographed January 2026",
      category: "anhinga",
      width: 1500,
      height: 2000,
    },
    {
      file: "anhinga-5261.jpg",
      title: "Anhinga 9",
      desc: "Photographed January 2026",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-6350.jpg",
      title: "Anhinga 10",
      desc: "Photographed January 2026",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-6905.jpg",
      title: "Anhinga 11",
      desc: "Photographed January 2026",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-8091.jpg",
      title: "Anhinga 12",
      desc: "Photographed February 2026",
      category: "anhinga",
      width: 1500,
      height: 2000,
    },
    {
      file: "anhinga-8097.jpg",
      title: "Anhinga 13",
      desc: "Photographed February 2026",
      category: "anhinga",
      width: 1500,
      height: 2000,
    },
    {
      file: "anhinga-9274.jpg",
      title: "Anhinga 14",
      desc: "Photographed March 2026",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-9282.jpg",
      title: "Anhinga 15",
      desc: "Photographed March 2026",
      category: "anhinga",
      width: 1500,
      height: 2000,
    },
    {
      file: "anhinga-3968.jpg",
      title: "Anhinga 16",
      desc: "Photographed May 2026",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-6279.jpg",
      title: "Anhinga 17",
      desc: "Photographed June 2026",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    {
      file: "anhinga-1527.jpg",
      title: "Anhinga 18",
      desc: "Photographed August 2026",
      category: "anhinga",
      width: 2000,
      height: 1500,
    },
    // --- Storks ---
    {
      file: "wood-stork-6620.jpg",
      title: "Wood stork 1",
      desc: "Photographed March 2025",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-storks-6662.jpg",
      title: "Wood storks 1",
      desc: "Photographed March 2025",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-6939.jpg",
      title: "Wood stork 2",
      desc: "Photographed March 2025",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-6936.jpg",
      title: "Wood stork 3",
      desc: "Photographed March 2025",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-by-the-palm.jpeg",
      title: "Wood Stork by the Palm",
      desc: "Tall white bird beside a sabal palm",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-in-the-shade.jpeg",
      title: "Wood Stork in the Shade",
      desc: "Soft light on a resting stork",
      category: "storks",
      width: 1500,
      height: 2000,
    },
    {
      file: "wood-stork-walking.jpeg",
      title: "Wood Stork Walking",
      desc: "Along the grassy bank of a canal",
      category: "storks",
      width: 1500,
      height: 2000,
    },
    {
      file: "wood-stork-foraging.jpeg",
      title: "Wood Stork Foraging",
      desc: "Head down in the shallows",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-4081.jpg",
      title: "Wood stork 4",
      desc: "Photographed January 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-4323.jpg",
      title: "Wood stork 5",
      desc: "Photographed January 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-5275.jpg",
      title: "Wood stork 6",
      desc: "Photographed January 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-5426.jpg",
      title: "Wood stork 7",
      desc: "Photographed January 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-storks-6027.jpg",
      title: "Wood storks 2",
      desc: "Photographed January 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-6500.jpg",
      title: "Wood stork 8",
      desc: "Photographed January 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-6507.jpg",
      title: "Wood stork 9",
      desc: "Photographed January 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-6766.jpg",
      title: "Wood stork 10",
      desc: "Photographed January 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-0156.jpg",
      title: "Wood stork 11",
      desc: "Photographed March 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-4203.jpg",
      title: "Wood stork 12",
      desc: "Photographed May 2026",
      category: "storks",
      width: 2000,
      height: 1500,
    },
    // --- Close-ups ---
    {
      file: "gator-up-close.jpeg",
      title: "Gator Up Close",
      desc: "Detailed view of an alligator’s face",
      category: "close-ups",
      width: 2000,
      height: 1500,
    },
    {
      file: "gator-eyes.jpeg",
      title: "Gator Eyes",
      desc: "Close portrait of an alligator at rest",
      category: "close-ups",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-close-up-5625.jpg",
      title: "Alligator close-up 1",
      desc: "Photographed May 2026",
      category: "close-ups",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-close-up-5637.jpg",
      title: "Alligator close-up 2",
      desc: "Photographed May 2026",
      category: "close-ups",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-close-up-5663.jpg",
      title: "Alligator close-up 3",
      desc: "Photographed May 2026",
      category: "close-ups",
      width: 2000,
      height: 1500,
    },
    {
      file: "alligator-close-up-5683.jpg",
      title: "Alligator close-up 4",
      desc: "Photographed May 2026",
      category: "close-ups",
      width: 2000,
      height: 1500,
    },
    {
      file: "gopher-tortoise-close-up-1299.jpg",
      title: "Gopher tortoise close-up",
      desc: "Photographed May 2025",
      category: "close-ups",
      width: 2000,
      height: 1500,
    },
    {
      file: "wood-stork-close-up-6524.jpg",
      title: "Wood stork close-up",
      desc: "Photographed January 2026",
      category: "close-ups",
      width: 1500,
      height: 2000,
    },
    // --- Turtles ---
    {
      file: "gopher-tortoise-7637.jpg",
      title: "Gopher tortoise 1",
      desc: "Photographed November 2024",
      category: "turtles",
      width: 2000,
      height: 1500,
    },
    {
      file: "gopher-tortoise-9671.jpg",
      title: "Gopher tortoise 2",
      desc: "Photographed March 2025",
      category: "turtles",
      width: 2000,
      height: 1500,
    },
    {
      file: "gopher-tortoise-1820.jpg",
      title: "Gopher tortoise 3",
      desc: "Photographed October 2025",
      category: "turtles",
      width: 2000,
      height: 1500,
    },
    {
      file: "turtle-in-the-grass-7005.jpg",
      title: "Turtle in the grass",
      desc: "Photographed June 2026",
      category: "turtles",
      width: 2000,
      height: 1500,
    },
    {
      file: "gopher-tortoise-1348.jpg",
      title: "Gopher tortoise 4",
      desc: "Photographed August 2026",
      category: "turtles",
      width: 2000,
      height: 1500,
    },
    {
      file: "gopher-tortoise-3364.jpg",
      title: "Gopher tortoise 5",
      desc: "Photographed September 2026",
      category: "turtles",
      width: 1500,
      height: 2000,
    },
    // --- Flowers ---
    {
      file: "red-hibiscus-6661.jpg",
      title: "Red hibiscus 1",
      desc: "Photographed April 2024",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "oleander-7290.jpg",
      title: "Oleander",
      desc: "Photographed April 2024",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "red-hibiscus-8030.jpg",
      title: "Red hibiscus 2",
      desc: "Photographed May 2024",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "desert-rose-8256.jpg",
      title: "Desert rose",
      desc: "Photographed May 2024",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "allamanda-1278.jpg",
      title: "Allamanda",
      desc: "Photographed June 2024",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "zinnia-1858.jpg",
      title: "Zinnia",
      desc: "Photographed July 2024",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "pink-hibiscus-1881.jpg",
      title: "Pink hibiscus 1",
      desc: "Photographed July 2024",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "heliconia-2575.jpg",
      title: "Heliconia",
      desc: "Photographed July 2024",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "black-eyed-susan-4281.jpg",
      title: "Black-eyed Susan",
      desc: "Photographed August 2024",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "plumbago-5115.jpg",
      title: "Plumbago",
      desc: "Photographed September 2024",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "tropical-milkweed-9369.jpg",
      title: "Tropical milkweed",
      desc: "Photographed December 2024",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "pink-hibiscus-0576.jpg",
      title: "Pink hibiscus 2",
      desc: "Photographed December 2024",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "red-hibiscus-1499.jpg",
      title: "Red hibiscus 3",
      desc: "Photographed January 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "phlox-3618.jpg",
      title: "Phlox",
      desc: "Photographed February 2025",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "pentas-3631.jpg",
      title: "Pentas",
      desc: "Photographed February 2025",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "double-hibiscus-8592.jpg",
      title: "Double hibiscus",
      desc: "Photographed March 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "canna-lily-2836.jpg",
      title: "Canna lily 1",
      desc: "Photographed April 2025",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "zinnias-3959.jpg",
      title: "Zinnias",
      desc: "Photographed May 2025",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "gerbera-daisy-3972.jpg",
      title: "Gerbera daisy",
      desc: "Photographed May 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "spiderwort-4186.jpg",
      title: "Spiderwort",
      desc: "Photographed June 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "daylily-4194.jpg",
      title: "Daylily",
      desc: "Photographed June 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "rose-4878.jpg",
      title: "Rose",
      desc: "Photographed June 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "canna-lily-4588.jpg",
      title: "Canna lily 2",
      desc: "Photographed July 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "sunflower-4803.jpg",
      title: "Sunflower",
      desc: "Photographed July 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "water-lilies-8901.jpg",
      title: "Water lilies",
      desc: "Photographed September 2025",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "pink-hibiscus-8447.jpg",
      title: "Pink hibiscus 3",
      desc: "Photographed November 2025",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "red-hibiscus-2103.jpg",
      title: "Red hibiscus 4",
      desc: "Photographed April 2026",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "bougainvillea-2339.jpg",
      title: "Bougainvillea",
      desc: "Photographed April 2026",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "orange-blossoms-3808.jpg",
      title: "Orange blossoms",
      desc: "Photographed May 2026",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "pink-hibiscus-5221.jpg",
      title: "Pink hibiscus 4",
      desc: "Photographed May 2026",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "bird-of-paradise-6256.jpg",
      title: "Bird of paradise",
      desc: "Photographed June 2026",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "blanket-flower-6380.jpg",
      title: "Blanket flower",
      desc: "Photographed June 2026",
      category: "flowers",
      width: 2000,
      height: 1500,
    },
    {
      file: "morning-glory-6735.jpg",
      title: "Morning glory",
      desc: "Photographed June 2026",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    {
      file: "red-hibiscus-4684.jpg",
      title: "Red hibiscus 5",
      desc: "Photographed September 2026",
      category: "flowers",
      width: 1500,
      height: 2000,
    },
    // --- Shells ---
    {
      file: "shell-pile-2340.jpg",
      title: "Shell pile",
      desc: "Photographed July 2024",
      category: "shells",
      width: 1500,
      height: 2000,
    },
    {
      file: "clam-on-a-cockle-shell-5068.jpg",
      title: "Clam on a cockle shell",
      desc: "Photographed February 2025",
      category: "shells",
      width: 2000,
      height: 1500,
    },
    {
      file: "whelks-on-driftwood-5073.jpg",
      title: "Whelks on driftwood",
      desc: "Photographed February 2025",
      category: "shells",
      width: 1500,
      height: 2000,
    },
    {
      file: "lightning-whelk-egg-case-5105.jpg",
      title: "Lightning whelk egg case",
      desc: "Photographed February 2025",
      category: "shells",
      width: 2000,
      height: 1500,
    },
    {
      file: "egg-cases-and-horseshoe-crab-molt-5173.jpg",
      title: "Egg cases and horseshoe crab molt",
      desc: "Photographed February 2025",
      category: "shells",
      width: 1500,
      height: 2000,
    },
    {
      file: "coral-and-sponge-pieces-5189.jpg",
      title: "Coral and sponge pieces",
      desc: "Photographed February 2025",
      category: "shells",
      width: 2000,
      height: 1500,
    },
  ],
};
