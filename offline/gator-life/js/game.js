/**
 * Gator Life — original Florida wetland hop-runner
 * A hatchling walks ponds and canals, climbs hills, hunts, and learns facts.
 * Original design — not affiliated with any trademarked game.
 */
(function () {
  "use strict";

  const STORAGE = "gatorLife_v1";
  const W = 960;
  const H = 440;
  const GROUND = 348;
  const PLAYER_X = 188;
  const TOTAL_LEVELS = 50;
  const GRAVITY = 2050;
  const HOP_V = -760;
  const MAX_FALL = 980;

  const NPCS = [
    {
      id: "heron",
      name: "Hattie the Heron",
      file: "images/game/heron.png",
      tag: "HERON SAYS",
      line: "Stand still a second — then hop on!",
    },
    {
      id: "spoonbill",
      name: "Rosa the Spoonbill",
      file: "images/game/spoonbill.png",
      tag: "SPOONBILL SAYS",
      line: "Sweep this one side to side in your head…",
    },
    {
      id: "ibis",
      name: "Ike the Ibis",
      file: "images/game/ibis.png",
      tag: "IBIS SAYS",
      line: "Probe this question like mud for a snack!",
    },
    {
      id: "manatee",
      name: "Milo the Manatee",
      file: "images/game/manatee.png",
      tag: "MANATEE SAYS",
      line: "Slow is fine. Think it through.",
    },
    {
      id: "turtle",
      name: "Tess the Turtle",
      file: "images/game/turtle.png",
      tag: "TURTLE SAYS",
      line: "No rush — I’ve got a shell full of time.",
    },
    {
      id: "gator",
      name: "The Hatchling",
      file: "images/game/gator-hatchling.png?v=7",
      tag: "HATCHLING SAYS",
      line: "Peep! Quiz time before the next bound.",
    },
  ];

  const STAGE = [
    { to: 10, name: "Hatchling Shore", blurb: "Learn the hop" },
    { to: 20, name: "Sawgrass Prairie", blurb: "Stay low under moss" },
    { to: 30, name: "Cypress Strand", blurb: "Logs, knees, and gaps" },
    { to: 40, name: "Bird Rookery", blurb: "Wildlife everywhere" },
    { to: 50, name: "Storm Marsh", blurb: "Fast water, loud sky" },
  ];

  const SIZE_WORDS = [
    "little",
    "small",
    "medium",
    "bigger",
    "large",
    "huge",
    "giant",
  ];

  function missionFor(idx) {
    const kindI = idx % 3;
    const tier = Math.floor(idx / 3);
    const size = SIZE_WORDS[Math.min(tier, SIZE_WORDS.length - 1)];
    const count = idx === 0 ? 6 : 8 + Math.min(8, tier * 2);
    const kinds = [
      {
        key: "fish",
        need: "needFish",
        noun: "fish",
        title: size === "little" ? "First hunt" : size.charAt(0).toUpperCase() + size.slice(1) + " fish",
        extra:
          idx === 0
            ? "Walk into the fish. Hop the great blue herons."
            : "Hop the sawgrass. Don't get grabbed by a heron.",
      },
      {
        key: "turtle",
        need: "needTurtle",
        noun: "turtles",
        title: size === "little" ? "Little turtles" : size.charAt(0).toUpperCase() + size.slice(1) + " turtles",
        extra: "Crunch the shells. Watch for herons.",
      },
      {
        key: "bird",
        need: "needBird",
        noun: "birds",
        title: size === "little" ? "Little birds" : size.charAt(0).toUpperCase() + size.slice(1) + " birds",
        extra: "They're sitting on the water. Hop herons.",
      },
    ];
    const k = kinds[kindI];
    const m = {
      title: k.title,
      text: "Eat " + count + " " + size + " " + k.noun + ". " + k.extra,
      hazard: "heron",
      food: k.key,
      size: size,
      tier: tier,
      count: count,
    };
    m[k.need] = count;
    return m;
  }

  const FACTS = [
    { label: "Alligator", text: "Hatchling alligators wear bright yellow bands that help them hide in sunlit grass and reeds." },
    { label: "Sawgrass", text: "Sawgrass isn’t a true grass — it’s a sedge, and its leaf edges are finely toothed like a saw." },
    { label: "Great Blue Heron", text: "Great blue herons hunt by standing statue-still in shallows, then striking with a spear-like bill." },
    { label: "Wetland", text: "Florida wetlands — marshes, sloughs, and cypress strands — are nurseries for fish, birds, and reptiles." },
    { label: "Roseate Spoonbill", text: "Roseate spoonbills sweep their spatula bills side to side to snap up small fish and shrimp." },
    { label: "Safety", text: "Never feed wild alligators. Fed gators lose their fear of people and become dangerous." },
    { label: "White Ibis", text: "White ibises probe soft mud with curved bills. A pink face and bill means an adult in breeding colors." },
    { label: "Gator Hole", text: "Alligators dig water-holding dens called gator holes. In a drought, other animals drink there too." },
    { label: "Manatee", text: "Florida manatees are gentle mammals. They graze seagrass and must surface to breathe air." },
    { label: "Anhinga", text: "Anhingas spear fish underwater, then spread their wings in the sun because their feathers get soaked." },
    { label: "Nest Heat", text: "Nest temperature helps decide whether baby alligators become male or female." },
    { label: "Snowy Egret", text: "Snowy egrets are famous for their “golden slippers” — bright yellow feet they shuffle to stir prey." },
    { label: "Cypress", text: "Bald cypress trees grow knobby “knees” from their roots. The knees may help the tree breathe in wet soil." },
    { label: "Softshell Turtle", text: "Florida softshell turtles have pancake-flat shells and a snorkel snout for breathing while buried in mud." },
    { label: "Osprey", text: "Ospreys hover, then dive feet-first for fish. They nest on tall platforms all over coastal Florida." },
    { label: "Spanish Moss", text: "Spanish moss is not a moss and not from Spain — it’s a bromeliad that hangs on trees and drinks the air." },
    { label: "Wood Stork", text: "Wood storks feed by feel: they snap their bills shut when a fish touches them in cloudy water." },
    { label: "Limpkin", text: "Limpkins wail at dusk and specialize in apple snails, prying them with a slightly curved bill." },
    { label: "Mangrove", text: "Red mangroves drop arching prop roots that break waves, trap sediment, and hide baby fish." },
    { label: "Gopher Tortoise", text: "Gopher tortoises dig long burrows. Dozens of other species may shelter in one tortoise home." },
    { label: "Double-crested Cormorant", text: "Cormorants chase fish underwater, then perch with wings spread to dry their less-waterproof feathers." },
    { label: "Pink Color", text: "Spoonbills turn pink from pigments in the crustaceans they eat — a living sunset on wings." },
    { label: "Key Deer", text: "Key deer are a tiny white-tailed deer that live only in the Florida Keys. Drive slowly there." },
    { label: "American Alligator", text: "American alligators are native to the southeastern U.S. They prefer fresh water over the open ocean." },
    { label: "Tricolored Heron", text: "Tricolored herons dash through shallows, wings partly open, herding minnows into a corner." },
    { label: "Firefly", text: "Some Florida fireflies flash in summer marshes. The light is a cold chemical glow used to find mates." },
    { label: "Roseate Spoonbill Nest", text: "Spoonbills nest in noisy colonies with herons and egrets, often on mangrove islands." },
    { label: "Black Skimmer", text: "Black skimmers fly with the lower bill slicing the water’s surface until it snaps up a fish." },
    { label: "Florida Panther", text: "The Florida panther is a rare cougar of south Florida. Wildlife underpasses help them cross roads." },
    { label: "Mosquitofish", text: "Tiny mosquitofish eat mosquito larvae and are a common snack for young wading birds and hatchling gators." },
    { label: "Brown Pelican", text: "Brown pelicans plunge-dive from the air, scooping fish in a huge throat pouch." },
    { label: "Everglades", text: "The Everglades is a wide, slow “river of grass.” Water depth of just inches can change the whole habitat." },
    { label: "Red-shouldered Hawk", text: "Red-shouldered hawks hunt wetlands from a perch, calling a loud kee-yer over cypress sloughs." },
    { label: "Apple Snail", text: "Island apple snails lay bright pink egg clusters above the waterline on stems and seawalls." },
    { label: "Night Heron", text: "Yellow-crowned and black-crowned night herons hunt at dusk, when frogs and crabs come out." },
    { label: "Alligator Bellow", text: "Adult alligators bellow to communicate. A strong bellow can make the water around them dance." },
    { label: "Purple Gallinule", text: "Purple gallinules walk on lily pads with extra-long toes, flashing jewel-green and violet feathers." },
    { label: "Seagrass", text: "Seagrass beds feed manatees, hide young fish, and keep coastal water clearer by holding the sand." },
    { label: "Swallow-tailed Kite", text: "Swallow-tailed kites arrive in spring and snatch dragonflies and lizards on the wing over the glades." },
    { label: "Cottonmouth", text: "The Florida cottonmouth is a water-loving pit viper. Give every unknown snake plenty of space." },
    { label: "Sandhill Crane", text: "Florida sandhill cranes are tall gray birds with a red cap. They often stroll through ranch pastures." },
    { label: "Air Plants", text: "Bromeliads (air plants) perch on cypress branches and hold rainwater that tree frogs use as tiny ponds." },
    { label: "Roseate Tern", text: "Some Florida beaches host nesting terns. Stay off roped nesting areas in spring and summer." },
    { label: "Alligator Gar", text: "Alligator gar are giant armored fish of slow rivers — not alligators, despite the name and snout." },
    { label: "Magnificent Frigatebird", text: "Frigatebirds soar over the Keys and steal fish from other birds rather than diving themselves." },
    { label: "Wetland Filter", text: "Healthy marshes filter water and soak up storm surge — wildlife habitat that also protects towns." },
    { label: "Mottled Duck", text: "Mottled ducks are Florida’s resident dabbling duck. They prefer freshwater marshes to the open Gulf." },
    { label: "Keep Distance", text: "The best wildlife photo is taken from far away. If an animal changes what it’s doing, you are too close." },
    { label: "River Otter", text: "North American river otters slide, dive, and hunt fish in Florida creeks. Watch for a sleek brown head." },
    { label: "Coexist", text: "Facts keep people and wildlife safer. Learn the habitat, give animals space, and take the long way around a nest." },
  ];

  const state = {
    screen: "start",
    totalScore: 0,
    unlocked: TOTAL_LEVELS,
    completed: {},
    level: 0,
    score: 0,
    lives: 3,
    playSeed: 1,
    usedQ: {},
    coupon: null,
  };

  let canvas, ctx;
  let loopId = null;
  let world = null;
  let pausedForQuiz = false;
  let pausedForGoal = false;
  let hopHeld = false;
  let hopQueued = false;
  let quizCloseTimer = null;
  let audioCtx = null;
  const sprites = {};
  const bgImages = [];

  const BG_FILES_FALLBACK = [
    "marsh-at-dusk.jpeg",
    "crimson-marsh.jpeg",
    "golden-gulf.jpeg",
    "gator-in-the-green.jpeg",
    "great-blue-heron.jpeg",
    "pink-cloud-reflections.jpeg",
    "open-water-sunset.jpeg",
    "horizon-fire.jpeg",
    "amber-waves.jpeg",
    "clouded-gold.jpeg",
    "evening-shore.jpeg",
    "heron-silhouette.jpeg",
    "floating-gator.jpeg",
    "young-gator.jpeg",
    "storm-lit-sunset.jpeg",
  ];

  const $ = function (s) {
    return document.querySelector(s);
  };

  function haptic(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {}
  }

  function seeded(idx, n) {
    const x = Math.sin(idx * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function stageFor(i) {
    for (let s = 0; s < STAGE.length; s++) {
      if (i < STAGE[s].to) return STAGE[s];
    }
    return STAGE[STAGE.length - 1];
  }

  function npcFor(level, n) {
    return NPCS[(level + n * 3) % NPCS.length];
  }

  /* ---------- audio ---------- */
  function ensureAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function playTone(freq, dur, type, vol, when) {
    const ctxA = ensureAudio();
    if (!ctxA) return;
    const t0 = ctxA.currentTime + (when || 0);
    const osc = ctxA.createOscillator();
    const g = ctxA.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.1, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ctxA.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function playNoise(dur, freq0, freq1, vol, when) {
    const ctxA = ensureAudio();
    if (!ctxA) return;
    const t0 = ctxA.currentTime + (when || 0);
    const n = Math.floor(ctxA.sampleRate * dur);
    const buf = ctxA.createBuffer(1, n, ctxA.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.15);
    }
    const src = ctxA.createBufferSource();
    src.buffer = buf;
    const bp = ctxA.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(freq0, t0);
    bp.frequency.exponentialRampToValueAtTime(Math.max(40, freq1), t0 + dur);
    bp.Q.value = 0.8;
    const g = ctxA.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(ctxA.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  function playGrowl(freq, dur, vol, when) {
    const ctxA = ensureAudio();
    if (!ctxA) {
      playTone(freq, dur, "sawtooth", vol * 0.7, when);
      return;
    }
    const t0 = ctxA.currentTime + (when || 0);
    const osc = ctxA.createOscillator();
    const lfo = ctxA.createOscillator();
    const lfoG = ctxA.createGain();
    const filt = ctxA.createBiquadFilter();
    const g = ctxA.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(28, freq * 0.55), t0 + dur);
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(14, t0);
    lfoG.gain.value = freq * 0.1;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    filt.type = "lowpass";
    filt.frequency.setValueAtTime(420, t0);
    filt.frequency.exponentialRampToValueAtTime(140, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.28, t0 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(filt);
    filt.connect(g);
    g.connect(ctxA.destination);
    osc.start(t0);
    lfo.start(t0);
    osc.stop(t0 + dur + 0.02);
    lfo.stop(t0 + dur + 0.02);
  }

  function sfxHop(air) {
    playTone(air ? 520 : 340, 0.07, "triangle", 0.09, 0);
    playTone(air ? 780 : 520, 0.09, "sine", 0.05, 0.03);
  }

  function sfxFart() {
    playTone(92, 0.09, "sawtooth", 0.2, 0);
    playTone(58, 0.18, "square", 0.16, 0.04);
    playTone(40, 0.22, "sine", 0.18, 0.07);
    playNoise(0.28, 220, 55, 0.42, 0);
  }

  function sfxCrunch() {
    playTone(180, 0.05, "square", 0.1, 0);
    playTone(90, 0.08, "sawtooth", 0.12, 0.03);
    playTone(55, 0.14, "triangle", 0.1, 0.06);
    playNoise(0.16, 900, 220, 0.38, 0);
    playNoise(0.12, 400, 90, 0.22, 0.05);
  }

  function sfxGatorCall(kind) {
    if (kind === "roar") {
      playGrowl(78, 0.55, 0.34, 0);
      playGrowl(46, 0.62, 0.28, 0.04);
      playNoise(0.45, 160, 48, 0.28, 0.02);
    } else if (kind === "hiss") {
      playNoise(0.38, 1600, 380, 0.3, 0);
      playTone(200, 0.12, "sawtooth", 0.08, 0);
    } else {
      playGrowl(92, 0.22, 0.3, 0);
      playTone(62, 0.16, "sine", 0.18, 0.05);
      playNoise(0.16, 240, 70, 0.18, 0);
    }
  }

  function sfxBurp() {
    playTone(190, 0.07, "sine", 0.24, 0);
    playTone(118, 0.12, "triangle", 0.22, 0.05);
    playTone(72, 0.2, "sawtooth", 0.16, 0.1);
    playNoise(0.16, 260, 70, 0.22, 0.04);
  }

  function sfxCollect(big) {
    playTone(big ? 660 : 540, 0.06, "sine", 0.08, 0);
    playTone(big ? 880 : 720, 0.1, "triangle", 0.06, 0.04);
  }

  function sfxHit() {
    playTone(160, 0.1, "sawtooth", 0.08, 0);
    playTone(90, 0.18, "sine", 0.1, 0.02);
  }

  function sfxChomp() {
    const ctxA = ensureAudio();
    playTone(140, 0.08, "sawtooth", 0.12, 0);
    playTone(80, 0.16, "square", 0.1, 0.03);
    playTone(50, 0.22, "sine", 0.12, 0.05);
    playTone(220, 0.06, "triangle", 0.08, 0.1);
    if (!ctxA) return;
    const t0 = ctxA.currentTime;
    const n = Math.floor(ctxA.sampleRate * 0.28);
    const buf = ctxA.createBuffer(1, n, ctxA.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.4);
    }
    const src = ctxA.createBufferSource();
    src.buffer = buf;
    const bp = ctxA.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(700, t0);
    bp.frequency.exponentialRampToValueAtTime(180, t0 + 0.22);
    const g = ctxA.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.45, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
    src.connect(bp);
    bp.connect(g);
    g.connect(ctxA.destination);
    src.start(t0);
    src.stop(t0 + 0.3);
  }

  function sfxWin() {
    playTone(523, 0.1, "sine", 0.08, 0);
    playTone(659, 0.12, "sine", 0.08, 0.1);
    playTone(784, 0.18, "triangle", 0.07, 0.2);
  }

  /* ---------- persist ---------- */
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE) || "{}");
      state.totalScore = d.totalScore || 0;
      state.unlocked = TOTAL_LEVELS;
      state.completed = d.completed || {};
      state.playSeed = d.playSeed || 1;
      state.usedQ = d.usedQ || {};
      state.coupon = d.coupon || null;
    } catch (e) {}
  }

  function save() {
    localStorage.setItem(
      STORAGE,
      JSON.stringify({
        totalScore: state.totalScore,
        unlocked: state.unlocked,
        completed: state.completed,
        playSeed: state.playSeed,
        usedQ: state.usedQ,
        coupon: state.coupon,
      })
    );
  }

  function allLevelsDone() {
    for (let i = 0; i < TOTAL_LEVELS; i++) {
      if (!state.completed[i]) return false;
    }
    return true;
  }

  function grantCoupon() {
    if (state.coupon && state.coupon.code) return state.coupon;
    const code =
      "GATOR10-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    state.coupon = { code: code, off: 10, earnedAt: Date.now() };
    save();
    return state.coupon;
  }

  function paintCoupon(elCode, elBox) {
    const box = typeof elBox === "string" ? $(elBox) : elBox;
    const codeEl = typeof elCode === "string" ? $(elCode) : elCode;
    if (!state.coupon || !state.coupon.code) {
      if (box) box.style.display = "none";
      return;
    }
    if (codeEl) codeEl.textContent = state.coupon.code;
    if (box) box.style.display = "block";
  }

  function galleryPhotoFiles() {
    if (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.photos && SITE_CONFIG.photos.length) {
      return SITE_CONFIG.photos.map(function (p) {
        return p.file;
      });
    }
    return BG_FILES_FALLBACK;
  }

  function applyCardPhotoBg(file) {
    const card = document.querySelector(".game-card-arcade");
    if (!card || !file) return;
    card.style.backgroundImage =
      "linear-gradient(180deg, rgba(18, 12, 6, 0.78) 0%, rgba(12, 22, 16, 0.84) 100%), url('images/prints/" +
      String(file).replace(/'/g, "") +
      "')";
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";
  }

  function show(name) {
    state.screen = name;
    ["start", "levels", "play", "fact"].forEach(function (k) {
      const el = $("#screen-" + k);
      if (el) el.classList.toggle("active", k === name);
    });
    if (document.body) document.body.classList.toggle("is-playing", name === "play");
    try {
      const files = galleryPhotoFiles();
      if (files && files.length) {
        const pick =
          name === "play" && world
            ? files[world.idx % files.length]
            : files[(state.level + files.length) % files.length];
        applyCardPhotoBg(pick);
      }
    } catch (e) {}
  }

  function hearts() {
    let s = "";
    for (let i = 0; i < 3; i++) s += i < state.lives ? "♥" : "♡";
    return s;
  }

  function updateHud() {
    const a = $("#play-hud-hearts");
    const b = $("#play-hud-score");
    const c = $("#play-hud-level");
    const g = $("#global-score");
    if (a) a.textContent = hearts();
    if (b) b.textContent = String(state.score);
    if (c) c.textContent = String(state.level + 1);
    if (g) g.textContent = String(state.totalScore);
    updateAgeHud();
  }

  function yearOfLevel() {
    return state.level; // level 1 = first year of life
  }

  function mealEveryDays() {
    return yearOfLevel() < 2 ? 2.5 : 7;
  }

  function dayOfYear() {
    if (!world) return 0;
    const p = Math.max(0, Math.min(1, worldX() / Math.max(1, world.finishX)));
    return p * 365;
  }

  function ageMonthsTotal() {
    return yearOfLevel() * 12 + (dayOfYear() / 365) * 12;
  }

  function formatAgeParts() {
    const months = Math.floor(ageMonthsTotal());
    if (months < 1) return { n: "0", unit: "months old" };
    if (months < 12) return { n: String(months), unit: months === 1 ? "month old" : "months old" };
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (m === 0) return { n: String(y), unit: y === 1 ? "year old" : "years old" };
    return { n: String(y), unit: y === 1 ? "yr " + m + " mo" : "yrs " + m + " mo" };
  }

  function daysUntilMeal() {
    if (!world) return mealEveryDays();
    const interval = mealEveryDays();
    const days = dayOfYear();
    const last = world.lastMealDay || 0;
    return Math.max(0, interval - (days - last));
  }

  function updateAgeHud() {
    const ageEl = $("#age-big");
    const unitEl = $("#age-sub");
    const eatEl = $("#eat-big");
    const eatSub = $("#eat-sub");
    const eatKick = $("#eat-kicker");
    const eatCell = $("#eat-cell");
    if (!ageEl) return;
    const age = formatAgeParts();
    ageEl.textContent = age.n;
    if (unitEl) unitEl.textContent = age.unit;
    const left = daysUntilMeal();
    const hungry = left < 0.4;
    if (eatEl) eatEl.textContent = hungry ? "0" : String(Math.max(1, Math.ceil(left)));
    if (eatSub) eatSub.textContent = hungry ? "EAT NOW" : Math.ceil(left) === 1 ? "day" : "days";
    if (eatKick) eatKick.textContent = hungry ? "EAT IN" : "EAT IN";
    if (eatCell) eatCell.classList.toggle("is-hungry", hungry);
  }

  function sayBirthday() {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        "Happy birthday to me! One more year older."
      );
      u.lang = "en-US";
      u.rate = 1.05;
      u.pitch = 1.2;
      u.volume = 1;
      const voices = window.speechSynthesis.getVoices() || [];
      for (let i = 0; i < voices.length; i++) {
        if (/en-US|en_US|English.*United States/i.test(voices[i].lang + voices[i].name)) {
          u.voice = voices[i];
          break;
        }
      }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function sfxBirthday() {
    playTone(523, 0.12, "sine", 0.14, 0);
    playTone(659, 0.12, "sine", 0.14, 0.12);
    playTone(784, 0.14, "triangle", 0.14, 0.24);
    playTone(1046, 0.28, "sine", 0.12, 0.38);
  }

  function spawnSparks(n) {
    world.sparks = world.sparks || [];
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 80 + Math.random() * 280;
      world.sparks.push({
        x: PLAYER_X,
        y: world.player.y - 24,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 60,
        life: 0.4 + Math.random() * 0.45,
        r: 2 + Math.random() * 4,
        warm: Math.random() > 0.4,
      });
    }
  }

  function loadBackgrounds() {
    galleryPhotoFiles().forEach(function (file) {
      const img = new Image();
      img.onload = function () {
        if (img.naturalWidth) bgImages.push(img);
      };
      img.src = "images/prints/" + file;
    });
  }

  function loadSprites() {
    const files = {
      gator: "images/game/gator-run.png",
      gatorWalk: "images/game/gator-walk.png",
      gatorClimb: "images/game/gator-climb.png",
      hatchling: "images/game/gator-hatchling.png?v=7",
      heron: "images/game/heron.png",
      spoonbill: "images/game/spoonbill.png",
      ibis: "images/game/ibis.png",
      manatee: "images/game/manatee.png",
      turtle: "images/game/turtle.png",
      foodFish: "images/game/food-fish.png",
      foodTurtle: "images/game/food-turtle.png",
      foodBird: "images/game/food-bird.png",
      gbHeron: "images/game/great-blue-heron.png",
      owl: "images/game/owl-swoop.png",
    };
    Object.keys(files).forEach(function (k) {
      const img = new Image();
      img.onload = function () {
        sprites[k] = img;
      };
      img.src = files[k];
    });
  }

  /* ---------- course ---------- */
  function pushObj(objs, o) {
    objs.push(o);
    return o.x + (o.w || 40);
  }

  function countKind(objs, kind) {
    let n = 0;
    for (let i = 0; i < objs.length; i++) if (objs[i].kind === kind) n++;
    return n;
  }

  function placeNeeded(objs, kind, want, length, yBase) {
    let have = countKind(objs, kind);
    let i = 0;
    while (have < want) {
      const x = 520 + ((have + 1) / (want + 1)) * (length - 700) + (i % 3) * 18;
      const y = yBase + ((have % 3) - 1) * 16;
      objs.push({
        kind: kind,
        x: x,
        y: y,
        pts: kind === "firefly" ? 20 : 15,
        w: 22,
        h: 16,
      });
      have++;
      i++;
    }
  }

  function buildCourse(idx) {
    const mission = missionFor(idx);
    const objs = [];
    const speed = idx === 0 ? 155 : 220 + idx * 4.2;
    const seconds = idx === 0 ? 36 : 40 + Math.min(8, Math.floor(idx / 8));
    const length = Math.floor(speed * seconds);
    const minGap = idx === 0 ? 480 : Math.max(240, 380 - idx * 2.2);
    let x = Math.floor(speed * (idx === 0 ? 8 : 4));

    let n = 0;
    while (x < length - 420) {
      const r = seeded(idx, 40 + n * 17);

      // Decor that never hurts
      if (seeded(idx, n + 900) > 0.72) {
        objs.push({
          kind: "deco",
          x: x - 80,
          npc: npcFor(idx, n + 2),
          yOff: -10 - seeded(idx, n + 3) * 40,
        });
      }

      if (idx === 0) {
        if (r < 0.22) {
          objs.push({ kind: "sawgrass", x: x, w: 26, h: 34 });
          x += 26 + minGap;
        } else {
          objs.push({
            kind: "fish",
            x: x + 20,
            y: GROUND - 24,
            pts: 15,
            w: 36,
            h: 22,
          });
          x += minGap * 0.7;
        }
        n++;
        continue;
      }

      if (r < 0.28) {
        objs.push({ kind: "sawgrass", x: x, w: 34, h: 46 + Math.floor(seeded(idx, n) * 12) });
        if (seeded(idx, n + 2) > 0.45) {
          objs.push({ kind: "fish", x: x + 18, y: GROUND - 86, pts: 15 });
        }
        x += 34 + minGap;
      } else if (r < 0.4) {
        objs.push({ kind: "knee", x: x, w: 26, h: 32 + Math.floor(seeded(idx, n) * 10) });
        x += 26 + minGap * 0.9;
      } else if (r < 0.52 && idx >= 4) {
        // stay-low moss
        const hang = 248 + Math.floor(seeded(idx, n) * 22);
        objs.push({ kind: "moss", x: x, w: 46, h: hang });
        if (seeded(idx, n + 5) > 0.55) {
          objs.push({ kind: "firefly", x: x + 12, y: hang + 26, pts: 20 });
        }
        x += 46 + minGap;
      } else if (r < 0.62 && idx >= 8) {
        // hop then stay low
        objs.push({ kind: "sawgrass", x: x, w: 32, h: 48 });
        objs.push({ kind: "moss", x: x + 150, w: 44, h: 252 });
        x += 150 + 44 + minGap;
      } else if (r < 0.72 && idx >= 6) {
        const gw = 70 + Math.floor(seeded(idx, n) * 36);
        objs.push({ kind: "gap", x: x, w: gw });
        if (idx >= 14 && seeded(idx, n + 8) > 0.55) {
          objs.push({ kind: "log", x: x + gw * 0.2, y: GROUND - 58, w: 70, h: 16 });
        }
        x += gw + minGap + 20;
      } else if (r < 0.8 && idx >= 10) {
        objs.push({ kind: "log", x: x, y: GROUND - 64, w: 88, h: 16 });
        objs.push({ kind: "fish", x: x + 30, y: GROUND - 118, pts: 20 });
        if (idx >= 18) {
          objs.push({ kind: "sawgrass", x: x + 120, w: 30, h: 44 });
        }
        x += 200 + minGap * 0.7;
      } else if (r < 0.88 && idx >= 12) {
        objs.push({
          kind: "turtle",
          x: x,
          w: 54,
          h: 24,
          phase: seeded(idx, n) * 6,
        });
        x += 54 + minGap;
      } else if (r < 0.94) {
        objs.push({ kind: "sawgrass", x: x, w: 30, h: 46 });
        objs.push({ kind: "sawgrass", x: x + 78, w: 30, h: 50 });
        objs.push({ kind: "fish", x: x + 36, y: GROUND - 96, pts: 15 });
        x += 78 + 30 + minGap;
      } else {
        objs.push({ kind: "firefly", x: x + 20, y: GROUND - 80, pts: 20 });
        objs.push({ kind: "firefly", x: x + 55, y: GROUND - 110, pts: 20 });
        x += minGap * 0.8;
      }
      n++;
    }

    const extra = mission.count + (idx === 0 ? 14 : 6);
    if (mission.food === "fish") {
      placeNeeded(objs, "fish", extra, length, idx === 0 ? GROUND - 24 : GROUND - 78);
    } else if (mission.food === "turtle") {
      placeNeeded(objs, "turtle", extra, length, GROUND - 18);
    } else if (mission.food === "bird") {
      placeNeeded(objs, "bird", extra, length, GROUND - 22);
    }

    const hCount = idx === 0 ? 2 : 3 + Math.floor(idx / 12);
    const heronStart = idx === 0 ? Math.floor(length * 0.42) : 980;
    for (let h = 0; h < hCount; h++) {
      objs.push({
        kind: "heron",
        x: heronStart + h * Math.floor((length - heronStart - 200) / Math.max(1, hCount)),
        w: idx === 0 ? 32 : 36,
        h: idx === 0 ? 52 : 58,
        phase: h * 1.7,
      });
    }

    const finishX = length;
    objs.push({ kind: "finish", x: finishX, w: 48, h: 140 });
    objs.sort(function (a, b) {
      return a.x - b.x;
    });
    return {
      objs: objs,
      finishX: finishX,
      length: length + 200,
      mission: mission,
      terrain: buildTerrain(length + 400, idx),
    };
  }

  function buildTerrain(length, idx) {
    const segs = [];
    let x = 0;
    let i = 0;
    segs.push({ type: "bank", x: 0, w: 380 });
    x = 380;
    while (x < length) {
      const r = seeded(idx, 90 + i * 7);
      if (r < 0.3) {
        const w = 240 + Math.floor(seeded(idx, i + 2) * 90);
        segs.push({ type: "pond", x: x, w: w });
        x += w;
      } else if (r < 0.5) {
        const w = 170 + Math.floor(seeded(idx, i + 3) * 70);
        segs.push({ type: "canal", x: x, w: w });
        x += w;
      } else if (r < 0.84) {
        const w = 250 + Math.floor(seeded(idx, i + 4) * 110);
        segs.push({
          type: "hill",
          x: x,
          w: w,
          peak: (idx === 0 ? 28 : 52) + Math.floor(seeded(idx, i + 5) * (idx === 0 ? 16 : 42)),
        });
        x += w;
      } else {
        segs.push({ type: "bank", x: x, w: 150 });
        x += 150;
      }
      i++;
    }
    return segs;
  }

  function createWeather(idx) {
    const stormy = idx >= 40;
    const drops = [];
    const n = stormy ? 70 : idx >= 20 ? 36 : 0;
    for (let i = 0; i < n; i++) {
      drops.push({
        x: Math.random() * W,
        y: Math.random() * H,
        len: 8 + Math.random() * 12,
        spd: 260 + Math.random() * 200,
        thick: 0.7 + Math.random() * 1.1,
        alpha: 0.22 + Math.random() * 0.35,
      });
    }
    return {
      drops: drops,
      stormy: stormy,
      nextStrike: stormy ? 2.5 + Math.random() * 4 : 99,
      bolt: null,
      flash: 0,
    };
  }

  function buildLevel(idx) {
    const course = buildCourse(idx);
    return {
      idx: idx,
      time: 0,
      scroll: 0,
      speed: idx === 0 ? 155 : 220 + idx * 4.2,
      objs: course.objs,
      finishX: course.finishX,
      length: course.length,
      terrain: course.terrain || [],
      player: {
        y: GROUND,
        vy: 0,
        onGround: true,
        hops: 0,
        maxHops: 2,
        coyote: 0,
        inv: 0,
        tilt: 0,
        bob: 0,
        slope: 0,
        pose: "walk",
      },
      ready: 0,
      goFlash: 1.1,
      needRestart: false,
      restartIn: 0,
      won: false,
      flash: 0,
      shake: 0,
      hitFlash: 0,
      floatScores: [],
      puffs: [],
      fx: [],
      weather: createWeather(idx),
      gore: [],
      heronEat: null,
      owlEat: null,
      owl: idx === 19 ? { next: 7, active: false } : null,
      collected: 0,
      fishEaten: 0,
      turtlesEaten: 0,
      birdsEaten: 0,
      fliesEaten: 0,
      foodScale:
        idx === 0
          ? 0.95
          : Math.min(2.45, 0.58 + (missionFor(idx).tier || 0) * 0.28),
      mission: course.mission || missionFor(idx),
      playTime: 0,
      nextRoar: 2.4 + Math.random() * 2.2,
      lastMealDay: 0,
      sparks: [],
      birthday: null,
      quizDue: idx < 12 ? [30] : [30, 58],
      quizFired: 0,
    };
  }

  /* ---------- physics ---------- */
  function worldX() {
    return world.scroll + PLAYER_X;
  }

  function terrainY(wx) {
    const segs = (world && world.terrain) || [];
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (wx < s.x || wx > s.x + s.w) continue;
      if (s.type === "pond") return GROUND + 18;
      if (s.type === "canal") return GROUND + 12;
      if (s.type === "hill") {
        const t = (wx - s.x) / Math.max(1, s.w);
        return GROUND - Math.sin(t * Math.PI) * (s.peak || 56);
      }
      return GROUND;
    }
    return GROUND;
  }

  function surfaceAt(wx) {
    let surf = terrainY(wx);
    let gap = false;
    for (let i = 0; i < world.objs.length; i++) {
      const o = world.objs[i];
      if (o.gone) continue;
      if (o.kind === "gap" && wx >= o.x && wx <= o.x + o.w) gap = true;
      if (o.kind === "log" && wx >= o.x && wx <= o.x + o.w) {
        surf = Math.min(surf, o.y);
      }
    }
    if (gap && surf === GROUND) return H + 90;
    return surf;
  }

  function requestHop() {
    if (pausedForGoal) closeGoalCard();
    if (!world || world.won || pausedForQuiz || world.heronEat || world.owlEat) return;
    const p = world.player;
    const grounded = p.onGround || p.coyote > 0;
    if (grounded || p.hops < p.maxHops) {
      const air = !grounded;
      p.vy = air ? HOP_V * 0.88 : HOP_V;
      p.onGround = false;
      p.coyote = 0;
      p.hops = air ? p.hops + 1 : 1;
      sfxHop(air);
      sfxFart();
      spawnFart(air);
      haptic(8);
    }
  }

  function spawnFart(air) {
    if (!world) return;
    world.fx = world.fx || [];
    const baseX = PLAYER_X - 46;
    const baseY = world.player.y - 10;
    for (let i = 0; i < (air ? 5 : 7); i++) {
      world.fx.push({
        kind: "fart",
        x: baseX - i * 4,
        y: baseY + (Math.random() - 0.4) * 10,
        vx: -40 - Math.random() * 70,
        vy: -20 - Math.random() * 40,
        r: 8 + Math.random() * 10,
        life: 0.38 + Math.random() * 0.22,
        max: 0.55,
      });
    }
  }

  function spawnBurp() {
    if (!world) return;
    world.fx = world.fx || [];
    const baseX = PLAYER_X + 28;
    const baseY = world.player.y - 28;
    for (let i = 0; i < 5; i++) {
      world.fx.push({
        kind: "burp",
        x: baseX + i * 3,
        y: baseY + (Math.random() - 0.5) * 8,
        vx: 50 + Math.random() * 60,
        vy: -30 - Math.random() * 50,
        r: 6 + Math.random() * 8,
        life: 0.42 + Math.random() * 0.18,
        max: 0.55,
      });
    }
  }

  function spawnGore(sx, sy, heavy) {
    world.gore = world.gore || [];
    const n = heavy ? 32 : 14;
    for (let i = 0; i < n; i++) {
      const ang = -0.2 + Math.random() * (Math.PI + 0.4);
      const spd = 90 + Math.random() * (heavy ? 340 : 200);
      world.gore.push({
        x: sx + (Math.random() - 0.5) * 16,
        y: sy + (Math.random() - 0.5) * 10,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 120,
        r: 3 + Math.random() * (heavy ? 9 : 6),
        life: 0.55 + Math.random() * 0.5,
        drip: Math.random() > 0.5,
      });
    }
  }

  function rewindPlayer() {
    const p = world.player;
    const wx = worldX();
    let safe = Math.max(0, wx - 220);
    for (let i = world.objs.length - 1; i >= 0; i--) {
      const o = world.objs[i];
      if (o.kind === "gap" && safe >= o.x && safe <= o.x + o.w) {
        safe = o.x - 40;
      }
    }
    world.scroll = Math.max(0, safe - PLAYER_X);
    p.y = GROUND;
    p.vy = 0;
    p.onGround = true;
    p.hops = 0;
  }

  function hitPlayer(by) {
    if (
      !world ||
      world.player.inv > 0 ||
      world.won ||
      world.needRestart ||
      world.heronEat ||
      world.owlEat
    )
      return;
    const p = world.player;
    p.inv = 2;
    state.lives = Math.max(0, state.lives - 1);
    updateHud();
    haptic(by === "heron" ? [40, 30, 80, 40, 60] : [30, 40, 50]);

    if (by === "heron" || by === "owl") {
      const pack = {
        life: 1.25,
        max: 1.25,
        x: PLAYER_X,
        y: p.y,
      };
      if (by === "owl") world.owlEat = pack;
      else world.heronEat = pack;
      spawnGore(PLAYER_X + 10, p.y - 22, true);
      world.shake = 0.75;
      world.hitFlash = 0.85;
      sfxChomp();
      if (state.lives <= 0) {
        world.needRestart = true;
        world.restartIn = 1.15;
        world.failMsg =
          by === "owl"
            ? "An owl swooped the hatchling!"
            : "A great blue heron ate the hatchling!";
      }
      return;
    }

    world.hitFlash = 0.45;
    world.shake = 0.35;
    world.flash = 0.2;
    sfxHit();
    rewindPlayer();
    if (state.lives <= 0) {
      world.needRestart = true;
      world.restartIn = 0.85;
    }
  }

  function goalMet() {
    if (!world || !world.mission) return false;
    const m = world.mission;
    if (m.needFish && (world.fishEaten || 0) < m.needFish) return false;
    if (m.needTurtle && (world.turtlesEaten || 0) < m.needTurtle) return false;
    if (m.needBird && (world.birdsEaten || 0) < m.needBird) return false;
    if (m.needFire && (world.fliesEaten || 0) < m.needFire) return false;
    return !!(m.needFish || m.needTurtle || m.needBird || m.needFire);
  }

  function goalLabel() {
    if (!world || !world.mission) return "";
    const m = world.mission;
    const bits = [];
    if (m.needFish) bits.push("Fish " + (world.fishEaten || 0) + "/" + m.needFish);
    if (m.needTurtle) bits.push("Turtles " + (world.turtlesEaten || 0) + "/" + m.needTurtle);
    if (m.needBird) bits.push("Birds " + (world.birdsEaten || 0) + "/" + m.needBird);
    if (m.needFire) bits.push("Fireflies " + (world.fliesEaten || 0) + "/" + m.needFire);
    if (m.hazard === "heron") bits.push("avoid herons");
    return bits.join(" · ");
  }

  function collectAt(o, pts) {
    o.gone = true;
    state.score += pts;
    world.collected += 1;
    if (o.kind === "fish") world.fishEaten = (world.fishEaten || 0) + 1;
    if (o.kind === "turtle") world.turtlesEaten = (world.turtlesEaten || 0) + 1;
    if (o.kind === "bird") world.birdsEaten = (world.birdsEaten || 0) + 1;
    if (o.kind === "firefly") world.fliesEaten = (world.fliesEaten || 0) + 1;
    world.floatScores.push({
      x: o.x - world.scroll,
      y: (o.y || GROUND - 40) - 10,
      pts: pts,
      life: 0.7,
    });
    world.lastMealDay = dayOfYear();
    sfxCollect(pts >= 20);
    if (o.kind === "turtle") {
      sfxCrunch();
      spawnBurp();
    } else if (o.kind === "fish" || o.kind === "bird") {
      sfxBurp();
      spawnBurp();
    }
    haptic(6);
    updateHud();
    if (goalMet()) winLevel();
  }

  function playerBox() {
    const wx = worldX();
    const p = world.player;
    return { x: wx - 16, y: p.y - 28, w: 38, h: 26 };
  }

  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function collide() {
    const pb = playerBox();
    for (let i = 0; i < world.objs.length; i++) {
      const o = world.objs[i];
      if (o.gone) continue;
      if (
        o.kind === "fish" ||
        o.kind === "firefly" ||
        o.kind === "turtle" ||
        o.kind === "bird"
      ) {
        const sc = (world.foodScale || 1) * (world.idx === 0 ? 1.7 : 1);
        const fw = (o.kind === "turtle" || o.kind === "bird" ? 42 : 28) * sc;
        const fh = (o.kind === "turtle" || o.kind === "bird" ? 22 : 18) * sc;
        const baseY = world.idx === 0 ? terrainY(o.x) - 6 : o.y || GROUND - 20;
        const box = {
          x: o.x - fw * 0.45,
          y: baseY - fh * 0.85,
          w: fw,
          h: fh + (world.idx === 0 ? 16 : 0),
        };
        if (overlaps(pb, box)) collectAt(o, o.pts || 15);
        continue;
      }
      if (o.kind === "finish" && worldX() > o.x) {
        if (goalMet()) {
          winLevel();
        } else {
          const m = world.mission || {};
          const missing = [];
          if (m.needFish && world.fishEaten < m.needFish) {
            missing.push(m.needFish - world.fishEaten + " more fish");
          }
          if (m.needTurtle && world.turtlesEaten < m.needTurtle) {
            missing.push(m.needTurtle - world.turtlesEaten + " more turtles");
          }
          if (m.needBird && world.birdsEaten < m.needBird) {
            missing.push(m.needBird - world.birdsEaten + " more birds");
          }
          if (m.needFire && world.fliesEaten < m.needFire) {
            missing.push(m.needFire - world.fliesEaten + " more fireflies");
          }
          world.failMsg = missing.length
            ? "Need " + missing.join(" and ")
            : "Goal not finished";
          world.needRestart = true;
          world.restartIn = 1.5;
        }
        return;
      }
      let hb = null;
      if (o.kind === "sawgrass") {
        hb = { x: o.x + 8, y: GROUND - o.h + 4, w: o.w - 12, h: o.h - 6 };
      } else if (o.kind === "knee") {
        hb = { x: o.x + 4, y: GROUND - o.h + 2, w: o.w - 6, h: o.h - 2 };
      } else if (o.kind === "moss") {
        hb = { x: o.x + 10, y: 0, w: o.w - 18, h: o.h - 8 };
      } else if (o.kind === "turtle") {
        const wob = Math.sin(world.time * 1.6 + (o.phase || 0)) * 18;
        hb = { x: o.x + wob + 6, y: GROUND - o.h, w: o.w - 10, h: o.h - 2 };
      } else if (o.kind === "heron") {
        hb = { x: o.x + 8, y: GROUND - o.h + 6, w: o.w - 10, h: o.h - 8 };
      }
      if (hb && overlaps(pb, hb)) hitPlayer(o.kind);
    }
    collideOwl();
  }

  function collideOwl() {
    const o = world.owl && world.owl.active;
    if (!o) return;
    const pb = playerBox();
    const box = { x: o.x - 28, y: o.y - 20, w: 56, h: 36 };
    if (overlaps(pb, box)) hitPlayer("owl");
  }

  function winLevel() {
    if (!world || world.won) return;
    world.won = true;
    world.birthday = { t: 0, max: 3.8, boomed: false };
    spawnSparks(40);
    sfxWin();
    sfxBirthday();
    sayBirthday();
    haptic([18, 30, 18, 30, 40, 20, 60]);
    state.totalScore += state.score;
    state.completed[state.level] = true;
    if (state.unlocked < state.level + 2) {
      state.unlocked = Math.min(TOTAL_LEVELS, state.level + 2);
    }
    save();
  }

  function finishWin() {
    stopLoop();
    const doneName = (world.mission && world.mission.title) || "Stretch";
    const yrs = state.level + 1;
    $("#fact-title").textContent =
      "Happy birthday! " + yrs + (yrs === 1 ? " year" : " years") + " old";
    $("#fact-score").textContent =
      "Level score: " + state.score + " · Total: " + state.totalScore;
    const fact = FACTS[state.level % FACTS.length];
    const lab = $("#fact-label");
    if (lab) lab.textContent = "Florida fact · " + fact.label;
    $("#fact-text").textContent = fact.text;
    const g = $("#global-score");
    if (g) g.textContent = String(state.totalScore);
    if (allLevelsDone()) {
      grantCoupon();
      paintCoupon("#coupon-code", "#coupon-box");
    }
    show("fact");
  }

  function updateWeather(dt) {
    const w = world.weather;
    if (!w) return;
    w.drops.forEach(function (d) {
      d.y += d.spd * dt;
      d.x += 40 * dt;
      if (d.y > H) {
        d.y = -12;
        d.x = Math.random() * W;
      }
      if (d.x > W) d.x -= W;
    });
    w.nextStrike -= dt;
    if (w.stormy && w.nextStrike <= 0) {
      w.flash = 0.85;
      w.nextStrike = 3.5 + Math.random() * 5;
      playTone(55, 0.28, "sine", 0.12, 0);
    }
    if (w.flash > 0) w.flash = Math.max(0, w.flash - dt * 2.8);
  }

  function update(dt) {
    if (!world) return;
    world.time += dt;
    if (world.birthday) {
      updateBirthday(dt);
      return;
    }
    if (world.won) return;
    if (world.flash > 0) world.flash -= dt;
    if (world.hitFlash > 0) world.hitFlash -= dt;
    if (world.shake > 0) world.shake -= dt;
    if (world.player.inv > 0) world.player.inv -= dt;

    updateWeather(dt);

    if (world.floatScores.length) {
      world.floatScores = world.floatScores.filter(function (fs) {
        fs.life -= dt;
        fs.y -= 36 * dt;
        return fs.life > 0;
      });
    }
    if (world.puffs.length) {
      world.puffs = world.puffs.filter(function (p) {
        p.life -= dt;
        p.x -= 30 * dt;
        p.y -= 10 * dt;
        return p.life > 0;
      });
    }
    if (world.fx && world.fx.length) {
      world.fx = world.fx.filter(function (f) {
        f.life -= dt;
        f.x += (f.vx || 0) * dt;
        f.y += (f.vy || 0) * dt;
        if (f.kind === "fart" || f.kind === "burp") f.vy += 40 * dt;
        return f.life > 0;
      });
    }

    if (world.gore && world.gore.length) {
      world.gore = world.gore.filter(function (g) {
        g.life -= dt;
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        g.vy += 780 * dt;
        if (g.y > GROUND - 2) {
          g.y = GROUND - 2;
          g.vy *= -0.18;
          g.vx *= 0.55;
        }
        return g.life > 0;
      });
    }

    if (world.heronEat || world.owlEat) {
      const eat = world.heronEat || world.owlEat;
      eat.life -= dt;
      if (world.needRestart) world.restartIn -= dt;
      if (eat.life < 0.85 && eat.life > 0.82) {
        spawnGore(eat.x + 8, eat.y - 18, false);
      }
      if (eat.life <= 0) {
        world.heronEat = null;
        world.owlEat = null;
        if (!world.needRestart) rewindPlayer();
      }
      return;
    }

    if (world.goFlash > 0) world.goFlash -= dt;
    if (world.needRestart) {
      world.restartIn -= dt;
      return;
    }
    if (pausedForQuiz || pausedForGoal) return;

    world.playTime = (world.playTime || 0) + dt;
    world.nextRoar = (world.nextRoar || 4) - dt;
    if (world.nextRoar <= 0 && world.playTime > 1.6) {
      const calls = ["roar", "hiss", "grunt"];
      const call = calls[Math.floor(Math.random() * calls.length)];
      sfxGatorCall(call);
      world.nextRoar = 3.2 + Math.random() * 4.2;
    }
    if (
      world.quizDue &&
      world.quizFired < world.quizDue.length &&
      world.playTime >= world.quizDue[world.quizFired]
    ) {
      const n = world.quizFired;
      world.quizFired += 1;
      openComicQuiz(npcFor(world.idx, n));
      return;
    }

    world.scroll += world.speed * dt;

    const p = world.player;
    p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);
    const wasAir = !p.onGround;
    p.y += p.vy * dt;
    const surf = surfaceAt(worldX());
    if (p.y >= surf && p.vy >= 0) {
      if (wasAir && surf < H) {
        world.puffs.push({ x: PLAYER_X - 8, y: surf - 4, life: 0.28 });
        world.puffs.push({ x: PLAYER_X + 10, y: surf - 2, life: 0.22 });
      }
      p.y = surf;
      p.vy = 0;
      p.onGround = true;
      p.hops = 0;
      p.coyote = 0.08;
    } else {
      p.onGround = false;
      p.coyote = Math.max(0, (p.coyote || 0) - dt);
    }
    if (p.y > H + 30) hitPlayer();

    const ahead = terrainY(worldX() + 26);
    const behind = terrainY(worldX() - 26);
    p.slope = ahead - behind;
    if (p.onGround) {
      if (p.slope < -12) p.pose = "climb";
      else if (p.slope > 12) p.pose = "down";
      else p.pose = "walk";
      p.tilt += ((p.slope / 90) - p.tilt) * Math.min(1, 8 * dt);
    } else {
      p.pose = "leap";
      const want = Math.max(-0.32, Math.min(0.42, p.vy / 1500));
      p.tilt += (want - p.tilt) * Math.min(1, 10 * dt);
    }
    p.bob += dt * (p.onGround ? (p.pose === "climb" ? 16 : 12) : 4);

    if (world.sparks && world.sparks.length) {
      world.sparks = world.sparks.filter(function (s) {
        s.life -= dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 220 * dt;
        return s.life > 0;
      });
    }

    updateOwl(dt);
    updateAgeHud();
    collide();
  }

  function updateOwl(dt) {
    if (!world.owl) return;
    if (!world.owl.active) {
      world.owl.next -= dt;
      if (world.owl.next <= 0) {
        world.owl.active = {
          x: world.scroll + W + 30,
          y: 36,
          vx: -300,
          vy: 210,
        };
        world.owl.next = 10 + Math.random() * 5;
        playTone(520, 0.08, "triangle", 0.08, 0);
        playTone(380, 0.12, "sine", 0.07, 0.06);
      }
      return;
    }
    const o = world.owl.active;
    o.x += o.vx * dt;
    o.y += o.vy * dt;
    if (o.y > GROUND - 20) {
      o.y = GROUND - 20;
      o.vy = -40;
    }
    if (o.x < world.scroll - 80 || o.y > H + 40) {
      world.owl.active = null;
    }
  }

  function updateBirthday(dt) {
    const b = world.birthday;
    b.t += dt;
    if (b.t > 0.15) spawnSparks(3);
    if (!b.boomed && b.t >= 1.35) {
      b.boomed = true;
      spawnSparks(70);
      world.shake = 0.55;
      world.flash = 0.45;
      playTone(90, 0.18, "sine", 0.2, 0);
      playNoise(0.28, 500, 80, 0.3, 0);
    }
    if (world.sparks && world.sparks.length) {
      world.sparks = world.sparks.filter(function (s) {
        s.life -= dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 180 * dt;
        return s.life > 0;
      });
    }
    if (b.t >= b.max) finishWin();
  }

  /* ---------- draw ---------- */
  function drawPhotoBg() {
    const img = bgImages.length ? bgImages[world.idx % bgImages.length] : null;
    if (img) {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(W / iw, H / ih) * 1.15;
      const dw = iw * scale;
      const dh = ih * scale;
      const drift = (world.scroll * 0.12) % 40;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, (W - dw) / 2 - drift, (H - dh) / 2, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#f0a04a");
      g.addColorStop(0.45, "#c45c3a");
      g.addColorStop(1, "#1a3328");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = "rgba(8, 16, 14, 0.28)";
    ctx.fillRect(0, 0, W, H);
  }

  function drawFarSilhouettes() {
    const t = world.scroll;
    ctx.fillStyle = "rgba(8, 22, 16, 0.45)";
    ctx.beginPath();
    ctx.moveTo(0, 210);
    for (let i = 0; i <= 12; i++) {
      const x = i * 90 - (t * 0.18) % 90;
      const y = 168 + Math.sin(i * 0.9 + world.idx) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, 230);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.fill();

    // palm / mangrove silhouettes
    ctx.fillStyle = "rgba(6, 18, 12, 0.55)";
    for (let i = 0; i < 8; i++) {
      const x = ((i * 160 - t * 0.28) % (W + 160)) - 40;
      ctx.beginPath();
      ctx.moveTo(x, 230);
      ctx.quadraticCurveTo(x - 8, 160, x + 4, 118);
      ctx.quadraticCurveTo(x + 14, 160, x + 10, 230);
      ctx.fill();
      for (let f = 0; f < 5; f++) {
        const a = -1.2 + f * 0.5;
        ctx.beginPath();
        ctx.moveTo(x + 4, 122);
        ctx.quadraticCurveTo(
          x + 4 + Math.cos(a) * 28,
          122 + Math.sin(a) * 10,
          x + 4 + Math.cos(a) * 46,
          132 + Math.sin(a) * 18
        );
        ctx.strokeStyle = "rgba(6, 18, 12, 0.55)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }

  function drawTerrain() {
    // water table under everything
    const wg = ctx.createLinearGradient(0, GROUND + 8, 0, H);
    wg.addColorStop(0, "rgba(30, 100, 110, 0.55)");
    wg.addColorStop(1, "rgba(10, 36, 44, 0.95)");
    ctx.fillStyle = wg;
    ctx.fillRect(0, GROUND + 6, W, H - GROUND);

    // land profile: hills, banks, pond rims
    ctx.beginPath();
    ctx.moveTo(-2, H);
    ctx.lineTo(-2, terrainY(world.scroll) + 8);
    for (let sx = 0; sx <= W + 8; sx += 5) {
      ctx.lineTo(sx, terrainY(world.scroll + sx));
    }
    ctx.lineTo(W + 8, H);
    ctx.closePath();
    const dirt = ctx.createLinearGradient(0, 180, 0, H);
    dirt.addColorStop(0, "#5a7a38");
    dirt.addColorStop(0.18, "#4a5a2c");
    dirt.addColorStop(1, "#2a3420");
    ctx.fillStyle = dirt;
    ctx.fill();

    // grass lip
    ctx.strokeStyle = "#6a9a44";
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let sx = 0; sx <= W; sx += 5) {
      const y = terrainY(world.scroll + sx);
      if (sx === 0) ctx.moveTo(sx, y);
      else ctx.lineTo(sx, y);
    }
    ctx.stroke();

    // mark ponds / canals with water sheen in the dips
    const segs = world.terrain || [];
    segs.forEach(function (s) {
      const sx = s.x - world.scroll;
      if (sx > W || sx + s.w < 0) return;
      if (s.type !== "pond" && s.type !== "canal") return;
      const y = terrainY(s.x + s.w * 0.5);
      ctx.fillStyle =
        s.type === "pond" ? "rgba(40, 130, 140, 0.45)" : "rgba(30, 90, 110, 0.4)";
      ctx.fillRect(Math.max(0, sx), y, Math.min(W, sx + s.w) - Math.max(0, sx), H - y);
      ctx.fillStyle = "rgba(220, 240, 230, 0.55)";
      ctx.font = "bold 10px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.type === "pond" ? "pond" : "canal", sx + s.w / 2, y + 14);
    });
  }

  function drawWaterAndBank() {
    const t = world.time;
    ctx.strokeStyle = "rgba(180, 230, 220, 0.18)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const y0 = GROUND + 22 + i * 14;
      for (let x = 0; x <= W; x += 14) {
        const yy = y0 + Math.sin(t * 2 + x * 0.04 + i) * 2;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }

  function inGapWorld(wx) {
    for (let i = 0; i < world.objs.length; i++) {
      const o = world.objs[i];
      if (o.kind === "gap" && wx >= o.x && wx <= o.x + o.w) return true;
    }
    return false;
  }

  function drawGap(o, sx) {
    ctx.fillStyle = "rgba(12, 50, 62, 0.95)";
    ctx.fillRect(sx, GROUND - 6, o.w, H - GROUND + 8);
    ctx.fillStyle = "rgba(30, 90, 100, 0.5)";
    ctx.fillRect(sx, GROUND + 8, o.w, 18);
    // cut banks
    ctx.fillStyle = "#4a3420";
    ctx.fillRect(sx - 6, GROUND - 8, 8, 22);
    ctx.fillRect(sx + o.w - 2, GROUND - 8, 8, 22);
  }

  function drawSawgrass(o, sx) {
    const t = world.time;
    for (let i = 0; i < 7; i++) {
      const bx = sx + 4 + i * 4.2;
      const h = o.h - (i % 3) * 6;
      const sway = Math.sin(t * 2.4 + o.x + i) * 3.2;
      ctx.strokeStyle = i % 2 ? "#2f6b32" : "#4a8a3a";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(bx, GROUND);
      ctx.quadraticCurveTo(bx + sway, GROUND - h * 0.55, bx + sway * 1.3, GROUND - h);
      ctx.stroke();
      ctx.fillStyle = "#c9a24a";
      ctx.beginPath();
      ctx.ellipse(bx + sway * 1.3, GROUND - h - 3, 2.2, 5.5, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawKnee(o, sx) {
    const g = ctx.createLinearGradient(sx, GROUND - o.h, sx + o.w, GROUND);
    g.addColorStop(0, "#8a6238");
    g.addColorStop(0.5, "#5a3a1c");
    g.addColorStop(1, "#3a2410");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx + 2, GROUND + 2);
    ctx.quadraticCurveTo(sx - 2, GROUND - o.h * 0.4, sx + o.w * 0.35, GROUND - o.h);
    ctx.quadraticCurveTo(sx + o.w + 4, GROUND - o.h * 0.5, sx + o.w, GROUND + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,220,160,0.18)";
    ctx.fillRect(sx + 6, GROUND - o.h + 8, 4, 10);
  }

  function drawMoss(o, sx) {
    const t = world.time;
    ctx.fillStyle = "rgba(18, 36, 22, 0.65)";
    ctx.fillRect(sx - 10, 0, o.w + 20, 16);
    for (let i = 0; i < 8; i++) {
      const mx = sx + 4 + i * 5.2;
      const sway = Math.sin(t * 1.8 + i + o.x * 0.01) * 5;
      ctx.strokeStyle = i % 2 ? "rgba(90, 120, 70, 0.85)" : "rgba(70, 100, 55, 0.8)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(mx, 12);
      ctx.bezierCurveTo(
        mx + sway,
        o.h * 0.35,
        mx - sway,
        o.h * 0.7,
        mx + sway * 0.4,
        o.h
      );
      ctx.stroke();
    }
  }

  function drawLog(o, sx) {
    const g = ctx.createLinearGradient(sx, o.y, sx, o.y + o.h);
    g.addColorStop(0, "#c4a06a");
    g.addColorStop(0.5, "#8a5a2c");
    g.addColorStop(1, "#4a2e14");
    ctx.fillStyle = g;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(sx, o.y, o.w, o.h, 6);
    else ctx.rect(sx, o.y, o.w, o.h);
    ctx.fill();
    ctx.strokeStyle = "rgba(40,20,8,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + 8, o.y + o.h * 0.5);
    ctx.lineTo(sx + o.w - 8, o.y + o.h * 0.5);
    ctx.stroke();
  }

  function foodDrawSize(kind) {
    const sc = (world && world.foodScale) || 1;
    if (kind === "fish") return { w: 58 * sc, h: 36 * sc };
    if (kind === "turtle") return { w: 76 * sc, h: 36 * sc };
    return { w: 78 * sc, h: 40 * sc };
  }

  function drawFoodSprite(kind, o, sx) {
    const key =
      kind === "fish" ? "foodFish" : kind === "turtle" ? "foodTurtle" : "foodBird";
    const img = sprites[key];
    const sz = foodDrawSize(kind);
    const bob = Math.sin((world.time || 0) * 2.4 + o.x * 0.015) * 3;
    const y = terrainY(o.x) - 10 + bob;
    if (img) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx - sz.w * 0.2, y - sz.h * 0.82, sz.w, sz.h);
      return;
    }
    if (kind === "fish") drawFishIcon(sx, y, world.time + o.x);
  }

  function drawFishIcon(x, y, phase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(phase) * 0.25);
    const body = ctx.createLinearGradient(-8, 0, 8, 0);
    body.addColorStop(0, "#6aa8b8");
    body.addColorStop(1, "#d5f0f6");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8ec4d2";
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(-13, -5);
    ctx.lineTo(-11, 0);
    ctx.lineTo(-13, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#112";
    ctx.beginPath();
    ctx.arc(4, -1, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFirefly(x, y, phase) {
    const glow = 0.45 + Math.sin(phase * 6) * 0.35;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(210, 255, 120, " + glow + ")";
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f6ff9a";
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSprite(img, sx, sy, dw, dh) {
    if (!img) return;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, sx, sy, dw, dh);
  }

  function drawQuizNpc(o, sx) {
    const img = o.npc && sprites[o.npc.id];
    const bob = Math.sin(world.time * 2.2 + o.x) * 4;
    if (img) {
      const h = o.npc.id === "manatee" ? 42 : 52;
      const w = h * ((img.naturalWidth || 1) / (img.naturalHeight || 1));
      const yBase = o.npc.id === "manatee" ? GROUND + 36 : GROUND;
      drawSprite(img, sx - w * 0.15, yBase - h + bob, w, h);
    } else {
      ctx.font = "42px serif";
      ctx.fillText("🐦", sx, GROUND - 12 + bob);
    }
    if (o.kind === "quiz" && !o.fired) {
      ctx.fillStyle = "rgba(255, 240, 160, 0.95)";
      ctx.font = "bold 11px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("?", sx + 24, GROUND - (o.h || 80) - 8 + bob);
    }
  }

  function drawHazardHeron(o, sx) {
    const img = sprites.gbHeron || sprites.heron;
    const peck = Math.sin(world.time * 3 + (o.phase || 0)) > 0.65;
    if (img) {
      drawSprite(img, sx - 8, GROUND - 92, 48, 94);
    } else {
      ctx.fillStyle = "#6a86a0";
      ctx.fillRect(sx + 10, GROUND - 70, 14, 70);
    }
    if (peck) {
      ctx.strokeStyle = "#e8c040";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + 40, GROUND - 62);
      ctx.lineTo(sx + 58, GROUND - 48);
      ctx.stroke();
    }
  }

  function drawTurtle(o, sx) {
    const wob = Math.sin(world.time * 1.6 + (o.phase || 0)) * 18;
    const img = sprites.turtle;
    if (img) drawSprite(img, sx + wob, GROUND - 36, 70, 36);
    else {
      ctx.fillStyle = "#4a6a32";
      ctx.beginPath();
      ctx.ellipse(sx + 24 + wob, GROUND - 12, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFinish(o, sx) {
    ctx.fillStyle = "rgba(240, 200, 70, 0.25)";
    ctx.fillRect(sx, 40, 10, GROUND - 40);
    ctx.fillStyle = "#f0c040";
    ctx.fillRect(sx, 36, 8, GROUND - 36);
    ctx.fillStyle = "#3cb371";
    ctx.beginPath();
    ctx.moveTo(sx + 8, 40);
    ctx.lineTo(sx + 78, 58);
    ctx.lineTo(sx + 8, 76);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#143d22";
    ctx.font = "bold 11px system-ui,sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("ROOKERY", sx + 12, 62);
  }

  function drawMoveFx() {
    if (!world.fx || !world.fx.length) return;
    world.fx.forEach(function (f) {
      const a = Math.max(0, f.life / (f.max || 0.5));
      if (f.kind === "fart") {
        ctx.fillStyle = "rgba(170, 190, 70, " + a * 0.55 + ")";
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r * (1.2 - a * 0.3), f.r * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(210, 220, 110, " + a * 0.35 + ")";
        ctx.beginPath();
        ctx.ellipse(f.x - 3, f.y - 2, f.r * 0.45, f.r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (f.kind === "burp") {
        ctx.fillStyle = "rgba(180, 150, 80, " + a * 0.5 + ")";
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.r, f.r * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 230, 140, " + a * 0.7 + ")";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else if (f.kind === "word") {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = f.color || "#ffe566";
        ctx.strokeStyle = "rgba(20, 30, 10, 0.65)";
        ctx.lineWidth = 3;
        ctx.font = "bold 18px system-ui,Impact,sans-serif";
        ctx.textAlign = "center";
        ctx.strokeText(f.text, f.x, f.y);
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      }
    });
  }

  function drawGore() {
    if (!world.gore || !world.gore.length) return;
    world.gore.forEach(function (g) {
      const a = Math.max(0, Math.min(1, g.life / 0.7));
      ctx.fillStyle = g.drip
        ? "rgba(150, 18, 28, " + a + ")"
        : "rgba(196, 28, 42, " + a + ")";
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, g.r, g.r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      if (g.drip) {
        ctx.fillRect(g.x - 1.1, g.y, 2.2, 6 + (1 - a) * 8);
      }
    });
    // puddle on the bank after a chomp
    if (world.heronEat) {
      const t = 1 - world.heronEat.life / world.heronEat.max;
      ctx.fillStyle = "rgba(130, 16, 24, " + Math.min(0.7, t * 0.75) + ")";
      ctx.beginPath();
      ctx.ellipse(PLAYER_X + 6, GROUND - 3, 22 + t * 18, 6 + t * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawOwlSwoop() {
    const o = world.owl && world.owl.active;
    if (!o) return;
    const sx = o.x - world.scroll;
    const img = sprites.owl;
    if (img) {
      ctx.save();
      ctx.translate(sx, o.y);
      ctx.rotate(-0.35);
      ctx.drawImage(img, -48, -32, 96, 64);
      ctx.restore();
    } else {
      ctx.fillStyle = "#6a5030";
      ctx.beginPath();
      ctx.ellipse(sx, o.y, 22, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHeronEat() {
    const eat = world.heronEat || world.owlEat;
    if (!eat) return;
    const isOwl = !!world.owlEat;
    const t = 1 - eat.life / eat.max;
    const cx = eat.x + 18;
    const cy = eat.y - 36 - Math.sin(Math.min(1, t * 2) * Math.PI) * 18;

    const img = isOwl ? sprites.owl : sprites.gbHeron || sprites.heron;
    ctx.save();
    ctx.translate(cx + 36, isOwl ? eat.y - 10 : GROUND);
    ctx.rotate(isOwl ? -0.5 : -0.25 - t * 0.15);
    if (img) {
      if (isOwl) ctx.drawImage(img, -50, -40, 100, 70);
      else ctx.drawImage(img, -28, -96, 70, 102);
    }
    ctx.restore();

    // snatched hatchling (smaller, spinning)
    const gator = sprites.gator;
    ctx.save();
    ctx.translate(cx - 8, cy);
    ctx.rotate(-0.8 + t * 4.2);
    ctx.globalAlpha = t < 0.75 ? 1 : Math.max(0, 1 - (t - 0.75) * 4);
    if (gator) ctx.drawImage(gator, -36, -18, 72, 38);
    ctx.restore();

    // extra spray
    ctx.fillStyle = "rgba(170, 20, 32, " + (0.85 - t * 0.4) + ")";
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + t * 6;
      const d = 10 + t * 36 + (i % 3) * 4;
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(ang) * d,
        cy + 8 + Math.sin(ang) * d * 0.65,
        4 + (i % 3),
        3,
        ang,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // comic stamp
    ctx.save();
    ctx.translate(W * 0.52, H * 0.34);
    ctx.rotate(-0.12);
    const pop = 0.85 + Math.sin(t * 20) * 0.08;
    ctx.scale(pop, pop);
    ctx.strokeStyle = "#4a0000";
    ctx.lineWidth = 7;
    ctx.font = "bold 54px system-ui,Impact,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const word = isOwl
      ? t < 0.35
        ? "SWOOP!"
        : t < 0.7
          ? "TALONS!"
          : "OUCH!"
      : t < 0.35
        ? "CHOMP!"
        : t < 0.7
          ? "GULP!"
          : "OUCH!";
    ctx.strokeText(word, 0, 0);
    ctx.fillStyle = "#ff3b3b";
    ctx.fillText(word, 0, 0);
    ctx.restore();
  }

  function drawPlayer() {
    const p = world.player;
    if (p.inv > 0 && Math.floor(world.time * 18) % 2 === 0) return;
    ctx.save();
    ctx.translate(PLAYER_X, p.y);
    const climb = p.pose === "climb";
    const months = ageMonthsTotal();
    let grow = 0.78 + Math.min(0.9, months / 16 * 0.5);
    if (world.birthday) {
      const bt = world.birthday.t / world.birthday.max;
      grow *= 1 + bt * 1.25;
      if (world.birthday.boomed) grow *= 1.1 + Math.sin(world.time * 24) * 0.08;
    }
    ctx.scale(grow, grow);
    ctx.rotate(p.tilt);
    const stride = p.onGround ? Math.sin(p.bob) : 0;
    const bob = p.onGround ? stride * (climb ? 3.4 : 2.2) : 0;
    let img = sprites.gator;
    if (p.onGround && climb && sprites.gatorClimb) img = sprites.gatorClimb;
    else if (p.onGround && sprites.gatorWalk) img = sprites.gatorWalk;
    if (img) {
      const dw = climb ? 108 : 124;
      const dh = climb ? 78 : 58;
      ctx.drawImage(img, -dw * 0.58, -dh + 8 + bob, dw, dh);
    } else {
      ctx.fillStyle = "#2a5a32";
      ctx.beginPath();
      ctx.ellipse(-4, -14, 28, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // visible stepping legs when walking / climbing
    if (p.onGround) {
      ctx.strokeStyle = "rgba(20, 28, 16, 0.55)";
      ctx.lineWidth = 3;
      const lift = climb ? 10 : 6;
      const a = stride * lift;
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-10, 6 + a);
      ctx.moveTo(10, -2);
      ctx.lineTo(14, 6 - a);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSparks() {
    if (!world.sparks || !world.sparks.length) return;
    world.sparks.forEach(function (s) {
      const a = Math.max(0, s.life / 0.6);
      ctx.fillStyle = s.warm
        ? "rgba(255, 180, 40, " + a + ")"
        : "rgba(255, 250, 160, " + a + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (1.2 - a * 0.3), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawBirthdayFx() {
    const b = world.birthday;
    if (!b) return;
    const t = b.t / b.max;
    if (b.boomed) {
      const boom = Math.min(1, (b.t - 1.35) / 0.35);
      ctx.save();
      ctx.translate(PLAYER_X, world.player.y - 20);
      ctx.strokeStyle = "rgba(255, 210, 60, " + (1 - boom) + ")";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 20 + boom * 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 140, 40, " + (0.35 * (1 - boom)) + ")";
      ctx.beginPath();
      ctx.arc(0, 0, 16 + boom * 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(W / 2, 78);
    ctx.rotate(-0.04);
    ctx.textAlign = "center";
    ctx.strokeStyle = "#4a2000";
    ctx.lineWidth = 6;
    ctx.font = "bold 28px system-ui,Impact,sans-serif";
    ctx.strokeText("HAPPY BIRTHDAY TO ME!", 0, 0);
    ctx.fillStyle = "#ffe566";
    ctx.fillText("HAPPY BIRTHDAY TO ME!", 0, 0);
    ctx.font = "bold 16px system-ui,sans-serif";
    ctx.fillStyle = "#fff4c0";
    ctx.strokeText("One more year older", 0, 26);
    ctx.fillText("One more year older", 0, 26);
    ctx.restore();
  }

  function drawHudStrip() {
    const prog = Math.max(0, Math.min(1, worldX() / world.finishX));
    ctx.fillStyle = "rgba(8, 14, 10, 0.72)";
    ctx.fillRect(0, H - 16, W, 16);
    ctx.fillStyle = "rgba(60, 179, 113, 0.85)";
    ctx.fillRect(0, H - 16, W * prog, 16);
    // sawgrass ticks
    ctx.fillStyle = "rgba(240, 220, 120, 0.55)";
    for (let i = 1; i < 8; i++) {
      ctx.fillRect((W * i) / 8, H - 16, 2, 16);
    }
    ctx.fillStyle = "#e8f5ec";
    ctx.font = "bold 10px system-ui,sans-serif";
    ctx.textAlign = "left";
    const age = formatAgeParts();
    const eatLeft = daysUntilMeal();
    ctx.fillText(
      "AGE " +
        age.n +
        " " +
        age.unit +
        "  ·  EAT IN " +
        (eatLeft < 0.4 ? "NOW" : Math.ceil(eatLeft) + "d"),
      8,
      H - 5
    );
    ctx.textAlign = "right";
    ctx.fillText(Math.round(prog * 100) + "%", W - 8, H - 5);
  }

  function drawReady() {
    if (world.needRestart) {
      ctx.fillStyle = "rgba(6, 12, 10, 0.45)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffe566";
      ctx.font = "bold 32px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(world.failMsg || "Try again!", W / 2, H * 0.42);
      ctx.fillStyle = "#e8f5ec";
      ctx.font = "bold 15px system-ui,sans-serif";
      ctx.fillText("Same goal — hop and hunt", W / 2, H * 0.54);
      return;
    }
    if (!world.goFlash || world.goFlash <= 0) return;
    const a = Math.min(1, world.goFlash);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "#ffe566";
    ctx.font = "bold 52px system-ui,Impact,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GO!", W / 2, H * 0.36);
    ctx.fillStyle = "#e8f5ec";
    ctx.font = "bold 15px system-ui,sans-serif";
    ctx.fillText("Tap, click, or press space to hop", W / 2, H * 0.5);
    ctx.restore();
  }

  function drawWeather() {
    const w = world.weather;
    if (!w) return;
    w.drops.forEach(function (d) {
      ctx.strokeStyle = "rgba(190, 220, 255, " + d.alpha + ")";
      ctx.lineWidth = d.thick;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + 5, d.y + d.len);
      ctx.stroke();
    });
    if (w.flash > 0.02) {
      ctx.fillStyle = "rgba(230, 245, 255, " + Math.min(0.55, w.flash * 0.7) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawWorld() {
    const shakeX = world.shake > 0 ? (Math.random() - 0.5) * 10 * world.shake : 0;
    const shakeY = world.shake > 0 ? (Math.random() - 0.5) * 8 * world.shake : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    drawPhotoBg();
    drawFarSilhouettes();
    drawTerrain();
    drawWaterAndBank();

    // hide bank over gaps
    world.objs.forEach(function (o) {
      if (o.kind !== "gap") return;
      const sx = o.x - world.scroll;
      if (sx > W + 40 || sx + o.w < -40) return;
      drawGap(o, sx);
    });

    world.objs.forEach(function (o) {
      if (o.gone) return;
      const sx = o.x - world.scroll;
      if (sx > W + 80 || sx + (o.w || 60) < -80) return;
      if (o.kind === "sawgrass") drawSawgrass(o, sx);
      else if (o.kind === "knee") drawKnee(o, sx);
      else if (o.kind === "moss") drawMoss(o, sx);
      else if (o.kind === "log") drawLog(o, sx);
      else if (o.kind === "fish") drawFoodSprite("fish", o, sx);
      else if (o.kind === "turtle") drawFoodSprite("turtle", o, sx);
      else if (o.kind === "bird") drawFoodSprite("bird", o, sx);
      else if (o.kind === "firefly") drawFirefly(sx, o.y, world.time + o.x);
      else if (o.kind === "quiz" || o.kind === "deco") drawQuizNpc(o, sx);
      else if (o.kind === "heron") drawHazardHeron(o, sx);
      else if (o.kind === "finish") drawFinish(o, sx);
    });
    drawOwlSwoop();

    world.puffs.forEach(function (p) {
      ctx.fillStyle = "rgba(210, 200, 150, " + p.life * 2 + ")";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 8 + (0.28 - p.life) * 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!world.heronEat && !world.owlEat) drawPlayer();
    drawMoveFx();
    drawSparks();
    drawBirthdayFx();
    drawGore();
    drawHeronEat();

    world.floatScores.forEach(function (fs) {
      ctx.globalAlpha = Math.max(0, fs.life / 0.7);
      ctx.fillStyle = "#ffe566";
      ctx.font = "bold 16px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("+" + fs.pts, fs.x, fs.y);
      ctx.globalAlpha = 1;
    });

    drawWeather();
    ctx.restore();

    if (world.hitFlash > 0) {
      ctx.fillStyle = "rgba(180, 30, 40, " + Math.min(0.35, world.hitFlash) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    if (world.flash > 0) {
      ctx.fillStyle = "rgba(255, 250, 200, " + Math.min(0.35, world.flash) + ")";
      ctx.fillRect(0, 0, W, H);
    }

    drawHudStrip();
    drawReady();
    if (world.idx === 0 && !world.needRestart && world.scroll < 900) {
      const pulse = 0.55 + Math.sin(world.time * 6) * 0.35;
      ctx.fillStyle = "rgba(255, 229, 102, " + pulse + ")";
      ctx.font = "bold 22px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TAP to hop the sawgrass!", W * 0.62, GROUND - 90);
    }
  }

  function tick(ts) {
    if (!world) return;
    if (!world._last) world._last = ts;
    const dt = Math.min(0.05, (ts - world._last) / 1000);
    world._last = ts;
    update(dt);
    if (world && world.needRestart && world.restartIn <= 0) {
      startLevel(state.level);
      return;
    }
    drawWorld();
    loopId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
  }

  function startLevel(idx) {
    stopLoop();
    closeComicQuiz();
    pausedForQuiz = false;
    hopQueued = false;
    state.level = idx;
    state.score = 0;
    state.lives = 3;
    world = buildLevel(idx);
    updateHud();
    const m = world.mission;
    const title = $("#level-title");
    if (title) {
      title.textContent = "Level " + (idx + 1) + " · " + m.title;
    }
    const hint = $("#play-hint");
    if (hint) {
      hint.textContent =
        idx === 19
          ? m.text + " Watch the sky — a great horned owl may swoop."
          : idx === 0
            ? m.text
            : m.text;
    }
    show("play");
    world._last = 0;
    loopId = requestAnimationFrame(tick);
    ensureAudio();
    haptic(10);
    updateAgeHud();
    openGoalCard(idx, m);
  }

  function openGoalCard(idx, mission) {
    const overlay = $("#goal-overlay");
    const kicker = $("#goal-kicker");
    const title = $("#goal-title");
    const text = $("#goal-text");
    if (kicker) kicker.textContent = "Level " + (idx + 1);
    if (title) title.textContent = mission.title;
    if (text) text.textContent = mission.text;
    if (overlay) overlay.classList.add("show");
    pausedForGoal = true;
  }

  function closeGoalCard() {
    const overlay = $("#goal-overlay");
    if (overlay) overlay.classList.remove("show");
    pausedForGoal = false;
    if (world) world.goFlash = 0.9;
  }

  function renderLevels() {
    const grid = $("#level-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const done = !!state.completed[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "level-card" + (done ? " done" : "");
      btn.disabled = false;
      const m = missionFor(i);
      const icon = done ? "✅" : m.hazard === "heron" ? "🐦" : "🐊";
      btn.innerHTML =
        '<span class="emoji">' + icon + "</span>" + (i + 1);
      btn.title = m.title + " — " + m.text;
      btn.addEventListener("click", function () {
        startLevel(i);
      });
      grid.appendChild(btn);
    }
    updateHud();
  }

  /* ---------- quiz ---------- */
  function openComicQuiz(npc) {
    if (pausedForQuiz || !window.GATOR_QUESTIONS) return;
    pausedForQuiz = true;
    npc = npc || npcFor(state.level, 0);
    const used = state.usedQ[state.level] || [];
    const q = window.GATOR_QUESTIONS.pickQuestion(state.level, used, state.playSeed);
    if (!q) {
      pausedForQuiz = false;
      return;
    }
    used.push(q.key);
    state.usedQ[state.level] = used;
    state.playSeed += 1;
    save();

    const overlay = $("#comic-overlay");
    const title = $("#comic-question");
    const opts = $("#comic-options");
    const fb = $("#comic-feedback");
    const cont = $("#comic-continue");
    const tag = $("#comic-tag");
    const npcName = $("#comic-npc-name");
    const npcFace = $("#comic-npc-face");
    const npcLine = $("#comic-npc-line");

    if (overlay) overlay.classList.add("show");
    if (tag) tag.textContent = npc.tag || "WILDLIFE QUIZ";
    if (npcName) npcName.textContent = npc.name || "River Friend";
    if (npcFace) {
      if (npc.file) {
        npcFace.classList.add("has-photo");
        npcFace.textContent = "";
        npcFace.style.backgroundImage = "url('" + npc.file + "')";
      } else {
        npcFace.classList.remove("has-photo");
        npcFace.style.backgroundImage = "";
        npcFace.textContent = "🐦";
      }
    }
    if (npcLine) npcLine.textContent = npc.line || "Quick question!";
    if (title) title.textContent = q.q;
    if (fb) {
      fb.className = "comic-feedback";
      fb.textContent = "";
    }
    if (cont) cont.style.display = "none";
    if (!opts) return;
    opts.innerHTML = "";

    q.choices.forEach(function (c, idx) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "comic-opt";
      b.textContent = String.fromCharCode(65 + idx) + ". " + c;
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(opts.querySelectorAll(".comic-opt"), function (el) {
          el.disabled = true;
        });
        if (idx === q.correct) {
          b.classList.add("correct");
          state.score += 40;
          if (fb) {
            fb.className = "comic-feedback show";
            fb.textContent = "Nice! " + q.explain;
          }
        } else {
          b.classList.add("wrong");
          if (opts.children[q.correct]) opts.children[q.correct].classList.add("correct");
          state.score += 8;
          if (fb) {
            fb.className = "comic-feedback show";
            fb.textContent = "Close! " + q.explain;
          }
        }
        updateHud();
        if (cont) cont.style.display = "block";
        if (quizCloseTimer) clearTimeout(quizCloseTimer);
        quizCloseTimer = setTimeout(closeComicQuiz, 1600);
      });
      opts.appendChild(b);
    });
  }

  function closeComicQuiz() {
    if (quizCloseTimer) {
      clearTimeout(quizCloseTimer);
      quizCloseTimer = null;
    }
    const overlay = $("#comic-overlay");
    if (overlay) overlay.classList.remove("show");
    pausedForQuiz = false;
  }

  /* ---------- input ---------- */
  function bindHop() {
    const hop = function (e) {
      if (e) {
        if (e.target && e.target.closest && e.target.closest(".comic-overlay.show")) return;
        if (e.target && e.target.closest && e.target.closest(".goal-overlay.show")) return;
        if (e.target && e.target.closest && e.target.closest(".goal-overlay.show")) return;
        if (e.target && e.target.closest && e.target.closest("#btn-quit-play")) return;
        if (e.cancelable) e.preventDefault();
      }
      requestHop();
    };
    const btn = $("#btn-hop");
    if (btn) {
      const on = function (e) {
        e.preventDefault();
        btn.classList.add("is-held");
        hopHeld = true;
        hop(e);
      };
      const off = function (e) {
        e.preventDefault();
        btn.classList.remove("is-held");
        hopHeld = false;
      };
      btn.addEventListener("pointerdown", on);
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        hop(e);
      });
      btn.addEventListener("pointerup", off);
      btn.addEventListener("pointercancel", off);
    }
    const stage = $("#stage-wrap") || canvas;
    if (stage) {
      stage.addEventListener(
        "pointerdown",
        function (e) {
          if (pausedForQuiz) return;
          hop(e);
        },
        { passive: false }
      );
    }
  }

  function init() {
    load();
    canvas = $("#game-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;

    loadBackgrounds();
    loadSprites();

    window.addEventListener("keydown", function (e) {
      const k = e.key.toLowerCase();
      if (pausedForGoal && (k === " " || k === "enter")) {
        e.preventDefault();
        closeGoalCard();
        return;
      }
      if (k === " " || k === "arrowup" || k === "w") {
        e.preventDefault();
        if (!e.repeat) requestHop();
      }
    });

    $("#btn-start").addEventListener("click", function () {
      ensureAudio();
      let startAt = 0;
      for (let i = 0; i < state.unlocked && i < TOTAL_LEVELS; i++) {
        if (!state.completed[i]) {
          startAt = i;
          break;
        }
        startAt = Math.min(TOTAL_LEVELS - 1, i);
      }
      startLevel(startAt);
    });
    const btnLevels = $("#btn-levels");
    if (btnLevels) {
      btnLevels.addEventListener("click", function () {
        renderLevels();
        show("levels");
      });
    }
    $("#btn-how").addEventListener("click", function () {
      const b = $("#how-box");
      b.style.display = b.style.display === "none" ? "block" : "none";
    });
    $("#btn-levels-back").addEventListener("click", function () {
      show("start");
    });
    $("#btn-reset").addEventListener("click", function () {
      if (confirm("Reset all Gator Life progress on this device?")) {
        localStorage.removeItem(STORAGE);
        state.totalScore = 0;
        state.unlocked = TOTAL_LEVELS;
        state.completed = {};
        state.usedQ = {};
        state.playSeed = 1;
        renderLevels();
        updateHud();
      }
    });
    const cont = $("#comic-continue");
    if (cont) cont.addEventListener("click", closeComicQuiz);
    const goalGo = $("#goal-go");
    if (goalGo) goalGo.addEventListener("click", closeGoalCard);
    const goalOverlay = $("#goal-overlay");
    if (goalOverlay) {
      goalOverlay.addEventListener("click", function (e) {
        if (e.target === goalOverlay) closeGoalCard();
      });
    }
    const closeBtn = $("#comic-close");
    if (closeBtn) closeBtn.addEventListener("click", closeComicQuiz);
    const overlay = $("#comic-overlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeComicQuiz();
      });
    }
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && pausedForQuiz) closeComicQuiz();
    });
    const quitPlay = $("#btn-quit-play");
    if (quitPlay) {
      quitPlay.addEventListener("click", function () {
        stopLoop();
        closeComicQuiz();
        show("start");
      });
    }
    $("#btn-fact-levels").addEventListener("click", function () {
      renderLevels();
      show("levels");
    });
    $("#btn-fact-next").addEventListener("click", function () {
      const n = state.level + 1;
      if (n < TOTAL_LEVELS && n < state.unlocked) startLevel(n);
      else {
        renderLevels();
        show("levels");
      }
    });

    document.addEventListener(
      "touchmove",
      function (e) {
        if (!document.body.classList.contains("is-playing")) return;
        if (e.target && e.target.closest && e.target.closest(".comic-overlay.show")) return;
        if (e.target && e.target.closest && e.target.closest(".goal-overlay.show")) return;
        if (e.cancelable) e.preventDefault();
      },
      { passive: false }
    );

    bindHop();
    updateHud();
    paintCoupon("#coupon-code-start", "#coupon-box-start");
    show("start");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
