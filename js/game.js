/**
 * Gator Life — original Florida swamp river adventure
 * Swim the waterways, climb hills & roads, eat fish, dodge big gators.
 * (Original design — not affiliated with any trademarked game.)
 */
(function () {
  "use strict";

  const STORAGE = "gatorLifeProgress_v6_swamp";
  const COLS = 15;
  const ROWS = 19;
  const TILE = 24;
  const W = COLS * TILE;
  const H = ROWS * TILE;
  const TOTAL_LEVELS = 50;
  // tile kinds
  const T = {
    BLOCK: 1,
    RIVER: 2,
    FISH: 3,
    BIGFISH: 4,
    ROAD: 5,
    HILL: 6,
    LOG: 7, // movable bridge piece (walkable)
    ROCK: 8, // movable blocker (not walkable)
  };

  // Match pair colors/symbols for ordered eating
  const MATCH_STYLES = [
    { id: 0, color: "#ff5c5c", label: "1", name: "Red" },
    { id: 1, color: "#4ecdc4", label: "2", name: "Teal" },
    { id: 2, color: "#ffe66d", label: "3", name: "Gold" },
    { id: 3, color: "#a78bfa", label: "4", name: "Violet" },
    { id: 4, color: "#fb923c", label: "5", name: "Orange" },
    { id: 5, color: "#34d399", label: "6", name: "Mint" },
    { id: 6, color: "#60a5fa", label: "7", name: "Blue" },
    { id: 7, color: "#f472b6", label: "8", name: "Pink" },
  ];

  const DIRS = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
  };
  const DIR_KEYS = ["left", "right", "up", "down"];

  const state = {
    screen: "start",
    totalScore: 0,
    unlocked: 1,
    completed: {},
    level: 0,
    score: 0,
    lives: 3,
    playSeed: 1,
    usedQ: {},
  };

  let canvas, ctx;
  let loopId = null;
  let keys = {};
  let world = null;
  let pausedForQuiz = false;
  let gatorImg = null;
  let gatorImgReady = false;
  const bgImages = [];
  let audioCtx = null;
  let audioReady = false;

  // Prefer every print from the website gallery when config is loaded
  const BG_FILES_FALLBACK = [
    "golden-gulf.jpeg",
    "crimson-marsh.jpeg",
    "marsh-at-dusk.jpeg",
    "pink-cloud-reflections.jpeg",
    "open-water-sunset.jpeg",
    "sea-and-sky.jpeg",
    "horizon-fire.jpeg",
    "amber-waves.jpeg",
    "clouded-gold.jpeg",
    "storm-lit-sunset.jpeg",
    "evening-shore.jpeg",
    "beach-horizon-glow.jpeg",
    "gator-in-the-green.jpeg",
    "great-blue-heron.jpeg",
    "orange-afterglow.jpeg",
    "sky-on-fire.jpeg",
    "footprints-at-sunset.jpeg",
    "last-light-on-the-beach.jpeg",
    "pink-bay-clouds.jpg",
    "sun-over-the-gulf.jpeg",
    "heron-silhouette.jpeg",
    "floating-gator.jpeg",
    "young-gator.jpeg",
  ];

  const $ = function (s) {
    return document.querySelector(s);
  };

  function haptic(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {}
  }

  /* ---------- Web Audio: eat blip + water-balloon OUCH splash ---------- */
  function ensureAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      audioReady = true;
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
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ctxA.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** Soft musical nibble when hatchling scores */
  function sfxEat(points) {
    const big = points >= 35;
    // light rising chime
    playTone(big ? 660 : 520, 0.07, "sine", 0.09, 0);
    playTone(big ? 880 : 700, 0.1, "triangle", 0.07, 0.04);
    if (big) playTone(1040, 0.12, "sine", 0.05, 0.08);
  }

  /** Noise burst shaped like a water balloon pop / liquid splash */
  function sfxWaterBalloonPop() {
    const ctxA = ensureAudio();
    if (!ctxA) return;
    const t0 = ctxA.currentTime;
    const dur = 0.38;
    // White-noise buffer
    const n = Math.floor(ctxA.sampleRate * dur);
    const buf = ctxA.createBuffer(1, n, ctxA.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      // decaying noise with a sharp attack
      const env = Math.pow(1 - i / n, 1.6);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctxA.createBufferSource();
    src.buffer = buf;
    // Bandpass for “wet” splash body
    const bp = ctxA.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(900, t0);
    bp.frequency.exponentialRampToValueAtTime(280, t0 + 0.28);
    bp.Q.value = 0.7;
    // Low shelf boom
    const low = ctxA.createBiquadFilter();
    low.type = "lowshelf";
    low.frequency.value = 180;
    low.gain.value = 8;
    const g = ctxA.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.55, t0 + 0.012); // pop attack
    g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp);
    bp.connect(low);
    low.connect(g);
    g.connect(ctxA.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.02);

    // Musical “plink” over the splash (like a balloon skin snap)
    playTone(220, 0.08, "triangle", 0.14, 0);
    playTone(140, 0.18, "sine", 0.1, 0.02);
    playTone(90, 0.22, "sine", 0.08, 0.04);
  }

  /** Quick vocal “ouch!” + splash */
  function sfxOuch() {
    sfxWaterBalloonPop();
    // Quick spoken ouch (browser TTS — short & punchy)
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("Ouch!");
      u.lang = "en-US";
      u.rate = 1.25;
      u.pitch = 1.35;
      u.volume = 1;
      // Prefer a US voice if available
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

  function growthScale() {
    // Grows with fish eaten this level (and a bit with score)
    const eaten = (world && world.fishEaten) || 0;
    const base = 0.72;
    const perFish = 0.045;
    const cap = 1.85;
    return Math.min(cap, base + eaten * perFish);
  }

  function popScore(px, py, pts) {
    if (!world) return;
    world.floatScores = world.floatScores || [];
    world.floatScores.push({
      x: px,
      y: py - 18,
      pts: pts,
      life: 0.85,
      max: 0.85,
    });
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE) || "{}");
      state.totalScore = d.totalScore || 0;
      state.unlocked = d.unlocked || 1;
      state.completed = d.completed || {};
      state.playSeed = d.playSeed || 1;
      state.usedQ = d.usedQ || {};
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
      })
    );
  }

  function applyCardPhotoBg(file) {
    const card = document.querySelector(".game-card-arcade");
    if (!card || !file) return;
    card.style.backgroundImage =
      "linear-gradient(180deg, rgba(8, 22, 16, 0.78) 0%, rgba(10, 28, 18, 0.82) 100%), url('images/prints/" +
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
    if (document.body) {
      document.body.classList.toggle("is-playing", name === "play");
    }
    // Website print photos behind every game screen
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
    for (let i = 0; i < 3; i++) s += i < state.lives ? "♥" : "·";
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
  }

  function stageName(i) {
    if (i < 10) return "Hatchling";
    if (i < 20) return "River Pup";
    if (i < 35) return "Swamp Scout";
    return "Marsh Ace";
  }

  function seeded(idx, n) {
    const x = Math.sin(idx * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function galleryPhotoFiles() {
    // All website print photos as living backgrounds
    if (
      typeof SITE_CONFIG !== "undefined" &&
      SITE_CONFIG.photos &&
      SITE_CONFIG.photos.length
    ) {
      return SITE_CONFIG.photos.map(function (p) {
        return p.file;
      });
    }
    return BG_FILES_FALLBACK;
  }

  function loadBackgrounds() {
    const files = galleryPhotoFiles();
    files.forEach(function (file) {
      const img = new Image();
      img.onload = function () {
        if (img.naturalWidth) bgImages.push(img);
      };
      img.onerror = function () {};
      img.src = "images/prints/" + file;
    });
  }

  function bgForLevel(idx) {
    if (!bgImages.length) return null;
    return bgImages[idx % bgImages.length];
  }

  function loadGator() {
    gatorImg = new Image();
    gatorImg.onload = function () {
      gatorImgReady = true;
    };
    gatorImg.onerror = function () {
      // fallback
      gatorImg.src = "images/game/gator-hatchling.png?v=7";
    };
    // Clear hatchling figurine (no speech bubble)
    gatorImg.src = "images/game/gator-hatchling.png?v=7";
  }

  function isWalkable(cell) {
    return (
      cell === T.RIVER ||
      cell === T.FISH ||
      cell === T.BIGFISH ||
      cell === T.ROAD ||
      cell === T.HILL ||
      cell === T.LOG
    );
  }

  function isBlocked(g, x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
    const c = g[y][x];
    return c === T.BLOCK || c === T.ROCK;
  }

  function isMovable(cell) {
    return cell === T.LOG || cell === T.ROCK;
  }

  /* ---------- Swirly river labyrinth generation ---------- */
  function buildLevel(idx) {
    // Start solid land
    const g = [];
    for (let y = 0; y < ROWS; y++) {
      g[y] = [];
      for (let x = 0; x < COLS; x++) g[y][x] = T.BLOCK;
    }

    // Carve several winding river channels (meandering paths)
    const channels = 3 + (idx % 3);
    for (let c = 0; c < channels; c++) {
      let x = 1 + Math.floor(seeded(idx, c * 3) * (COLS - 2));
      let y = c === 0 ? ROWS - 2 : 1 + Math.floor(seeded(idx, c * 7) * (ROWS - 2));
      let dir = c % 2 === 0 ? 0 : 1; // 0 rightish, 1 downish
      const steps = 40 + Math.floor(seeded(idx, c + 20) * 50);
      for (let s = 0; s < steps; s++) {
        g[y][x] = T.RIVER;
        // widen river slightly
        if (x + 1 < COLS - 1 && seeded(idx, s + c * 11) > 0.45) g[y][x + 1] = T.RIVER;
        if (y + 1 < ROWS - 1 && seeded(idx, s + c * 13) > 0.55) g[y + 1][x] = T.RIVER;

        // meander
        const r = seeded(idx, s * 3 + c * 17);
        if (r < 0.28) dir = (dir + 1) % 4;
        else if (r < 0.4) dir = (dir + 3) % 4;
        const d = [
          [1, 0],
          [0, 1],
          [-1, 0],
          [0, -1],
        ][dir];
        let nx = x + d[0];
        let ny = y + d[1];
        if (nx < 1 || nx >= COLS - 1 || ny < 1 || ny >= ROWS - 1) {
          dir = (dir + 1) % 4;
          continue;
        }
        x = nx;
        y = ny;
      }
    }

    // Connect channels: carve a few arcs between random river cells
    const riverCells = [];
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        if (g[y][x] === T.RIVER) riverCells.push({ x: x, y: y });
      }
    }
    for (let i = 0; i < 8; i++) {
      if (riverCells.length < 2) break;
      const a = riverCells[Math.floor(seeded(idx, 100 + i) * riverCells.length)];
      const b = riverCells[Math.floor(seeded(idx, 200 + i) * riverCells.length)];
      let cx = a.x;
      let cy = a.y;
      let guard = 0;
      while ((cx !== b.x || cy !== b.y) && guard++ < 30) {
        g[cy][cx] = T.RIVER;
        if (cx !== b.x && (guard % 2 === 0 || cy === b.y)) cx += cx < b.x ? 1 : -1;
        else if (cy !== b.y) cy += cy < b.y ? 1 : -1;
      }
    }

    // Roads crossing scenery (horizontal strips of walkable path)
    const roadRows = [4, 10, 15].filter(function (_, i) {
      return seeded(idx, 300 + i) > 0.25 || i === 1;
    });
    roadRows.forEach(function (ry, i) {
      if (ry >= ROWS - 1) return;
      for (let x = 1; x < COLS - 1; x++) {
        // Road only where it bridges land or continues river network
        if (g[ry][x] === T.BLOCK || g[ry][x] === T.RIVER) {
          // leave occasional gaps for swirl look
          if (seeded(idx, 400 + i * 20 + x) > 0.12) g[ry][x] = T.ROAD;
        }
      }
    });

    // Hills — raised mounds you can climb onto
    const hillCount = 4 + (idx % 4);
    for (let i = 0; i < hillCount; i++) {
      const hx = 2 + Math.floor(seeded(idx, 500 + i) * (COLS - 4));
      const hy = 2 + Math.floor(seeded(idx, 600 + i) * (ROWS - 4));
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const x = hx + dx;
          const y = hy + dy;
          if (x > 0 && y > 0 && x < COLS - 1 && y < ROWS - 1) {
            g[y][x] = T.HILL;
          }
        }
      }
      // ensure access from a river neighbor
      if (hx > 1) g[hy][hx - 1] = g[hy][hx - 1] === T.BLOCK ? T.RIVER : g[hy][hx - 1];
    }

    // Ensure border remains blocked (swamp edge)
    for (let x = 0; x < COLS; x++) {
      g[0][x] = T.BLOCK;
      g[ROWS - 1][x] = T.BLOCK;
    }
    for (let y = 0; y < ROWS; y++) {
      g[y][0] = T.BLOCK;
      g[y][COLS - 1] = T.BLOCK;
    }

    // Start position: bottom river
    let start = { x: 2, y: ROWS - 3 };
    for (let y = ROWS - 2; y >= 1; y--) {
      for (let x = 1; x < COLS - 1; x++) {
        if (isWalkable(g[y][x])) {
          start = { x: x, y: y };
          y = 0;
          break;
        }
      }
    }
    // Force open start pocket
    g[start.y][start.x] = T.RIVER;
    if (start.x + 1 < COLS - 1) g[start.y][start.x + 1] = T.RIVER;

    // Connectivity flood from start — open blocked pockets
    const reach = floodWalk(g, start.x, start.y);
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        if (!isWalkable(g[y][x])) continue;
        if (reach[y][x]) continue;
        let cx = x;
        let cy = y;
        let guard = 0;
        while (!reach[cy][cx] && guard++ < 50) {
          if (cx > start.x) cx--;
          else if (cx < start.x) cx++;
          else if (cy > start.y) cy--;
          else if (cy < start.y) cy++;
          if (g[cy][cx] === T.BLOCK) g[cy][cx] = T.RIVER;
          reach[cy][cx] = true;
        }
      }
    }

    // Place movable puzzle pieces (logs + rocks)
    const movableSpots = [];
    for (let y = 2; y < ROWS - 2; y++) {
      for (let x = 2; x < COLS - 2; x++) {
        if (g[y][x] === T.BLOCK || g[y][x] === T.RIVER) {
          if (Math.abs(x - start.x) + Math.abs(y - start.y) > 3) {
            movableSpots.push({ x: x, y: y });
          }
        }
      }
    }
    const logCount = 2 + Math.min(3, Math.floor(idx / 8));
    const rockCount = 2 + Math.min(3, Math.floor(idx / 10));
    for (let i = 0; i < logCount && movableSpots.length; i++) {
      const si = Math.floor(seeded(idx, 710 + i) * movableSpots.length);
      const sp = movableSpots.splice(si, 1)[0];
      g[sp.y][sp.x] = T.LOG;
    }
    for (let i = 0; i < rockCount && movableSpots.length; i++) {
      const si = Math.floor(seeded(idx, 730 + i) * movableSpots.length);
      const sp = movableSpots.splice(si, 1)[0];
      // rocks prefer blocking a river choke
      g[sp.y][sp.x] = T.ROCK;
    }

    // Match fish: pairs that must be eaten in order (first any of pair, then its match)
    // Level 1 = exactly 10 fish (5 pairs). Later levels scale up.
    const pairCount = idx === 0 ? 5 : 5 + Math.min(3, Math.floor(idx / 5));
    const targetFish = pairCount * 2;
    const fishMeta = [];
    for (let y = 0; y < ROWS; y++) {
      fishMeta[y] = [];
      for (let x = 0; x < COLS; x++) fishMeta[y][x] = null;
    }
    const candidates = [];
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        if (g[y][x] === T.RIVER && !(x === start.x && y === start.y)) {
          candidates.push({ x: x, y: y });
        }
      }
    }
    // shuffle-ish with seed
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(seeded(idx, 800 + i) * (i + 1));
      const tmp = candidates[i];
      candidates[i] = candidates[j];
      candidates[j] = tmp;
    }
    let fishLeft = 0;
    for (let p = 0; p < pairCount; p++) {
      const style = MATCH_STYLES[p % MATCH_STYLES.length];
      for (let k = 0; k < 2; k++) {
        if (!candidates.length) break;
        const sp = candidates.shift();
        const big = idx > 2 && p === pairCount - 1 && k === 1;
        g[sp.y][sp.x] = big ? T.BIGFISH : T.FISH;
        fishMeta[sp.y][sp.x] = {
          pairId: p,
          color: style.color,
          label: style.label,
          name: style.name,
          big: big,
        };
        fishLeft++;
      }
    }
    // If we couldn't place enough, fill remaining as free-for-all match pairs
    while (fishLeft < targetFish && candidates.length) {
      const p = Math.floor(fishLeft / 2) % MATCH_STYLES.length;
      const style = MATCH_STYLES[p];
      const sp = candidates.shift();
      g[sp.y][sp.x] = T.FISH;
      fishMeta[sp.y][sp.x] = {
        pairId: p,
        color: style.color,
        label: style.label,
        name: style.name,
        big: false,
      };
      fishLeft++;
    }

    // Big gator obstacles
    const bigCount = Math.min(5, 1 + Math.floor(idx / 6));
    const bigs = [];
    const spots = [];
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        if (isWalkable(g[y][x]) && Math.abs(x - start.x) + Math.abs(y - start.y) > 5) {
          spots.push({ x: x, y: y });
        }
      }
    }
    for (let i = 0; i < bigCount; i++) {
      if (!spots.length) break;
      const si = Math.floor(seeded(idx, 900 + i) * spots.length);
      const sp = spots.splice(si, 1)[0];
      bigs.push({
        x: sp.x,
        y: sp.y,
        px: (sp.x + 0.5) * TILE,
        py: (sp.y + 0.5) * TILE,
        dir: DIR_KEYS[i % 4],
        speed: 1.05 + Math.min(0.9, idx * 0.025) + i * 0.08,
        phase: i * 1.7,
        wiggle: 0,
      });
    }

    return {
      grid: g,
      fishMeta: fishMeta,
      fishLeft: fishLeft,
      fishEaten: 0,
      fishTotal: fishLeft,
      pairCount: pairCount,
      // Match order: after eating one of a pair, must eat its match next
      matchNeeded: null, // pairId or null
      matchFlash: 0, // wrong-match red flash
      matchMsg: "",
      matchMsgLife: 0,
      // Tile edit: select a movable LOG/ROCK then tap destination
      selectedTile: null, // {x,y}
      floatScores: [],
      eatCam: null,
      digiCam: null,
      lastDigiAt: 0,
      player: {
        x: start.x,
        y: start.y,
        px: (start.x + 0.5) * TILE,
        py: (start.y + 0.5) * TILE,
        dir: "right",
        nextDir: "right",
        speed: 2.05,
        bob: 0,
        onLand: false,
        growPulse: 0,
        bite: 0,
      },
      bigs: bigs,
      inv: 0,
      time: 0,
      won: false,
      flash: 0,
      focus: 0,
      splat: 0,
      splatX: 0,
      splatY: 0,
      ouch: 0,
      idx: idx,
    };
  }

  function floodWalk(g, sx, sy) {
    const seen = [];
    for (let y = 0; y < ROWS; y++) {
      seen[y] = [];
      for (let x = 0; x < COLS; x++) seen[y][x] = false;
    }
    const q = [{ x: sx, y: sy }];
    seen[sy][sx] = true;
    while (q.length) {
      const c = q.shift();
      DIR_KEYS.forEach(function (k) {
        const d = DIRS[k];
        const nx = c.x + d.x;
        const ny = c.y + d.y;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return;
        if (!isWalkable(g[ny][nx])) return;
        if (seen[ny][nx]) return;
        seen[ny][nx] = true;
        q.push({ x: nx, y: ny });
      });
    }
    return seen;
  }

  function tileCenter(tx, ty) {
    return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
  }

  function nearCenter(px, py, tx, ty) {
    const c = tileCenter(tx, ty);
    return Math.abs(px - c.x) < 2.4 && Math.abs(py - c.y) < 2.4;
  }

  function trySetDir(entity, dir) {
    const d = DIRS[dir];
    if (!d) return false;
    const nx = entity.x + d.x;
    const ny = entity.y + d.y;
    if (isBlocked(world.grid, nx, ny)) return false;
    entity.dir = dir;
    return true;
  }

  function moveEntity(entity, speed) {
    const d = DIRS[entity.dir] || DIRS.right;
    const c = tileCenter(entity.x, entity.y);

    if (entity.nextDir && entity.nextDir !== entity.dir) {
      if (nearCenter(entity.px, entity.py, entity.x, entity.y)) {
        if (trySetDir(entity, entity.nextDir)) {
          entity.px = c.x;
          entity.py = c.y;
        }
      }
    }

    const nx = entity.x + d.x;
    const ny = entity.y + d.y;
    if (isBlocked(world.grid, nx, ny)) {
      if (d.x !== 0) {
        if ((d.x > 0 && entity.px >= c.x) || (d.x < 0 && entity.px <= c.x)) {
          entity.px = c.x;
          return;
        }
      } else {
        if ((d.y > 0 && entity.py >= c.y) || (d.y < 0 && entity.py <= c.y)) {
          entity.py = c.y;
          return;
        }
      }
    }

    entity.px += d.x * speed;
    entity.py += d.y * speed;

    const tx = Math.floor(entity.px / TILE);
    const ty = Math.floor(entity.py / TILE);
    if (tx >= 0 && ty >= 0 && tx < COLS && ty < ROWS && !isBlocked(world.grid, tx, ty)) {
      entity.x = tx;
      entity.y = ty;
    }
    if (d.x !== 0) entity.py += (c.y - entity.py) * 0.32;
    if (d.y !== 0) entity.px += (c.x - entity.px) * 0.32;
  }

  /* ---------- Drawing: more realistic swamp ---------- */
  function drawPhotoBg() {
    const img = bgForLevel(world.idx);
    if (img) {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      // Cover full playfield with website photo
      const scale = Math.max(W / iw, H / ih) * 1.12;
      const dw = iw * scale;
      const dh = ih * scale;
      // Slow parallax with camera-less drift from time
      const drift = ((world.time || 0) * 3) % 20;
      ctx.imageSmoothingEnabled = true;
      if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (W - dw) / 2 - drift * 0.3, (H - dh) / 2, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1a3d2e");
      g.addColorStop(1, "#0a1810");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    // Lighter veil so Florida photos stay vivid
    ctx.fillStyle = "rgba(4, 14, 12, 0.22)";
    ctx.fillRect(0, 0, W, H);
  }

  function drawWorld() {
    const g = world.grid;
    const t = world.time;
    drawPhotoBg();

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = g[y][x];
        const px = x * TILE;
        const py = y * TILE;
        if (cell === T.BLOCK) {
          // Soft marsh bank / mud
          const mud = ctx.createLinearGradient(px, py, px, py + TILE);
          mud.addColorStop(0, "rgba(42, 58, 32, 0.42)");
          mud.addColorStop(1, "rgba(28, 40, 22, 0.5)");
          ctx.fillStyle = mud;
          ctx.fillRect(px, py, TILE, TILE);
          // Cattail reeds
          if ((x * 3 + y * 5) % 4 === 0) {
            for (let r = 0; r < 3; r++) {
              const rx = px + 5 + r * 6;
              const sway = Math.sin(t * 1.8 + x + r) * 2.5;
              ctx.strokeStyle = "rgba(46, 90, 40, 0.75)";
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.moveTo(rx, py + TILE - 1);
              ctx.quadraticCurveTo(rx + sway, py + 10, rx + sway * 0.6, py + 2);
              ctx.stroke();
              ctx.fillStyle = "rgba(90, 55, 28, 0.8)";
              ctx.fillRect(rx + sway * 0.6 - 1.5, py + 1, 3.2, 7);
            }
          }
        } else if (cell === T.RIVER || cell === T.FISH || cell === T.BIGFISH) {
          // Realistic river water with depth + caustics
          const wave = Math.sin(t * 2.2 + x * 0.8 + y * 0.55) * 2.2;
          const grd = ctx.createLinearGradient(px, py, px + TILE, py + TILE);
          grd.addColorStop(0, "rgba(22, 78, 92, 0.78)");
          grd.addColorStop(0.45, "rgba(35, 120, 118, 0.7)");
          grd.addColorStop(1, "rgba(18, 70, 88, 0.8)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.moveTo(px - 1, py + 5 + wave);
          ctx.bezierCurveTo(
            px + TILE * 0.35,
            py - 1 + wave,
            px + TILE * 0.65,
            py + 2 - wave,
            px + TILE + 1,
            py + 5 - wave
          );
          ctx.lineTo(px + TILE + 1, py + TILE - 1);
          ctx.bezierCurveTo(
            px + TILE * 0.6,
            py + TILE + 2,
            px + TILE * 0.35,
            py + TILE,
            px - 1,
            py + TILE - 1
          );
          ctx.closePath();
          ctx.fill();
          // Surface shimmer
          ctx.strokeStyle = "rgba(180, 230, 220, 0.28)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 3, py + 9 + wave);
          ctx.quadraticCurveTo(px + TILE / 2, py + 6 + wave, px + TILE - 3, py + 10 - wave);
          ctx.stroke();
          // Mud bank rim
          ctx.strokeStyle = "rgba(70, 95, 45, 0.55)";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (cell === T.ROAD) {
          // Asphalt-like road
          const road = ctx.createLinearGradient(px, py, px, py + TILE);
          road.addColorStop(0, "rgba(62, 60, 55, 0.88)");
          road.addColorStop(0.5, "rgba(48, 46, 42, 0.9)");
          road.addColorStop(1, "rgba(58, 56, 50, 0.88)");
          ctx.fillStyle = road;
          ctx.fillRect(px + 1, py + 5, TILE - 2, TILE - 10);
          // Edge gravel
          ctx.strokeStyle = "rgba(120, 110, 90, 0.55)";
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1.5, py + 5.5, TILE - 3, TILE - 11);
          // Center dashed line
          ctx.strokeStyle = "rgba(240, 210, 70, 0.75)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(px + 3, py + TILE / 2);
          ctx.lineTo(px + TILE - 3, py + TILE / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (cell === T.HILL) {
          // Earthy grassy hill
          const hill = ctx.createRadialGradient(
            px + TILE * 0.45,
            py + TILE * 0.45,
            2,
            px + TILE / 2,
            py + TILE * 0.6,
            TILE * 0.55
          );
          hill.addColorStop(0, "rgba(120, 160, 75, 0.92)");
          hill.addColorStop(0.55, "rgba(70, 120, 55, 0.9)");
          hill.addColorStop(1, "rgba(45, 80, 40, 0.85)");
          ctx.fillStyle = hill;
          ctx.beginPath();
          ctx.ellipse(
            px + TILE / 2,
            py + TILE * 0.62,
            TILE * 0.5,
            TILE * 0.4,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          // Grass tufts
          ctx.strokeStyle = "rgba(90, 150, 60, 0.8)";
          ctx.lineWidth = 1.2;
          for (let i = 0; i < 4; i++) {
            const gx = px + 6 + i * 5;
            ctx.beginPath();
            ctx.moveTo(gx, py + TILE * 0.55);
            ctx.lineTo(gx + Math.sin(t + i) * 1.5, py + TILE * 0.28);
            ctx.stroke();
          }
        } else if (cell === T.LOG) {
          // Movable wooden log bridge
          ctx.fillStyle = "rgba(20, 70, 85, 0.45)";
          ctx.fillRect(px, py, TILE, TILE);
          const wood = ctx.createLinearGradient(px, py, px + TILE, py + TILE);
          wood.addColorStop(0, "#8b5a2b");
          wood.addColorStop(0.5, "#c4a35a");
          wood.addColorStop(1, "#6b3f1a");
          ctx.fillStyle = wood;
          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(px + 3, py + 7, TILE - 6, TILE - 14, 4)
            : ctx.rect(px + 3, py + 7, TILE - 6, TILE - 14);
          ctx.fill();
          ctx.strokeStyle = "rgba(40, 25, 10, 0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + 6, py + TILE / 2);
          ctx.lineTo(px + TILE - 6, py + TILE / 2);
          ctx.stroke();
          // movable hint
          ctx.fillStyle = "rgba(255, 240, 180, 0.9)";
          ctx.font = "bold 8px system-ui,sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("LOG", px + TILE / 2, py + 6);
        } else if (cell === T.ROCK) {
          // Movable rock blocker
          const rock = ctx.createRadialGradient(
            px + 8,
            py + 8,
            2,
            px + TILE / 2,
            py + TILE / 2,
            TILE * 0.55
          );
          rock.addColorStop(0, "#9aa0a6");
          rock.addColorStop(0.6, "#5c636a");
          rock.addColorStop(1, "#2f3438");
          ctx.fillStyle = rock;
          ctx.beginPath();
          ctx.ellipse(
            px + TILE / 2,
            py + TILE / 2 + 1,
            TILE * 0.4,
            TILE * 0.34,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "rgba(255, 200, 180, 0.85)";
          ctx.font = "bold 8px system-ui,sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("ROCK", px + TILE / 2, py + 7);
        }

        // Selection highlight for movable tiles
        if (
          world.selectedTile &&
          world.selectedTile.x === x &&
          world.selectedTile.y === y
        ) {
          ctx.strokeStyle = "rgba(255, 230, 80, 0.95)";
          ctx.lineWidth = 2.5;
          ctx.strokeRect(px + 1.5, py + 1.5, TILE - 3, TILE - 3);
          // pulse
          ctx.strokeStyle =
            "rgba(255, 255, 120, " + (0.4 + Math.sin(t * 8) * 0.35) + ")";
          ctx.strokeRect(px - 1, py - 1, TILE + 2, TILE + 2);
        }
      }
    }

    // Fish in water (with match badges)
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = g[y][x];
        if (cell !== T.FISH && cell !== T.BIGFISH) continue;
        const cx = x * TILE + TILE / 2;
        const cy = y * TILE + TILE / 2 + Math.sin(t * 3.5 + x) * 1.8;
        const meta = world.fishMeta[y][x];
        const needed =
          world.matchNeeded !== null &&
          meta &&
          meta.pairId === world.matchNeeded;
        const wrongDim =
          world.matchNeeded !== null &&
          meta &&
          meta.pairId !== world.matchNeeded;
        ctx.save();
        if (wrongDim) ctx.globalAlpha = 0.45;
        if (needed) {
          ctx.shadowColor = meta.color;
          ctx.shadowBlur = 12;
        }
        drawFishRealistic(cx, cy, cell === T.BIGFISH, t + x, 1, false);
        ctx.shadowBlur = 0;
        // Match badge ring + number
        if (meta) {
          ctx.strokeStyle = meta.color;
          ctx.lineWidth = needed ? 2.5 : 1.6;
          ctx.beginPath();
          ctx.arc(cx, cy, needed ? 11 : 9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.beginPath();
          ctx.arc(cx + 7, cy - 7, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = meta.color;
          ctx.font = "bold 9px system-ui,sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(meta.label, cx + 7, cy - 7);
        }
        ctx.restore();
      }
    }

    // Big gators
    world.bigs.forEach(function (b) {
      drawBigGator(b);
    });

    // Little player gator
    drawLittleGator();

    // Left-side bloody fish tally (5 per row)
    drawKillTally();

    // Eating focus vignette (darken edges, spotlight on gator)
    if (world.focus > 0) {
      const f = Math.min(1, world.focus);
      const p = world.player;
      const grd = ctx.createRadialGradient(
        p.px,
        p.py,
        TILE * 0.8,
        p.px,
        p.py,
        TILE * 5
      );
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(0.45, "rgba(0,0,0," + 0.15 * f + ")");
      grd.addColorStop(1, "rgba(0,0,0," + 0.55 * f + ")");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      // Bite ring
      ctx.strokeStyle = "rgba(255, 240, 120," + 0.85 * f + ")";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.px, p.py, TILE * (0.9 + (1 - f) * 1.2), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Side close-up: fish death / catch (bigger angled view)
    drawEatCloseup();
    // Digestion lesson every 10 fish
    drawDigiCloseup();

    // HUD strip
    ctx.fillStyle = "rgba(5, 18, 12, 0.78)";
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = "#e8f5ec";
    ctx.font = "bold 11px system-ui,sans-serif";
    ctx.textAlign = "left";
    let matchHud = "";
    if (world.matchNeeded !== null) {
      const st = MATCH_STYLES[world.matchNeeded % MATCH_STYLES.length];
      matchHud = " · NEXT: " + st.name + " #" + st.label;
    } else {
      matchHud = " · Pick any match fish";
    }
    ctx.fillText(
      "Lv " +
        (world.idx + 1) +
        " · Fish " +
        world.fishLeft +
        " · Eaten " +
        (world.fishEaten || 0) +
        matchHud,
      8,
      12
    );

    // Match order message
    if (world.matchMsgLife > 0 && world.matchMsg) {
      ctx.fillStyle =
        world.matchFlash > 0
          ? "rgba(180,30,30,0.88)"
          : "rgba(20, 60, 40, 0.88)";
      ctx.fillRect(W / 2 - 110, 22, 220, 22);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(world.matchMsg, W / 2, 37);
    }

    // Tile edit hint
    if (world.selectedTile) {
      ctx.fillStyle = "rgba(255, 230, 100, 0.92)";
      ctx.font = "bold 10px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Tap adjacent tile to move piece", W / 2, H - 6);
    }

    // Splat + OUCH overlay
    if (world.splat > 0) {
      const a = Math.min(1, world.splat);
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const dist = (1 - a) * 40 + 10 + (i % 3) * 8;
        const sx = world.splatX + Math.cos(ang) * dist;
        const sy = world.splatY + Math.sin(ang) * dist * 0.7;
        ctx.fillStyle = "rgba(180, 30, 40," + a * 0.85 + ")";
        ctx.beginPath();
        ctx.ellipse(sx, sy, 10 + (i % 4) * 3, 7 + (i % 3) * 2, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(120, 20, 30," + a * 0.35 + ")";
      ctx.fillRect(0, 0, W, H);
    }
    if (world.ouch > 0) {
      const p = Math.min(1, world.ouch);
      const scale = 0.7 + (1 - p) * 0.6;
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.min(1, p * 1.4);
      ctx.strokeStyle = "#8b0000";
      ctx.lineWidth = 6;
      ctx.font = "bold 64px system-ui,Impact,sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeText("OUCH!", 0, 0);
      ctx.fillStyle = "#ff3b3b";
      ctx.fillText("OUCH!", 0, 0);
      ctx.restore();
    }

    if (world.flash > 0) {
      ctx.fillStyle = "rgba(255, 250, 200," + Math.min(0.45, world.flash) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    if (world.matchFlash > 0) {
      ctx.fillStyle =
        "rgba(180, 20, 30, " + Math.min(0.35, world.matchFlash) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  /** Realistic silver/gold fish (world size or close-up scale) */
  function drawFishRealistic(cx, cy, big, phase, scale, dying) {
    scale = scale || 1;
    const s = (big ? 1.4 : 1) * scale;
    ctx.save();
    ctx.translate(cx, cy);
    if (dying) {
      // flop / death angle
      ctx.rotate(-0.55 + Math.sin(phase * 18) * 0.35 * Math.max(0, 1 - dying));
      ctx.scale(1, 1 - dying * 0.25);
    } else {
      ctx.rotate(Math.sin(phase * 2.2) * 0.3);
    }

    // Soft shadow in water
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(1, 3 * s, 7 * s, 2.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body gradient
    const body = ctx.createLinearGradient(-8 * s, -4 * s, 8 * s, 4 * s);
    if (big) {
      body.addColorStop(0, "#c9822a");
      body.addColorStop(0.4, "#f0b14a");
      body.addColorStop(1, "#8a5018");
    } else {
      body.addColorStop(0, "#6a9aaa");
      body.addColorStop(0.45, "#c5e4ef");
      body.addColorStop(1, "#3d6a7a");
    }
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.5 * s, 4.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scale hint
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 0.6 * scale;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(-1 * s, i * 1.2 * s, 2.2 * s, -0.6, 0.6);
      ctx.stroke();
    }

    // Tail
    ctx.fillStyle = big ? "#d4923a" : "#8eb8c8";
    ctx.beginPath();
    ctx.moveTo(-6.5 * s, 0);
    ctx.lineTo(-12 * s, -5 * s);
    ctx.lineTo(-10 * s, 0);
    ctx.lineTo(-12 * s, 5 * s);
    ctx.closePath();
    ctx.fill();

    // Fin
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, -3.5 * s);
    ctx.lineTo(3 * s, -7 * s);
    ctx.lineTo(4 * s, -2 * s);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(4 * s, -1 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dying ? "#444" : "#111";
    ctx.beginPath();
    ctx.arc(4.3 * s, -1 * s, 0.85 * s, 0, Math.PI * 2);
    ctx.fill();

    // X eyes when dying late
    if (dying && dying > 0.45) {
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(3 * s, -2.2 * s);
      ctx.lineTo(5.2 * s, 0);
      ctx.moveTo(5.2 * s, -2.2 * s);
      ctx.lineTo(3 * s, 0);
      ctx.stroke();
    }

    // Belly highlight
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.ellipse(1 * s, 1.5 * s, 4 * s, 1.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /** Left tally: dead headless bloody fish icons, 5 per row */
  function drawKillTally() {
    const n = world.fishEaten || 0;
    if (n <= 0) return;
    const perRow = 5;
    const iconW = 18;
    const iconH = 14;
    const gapX = 3;
    const gapY = 4;
    const startX = 6;
    const startY = 24;
    const maxShow = 40; // keep UI readable
    const show = Math.min(n, maxShow);

    // Panel backdrop
    const rows = Math.ceil(show / perRow);
    const panelH = 18 + rows * (iconH + gapY) + 6;
    const panelW = 10 + perRow * (iconW + gapX);
    ctx.fillStyle = "rgba(20, 8, 8, 0.72)";
    ctx.strokeStyle = "rgba(180, 40, 40, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(startX - 4, startY - 14, panelW, panelH, 8);
    else ctx.rect(startX - 4, startY - 14, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 160, 140, 0.95)";
    ctx.font = "bold 9px system-ui,sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("CATCHES", startX, startY - 4);

    for (let i = 0; i < show; i++) {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const ix = startX + col * (iconW + gapX);
      const iy = startY + 6 + row * (iconH + gapY);
      drawDeadFishIcon(ix, iy, iconW, iconH, i);
    }
    if (n > maxShow) {
      ctx.fillStyle = "#ffb0a0";
      ctx.font = "bold 10px system-ui,sans-serif";
      ctx.fillText("+" + (n - maxShow), startX, startY + panelH - 18);
    }
  }

  function drawDeadFishIcon(x, y, w, h, seed) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(-0.25 + (seed % 3) * 0.08);
    // Body stump (headless)
    const body = ctx.createLinearGradient(-6, 0, 6, 0);
    body.addColorStop(0, "#6a3030");
    body.addColorStop(0.5, "#a85a4a");
    body.addColorStop(1, "#4a2020");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(1, 0, 6.5, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bloody neck stump (no head)
    ctx.fillStyle = "#8b1515";
    ctx.beginPath();
    ctx.ellipse(7, 0, 2.2, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(200, 30, 30, 0.9)";
    ctx.beginPath();
    ctx.arc(7.5, -1, 1.2, 0, Math.PI * 2);
    ctx.arc(8, 1.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
    // Drip
    ctx.fillStyle = "rgba(160, 20, 20, 0.85)";
    ctx.fillRect(7, 2.5, 1.5, 3);
    // Tail
    ctx.fillStyle = "#704040";
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-9, -3.5);
    ctx.lineTo(-7.5, 0);
    ctx.lineTo(-9, 3.5);
    ctx.closePath();
    ctx.fill();
    // X where head was
    ctx.strokeStyle = "rgba(40,10,10,0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5.5, -2.5);
    ctx.lineTo(8.5, 2.5);
    ctx.moveTo(8.5, -2.5);
    ctx.lineTo(5.5, 2.5);
    ctx.stroke();
    ctx.restore();
  }

  /** Draw fish split in half with gore (close-up chomp) */
  function drawFishBrokenInHalf(cx, cy, big, t) {
    const s = big ? 3.4 : 3.0;
    // Left half (tail side) flies left
    const sep = t * 18;
    ctx.save();
    ctx.translate(cx - sep, cy + t * 6);
    ctx.rotate(-0.4 - t * 0.8);
    drawFishHalf(s, false, true);
    ctx.restore();
    // Right half (head side) flies right
    ctx.save();
    ctx.translate(cx + sep * 0.9, cy - t * 4);
    ctx.rotate(0.35 + t * 0.7);
    drawFishHalf(s, true, true);
    ctx.restore();
    // Blood burst
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + t;
      const d = 6 + t * 22 + (i % 3) * 3;
      ctx.fillStyle = "rgba(160, 20, 30," + (0.85 - t * 0.5) + ")";
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(a) * d,
        cy + Math.sin(a) * d * 0.65,
        2.5 + (i % 3),
        1.5 + (i % 2),
        a,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  function drawFishHalf(s, headHalf, bloody) {
    if (headHalf) {
      const body = ctx.createLinearGradient(0, 0, 10 * s, 0);
      body.addColorStop(0, "#a0c8d4");
      body.addColorStop(1, "#4a7080");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(3 * s, 0, 5 * s, 4 * s, 0, -Math.PI / 2, Math.PI / 2);
      ctx.fill();
      // eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(5 * s, -1 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(5.2 * s, -1 * s, 0.7 * s, 0, Math.PI * 2);
      ctx.fill();
      // bloody cut edge
      if (bloody) {
        ctx.fillStyle = "#8a1515";
        ctx.fillRect(-1 * s, -4 * s, 2.5 * s, 8 * s);
        ctx.fillStyle = "rgba(200,40,40,0.9)";
        ctx.beginPath();
        ctx.arc(0, -2 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.arc(0.5 * s, 2 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      const body = ctx.createLinearGradient(-8 * s, 0, 0, 0);
      body.addColorStop(0, "#3d6070");
      body.addColorStop(1, "#90b8c4");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(-2 * s, 0, 5.5 * s, 3.8 * s, 0, Math.PI / 2, -Math.PI / 2);
      ctx.fill();
      // tail
      ctx.fillStyle = "#6a90a0";
      ctx.beginPath();
      ctx.moveTo(-6 * s, 0);
      ctx.lineTo(-11 * s, -4.5 * s);
      ctx.lineTo(-9 * s, 0);
      ctx.lineTo(-11 * s, 4.5 * s);
      ctx.closePath();
      ctx.fill();
      if (bloody) {
        ctx.fillStyle = "#8a1515";
        ctx.fillRect(-1 * s, -3.8 * s, 2.2 * s, 7.6 * s);
        ctx.fillStyle = "rgba(180,30,30,0.85)";
        ctx.fillRect(0, 2 * s, 1.5 * s, 4 * s);
      }
    }
  }

  /** Side panel: gator chomps fish in half (all levels) */
  function drawEatCloseup() {
    const cam = world.eatCam;
    if (!cam || cam.life <= 0) return;
    const t = 1 - cam.life / cam.max;
    const fade =
      t < 0.1 ? t / 0.1 : t > 0.8 ? Math.max(0, (1 - t) / 0.2) : 1;

    const panelW = 124;
    const panelH = 158;
    const px = W - panelW - 8;
    const py = 26;

    ctx.save();
    ctx.globalAlpha = fade;

    ctx.fillStyle = "rgba(18, 6, 6, 0.92)";
    ctx.strokeStyle = "rgba(220, 60, 50, 0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, panelW, panelH, 12);
    else ctx.rect(px, py, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ff6b5a";
    ctx.font = "bold 11px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(cam.big ? "SNAPPED IN HALF!" : "CHOMPED!", px + panelW / 2, py + 16);

    // Water + blood wash
    const wg = ctx.createLinearGradient(px, py + 22, px, py + panelH);
    wg.addColorStop(0, "rgba(40, 70, 80, 0.95)");
    wg.addColorStop(0.6, "rgba(60, 30, 30, 0.9)");
    wg.addColorStop(1, "rgba(40, 15, 15, 0.95)");
    ctx.fillStyle = wg;
    ctx.fillRect(px + 6, py + 22, panelW - 12, panelH - 52);

    const cx = px + panelW / 2;
    const cy = py + 82;
    const chomp = Math.min(1, Math.max(0, (t - 0.08) / 0.55));

    // Whole fish first, then broken
    if (chomp < 0.35) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.4);
      ctx.scale(1.1, 1.05);
      ctx.translate(-cx, -cy);
      drawFishRealistic(cx, cy, cam.big, world.time * 3, 3.0, chomp * 2);
      ctx.restore();
    } else {
      drawFishBrokenInHalf(cx, cy, cam.big, (chomp - 0.35) / 0.65);
    }

    // Gator jaws clamp
    if (t > 0.12) {
      const sn = Math.min(1, (t - 0.12) / 0.4);
      // upper jaw
      ctx.fillStyle = "rgba(35, 90, 48, 0.95)";
      ctx.beginPath();
      ctx.ellipse(px + 20 + sn * 40, py + 55, 40, 14, -0.15, 0, Math.PI * 2);
      ctx.fill();
      // lower jaw
      ctx.beginPath();
      ctx.ellipse(px + 22 + sn * 38, py + 118, 38, 12, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // teeth upper
      ctx.fillStyle = "#f0ebe0";
      for (let i = 0; i < 6; i++) {
        const tx = px + 28 + sn * 36 + i * 8;
        ctx.beginPath();
        ctx.moveTo(tx, py + 62);
        ctx.lineTo(tx + 3, py + 72);
        ctx.lineTo(tx + 6, py + 62);
        ctx.fill();
      }
      // blood on teeth after snap
      if (chomp > 0.4) {
        ctx.fillStyle = "rgba(160, 20, 30, 0.85)";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(px + 36 + sn * 36 + i * 9, py + 68, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px system-ui,sans-serif";
    ctx.fillText("+" + cam.pts, px + panelW / 2, py + panelH - 12);
    ctx.fillStyle = "rgba(255, 180, 170, 0.9)";
    ctx.font = "10px system-ui,sans-serif";
    ctx.fillText(
      chomp > 0.45 ? "broken in half" : "jaws closing…",
      px + panelW / 2,
      py + 30
    );

    ctx.restore();
  }

  /**
   * Every 10 fish: educational gut journey
   * 10 → throat, 20 → stomach, 30 → waste/poop, then cycles
   */
  function drawDigiCloseup() {
    const d = world.digiCam;
    if (!d || d.life <= 0) return;
    const t = 1 - d.life / d.max;
    const fade =
      t < 0.08 ? t / 0.08 : t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1;

    const panelW = Math.min(W - 20, 300);
    const panelH = 168;
    const px = (W - panelW) / 2;
    const py = H - panelH - 10;

    ctx.save();
    ctx.globalAlpha = fade;

    ctx.fillStyle = "rgba(8, 14, 12, 0.94)";
    ctx.strokeStyle =
      d.stage === 3
        ? "rgba(160, 120, 70, 0.95)"
        : "rgba(255, 200, 90, 0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, panelW, panelH, 14);
    else ctx.rect(px, py, panelW, panelH);
    ctx.fill();
    ctx.stroke();

    const titles = {
      1: "INSIDE: DOWN THE THROAT",
      2: "INSIDE: INTO THE STOMACH",
      3: "INSIDE: WHAT GOES OUT",
    };
    const captions = {
      1: "After the chomp, the fish slides down the hatchling’s throat.",
      2: "Strong stomach acid breaks the meal into energy to grow.",
      3: "Leftovers leave as waste — nature’s messy but normal cycle.",
    };

    ctx.fillStyle = "#ffe566";
    ctx.font = "bold 12px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(titles[d.stage] || "INSIDE LOOK", px + panelW / 2, py + 18);

    ctx.fillStyle = "rgba(210, 230, 215, 0.92)";
    ctx.font = "10px system-ui,sans-serif";
    ctx.fillText(captions[d.stage] || "", px + panelW / 2, py + panelH - 12);

    // Diagram area
    const dx = px + 16;
    const dy = py + 32;
    const dw = panelW - 32;
    const dh = panelH - 54;
    ctx.fillStyle = "rgba(20, 40, 32, 0.9)";
    ctx.fillRect(dx, dy, dw, dh);

    // Side-view gator outline
    const gx = dx + 70;
    const gy = dy + dh / 2 + 8;
    ctx.save();
    ctx.translate(gx, gy);
    // body
    const gbody = ctx.createLinearGradient(-50, 0, 80, 0);
    gbody.addColorStop(0, "#1a4a2a");
    gbody.addColorStop(1, "#2f7a45");
    ctx.fillStyle = gbody;
    ctx.beginPath();
    ctx.ellipse(10, 0, 58, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    // head/snout
    ctx.beginPath();
    ctx.ellipse(62, 2, 28, 16, 0.05, 0, Math.PI * 2);
    ctx.fill();
    // eye
    ctx.fillStyle = "#e8d050";
    ctx.beginPath();
    ctx.arc(48, -10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(49, -10, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // legs hint
    ctx.fillStyle = "#1f5530";
    ctx.fillRect(-20, 18, 14, 8);
    ctx.fillRect(20, 18, 14, 8);

    // Internal path highlight
    ctx.strokeStyle = "rgba(255, 200, 120, 0.85)";
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(70, 4);
    ctx.quadraticCurveTo(40, 6, 10, 4);
    ctx.quadraticCurveTo(-10, 2, -20, 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated fish / bolus position by stage + time
    const prog = Math.min(1, t * 1.15);
    let fx = 70;
    let fy = 4;
    if (d.stage === 1) {
      // throat: snout → neck
      fx = 70 - prog * 50;
      fy = 4 + Math.sin(prog * 6) * 2;
      drawFishRealistic(fx, fy, false, world.time, 0.55, 0.3);
      ctx.fillStyle = "#ffe8a0";
      ctx.font = "bold 9px system-ui,sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("throat", -5, -22);
    } else if (d.stage === 2) {
      // stomach: mid-body churn
      fx = 5 + Math.sin(prog * 8) * 6;
      fy = 6 + Math.cos(prog * 7) * 4;
      // bolus blob instead of whole fish
      ctx.fillStyle = "rgba(180, 80, 60, 0.9)";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 10, 7, prog, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(120, 40, 30, 0.7)";
      ctx.beginPath();
      ctx.ellipse(fx - 2, fy + 1, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // acid bubbles
      ctx.fillStyle = "rgba(200, 220, 100, 0.5)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(fx + Math.sin(prog * 10 + i) * 12, fy - 8 - i * 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffe8a0";
      ctx.font = "bold 9px system-ui,sans-serif";
      ctx.fillText("stomach", -30, -22);
    } else {
      // waste leaving
      fx = -35 - prog * 15;
      fy = 22 + prog * 8;
      ctx.fillStyle = "rgba(90, 65, 40, 0.95)";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 7 + prog * 2, 4, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(70, 50, 30, 0.8)";
      ctx.beginPath();
      ctx.ellipse(fx - 3, fy + 1, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // little splash
      ctx.fillStyle = "rgba(100, 80, 50, 0.5)";
      ctx.beginPath();
      ctx.arc(fx + 6, fy + 4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8d0a0";
      ctx.font = "bold 9px system-ui,sans-serif";
      ctx.fillText("waste leaves body", -50, -22);
      ctx.fillStyle = "rgba(200, 190, 160, 0.85)";
      ctx.font = "8px system-ui,sans-serif";
      ctx.fillText("(yes — hatchlings poop too!)", -50, 40);
    }

    // Milestone badge
    ctx.fillStyle = "rgba(255, 220, 100, 0.95)";
    ctx.font = "bold 10px system-ui,sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(d.milestone + " fish!", 95, -28);

    ctx.restore();
    ctx.restore();
  }

  function drawBigGator(b) {
    const ang =
      b.dir === "right"
        ? 0
        : b.dir === "left"
          ? Math.PI
          : b.dir === "down"
            ? Math.PI / 2
            : -Math.PI / 2;
    ctx.save();
    ctx.translate(b.px, b.py);
    ctx.rotate(ang + Math.sin(b.wiggle) * 0.06);

    const len = TILE * 1.65;
    const thick = TILE * 0.58;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(2, 6, len * 0.42, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body with gradient scales
    const body = ctx.createLinearGradient(-len * 0.4, -thick, len * 0.4, thick);
    body.addColorStop(0, "#0f3d22");
    body.addColorStop(0.45, "#2a6b3e");
    body.addColorStop(1, "#163d24");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.46, thick * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scale ridges
    ctx.strokeStyle = "rgba(20, 50, 30, 0.55)";
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 5, -2, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Snout
    const snout = ctx.createLinearGradient(len * 0.1, 0, len * 0.5, 0);
    snout.addColorStop(0, "#2f7a48");
    snout.addColorStop(1, "#1a5030");
    ctx.fillStyle = snout;
    ctx.beginPath();
    ctx.ellipse(len * 0.28, 1, len * 0.24, thick * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = "#0a2010";
    ctx.beginPath();
    ctx.arc(len * 0.42, -2, 1.2, 0, Math.PI * 2);
    ctx.arc(len * 0.42, 3, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye ridge + eye
    ctx.fillStyle = "#1a4a28";
    ctx.beginPath();
    ctx.ellipse(len * 0.12, -thick * 0.28, 5, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8d060";
    ctx.beginPath();
    ctx.arc(len * 0.14, -thick * 0.28, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(len * 0.16, -thick * 0.28, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(len * 0.13, -thick * 0.32, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    ctx.fillStyle = "#f4f0e0";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(len * 0.28 + i * 4, thick * 0.12);
      ctx.lineTo(len * 0.3 + i * 4, thick * 0.28);
      ctx.lineTo(len * 0.32 + i * 4, thick * 0.12);
      ctx.fill();
    }

    // Label
    ctx.rotate(-ang);
    ctx.fillStyle = "rgba(200,40,40,0.92)";
    ctx.font = "bold 9px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BIG", 0, -TILE * 0.62);
    ctx.restore();
  }

  function drawLittleGator() {
    const p = world.player;
    const cell = world.grid[p.y][p.x];
    const onLand = cell === T.ROAD || cell === T.HILL;
    const ang =
      p.dir === "right"
        ? 0
        : p.dir === "left"
          ? Math.PI
          : p.dir === "down"
            ? Math.PI / 2
            : -Math.PI / 2;

    // Visual growth from eating + bite lunge
    const grow = growthScale() * (1 + (p.growPulse || 0) * 0.22);
    const bite = p.bite || 0;
    const body = TILE * 1.15 * grow * (1 + bite * 0.12);

    ctx.save();
    ctx.translate(p.px, p.py + (onLand ? 0 : Math.sin(p.bob) * 2));

    // Score counter floating above the hatchling
    ctx.save();
    ctx.translate(0, -body * 0.68);
    const label = String(state.score);
    ctx.font = "bold 12px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const tw = Math.max(32, ctx.measureText(label).width + 14);
    ctx.fillStyle = "rgba(8, 30, 18, 0.88)";
    ctx.strokeStyle =
      bite > 0.1
        ? "rgba(255, 230, 80, 0.95)"
        : "rgba(180, 255, 160, 0.9)";
    ctx.lineWidth = 2;
    const bx = -tw / 2;
    const by = -10;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, tw, 18, 9);
    else ctx.rect(bx, by, tw, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#d4ffc8";
    ctx.fillText(label, 0, 0);
    if (p.growPulse > 0.05) {
      ctx.fillStyle =
        "rgba(255, 240, 120, " + Math.min(1, p.growPulse * 2) + ")";
      ctx.font = "bold 11px system-ui,sans-serif";
      ctx.fillText("CHOMP!", 0, -16);
    }
    ctx.restore();

    // Lunge slightly forward when biting
    ctx.rotate(ang);
    ctx.translate(bite * 6, 0);

    if (world.inv > 0 && Math.floor(world.time * 14) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Swim wake
    if (!onLand) {
      ctx.fillStyle = "rgba(200, 240, 255, 0.4)";
      ctx.beginPath();
      ctx.ellipse(-body * 0.3, 0, 8 * grow, 4 * grow, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Jaw snap flash
    if (bite > 0.2) {
      ctx.strokeStyle = "rgba(255,255,200," + bite + ")";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(body * 0.15, 0, body * 0.4, -0.8, 0.8);
      ctx.stroke();
    }

    if (gatorImgReady && gatorImg) {
      const s = body;
      ctx.imageSmoothingEnabled = true;
      if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.ellipse(0, s * 0.3, s * 0.3, 4.5 * grow, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(gatorImg, -s / 2, -s / 2, s, s);
    } else {
      ctx.fillStyle = "#3cb371";
      ctx.beginPath();
      ctx.ellipse(0, 0, 10 * grow, 6.5 * grow, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (onLand) {
      ctx.rotate(-ang);
      ctx.fillStyle = "rgba(255, 230, 120, 0.9)";
      ctx.font = "bold 9px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(cell === T.HILL ? "⬆ hill" : "road", 0, -body * 0.55);
    }

    ctx.restore();

    // Floating +points
    if (world.floatScores && world.floatScores.length) {
      world.floatScores.forEach(function (fs) {
        const a = Math.max(0, fs.life / fs.max);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = "#ffe566";
        ctx.strokeStyle = "rgba(20,40,20,0.75)";
        ctx.lineWidth = 3.5;
        ctx.font = "bold 16px system-ui,sans-serif";
        ctx.textAlign = "center";
        const text = "+" + fs.pts;
        ctx.strokeText(text, fs.x, fs.y);
        ctx.fillText(text, fs.x, fs.y);
        ctx.restore();
      });
    }
  }

  /* ---------- Logic ---------- */
  function pickBigDir(b) {
    const options = [];
    DIR_KEYS.forEach(function (dir) {
      const d = DIRS[dir];
      if (!isBlocked(world.grid, b.x + d.x, b.y + d.y)) options.push(dir);
    });
    if (!options.length) return;
    const p = world.player;
    let best = options[0];
    let bestD = 1e9;
    options.forEach(function (dir) {
      const d = DIRS[dir];
      const nx = b.x + d.x;
      const ny = b.y + d.y;
      const dist = Math.abs(nx - p.x) + Math.abs(ny - p.y);
      // slight wander so not perfect chase
      const score = dist + seeded(world.idx, b.x + b.y + world.time) * 1.2;
      if (score < bestD) {
        bestD = score;
        best = dir;
      }
    });
    b.dir = best;
  }

  function collectFish() {
    const p = world.player;
    const cell = world.grid[p.y][p.x];
    if (cell !== T.FISH && cell !== T.BIGFISH) return;

    const meta = world.fishMeta[p.y][p.x];
    // Match-order rule: after opening a pair, only its match can be eaten next
    if (world.matchNeeded !== null) {
      if (!meta || meta.pairId !== world.matchNeeded) {
        world.matchFlash = 0.55;
        world.matchMsg = "Wrong fish! Eat the matching #" +
          (MATCH_STYLES[world.matchNeeded % MATCH_STYLES.length].label) +
          " next";
        world.matchMsgLife = 1.6;
        haptic([30, 20, 30]);
        // nudge player off so they don't spam
        p.px -= DIRS[p.dir].x * 6;
        p.py -= DIRS[p.dir].y * 6;
        return;
      }
    }

    const big = cell === T.BIGFISH || (meta && meta.big);
    const pts = big ? 40 : 15;
    const pairId = meta ? meta.pairId : 0;

    world.grid[p.y][p.x] = T.RIVER;
    world.fishMeta[p.y][p.x] = null;
    world.fishLeft--;
    world.fishEaten = (world.fishEaten || 0) + 1;
    state.score += pts;

    // Pair state machine
    if (world.matchNeeded === null) {
      world.matchNeeded = pairId;
      world.matchMsg =
        "Match next: " +
        (meta ? meta.name : "pair") +
        " #" +
        (meta ? meta.label : "?");
      world.matchMsgLife = 1.8;
    } else if (world.matchNeeded === pairId) {
      world.matchNeeded = null;
      world.matchMsg = "Pair complete!";
      world.matchMsgLife = 1.2;
      state.score += 20; // pair bonus
      popScore(p.px, p.py - 12, 20);
    }

    p.growPulse = 1;
    p.bite = 1;
    world.focus = 0.95;
    world.flash = big ? 0.4 : 0.28;
    world.eatCam = {
      life: 1.25,
      max: 1.25,
      big: big,
      pts: pts,
    };
    const eaten = world.fishEaten;
    if (eaten > 0 && eaten % 10 === 0 && eaten !== world.lastDigiAt) {
      world.lastDigiAt = eaten;
      const cycle = (eaten / 10 - 1) % 3;
      world.digiCam = {
        life: 3.4,
        max: 3.4,
        stage: cycle + 1,
        milestone: eaten,
      };
      world.focus = 1.2;
      haptic([15, 30, 15, 30, 20]);
    }
    popScore(p.px, p.py, pts);
    sfxEat(pts);
    haptic(big ? [12, 25, 12] : [10, 15]);
    updateHud();
    if (world.fishLeft <= 0) winLevel();
  }

  /** Tap interaction for movable tiles (log/rock) */
  function handleTileTap(tx, ty) {
    if (!world || tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return false;
    const cell = world.grid[ty][tx];
    const sel = world.selectedTile;

    // Select a movable piece
    if (!sel) {
      if (isMovable(cell)) {
        world.selectedTile = { x: tx, y: ty };
        world.matchMsg =
          cell === T.LOG
            ? "Log selected — tap adjacent tile to place bridge"
            : "Rock selected — tap adjacent river/path to block";
        world.matchMsgLife = 2;
        haptic(8);
        return true;
      }
      return false;
    }

    // Deselect if same tile
    if (sel.x === tx && sel.y === ty) {
      world.selectedTile = null;
      world.matchMsg = "Cancelled";
      world.matchMsgLife = 0.8;
      return true;
    }

    // Must be adjacent
    const dist = Math.abs(sel.x - tx) + Math.abs(sel.y - ty);
    if (dist !== 1) {
      // allow reselect another movable
      if (isMovable(cell)) {
        world.selectedTile = { x: tx, y: ty };
        haptic(8);
        return true;
      }
      world.matchMsg = "Only move to an adjacent tile";
      world.matchMsgLife = 1.2;
      haptic(20);
      return true;
    }

    const from = world.grid[sel.y][sel.x];
    const to = world.grid[ty][tx];
    // Don't move onto player or fish
    if (world.player.x === tx && world.player.y === ty) {
      world.matchMsg = "Can't place on the hatchling";
      world.matchMsgLife = 1.2;
      return true;
    }
    if (to === T.FISH || to === T.BIGFISH) {
      world.matchMsg = "Can't cover a fish";
      world.matchMsgLife = 1.2;
      return true;
    }

    // Rules by piece type
    if (from === T.LOG) {
      // Log can swap with BLOCK (make bridge) or RIVER/ROAD/HILL
      if (
        to !== T.BLOCK &&
        to !== T.RIVER &&
        to !== T.ROAD &&
        to !== T.HILL
      ) {
        world.matchMsg = "Log needs land or water next to it";
        world.matchMsgLife = 1.3;
        return true;
      }
      // Swap: destination becomes LOG, source becomes RIVER (open water)
      world.grid[ty][tx] = T.LOG;
      world.grid[sel.y][sel.x] = T.RIVER;
    } else if (from === T.ROCK) {
      // Rock can swap with RIVER/ROAD/LOG to block paths or free a cell
      if (to !== T.RIVER && to !== T.ROAD && to !== T.LOG && to !== T.HILL) {
        world.matchMsg = "Rock moves onto path/river/log";
        world.matchMsgLife = 1.3;
        return true;
      }
      world.grid[ty][tx] = T.ROCK;
      world.grid[sel.y][sel.x] =
        to === T.LOG ? T.RIVER : to === T.HILL ? T.RIVER : T.RIVER;
    } else {
      world.selectedTile = null;
      return false;
    }

    world.selectedTile = null;
    world.matchMsg = "Tile moved!";
    world.matchMsgLife = 1;
    state.score += 5;
    popScore(
      (tx + 0.5) * TILE,
      (ty + 0.5) * TILE,
      5
    );
    playTone(400, 0.06, "triangle", 0.08, 0);
    haptic(10);
    updateHud();
    return true;
  }

  function collideBigs() {
    if (world.inv > 0 || world.splat > 0) return;
    const p = world.player;
    for (let i = 0; i < world.bigs.length; i++) {
      const b = world.bigs[i];
      const dx = p.px - b.px;
      const dy = p.py - b.py;
      if (dx * dx + dy * dy < (TILE * 0.7) * (TILE * 0.7)) {
        getEaten(b);
        return;
      }
    }
  }

  function getEaten(byBig) {
    world.splat = 1.15;
    world.ouch = 1.25;
    world.splatX = world.player.px;
    world.splatY = world.player.py;
    world.inv = 2.5;
    world.flash = 0.5;
    state.lives -= 1;
    sfxOuch();
    haptic([50, 40, 80, 40, 100]);
    updateHud();

    // Respawn after brief splat
    const sx = world.player.x;
    const sy = world.player.y;
    // find safe tile near start-ish
    setTimeout(function () {
      if (!world) return;
      // reset player toward bottom open tile
      let rx = 2;
      let ry = ROWS - 3;
      for (let y = ROWS - 2; y >= 1; y--) {
        for (let x = 1; x < COLS - 1; x++) {
          if (isWalkable(world.grid[y][x])) {
            rx = x;
            ry = y;
            y = 0;
            break;
          }
        }
      }
      world.player.x = rx;
      world.player.y = ry;
      world.player.px = (rx + 0.5) * TILE;
      world.player.py = (ry + 0.5) * TILE;
      world.player.dir = "right";
      world.player.nextDir = "right";
      // shove big gator away a bit
      if (byBig) {
        byBig.x = Math.min(COLS - 2, byBig.x + 2);
        byBig.px = (byBig.x + 0.5) * TILE;
      }
      if (state.lives <= 0) {
        state.lives = 3;
        state.score = Math.max(0, state.score - 25);
        state._fishEatenCarry = (world && world.fishEaten) || 0;
        startLevel(state.level, true);
      }
    }, 650);
  }

  function winLevel() {
    if (world.won) return;
    world.won = true;
    stopLoop();
    haptic([20, 40, 20, 40, 50]);
    state.totalScore += state.score;
    state.completed[state.level] = true;
    if (state.unlocked < state.level + 2) {
      state.unlocked = Math.min(TOTAL_LEVELS, state.level + 2);
    }
    save();
    const factEmoji = $("#fact-emoji");
    // Keep hatchling image on clear screen (don't replace with emoji text)
    if (factEmoji && !factEmoji.querySelector("img")) {
      factEmoji.textContent = "🐊";
    }
    $("#fact-title").textContent = "Level " + (state.level + 1) + " clear!";
    $("#fact-score").textContent =
      "Level score: " + state.score + " · Total: " + state.totalScore;
    const facts = [
      "Baby alligators stay near water and eat insects, small fish, and frogs.",
      "Florida’s wetlands are a maze of rivers, sloughs, and cypress strands.",
      "Adult alligators can be dangerous — keep a safe distance in the wild.",
      "Roads near wetlands are real gator crossing spots — drive carefully.",
      "Hills and banks give gators sunny basking spots after a swim.",
      "Never feed wild alligators — it makes them bold around people.",
    ];
    $("#fact-text").textContent = facts[state.level % facts.length];
    const g = $("#global-score");
    if (g) g.textContent = String(state.totalScore);
    show("fact");
  }

  function update(dt) {
    if (!world || world.won || pausedForQuiz) return;
    world.time += dt;
    if (world.inv > 0) world.inv -= dt;
    if (world.flash > 0) world.flash -= dt;
    if (world.splat > 0) world.splat -= dt;
    if (world.ouch > 0) world.ouch -= dt;

    const p = world.player;
    if (p.growPulse > 0) p.growPulse = Math.max(0, p.growPulse - dt * 2.2);
    if (p.bite > 0) p.bite = Math.max(0, p.bite - dt * 2.8);
    if (world.focus > 0) world.focus = Math.max(0, world.focus - dt * 1.6);
    if (world.matchFlash > 0) world.matchFlash = Math.max(0, world.matchFlash - dt);
    if (world.matchMsgLife > 0) world.matchMsgLife = Math.max(0, world.matchMsgLife - dt);
    if (world.eatCam) {
      world.eatCam.life -= dt;
      if (world.eatCam.life <= 0) world.eatCam = null;
    }
    if (world.digiCam) {
      world.digiCam.life -= dt;
      if (world.digiCam.life <= 0) world.digiCam = null;
    }
    // Wrong-match red wash
    if (world.matchFlash > 0) {
      // drawn in drawWorld via message; optional full flash:
    }
    // Float +pts upward
    if (world.floatScores && world.floatScores.length) {
      world.floatScores = world.floatScores.filter(function (fs) {
        fs.life -= dt;
        fs.y -= 34 * dt;
        return fs.life > 0;
      });
    }
    if (keys["arrowleft"] || keys["a"]) p.nextDir = "left";
    if (keys["arrowright"] || keys["d"]) p.nextDir = "right";
    if (keys["arrowup"] || keys["w"]) p.nextDir = "up";
    if (keys["arrowdown"] || keys["s"]) p.nextDir = "down";

    if (p.nextDir) {
      const rev = { left: "right", right: "left", up: "down", down: "up" };
      if (p.nextDir === rev[p.dir] || nearCenter(p.px, p.py, p.x, p.y)) {
        trySetDir(p, p.nextDir);
      }
    }

    // Slightly slower on hills, faster on river
    const cell = world.grid[p.y][p.x];
    let spd = p.speed;
    if (cell === T.HILL) spd *= 0.82;
    if (cell === T.ROAD) spd *= 1.08;
    if (cell === T.RIVER || cell === T.FISH || cell === T.BIGFISH) spd *= 1.05;

    // Freeze brief moment during splat
    if (world.splat <= 0.55) {
      moveEntity(p, spd);
      p.bob += dt * 8;
      collectFish();
    }

    world.bigs.forEach(function (b) {
      b.wiggle += dt * 6;
      b.phase += dt;
      if (nearCenter(b.px, b.py, b.x, b.y)) {
        b.px = (b.x + 0.5) * TILE;
        b.py = (b.y + 0.5) * TILE;
        pickBigDir(b);
      }
      // Big gators prefer river/road but can use any walkable
      moveEntity(b, b.speed);
    });

    if (world.splat <= 0.4) collideBigs();
  }

  function tick(ts) {
    if (!world) return;
    if (!world._last) world._last = ts;
    const dt = Math.min(0.05, (ts - world._last) / 1000);
    world._last = ts;
    if (!pausedForQuiz && !world.won) update(dt);
    drawWorld();
    loopId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
  }

  function startLevel(idx, soft) {
    stopLoop();
    closeComicQuiz();
    pausedForQuiz = false;
    state.level = idx;
    if (!soft) {
      state.score = 0;
      state.lives = 3;
    }
    world = buildLevel(idx);
    // Keep growth progress within a soft restart of the same run
    if (soft && typeof state._fishEatenCarry === "number") {
      world.fishEaten = state._fishEatenCarry;
    }
    updateHud();
    const title = $("#level-title");
    if (title) {
      title.textContent = "Level " + (idx + 1) + " · " + stageName(idx);
    }
    const hint = $("#play-hint");
    if (hint) {
      hint.textContent =
        "Match fish pairs in order · Tap LOG/ROCK to move tiles · Dodge BIG gators";
    }
    show("play");
    world._last = 0;
    loopId = requestAnimationFrame(tick);
    ensureAudio();
    haptic(12);
  }

  function renderLevels() {
    const grid = $("#level-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const unlocked = i < state.unlocked;
      const done = !!state.completed[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "level-card" + (done ? " done" : "");
      btn.disabled = !unlocked;
      btn.innerHTML =
        '<span class="emoji">' +
        (unlocked ? (done ? "✅" : "🐊") : "🔒") +
        "</span>" +
        (i + 1);
      if (unlocked) {
        btn.addEventListener("click", function () {
          startLevel(i);
        });
      }
      grid.appendChild(btn);
    }
    updateHud();
  }

  /* ---------- Light quiz (optional flavor) ---------- */
  function openComicQuiz() {
    if (pausedForQuiz || !window.GATOR_QUESTIONS) return;
    pausedForQuiz = true;
    const used = state.usedQ[state.level] || [];
    const q = window.GATOR_QUESTIONS.pickQuestion(
      state.level,
      used,
      state.playSeed
    );
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
    if (tag) tag.textContent = "SWAMP QUIZ";
    if (npcName) npcName.textContent = "River Friend";
    if (npcFace) {
      npcFace.classList.remove("has-photo");
      npcFace.textContent = "🐟";
    }
    if (npcLine) npcLine.textContent = "Quick question while you swim!";
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
          state.score += 35;
          if (fb) {
            fb.className = "comic-feedback show";
            fb.textContent = "Nice! " + q.explain;
          }
        } else {
          b.classList.add("wrong");
          if (opts.children[q.correct]) opts.children[q.correct].classList.add("correct");
          state.score += 5;
          if (fb) {
            fb.className = "comic-feedback show";
            fb.textContent = "Close! " + q.explain;
          }
        }
        updateHud();
        if (cont) cont.style.display = "block";
      });
      opts.appendChild(b);
    });
  }

  function closeComicQuiz() {
    const overlay = $("#comic-overlay");
    if (overlay) overlay.classList.remove("show");
    pausedForQuiz = false;
  }

  /* ---------- Mobile input ---------- */
  function setDir(dir) {
    if (!dir) return;
    DIR_KEYS.forEach(function (d) {
      keys["arrow" + d] = d === dir;
    });
    if (world && world.player) {
      world.player.nextDir = dir;
      const rev = { left: "right", right: "left", up: "down", down: "up" };
      if (world.player.dir === rev[dir]) trySetDir(world.player, dir);
    }
  }

  function clearDir(dir) {
    if (dir) keys["arrow" + dir] = false;
  }

  function bindPads() {
    ["pad-left", "pad-right", "pad-up", "pad-down"].forEach(function (id) {
      const el = $("#" + id);
      if (!el) return;
      const dir = el.getAttribute("data-dir");
      const on = function (e) {
        e.preventDefault();
        try {
          el.setPointerCapture(e.pointerId);
        } catch (err) {}
        el.classList.add("is-held");
        setDir(dir);
        haptic(6);
      };
      const off = function (e) {
        e.preventDefault();
        el.classList.remove("is-held");
        clearDir(dir);
      };
      el.addEventListener("pointerdown", on);
      el.addEventListener("pointerup", off);
      el.addEventListener("pointercancel", off);
      el.addEventListener("lostpointercapture", off);
    });
    const dpad = $("#dpad");
    if (dpad) {
      dpad.addEventListener(
        "pointermove",
        function (e) {
          if (e.buttons === 0 && e.pressure === 0) return;
          const t = document.elementFromPoint(e.clientX, e.clientY);
          const btn = t && t.closest && t.closest("[data-dir]");
          if (btn) setDir(btn.getAttribute("data-dir"));
        },
        { passive: true }
      );
    }
  }

  function canvasTileFromEvent(e) {
    if (!canvas || !world) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX =
      e.changedTouches && e.changedTouches[0]
        ? e.changedTouches[0].clientX
        : e.clientX;
    const clientY =
      e.changedTouches && e.changedTouches[0]
        ? e.changedTouches[0].clientY
        : e.clientY;
    const sx = ((clientX - rect.left) / rect.width) * W;
    const sy = ((clientY - rect.top) / rect.height) * H;
    const tx = Math.floor(sx / TILE);
    const ty = Math.floor(sy / TILE);
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return null;
    return { x: tx, y: ty, sx: sx, sy: sy };
  }

  function bindSwipe() {
    const stage = $("#stage-wrap") || canvas;
    if (!stage) return;
    let start = null;
    let lastDir = null;
    let moved = false;
    const pt = function (e) {
      if (e.touches && e.touches[0])
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    };
    const onStart = function (e) {
      if (pausedForQuiz) return;
      if (e.target && e.target.closest && e.target.closest(".comic-overlay.show"))
        return;
      start = pt(e);
      lastDir = null;
      moved = false;
      if (e.cancelable) e.preventDefault();
    };
    const onMove = function (e) {
      if (!start || !world) return;
      if (e.cancelable) e.preventDefault();
      const p = pt(e);
      const dx = p.x - start.x;
      const dy = p.y - start.y;
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
      moved = true;
      const dir =
        Math.abs(dx) > Math.abs(dy)
          ? dx > 0
            ? "right"
            : "left"
          : dy > 0
            ? "down"
            : "up";
      if (dir !== lastDir) {
        lastDir = dir;
        setDir(dir);
        haptic(4);
        start = p;
      }
    };
    const onEnd = function (e) {
      // Short tap → tile interact (move logs/rocks)
      if (start && !moved && world) {
        const tile = canvasTileFromEvent(e);
        if (tile) handleTileTap(tile.x, tile.y);
      }
      start = null;
      moved = false;
    };
    stage.addEventListener("pointerdown", onStart, { passive: false });
    stage.addEventListener("pointermove", onMove, { passive: false });
    stage.addEventListener("pointerup", onEnd, { passive: true });
    stage.addEventListener("touchstart", onStart, { passive: false });
    stage.addEventListener("touchmove", onMove, { passive: false });
    stage.addEventListener("touchend", onEnd, { passive: true });
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
    loadGator();

    window.addEventListener("keydown", function (e) {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(k) >= 0
      ) {
        e.preventDefault();
      }
      if (world && world.player) {
        if (k === "arrowleft" || k === "a") world.player.nextDir = "left";
        if (k === "arrowright" || k === "d") world.player.nextDir = "right";
        if (k === "arrowup" || k === "w") world.player.nextDir = "up";
        if (k === "arrowdown" || k === "s") world.player.nextDir = "down";
      }
    });
    window.addEventListener("keyup", function (e) {
      keys[e.key.toLowerCase()] = false;
    });

    $("#btn-start").addEventListener("click", function () {
      ensureAudio(); // unlock sound on user gesture (required on phones)
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
        state.unlocked = 1;
        state.completed = {};
        state.usedQ = {};
        state.playSeed = 1;
        renderLevels();
        updateHud();
      }
    });
    const cont = $("#comic-continue");
    if (cont) cont.addEventListener("click", closeComicQuiz);
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
        if (e.target && e.target.closest && e.target.closest(".comic-overlay.show"))
          return;
        if (e.cancelable) e.preventDefault();
      },
      { passive: false }
    );

    bindPads();
    bindSwipe();
    updateHud();
    show("start");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
