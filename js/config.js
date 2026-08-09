/**
 * ============================================================
 *  EASY SETTINGS  - edit this file to customize your website
 * ============================================================
 *  You only need to change the values below (keep the quotes).
 *  After saving, refresh your browser to see the changes.
 */

const SITE_CONFIG = {
  // ---- Your info ----
  businessName: "Florida Nature Prints",
  tagline: "Calm moments from the Sunshine State",
  yourName: "Florida Nature Prints", // public name on About/Contact (not a personal name)
  yourEmail: "hello@floridanatureprints.com",

  // ---- Contact & order forms ----
  // Forms email this address using FormSubmit (no extra account needed).
  // The FIRST time someone submits a form, check hello@… and click FormSubmit’s
  // confirmation link. After that, messages arrive automatically.
  // (Optional) You can still use Formspree instead by putting a form ID below.
  formspreeFormId: "",

  // ---- Payment (Stripe Payment Link) ----
  // 1. In Stripe, create a Payment Link for your prints
  // 2. Paste the full URL below
  // To switch to another payment method later, just change this URL
  // or replace the payment button in shop.html
  stripePaymentLink: "https://buy.stripe.com/test_REPLACE_WITH_YOUR_LINK",

  // ---- Print sizes & prices (shown in the shop) ----
  printSizes: [
    { id: "8x10", label: '8" × 10"', price: 35 },
    { id: "11x14", label: '11" × 14"', price: 55 },
    { id: "16x20", label: '16" × 20"', price: 85 },
    { id: "20x30", label: '20" × 30"', price: 125 },
  ],

  /**
   * ---- Gallery categories (tabs) ----
   * id must match photo.category values below.
   */
  categories: [
    { id: "all", label: "All" },
    { id: "sunsets", label: "Sunsets" },
    { id: "beaches", label: "Beaches" },
    { id: "gators", label: "Gators" },
    { id: "herons", label: "Herons" },
    { id: "anhinga", label: "Anhinga" },
    { id: "storks", label: "Storks" },
  ],

  /**
   * ---- Your photos ----
   * Put files in images/prints/, then list them below.
   * file / title / desc / category (sunsets, beaches, gators, herons, anhinga, storks)
   */
  photos: [
    // --- Featured (also on home) ---
    {
      file: "golden-gulf.jpeg",
      title: "Golden Gulf",
      desc: "Sun on the horizon over calm Florida waters",
      category: "beaches",
    },
    {
      file: "crimson-marsh.jpeg",
      title: "Crimson Marsh",
      desc: "Fiery sky reflected in still water",
      category: "sunsets",
    },
    {
      file: "anhinga-portrait.JPG",
      title: "Anhinga Portrait",
      desc: "Close-up of a diving bird against blue water",
      category: "anhinga",
    },
    // --- Sunsets & skies ---
    {
      file: "footprints-at-sunset.jpeg",
      title: "Footprints at Sunset",
      desc: "Soft waves and a golden path on the sand",
      category: "sunsets",
    },
    // --- Beaches & shores ---
    {
      file: "beach-horizon-glow.jpeg",
      title: "Beach Horizon Glow",
      desc: "Warm light over a quiet shoreline",
      category: "beaches",
    },
    {
      file: "evening-shore.jpeg",
      title: "Evening Shore",
      desc: "Pastel clouds above the Gulf",
      category: "beaches",
    },
    // --- Sunsets & skies ---
    {
      file: "clouded-gold.jpeg",
      title: "Clouded Gold",
      desc: "Sunset colors rolling in over the sea",
      category: "sunsets",
    },
    // --- Beaches & shores ---
    {
      file: "last-light-on-the-beach.jpeg",
      title: "Last Light on the Beach",
      desc: "Soft sand and a glowing sky",
      category: "beaches",
    },
    // --- Sunsets & skies ---
    {
      file: "storm-lit-sunset.jpeg",
      title: "Storm-Lit Sunset",
      desc: "Dark clouds framed by golden light",
      category: "sunsets",
    },
    {
      file: "open-water-sunset.jpeg",
      title: "Open Water Sunset",
      desc: "Wide horizon of orange and blue",
      category: "sunsets",
    },
    // --- Beaches & shores ---
    {
      file: "sea-and-sky.jpeg",
      title: "Sea and Sky",
      desc: "A calm Gulf evening at day’s end",
      category: "beaches",
    },
    // --- Sunsets & skies ---
    {
      file: "horizon-fire.jpeg",
      title: "Horizon Fire",
      desc: "Bold orange light over open water",
      category: "sunsets",
    },
    // --- Beaches & shores ---
    {
      file: "amber-waves.jpeg",
      title: "Amber Waves",
      desc: "Sunset reflected in gentle swells",
      category: "beaches",
    },
    {
      file: "sun-over-the-gulf.jpeg",
      title: "Sun Over the Gulf",
      desc: "A bright disk of light above the sea",
      category: "beaches",
    },
    // --- Sunsets & skies ---
    {
      file: "sky-on-fire.jpeg",
      title: "Sky on Fire",
      desc: "Abstract orange clouds at dusk",
      category: "sunsets",
    },
    {
      file: "pink-cloud-reflections.jpeg",
      title: "Pink Cloud Reflections",
      desc: "Soft evening color mirrored on the water",
      category: "sunsets",
    },
    {
      file: "marsh-at-dusk.jpeg",
      title: "Marsh at Dusk",
      desc: "Still water, green banks, pastel sky",
      category: "sunsets",
    },
    {
      file: "orange-afterglow.jpeg",
      title: "Orange Afterglow",
      desc: "Tree silhouettes against a burning sky",
      category: "sunsets",
    },
    {
      file: "storm-sunset.jpeg",
      title: "Storm Sunset",
      desc: "Heavy clouds lit from below at twilight",
      category: "sunsets",
    },
    {
      file: "pink-bay-clouds.jpg",
      title: "Pink Bay Clouds",
      desc: "Cotton-candy sky over a quiet Florida bay",
      category: "sunsets",
    },
    // --- Herons, egrets & cranes ---
    {
      file: "sandhill-crane-elegant.jpeg",
      title: "Sandhill Crane Portrait",
      desc: "Elegant close-up by blue water — a top fan favorite",
      category: "herons",
    },
    {
      file: "sandhill-crane-pair.jpeg",
      title: "Sandhill Crane Pair",
      desc: "Trusting cranes along a Florida shore",
      category: "herons",
    },
    {
      file: "sandhill-crane-walk.jpeg",
      title: "Sandhill Crane Walk",
      desc: "Tall, calm, and unbothered by company",
      category: "herons",
    },
    // --- Alligators ---
    {
      file: "gator-egret-breakfast.jpeg",
      title: "Breakfast for Two",
      desc: "Egret on the bank, gator in the shallows",
      category: "gators",
    },
    // --- Herons, egrets & cranes ---
    {
      file: "snowy-egret-hunter.jpeg",
      title: "Snowy Egret Hunter",
      desc: "Yellow feet and black bill — Florida’s crab specialist",
      category: "herons",
    },
    {
      file: "great-blue-command.jpeg",
      title: "Great Blue in Command",
      desc: "Tall heron ruling a quiet lake shore",
      category: "herons",
    },
    {
      file: "heron-rising-sun.jpeg",
      title: "Heron at Sunrise",
      desc: "Great blue basking in early morning light",
      category: "herons",
    },
    {
      file: "heron-morning-bask.jpeg",
      title: "Morning Bask",
      desc: "Another angle of a sunlit great blue",
      category: "herons",
    },
    {
      file: "heron-close-portrait.jpeg",
      title: "Heron Close Portrait",
      desc: "A rare close approach while he watched the water",
      category: "herons",
    },
    {
      file: "farewell-egret.jpeg",
      title: "Farewell Egret",
      desc: "A watchful great egret on the trail",
      category: "herons",
    },
    {
      file: "focused-mister-egret.jpeg",
      title: "Focused Mister Egret",
      desc: "Deep in thought at the water’s edge",
      category: "herons",
    },
    {
      file: "great-egret-morning.jpeg",
      title: "Great Egret Morning",
      desc: "Morning wisdom from a pure white hunter",
      category: "herons",
    },
    // --- Anhinga ---
    {
      file: "anhinga-drying.jpeg",
      title: "Anhinga Drying",
      desc: "Wings open after a productive swim",
      category: "anhinga",
    },
    // --- Herons, egrets & cranes ---
    {
      file: "wetland-neighbors.jpeg",
      title: "Wetland Neighbors",
      desc: "Anhinga, egret, and stork sharing the bank",
      category: "herons",
    },
    {
      file: "heron-in-chilled-lake.jpeg",
      title: "Heron in a Chilled Lake",
      desc: "Brave wading on a windy Florida morning",
      category: "herons",
    },
    // --- Anhinga ---
    {
      file: "anhinga-on-the-branch.jpeg",
      title: "Anhinga on the Branch",
      desc: "A sunning anhinga perched by the water",
      category: "anhinga",
    },
    // --- Herons, egrets & cranes ---
    {
      file: "great-blue-on-the-path.jpeg",
      title: "Great Blue on the Path",
      desc: "A heron pausing beside a Florida trail",
      category: "herons",
    },
    {
      file: "sandhill-crane.jpeg",
      title: "Sandhill Crane",
      desc: "A crane feeding along the water’s edge",
      category: "herons",
    },
    // --- Wood storks ---
    {
      file: "wood-stork-by-the-palm.jpeg",
      title: "Wood Stork by the Palm",
      desc: "Tall white bird beside a sabal palm",
      category: "storks",
    },
    {
      file: "wood-stork-in-the-shade.jpeg",
      title: "Wood Stork in the Shade",
      desc: "Soft light on a resting stork",
      category: "storks",
    },
    {
      file: "wood-stork-walking.jpeg",
      title: "Wood Stork Walking",
      desc: "Along the grassy bank of a canal",
      category: "storks",
    },
    {
      file: "wood-stork-profile.jpeg",
      title: "Wood Stork Profile",
      desc: "Close view of a stork by still water",
      category: "storks",
    },
    {
      file: "wood-stork-watchful.jpeg",
      title: "Wood Stork Watchful",
      desc: "A stork pausing at the waterline",
      category: "storks",
    },
    {
      file: "wood-stork-foraging.jpeg",
      title: "Wood Stork Foraging",
      desc: "Head down in the shallows",
      category: "storks",
    },
    {
      file: "wood-stork-in-the-marsh.jpeg",
      title: "Wood Stork in the Marsh",
      desc: "Feeding among reeds and open water",
      category: "storks",
    },
    {
      file: "wood-stork-standing-tall.jpeg",
      title: "Wood Stork Standing Tall",
      desc: "White plumage against dark water",
      category: "storks",
    },
    {
      file: "wood-stork-on-the-bank.jpeg",
      title: "Wood Stork on the Bank",
      desc: "A classic Florida wetland scene",
      category: "storks",
    },
    // --- Herons, egrets & cranes ---
    {
      file: "great-blue-among-reeds.jpeg",
      title: "Great Blue Among Reeds",
      desc: "A heron resting by the water",
      category: "herons",
    },
    {
      file: "great-blue-heron.jpeg",
      title: "Great Blue Heron",
      desc: "Tall and still on a marshy shore",
      category: "herons",
    },
    {
      file: "heron-neck-curve.jpeg",
      title: "Heron Neck Curve",
      desc: "Close study of a great blue’s form",
      category: "herons",
    },
    {
      file: "heron-in-clear-water.jpeg",
      title: "Heron in Clear Water",
      desc: "Wading through pale shallows",
      category: "herons",
    },
    {
      file: "heron-at-the-shore.jpeg",
      title: "Heron at the Shore",
      desc: "Blue-gray feathers and a sharp gaze",
      category: "herons",
    },
    {
      file: "great-egret.jpeg",
      title: "Great Egret",
      desc: "Pure white among green marsh grass",
      category: "herons",
    },
    {
      file: "heron-and-palm.jpeg",
      title: "Heron and Palm",
      desc: "A great blue framed by fronds and water",
      category: "herons",
    },
    {
      file: "heron-in-tall-grass.jpeg",
      title: "Heron in Tall Grass",
      desc: "Soft light on a watchful bird",
      category: "herons",
    },
    {
      file: "heron-looking-down.jpeg",
      title: "Heron Looking Down",
      desc: "Quiet moment at the water’s edge",
      category: "herons",
    },
    // --- Anhinga ---
    {
      file: "anhinga-neck.jpeg",
      title: "Anhinga Neck",
      desc: "S-curve silhouette against blue water",
      category: "anhinga",
    },
    // --- Herons, egrets & cranes ---
    {
      file: "heron-against-the-sky.jpeg",
      title: "Heron Against the Sky",
      desc: "Looking up at a great blue in open light",
      category: "herons",
    },
    {
      file: "heron-on-the-bank.jpeg",
      title: "Heron on the Bank",
      desc: "Beside rippled blue water",
      category: "herons",
    },
    {
      file: "heron-along-the-canal.jpeg",
      title: "Heron Along the Canal",
      desc: "A great blue walking the grassy edge",
      category: "herons",
    },
    {
      file: "egret-by-the-water.jpeg",
      title: "Egret by the Water",
      desc: "Elegant white bird near green cover",
      category: "herons",
    },
    {
      file: "egret-portrait.jpeg",
      title: "Egret Portrait",
      desc: "Soft focus background, crisp white feathers",
      category: "herons",
    },
    {
      file: "golden-hour-heron.jpeg",
      title: "Golden Hour Heron",
      desc: "Warm evening light on a great blue",
      category: "herons",
    },
    {
      file: "heron-in-evening-grass.jpeg",
      title: "Heron in Evening Grass",
      desc: "Sunlit plumes at the shoreline",
      category: "herons",
    },
    {
      file: "heron-stride.jpeg",
      title: "Heron Stride",
      desc: "Caught mid-step along the bank",
      category: "herons",
    },
    {
      file: "egret-looking-down.jpeg",
      title: "Egret Looking Down",
      desc: "A great egret studying the water",
      category: "herons",
    },
    {
      file: "egret-curve.jpeg",
      title: "Egret Curve",
      desc: "Graceful neck against dark water",
      category: "herons",
    },
    {
      file: "heron-silhouette.jpeg",
      title: "Heron Silhouette",
      desc: "Backlit bird over sparkling water",
      category: "herons",
    },
    {
      file: "heron-in-warm-light.jpeg",
      title: "Heron in Warm Light",
      desc: "Golden tones on a great blue",
      category: "herons",
    },
    {
      file: "heron-at-golden-hour.jpeg",
      title: "Heron at Golden Hour",
      desc: "Soft sun lighting every feather",
      category: "herons",
    },
    {
      file: "heron-glow.JPG",
      title: "Heron Glow",
      desc: "Rich warm light on a Florida heron",
      category: "herons",
    },
    {
      file: "egret-on-the-shore.jpeg",
      title: "Egret on the Shore",
      desc: "A great egret walking the waterline",
      category: "herons",
    },
    // --- Alligators ---
    {
      file: "gator-mid-yawn.jpeg",
      title: "Gator Mid-Yawn",
      desc: "Caught mid-yawn on a grassy bank — high-traffic favorite",
      category: "gators",
    },
    {
      file: "gator-bottoms-up.jpeg",
      title: "Bottoms Up",
      desc: "Head down, cooling off Florida-style",
      category: "gators",
    },
    {
      file: "almost-walked-gator.jpeg",
      title: "Almost Walked Into Him",
      desc: "A quiet gator hidden in the grass line",
      category: "gators",
    },
    {
      file: "adult-seven-foot-gator.jpeg",
      title: "Seven-Foot Adult",
      desc: "A definitive adult Florida alligator",
      category: "gators",
    },
    {
      file: "gator-etiquette.jpeg",
      title: "Bankside Gator",
      desc: "Scales, grass, and deep blue water",
      category: "gators",
    },
    {
      file: "gator-road-crossing.jpeg",
      title: "Road Crossing",
      desc: "Alligator crossing near a Florida school",
      category: "gators",
    },
    {
      file: "more-gators-one.jpeg",
      title: "More Gators I",
      desc: "Because one gator is never enough",
      category: "gators",
    },
    {
      file: "more-gators-two.jpeg",
      title: "More Gators II",
      desc: "Another angle from a favorite gator day",
      category: "gators",
    },
    {
      file: "more-gators-three.jpeg",
      title: "More Gators III",
      desc: "Still more scaly neighbors",
      category: "gators",
    },
    {
      file: "another-day-gator.jpeg",
      title: "Another Day, Another Gator",
      desc: "He might be following at this point",
      category: "gators",
    },
    {
      file: "gator-on-patrol.jpeg",
      title: "Gator on Patrol",
      desc: "Friday without an alligator? Never",
      category: "gators",
    },
    {
      file: "gator-in-the-green.jpeg",
      title: "Gator in the Green",
      desc: "An alligator resting in algae-rich water",
      category: "gators",
    },
    {
      file: "young-gator.jpeg",
      title: "Young Gator",
      desc: "A smaller alligator in clear shallows",
      category: "gators",
    },
    {
      file: "gator-up-close.jpeg",
      title: "Gator Up Close",
      desc: "Detailed view of an alligator’s face",
      category: "gators",
    },
    {
      file: "gator-eyes.jpeg",
      title: "Gator Eyes",
      desc: "Close portrait of an alligator at rest",
      category: "gators",
    },
    {
      file: "gator-from-above.jpeg",
      title: "Gator from Above",
      desc: "Looking down on armored scales",
      category: "gators",
    },
    {
      file: "gator-in-still-water.jpeg",
      title: "Gator in Still Water",
      desc: "Top-down view of a resting alligator",
      category: "gators",
    },
    {
      file: "gator-surface.jpeg",
      title: "Gator Surface",
      desc: "Just the head and eyes above the water",
      category: "gators",
    },
    {
      file: "floating-gator.jpeg",
      title: "Floating Gator",
      desc: "Calm water and a quiet Florida gator",
      category: "gators",
    },
    // --- Beaches & shores ---
    {
      file: "baby-manatee.jpeg",
      title: "Baby Manatee",
      desc: "A gentle sea cow rising for air",
      category: "beaches",
    },
  ],
};
