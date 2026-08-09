/**
 * Gator Life - original Florida wetland pixel adventure
 * 50 levels, mid-run comic quiz popups, localStorage progress
 * (Inspired by classic side-scrollers; original art/design - not affiliated with any trademarked game)
 */
(function () {
  "use strict";

  const STORAGE = "gatorLifeProgress_v2";
  // Portrait playfield: taller than wide so the action reads vertically
  const W = 360;
  const H = 560;
  const GRAV = 0.48;
  const TOTAL_LEVELS = 50;

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
    voiceOn: true,
  };

  let canvas, ctx;
  let loopId = null;
  let keys = {};
  let world = null;
  let pausedForQuiz = false;
  let lastGatorLineAt = 0;
  let voiceSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  /* ---------- Voice (browser text-to-speech) ---------- */
  function stopVoice() {
    if (!voiceSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  function scoreVoice(v, prefer) {
    const n = ((v.name || "") + " " + (v.lang || "")).toLowerCase();
    const lang = (v.lang || "").toLowerCase();
    let s = 0;

    // Strong preference: American English only
    if (lang === "en-us" || lang.indexOf("en-us") === 0) s += 20;
    else if (lang === "en_us") s += 20;
    else if (/en[-_]?us/.test(lang)) s += 18;
    else if (lang.indexOf("en") === 0) s += 2; // other English (weak)
    else s -= 25; // non-English

    // Penalize non-American accents / locales when labeled in the name
    if (
      /chinese|mandarin|cantonese|japanese|korean|taiwan|hong kong|india|hindi|tamil|vietnamese|thai|filipino|indonesian|malay|singapore|ja-jp|zh-|ko-kr|hi-in|en-in|en-gb|en-au|en-ie|en-za|british|australian|irish|scottish|indian|asian/i.test(
        n
      )
    ) {
      s -= 30;
    }

    // Prefer common natural US voices on Apple / Google / Microsoft
    if (
      /samantha|susan|allison|ava|zoe|nicky|siri|jenny|aria|guy|davis|jane|sara|nancy|natural|neural|premium|enhanced|google us|microsoft (aria|jenny|guy|davis)/i.test(
        n
      )
    ) {
      s += 10;
    }

    if (prefer === "gator" || prefer === "owl") {
      // Kid-like American voices when available
      if (/samantha|karen|ava|susan|allison|nicky|zoe|girl|child|kids|junior/i.test(n)) s += 8;
      if (/female|woman/i.test(n)) s += 3;
      // Avoid deep male defaults for kid gator
      if (/fred|daniel|alex|bruce|david|mark|tom|james|john/i.test(n) && !/female/i.test(n))
        s -= 2;
    }
    if (prefer === "npc") {
      if (/samantha|susan|ava|jenny|aria|zira/i.test(n)) s += 4;
    }

    if (/robot|compact|eloquence|novelty/i.test(n)) s -= 4;
    return s;
  }

  function pickVoice(prefer) {
    if (!voiceSupported) return null;
    let list = window.speechSynthesis.getVoices() || [];
    if (!list.length) return null;

    // Prefer strictly American English voices first
    const us = list.filter(function (v) {
      const lang = (v.lang || "").toLowerCase();
      return lang === "en-us" || lang.indexOf("en-us") === 0 || /en[-_]?us/.test(lang);
    });
    if (us.length) list = us;

    // Drop clearly non-US / Asian-labeled voices even if lang is odd
    list = list.filter(function (v) {
      const n = ((v.name || "") + " " + (v.lang || "")).toLowerCase();
      return !/chinese|mandarin|cantonese|japanese|korean|taiwan|ja-jp|zh-|ko-kr|hi-in|en-in|en-gb|en-au|british|indian|asian/i.test(
        n
      );
    });
    if (!list.length) {
      list = (window.speechSynthesis.getVoices() || []).filter(function (v) {
        return /en/i.test(v.lang || "");
      });
    }
    if (!list.length) list = window.speechSynthesis.getVoices() || [];

    let best = list[0];
    let bestScore = -999;
    for (let i = 0; i < list.length; i++) {
      const sc = scoreVoice(list[i], prefer);
      if (sc > bestScore) {
        bestScore = sc;
        best = list[i];
      }
    }
    return best;
  }

  /** Kid energy: bright, quick, excited (browser TTS limits apply) */
  function kidify(text) {
    return String(text)
      .replace(/!+/g, "!")
      .replace(/\.$/, "!");
  }

  function speak(text, kind, opts) {
    if (!state.voiceOn || !voiceSupported || !text) return;
    opts = opts || {};
    try {
      if (!opts.queue) stopVoice();
      let said = String(text);
      if (kind === "gator" || kind === "owl") said = kidify(said);
      const u = new SpeechSynthesisUtterance(said);
      // Force American English locale for all speech
      u.lang = "en-US";
      const prefer =
        kind === "npc" ? "npc" : kind === "owl" ? "owl" : "gator";
      const v = pickVoice(prefer);
      if (v) {
        u.voice = v;
        // Keep utterance lang aligned to voice when it is en-US
        if (v.lang && /en[-_]?us/i.test(v.lang)) u.lang = v.lang;
        else u.lang = "en-US";
      }
      if (kind === "gator") {
        // ~7–9 year old excitement (American voice preferred)
        u.rate = 1.16;
        u.pitch = 1.65;
        u.volume = 1;
      } else if (kind === "owl") {
        u.rate = 1.1;
        u.pitch = 1.42;
        u.volume = 1;
      } else if (kind === "npc") {
        u.rate = 1.04;
        u.pitch = 1.12;
        u.volume = 1;
      } else {
        u.rate = 1.06;
        u.pitch = 1.08;
        u.volume = 1;
      }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function gatorSay(line, force) {
    const now = Date.now();
    if (!force && now - lastGatorLineAt < 2800) return;
    lastGatorLineAt = now;
    speak(line, "gator");
  }

  let lastOwlLineAt = 0;
  function owlSay(line, force) {
    const now = Date.now();
    if (!force && now - lastOwlLineAt < 3200) return;
    lastOwlLineAt = now;
    speak(line, "owl");
    // Show floating cheer near gator briefly
    if (world) {
      world.owlCheer = { text: line, t: 2.2 };
    }
  }

  const GATOR_START_LINE =
    "C'mon, let's get this show on the road! Get set, survival mode on!";

  const GATOR_LINES = {
    jump: ["Weee!", "Boing!", "Up up!"],
    fire: ["Hot hot hot!", "Jump the fire!", "Gotta go faster!"],
    cave: ["Through the cave!", "Now now!", "Zip zip!"],
    hurt: ["Owie!", "Hey!", "I'm okay!"],
    snack: ["Yum yum!", "Snack attack!"],
    quiz: ["Okay, brain time!", "I can do this!"],
    win: ["Yay! We did it!", "Survival mode success!"],
    nearFlag: ["Almost there!", "Go go go!"],
  };

  const OWL_LINES = [
    "Nice job! Now let's do the next!",
    "Nice job! On to the next!",
    "Whoo-hoo! Nice job! Let's do the next!",
    "You got it! Now let's do the next!",
    "Awesome! Nice job! Keep going!",
    "Nice job, buddy! Next step!",
  ];

  function gatorLine(kind, force) {
    const arr = GATOR_LINES[kind];
    if (!arr) return;
    const line = arr[Math.floor(Math.random() * arr.length)];
    gatorSay(line, force);
  }

  function owlCheer(force) {
    const line = OWL_LINES[Math.floor(Math.random() * OWL_LINES.length)];
    owlSay(line, force);
  }

  // Your site photos only - used as full game backgrounds (no drawn scenery)
  const BG_FILES = [
    "golden-gulf.jpeg",
    "crimson-marsh.jpeg",
    "footprints-at-sunset.jpeg",
    "beach-horizon-glow.jpeg",
    "evening-shore.jpeg",
    "storm-lit-sunset.jpeg",
    "marsh-at-dusk.jpeg",
    "pink-cloud-reflections.jpeg",
    "open-water-sunset.jpeg",
    "sea-and-sky.jpeg",
    "horizon-fire.jpeg",
    "amber-waves.jpeg",
    "clouded-gold.jpeg",
    "last-light-on-the-beach.jpeg",
    "storm-sunset.jpeg",
    "orange-afterglow.jpeg",
    "pink-bay-clouds.jpg",
    "sky-on-fire.jpeg",
    "sun-over-the-gulf.jpeg",
    "heron-silhouette.jpeg",
    "everglades-style", // placeholder skip
  ].filter(function (f) {
    return f.indexOf("everglades") === -1;
  });

  const bgImages = [];
  let bgReady = false;
  let gatorImg = null;
  let gatorImgReady = false;

  const $ = function (s) {
    return document.querySelector(s);
  };

  function loadBackgrounds(done) {
    let left = BG_FILES.length;
    if (!left) {
      bgReady = true;
      if (done) done();
      return;
    }
    BG_FILES.forEach(function (file, i) {
      const img = new Image();
      img.onload = img.onerror = function () {
        left -= 1;
        if (img.naturalWidth) bgImages.push(img);
        if (left <= 0) {
          bgReady = true;
          if (done) done();
        }
      };
      img.src = "images/prints/" + file;
    });
  }

  function loadGatorSprite(done) {
    gatorImg = new Image();
    gatorImg.onload = function () {
      gatorImgReady = true;
      if (done) done();
    };
    gatorImg.onerror = function () {
      gatorImgReady = false;
      if (done) done();
    };
    // Your custom baby gator art (grows in-game with age)
    gatorImg.src = "images/game/gator-sprite.png";
  }

  function bgForLevel(idx) {
    if (!bgImages.length) return null;
    return bgImages[idx % bgImages.length];
  }

  /** Display size for gator by stage - baby smaller, adult much bigger */
  function gatorDrawSize(idx) {
    // Portrait figurine aspect ~2:3 (clear photo gator, not pixel mesh)
    if (idx < 5) return { w: 72, h: 108 }; // newborn
    if (idx < 10) return { w: 88, h: 132 }; // baby
    if (idx < 20) return { w: 108, h: 162 }; // hatchling
    if (idx < 30) return { w: 128, h: 192 }; // juvenile
    if (idx < 40) return { w: 148, h: 222 }; // sub-adult
    return { w: 168, h: 252 }; // adult
  }

  /** Older gators: slightly darker/greener adult look (same figurine) */
  function gatorAgeFilter(idx) {
    if (idx < 10) return "none";
    if (idx < 20) return "saturate(0.98) brightness(0.99)";
    if (idx < 30) return "saturate(0.9) brightness(0.95) contrast(1.04)";
    if (idx < 40) return "saturate(0.78) brightness(0.9) contrast(1.06) hue-rotate(-5deg)";
    return "saturate(0.65) brightness(0.86) contrast(1.1) hue-rotate(-10deg)";
  }

  function stageName(i) {
    if (i < 10) return "Nestling";
    if (i < 20) return "Hatchling";
    if (i < 30) return "Juvenile";
    if (i < 40) return "Sub-adult";
    return "Adult";
  }

  function gatorScale(i) {
    // Kept for rival sizing; main player uses gatorDrawSize()
    if (i < 10) return 3.2;
    if (i < 20) return 3.6;
    if (i < 30) return 4.0;
    if (i < 40) return 4.4;
    return 4.8;
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE) || "{}");
      state.totalScore = d.totalScore || 0;
      state.unlocked = d.unlocked || 1;
      state.completed = d.completed || {};
      state.playSeed = d.playSeed || 1;
      state.usedQ = d.usedQ || {};
      if (typeof d.voiceOn === "boolean") state.voiceOn = d.voiceOn;
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
        voiceOn: state.voiceOn,
      })
    );
  }

  function syncVoiceButton() {
    const labels = document.querySelectorAll("[data-voice-toggle]");
    labels.forEach(function (btn) {
      btn.textContent = state.voiceOn ? "Voice: On" : "Voice: Off";
      btn.setAttribute("aria-pressed", state.voiceOn ? "true" : "false");
    });
  }

  function toggleVoice() {
    state.voiceOn = !state.voiceOn;
    if (!state.voiceOn) stopVoice();
    save();
    syncVoiceButton();
    if (state.voiceOn) gatorSay("Voice on! Let's go!", true);
  }

  function show(name) {
    state.screen = name;
    ["start", "levels", "play", "fact"].forEach(function (k) {
      const el = $("#screen-" + k);
      if (el) el.classList.toggle("active", k === name);
    });
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

  /* ---------- Level geometry ---------- */
  function buildLevel(idx) {
    const platforms = [];
    const hazards = [];
    const climbs = []; // ladders + snake-ropes
    const quizzes = [];
    const items = [];
    const explosions = [];
    const len = 1800 + idx * 52;
    // Labyrinth stories (floors), bottom to top
    const floors = [500, 380, 260, 145];
    const groundY = floors[0];

    // --- Maze floors: segments + side walls ---
    for (let f = 0; f < floors.length; f++) {
      const fy = floors[f];
      let x = f % 2 === 0 ? 0 : 80;
      let room = 0;
      while (x < len - 40) {
        const w = 90 + Math.floor(Math.random() * 70) + (f === 0 ? 40 : 0);
        platforms.push({ x: x, y: fy, w: Math.min(w, len - x), h: f === 0 ? 64 : 14 });
        // Vertical wall stubs to feel maze-like
        if (room % 2 === 1 && f < floors.length - 1) {
          const wallH = floors[f] - floors[f + 1] - 8;
          platforms.push({
            x: x + w - 12,
            y: floors[f + 1] + 8,
            w: 14,
            h: wallH,
            wall: true,
          });
        }
        const gap = 24 + (idx > 5 ? Math.min(40, 10 + idx) : 12);
        x += w + (Math.random() < 0.4 ? gap : 18);
        room++;
      }
      // Floor edge walls
      platforms.push({ x: 0, y: fy - 90, w: 12, h: 90, wall: true });
      platforms.push({ x: len - 16, y: fy - 90, w: 12, h: 90, wall: true });
    }

    // --- Ladders & snake-ropes between stories ---
    const climbCount = 5 + Math.floor(idx / 4);
    for (let i = 0; i < climbCount; i++) {
      const from = i % (floors.length - 1);
      const yBottom = floors[from];
      const yTop = floors[from + 1];
      const cx = 120 + i * Math.floor(len / (climbCount + 1)) + (idx % 5) * 9;
      const type = i % 2 === 0 ? "ladder" : "snake";
      climbs.push({
        type: type,
        x: cx,
        y: yTop,
        w: type === "ladder" ? 40 : 36,
        h: yBottom - yTop,
      });
    }
    // Extra snake ropes in the middle of long rooms
    for (let i = 0; i < 4; i++) {
      const from = Math.floor(Math.random() * (floors.length - 1));
      climbs.push({
        type: "snake",
        x: 200 + Math.random() * (len - 400),
        y: floors[from + 1],
        w: 36,
        h: floors[from] - floors[from + 1],
      });
    }

    // Hazards placed per floor (labyrinth dens)
    const roster = [
      "fire",
      "cave",
      "rattler",
      "hawk",
      "raccoon",
      "panther",
      "boar",
      "boat",
      "rival",
      "bird",
    ];
    const count = 6 + Math.floor(idx / 2);
    for (let i = 0; i < count; i++) {
      const unlock = Math.min(roster.length - 1, 2 + Math.floor(idx / 4) + (i % 3));
      const k = roster[Math.floor(Math.random() * (unlock + 1))];
      const floor = floors[Math.min(floors.length - 1, i % floors.length)];
      const baseX = 160 + i * (110 - Math.min(45, idx * 0.4)) + Math.random() * 40;
      if (k === "fire") {
        hazards.push({
          kind: "fire",
          x: baseX,
          y: floor - 2,
          w: 36,
          h: 36,
          vx: 0,
          baseY: floor - 2,
          phase: Math.random() * 10,
          tall: 28 + Math.random() * 12,
        });
      } else if (k === "cave") {
        hazards.push({
          kind: "cave",
          x: baseX,
          y: floor - 90,
          w: 52,
          h: 92,
          open: true,
          phase: Math.random() * 6,
          period: 2.2 + Math.random() * 1.4,
          vx: 0,
          baseY: floor - 90,
        });
      } else {
        const fly = k === "hawk" || k === "bird";
        const big = k === "panther" || k === "boar" || k === "rival";
        hazards.push({
          kind: k,
          x: baseX,
          y: fly ? floor - 140 : floor - 48,
          w: big ? 48 : 40,
          h: big ? 44 : 38,
          vx:
            fly
              ? 1.45 + idx * 0.025
              : k === "boat"
                ? 1.55
                : k === "panther"
                  ? 1.05
                  : 0.8,
          baseY: fly ? floor - 140 : floor - 48,
          phase: Math.random() * 10,
        });
      }
    }

    // Quizzes on alternating floors
    const qn = 2 + (idx % 3);
    for (let i = 0; i < qn; i++) {
      const fy = floors[Math.min(floors.length - 1, (i + 1) % floors.length)];
      quizzes.push({
        x: 260 + ((i + 1) * len) / (qn + 2),
        y: fy - 80,
        hit: false,
      });
    }

    // Snacks scattered on upper stories
    for (let i = 0; i < 10 + (idx % 5); i++) {
      const fy = floors[i % floors.length];
      items.push({
        x: 140 + i * 110,
        y: fy - 60 - (i % 2) * 20,
        taken: false,
      });
    }

    // Flag on top floor near the end
    const goalFloor = floors[floors.length - 1];
    const sz = gatorDrawSize(idx);
    const pw = sz.w;
    const ph = sz.h;
    return {
      idx: idx,
      len: len,
      floors: floors,
      platforms: platforms,
      climbs: climbs,
      hazards: hazards,
      quizzes: quizzes,
      items: items,
      explosions: explosions,
      asteroids: [],
      astroTimer: 1.2 + Math.random(),
      goalX: len - 70,
      goalY: goalFloor,
      camera: 0,
      time: 0,
      inv: 0,
      won: false,
      steps: 0,
      nextStepAt: 3,
      owlCheer: null,
      player: {
        x: 48,
        y: groundY - ph - 4,
        vx: 0,
        vy: 0,
        w: pw,
        h: ph,
        onGround: false,
        onClimb: false,
        facing: 1,
      },
    };
  }

  /** Call when player accomplishes a step (snack, quiz, milestone…) */
  function accomplishStep(reason) {
    if (!world || world.won) return;
    world.steps = (world.steps || 0) + 1;
    // Owl cheers on each accomplished step (with light spacing unless forced)
    owlCheer(reason === "quiz" || reason === "flag");
  }

  /* ---------- Drawing (original pixel style) ---------- */
  function drawBackground(cam, t, idx) {
    const img = bgForLevel(idx);
    // Fallback solid only if photos failed to load
    if (!img) {
      ctx.fillStyle = "#3d6a55";
      ctx.fillRect(0, 0, W, H);
      return;
    }

    // Draw ONLY your photo as the full backdrop (cover + gentle parallax)
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.max(W / iw, H / ih) * 1.08;
    const dw = iw * scale;
    const dh = ih * scale;
    // Parallax: photo drifts slower than gameplay camera
    const maxShift = Math.max(0, dw - W);
    const shift = maxShift ? ((cam * 0.15) % maxShift) : 0;
    const dx = -shift;
    const dy = (H - dh) * 0.45;

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, dx, dy, dw, dh);
    // Soft darken so the figurine stays readable on bright photos
    ctx.fillStyle = "rgba(10, 25, 18, 0.22)";
    ctx.fillRect(0, 0, W, H);
    // Light bottom shade for platform readability only
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
  }

  function drawPlatforms(cam) {
    world.platforms.forEach(function (p) {
      const x = Math.floor(p.x - cam);
      if (x > W || x + p.w < 0) return;
      if (p.wall) {
        ctx.fillStyle = "rgba(45, 55, 40, 0.72)";
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = "rgba(70, 90, 55, 0.5)";
        for (let yy = p.y; yy < p.y + p.h; yy += 10) {
          ctx.fillRect(x + 2, yy, p.w - 4, 2);
        }
        return;
      }
      // Semi-transparent ledges so your photo still shows through
      ctx.fillStyle = "rgba(40, 55, 35, 0.6)";
      ctx.fillRect(x, p.y, p.w, p.h);
      ctx.fillStyle = "rgba(90, 140, 70, 0.8)";
      ctx.fillRect(x, p.y, p.w, 4);
    });
  }

  function drawClimbs(cam) {
    if (!world.climbs) return;
    world.climbs.forEach(function (c) {
      const x = Math.floor(c.x - cam);
      if (x > W + 20 || x + c.w < -20) return;
      if (c.type === "ladder") {
        // Wide wooden ladder (easy to see and grab)
        ctx.fillStyle = "rgba(140, 90, 45, 0.95)";
        ctx.fillRect(x + 2, c.y, 8, c.h);
        ctx.fillRect(x + c.w - 10, c.y, 8, c.h);
        ctx.fillStyle = "rgba(190, 130, 60, 0.98)";
        for (let yy = c.y + 10; yy < c.y + c.h - 6; yy += 16) {
          ctx.fillRect(x + 2, yy, c.w - 4, 7);
        }
        // Glow so players notice climb points
        ctx.fillStyle = "rgba(255, 230, 120, 0.15)";
        ctx.fillRect(x - 4, c.y, c.w + 8, c.h);
      } else {
        // Snake rope (climbable)
        ctx.fillStyle = "#3d9a45";
        for (let yy = 0; yy < c.h; yy += 5) {
          const wob = Math.sin(yy * 0.18 + (world.time || 0) * 3) * 4;
          ctx.fillRect(x + c.w / 2 - 5 + wob, c.y + yy, 10, 8);
        }
        ctx.fillStyle = "#d4b060";
        ctx.fillRect(x + c.w / 2 - 10, c.y, 20, 16);
        ctx.fillStyle = "#111";
        ctx.fillRect(x + c.w / 2 - 5, c.y + 5, 3, 3);
        ctx.fillRect(x + c.w / 2 + 3, c.y + 5, 3, 3);
        ctx.fillStyle = "#e8d080";
        ctx.fillRect(x + c.w / 2 - 6, c.y + c.h - 12, 14, 8);
        ctx.fillStyle = "rgba(255, 230, 120, 0.12)";
        ctx.fillRect(x - 4, c.y, c.w + 8, c.h);
      }
    });
  }

  function climbAt(p) {
    if (!world || !world.climbs) return null;
    // Generous grab zone so large gator sprites can still catch ladders/snakes
    for (let i = 0; i < world.climbs.length; i++) {
      const c = world.climbs[i];
      const grabW = Math.max(c.w, 56);
      const cx = c.x + c.w / 2 - grabW / 2;
      const top = c.y - 28;
      const bot = c.y + c.h + 36;
      if (
        p.x + p.w > cx &&
        p.x < cx + grabW &&
        p.y + p.h > top &&
        p.y < bot
      ) {
        return c;
      }
    }
    return null;
  }

  function nearClimb(p) {
    return !!climbAt(p);
  }

  /**
   * Draw your custom gator art (images/game/gator-sprite.png).
   * Smooth (not chunky-pixel) so the alligator is clearly visible.
   * Baby years: bright striped look. Older: larger + age filter.
   */
  function drawPixelGator(p, scale, facing) {
    const x = Math.floor(p.x - world.camera);
    const y = Math.floor(p.y);
    const w = Math.max(8, Math.floor(p.w));
    const h = Math.max(8, Math.floor(p.h));
    const idx = world ? world.idx : 0;

    ctx.save();
    // Always smooth-scale the photo gator (reduce harsh pixelation)
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";

    if (facing < 0) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.scale(-1, 1);
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }

    if (gatorImgReady && gatorImg) {
      // Soft shadow under feet
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h - 1, w * 0.32, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.filter = gatorAgeFilter(idx);
      const bob =
        world && Math.abs((world.player && world.player.vx) || 0) > 0.2
          ? Math.sin((world.time || 0) * 12) * 2
          : 0;
      ctx.drawImage(gatorImg, x, y + bob, w, h);
      ctx.filter = "none";
    } else {
      ctx.fillStyle = "#3d8a4a";
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  }

  function spawnAsteroid() {
    if (!world) return;
    const cam = world.camera;
    world.asteroids.push({
      x: cam + 30 + Math.random() * (W - 60),
      y: -20 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 2.2 + Math.random() * 2.4 + world.idx * 0.03,
      r: 10 + Math.random() * 10,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.2,
      alive: true,
    });
  }

  function boom(x, y, power) {
    power = power || 1;
    if (!world) return;
    const n = 14 + Math.floor(power * 10);
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const sp = 1.5 + Math.random() * 4 * power;
      world.explosions.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 1,
        life: 0.45 + Math.random() * 0.45,
        max: 0.9,
        size: 3 + Math.random() * 6 * power,
        color: i % 3 === 0 ? "#fff2a0" : i % 3 === 1 ? "#ff7a20" : "#ff3030",
      });
    }
    // Flash ring
    world.explosions.push({
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      life: 0.28,
      max: 0.28,
      size: 28 * power,
      color: "rgba(255,200,80,0.5)",
      ring: true,
    });
    // Damage if player near blast
    if (world.player) {
      const dx = world.player.x + world.player.w / 2 - x;
      const dy = world.player.y + world.player.h / 2 - y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 38 * power + world.player.w) {
        hurt();
        gatorSay("Whoa, asteroid!", false);
      }
    }
  }

  function updateSkyDanger(dt) {
    if (!world || world.won) return;
    world.astroTimer -= dt;
    // More frequent drops on later levels
    const interval = Math.max(0.85, 2.4 - world.idx * 0.03);
    if (world.astroTimer <= 0) {
      spawnAsteroid();
      if (world.idx > 8 && Math.random() < 0.35) spawnAsteroid();
      world.astroTimer = interval * (0.7 + Math.random() * 0.7);
    }

    world.asteroids = world.asteroids.filter(function (a) {
      if (!a.alive) return false;
      a.x += a.vx;
      a.y += a.vy;
      a.vy += 0.04;
      a.rot += a.spin;
      // Hit player
      const pr = {
        x: world.player.x,
        y: world.player.y,
        w: world.player.w,
        h: world.player.h,
      };
      const box = {
        x: a.x - a.r * 0.7,
        y: a.y - a.r * 0.7,
        w: a.r * 1.4,
        h: a.r * 1.4,
      };
      if (aabb(pr, box)) {
        boom(a.x, a.y, 1.15);
        a.alive = false;
        return false;
      }
      // Hit ground / platforms
      if (a.y > 500 || solidAt(a.x - 4, a.y - 4, 8, 8)) {
        boom(a.x, a.y, 1.25);
        a.alive = false;
        return false;
      }
      if (a.y > H + 80) return false;
      return true;
    });

    world.explosions = world.explosions.filter(function (e) {
      e.life -= dt;
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.08;
      return e.life > 0;
    });
  }

  function drawAsteroidsAndBooms(cam) {
    // Falling asteroids
    world.asteroids.forEach(function (a) {
      const x = a.x - cam;
      const y = a.y;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a.rot);
      // rock body
      ctx.fillStyle = "#5a4030";
      ctx.fillRect(-a.r * 0.7, -a.r * 0.55, a.r * 1.4, a.r * 1.1);
      ctx.fillStyle = "#3a2818";
      ctx.fillRect(-a.r * 0.4, -a.r * 0.3, a.r * 0.5, a.r * 0.45);
      ctx.fillStyle = "#8a7060";
      ctx.fillRect(-a.r * 0.15, -a.r * 0.5, a.r * 0.35, a.r * 0.3);
      // fiery trail
      ctx.fillStyle = "rgba(255,120,20,0.75)";
      ctx.fillRect(-3, -a.r - 10, 6, 12);
      ctx.fillStyle = "rgba(255,220,80,0.85)";
      ctx.fillRect(-2, -a.r - 16, 4, 8);
      ctx.restore();
    });

    // Explosions
    world.explosions.forEach(function (e) {
      const x = e.x - cam;
      const alpha = Math.max(0, e.life / (e.max || 0.6));
      ctx.globalAlpha = alpha;
      if (e.ring) {
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, e.y, e.size * (1.2 - alpha), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = e.color;
        const s = e.size * (0.5 + alpha);
        ctx.fillRect(x - s / 2, e.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    });
  }

  function drawHazard(h, cam) {
    const x = Math.floor(h.x - cam);
    const y = Math.floor(h.y);
    if (x < -40 || x > W + 40) return;
    const flick = Math.sin((world ? world.time : 0) * 14 + h.phase) * 0.5 + 0.5;

    if (h.kind === "fire") {
      const tall = (h.tall || 20) + flick * 8;
      ctx.fillStyle = "#2a1810";
      ctx.fillRect(x + 1, y + 14, h.w - 2, 6);
      ctx.fillStyle = "#ff5500";
      ctx.fillRect(x + 3, y + 14 - tall, h.w - 6, tall);
      ctx.fillStyle = "#ffcc33";
      ctx.fillRect(x + 6, y + 16 - tall * 0.65, Math.max(3, h.w - 12), tall * 0.5);
      ctx.fillStyle = "#fff6a0";
      ctx.fillRect(x + Math.floor(h.w / 2) - 1, y + 10 - tall, 4, 8);
      return;
    }

    if (h.kind === "cave") {
      const openAmt = h.open ? 0.8 : 0.18;
      const gap = Math.floor(h.h * openAmt);
      const topH = Math.floor((h.h - gap) / 2);
      ctx.fillStyle = "#3a342e";
      ctx.fillRect(x, y, h.w, topH);
      ctx.fillRect(x, y + h.h - topH, h.w, topH);
      ctx.fillStyle = "#1a1612";
      ctx.fillRect(x + 3, y + topH, h.w - 6, gap);
      ctx.fillStyle = "#5a5048";
      ctx.fillRect(x - 1, y, 2, h.h);
      ctx.fillRect(x + h.w - 1, y, 2, h.h);
      if (!h.open) {
        ctx.fillStyle = "rgba(160,50,40,0.3)";
        ctx.fillRect(x, y, h.w, h.h);
      }
      return;
    }

    if (h.kind === "rattler") {
      // Upright coiled rattler silhouette (taller, more visible)
      ctx.fillStyle = "#b89540";
      ctx.fillRect(x + 6, y + 4, 10, 18);
      ctx.fillStyle = "#8a6a20";
      ctx.fillRect(x + 8, y + 6, 3, 3);
      ctx.fillRect(x + 8, y + 11, 3, 3);
      ctx.fillStyle = "#d4b060";
      ctx.fillRect(x + 4, y, 14, 10);
      ctx.fillStyle = "#111";
      ctx.fillRect(x + 8, y + 3, 2, 2);
      ctx.fillRect(x + 13, y + 3, 2, 2);
      ctx.fillStyle = "#e8d080";
      ctx.fillRect(x + 8, y + 20, 6, 4);
      return;
    }

    if (h.kind === "hawk" || h.kind === "bird") {
      ctx.fillStyle = h.kind === "hawk" ? "#5a4030" : "#333";
      ctx.fillRect(x + 4, y + 6, 16, 8);
      ctx.fillRect(x + 14, y + 2, 10, 6);
      ctx.fillStyle = "#222";
      ctx.fillRect(x + 6, y + 8, 3, 2);
      ctx.fillStyle = "#6a5030";
      ctx.fillRect(x - 4, y + 6, 10, 5);
      ctx.fillRect(x + 14, y + 6, 10, 5);
      return;
    }

    if (h.kind === "panther") {
      // More upright stalking pose
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(x + 6, y + 4, 14, 22);
      ctx.fillRect(x + 4, y, 16, 12);
      ctx.fillStyle = "#e0b040";
      ctx.fillRect(x + 8, y + 4, 2, 2);
      ctx.fillRect(x + 14, y + 4, 2, 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(x + 8, y + 24, 4, 6);
      ctx.fillRect(x + 14, y + 24, 4, 6);
      return;
    }

    if (h.kind === "boar") {
      ctx.fillStyle = "#5a4030";
      ctx.fillRect(x + 4, y + 6, 18, 16);
      ctx.fillRect(x + 8, y, 12, 10);
      ctx.fillStyle = "#f0e8d8";
      ctx.fillRect(x + 18, y + 10, 6, 3);
      ctx.fillStyle = "#2a2010";
      ctx.fillRect(x + 8, y + 20, 4, 5);
      ctx.fillRect(x + 16, y + 20, 4, 5);
      return;
    }

    if (h.kind === "boat") {
      ctx.fillStyle = "#7a4518";
      ctx.fillRect(x, y + 10, 28, 10);
      ctx.fillStyle = "#c8c8c8";
      ctx.fillRect(x + 10, y, 4, 12);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 14, y + 2, 10, 6);
      return;
    }

    if (h.kind === "raccoon") {
      ctx.fillStyle = "#6b5b4b";
      ctx.fillRect(x + 4, y + 4, 14, 16);
      ctx.fillRect(x + 6, y, 10, 8);
      ctx.fillStyle = "#111";
      ctx.fillRect(x + 8, y + 3, 8, 3);
      return;
    }

    if (h.kind === "snake") {
      ctx.fillStyle = "#3d6a32";
      ctx.fillRect(x + 8, y + 4, 8, 18);
      ctx.fillRect(x + 4, y, 14, 8);
      return;
    }

    if (h.kind === "rival") {
      const sz = gatorDrawSize(Math.min(49, (world ? world.idx : 0) + 10));
      drawPixelGator(
        { x: h.x, y: h.y, w: sz.w * 0.85, h: sz.h * 0.85 },
        1,
        -1
      );
      return;
    }

    ctx.fillStyle = "#5c4030";
    ctx.fillRect(x, y + 2, 16, 10);
  }

  function drawWorld() {
    const p = world.player;
    const cam = world.camera;
    drawBackground(cam, world.time, world.idx);
    drawPlatforms(cam);
    drawClimbs(cam);

    // items
    world.items.forEach(function (it) {
      if (it.taken) return;
      const x = Math.floor(it.x - cam);
      ctx.fillStyle = "#e8c040";
      ctx.fillRect(x, it.y, 10, 10);
      ctx.fillStyle = "#fff8c0";
      ctx.fillRect(x + 2, it.y + 2, 4, 4);
    });

    // quiz markers
    world.quizzes.forEach(function (q) {
      if (q.hit) return;
      const x = Math.floor(q.x - cam);
      ctx.fillStyle = "#ffe566";
      ctx.fillRect(x, q.y, 18, 18);
      ctx.fillStyle = "#111";
      ctx.font = "bold 14px monospace";
      ctx.fillText("?", x + 4, q.y + 14);
    });

    // goal flag (top story)
    const gx = Math.floor(world.goalX - cam);
    const gy = (world.goalY || 145) - 80;
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(gx, gy, 5, 80);
    ctx.fillStyle = "#3cb371";
    ctx.fillRect(gx + 5, gy, 22, 16);

    world.hazards.forEach(function (h) {
      drawHazard(h, cam);
    });

    drawAsteroidsAndBooms(cam);

    drawPixelGator(p, gatorScale(world.idx), p.facing);

    // Small owl buddy (simple, not pixel-mesh)
    drawOwlCompanion(p);

    // Owl cheer bubble
    if (world.owlCheer && world.owlCheer.t > 0) {
      const bx = Math.floor(p.x - world.camera + p.w + 6);
      const by = Math.floor(p.y - 18);
      ctx.fillStyle = "rgba(255,252,230,0.95)";
      ctx.fillRect(bx, by, 120, 16);
      ctx.strokeStyle = "#111";
      ctx.strokeRect(bx, by, 120, 16);
      ctx.fillStyle = "#111";
      ctx.font = "9px monospace";
      ctx.fillText("🦉 Nice job!", bx + 4, by + 11);
    }

    // HUD strip on canvas
    ctx.fillStyle = "rgba(10,30,18,0.55)";
    ctx.fillRect(0, 0, W, 16);
    ctx.fillStyle = "#e8f5ec";
    ctx.font = "11px monospace";
    ctx.fillText(
      "LV " +
        (world.idx + 1) +
        "  " +
        stageName(world.idx) +
        "  SCORE " +
        state.score +
        "  STEPS " +
        (world.steps || 0),
      6,
      12
    );

    // Climb helper text
    if (world.climbHint) {
      ctx.fillStyle = "rgba(255, 245, 180, 0.92)";
      ctx.fillRect(W / 2 - 110, H - 36, 220, 24);
      ctx.strokeStyle = "#2f6b43";
      ctx.strokeRect(W / 2 - 110, H - 36, 220, 24);
      ctx.fillStyle = "#143d22";
      ctx.font = "bold 12px system-ui,sans-serif";
      ctx.fillText("Hold UP / W to climb!", W / 2 - 70, H - 20);
    }
  }

  function drawOwlCompanion(p) {
    // Soft round companion (emoji-scale) so we stay non-pixel
    const ox = Math.floor(p.x - world.camera + (p.facing > 0 ? -28 : p.w + 4));
    const bob = Math.sin((world.time || 0) * 5) * 3;
    const oy = Math.floor(p.y + 8 + bob);
    ctx.font = "28px serif";
    ctx.textBaseline = "top";
    ctx.fillText("🦉", ox, oy);
  }

  /* ---------- Physics ---------- */
  function solidAt(x, y, w, h, opts) {
    opts = opts || {};
    for (let i = 0; i < world.platforms.length; i++) {
      const p = world.platforms[i];
      // While climbing, ignore floor ledges so gator can pass between stories
      if (opts.climbing && !p.wall) continue;
      if (x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y) return p;
    }
    return null;
  }

  function updatePlayer(dt) {
    const p = world.player;
    const sp = 2.8 + Math.min(1.3, world.idx * 0.025);
    let move = 0;
    if (keys["arrowleft"] || keys["a"]) move -= 1;
    if (keys["arrowright"] || keys["d"]) move += 1;

    const climb = climbAt(p);
    p.onClimb = !!climb;
    const up = keys["arrowup"] || keys["w"];
    const down = keys["arrowdown"] || keys["s"];
    const jumpKey = keys[" "] || keys["z"];
    const climbing = !!(climb && (up || down || p._holdingClimb));

    // Stick to climb when overlapping and pressing vertical, or already climbing
    if (climb && (up || down)) p._holdingClimb = true;
    if (!climb) p._holdingClimb = false;
    if (climb && jumpKey && !up && !down) p._holdingClimb = false;

    if (climb && (up || down || p._holdingClimb)) {
      // Climb mode: move up/down the ladder or snake-rope
      if (up || down) {
        p.vx = move * sp * 0.25;
        p.vy = up ? -4.2 : 4.2;
      } else {
        p.vx = move * sp * 0.2;
        p.vy = 0;
      }
      if (move) p.facing = move > 0 ? 1 : -1;
      // Center on climb aid
      const targetX = climb.x + climb.w / 2 - p.w / 2;
      p.x += (targetX - p.x) * 0.25;
      if (up && Math.random() < 0.015) gatorSay("Gotta go faster!", false);
    } else {
      p.vx = move * sp;
      if (move) p.facing = move > 0 ? 1 : -1;
      if ((up || jumpKey) && p.onGround) {
        if (Math.random() < 0.35) gatorLine("jump");
        p.vy = -8.4 - Math.min(1.2, world.idx * 0.03);
        p.onGround = false;
      } else {
        p.vy += GRAV;
        if (p.vy > 11) p.vy = 11;
      }
    }

    // Jump off climb with space
    if (climb && jumpKey && !up && !down) {
      p.vy = -7;
      p._holdingClimb = false;
    }

    const useClimbPhys = !!(climb && (up || down || p._holdingClimb));

    // horizontal
    p.x += p.vx;
    let hit = solidAt(p.x, p.y, p.w, p.h, { climbing: useClimbPhys });
    if (hit) {
      if (p.vx > 0) p.x = hit.x - p.w - 0.01;
      else if (p.vx < 0) p.x = hit.x + hit.w + 0.01;
      p.vx = 0;
    }
    // vertical
    p.y += p.vy;
    p.onGround = false;
    hit = solidAt(p.x, p.y, p.w, p.h, { climbing: useClimbPhys });
    if (hit) {
      if (p.vy > 0) {
        p.y = hit.y - p.h - 0.01;
        p.onGround = true;
        p._holdingClimb = false;
      } else if (p.vy < 0) {
        p.y = hit.y + hit.h + 0.01;
      }
      p.vy = 0;
    }

    if (climb && useClimbPhys) {
      // Allow stepping onto the upper floor above the climb top
      if (p.y < climb.y - p.h * 0.35) {
        // Reached top: snap onto floor if any
        p.y = Math.max(p.y, climb.y - p.h - 2);
        p._holdingClimb = false;
        p.onGround = true;
        p.vy = 0;
      }
      if (p.y + p.h > climb.y + climb.h + 20) {
        p.y = climb.y + climb.h - p.h + 8;
      }
    }

    if (p.y > H + 40) {
      hurt();
      p.x = 48;
      p.y = 420;
      p.vy = 0;
      world.camera = 0;
    }

    world.camera = Math.max(0, Math.min(world.len - W, p.x - 100));

    // On-screen climb hint
    world.climbHint = !!climb;
  }

  function hurt() {
    if (world.inv > 0) return;
    state.lives -= 1;
    world.inv = 1.2;
    updateHud();
    gatorLine("hurt");
    if (state.lives <= 0) {
      // gentle restart level
      state.lives = 3;
      state.score = Math.max(0, state.score - 20);
      gatorSay("Reset! Let's go again!", true);
      startLevel(state.level, true);
    }
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function updateHazards(dt) {
    world.hazards.forEach(function (h) {
      h.phase += dt;

      if (h.kind === "fire") {
        // Stay on ground; damage if player walks through flames
        h.y = h.baseY;
        const box = { x: h.x, y: h.y - (h.tall || 14), w: h.w, h: (h.tall || 14) + 8 };
        const near =
          Math.abs(world.player.x - h.x) < 40 &&
          Math.abs(world.player.y - h.y) < 50;
        if (near && Math.random() < 0.01) gatorLine("fire");
        if (world.inv <= 0 && aabb(world.player, box)) hurt();
        return;
      }

      if (h.kind === "cave") {
        // Opening / closing rock jaws - only hurts when closing on you
        const cycle = (h.phase % h.period) / h.period;
        h.open = cycle < 0.55;
        const nearCave = Math.abs(world.player.x - h.x) < 36;
        if (nearCave && h.open && Math.random() < 0.012) gatorLine("cave");
        if (!h.open) {
          const box = { x: h.x + 2, y: h.y + 4, w: h.w - 4, h: h.h - 8 };
          if (world.inv <= 0 && aabb(world.player, box)) hurt();
        }
        return;
      }

      if (h.kind === "hawk" || h.kind === "bird") {
        h.x += h.vx * (Math.sin(h.phase) > 0 ? 1 : -1);
        h.y = h.baseY + Math.sin(h.phase * 2.2) * 18;
      } else if (h.kind === "boat") {
        h.x += h.vx * 0.85;
        if (h.x > world.len + 20) h.x = -30;
      } else if (h.kind === "panther" || h.kind === "boar" || h.kind === "rattler") {
        h.x += Math.sin(h.phase * 1.1) * h.vx * 1.2;
        h.y = h.baseY;
      } else if (h.kind === "rival") {
        h.x += Math.sin(h.phase * 0.8) * h.vx;
      } else {
        h.x += Math.sin(h.phase) * h.vx * 0.5;
      }

      const box = {
        x: h.x,
        y: h.y,
        w: h.w || 14,
        h: h.h || 12,
      };
      if (world.inv <= 0 && aabb(world.player, box)) hurt();
    });
  }

  function updateItems() {
    world.items.forEach(function (it) {
      if (it.taken) return;
      if (aabb(world.player, { x: it.x, y: it.y, w: 6, h: 6 })) {
        it.taken = true;
        state.score += 10;
        updateHud();
        gatorLine("snack");
        accomplishStep("snack");
      }
    });
  }

  function updateQuizzes() {
    world.quizzes.forEach(function (q) {
      if (q.hit) return;
      if (aabb(world.player, { x: q.x, y: q.y, w: 12, h: 12 })) {
        q.hit = true;
        openComicQuiz();
      }
    });
  }

  function updateGoal() {
    const dist = world.goalX - (world.player.x + world.player.w);
    if (dist < 140 && dist > 24 && Math.random() < 0.01) gatorLine("nearFlag");
    // Distance milestones (every ~22% of the run)
    if (world && world.len) {
      const progress = world.player.x / world.len;
      const mark = world.nextStepAt || 3;
      // nextStepAt counts snacks/quizzes; also award path milestones
      if (!world._mile) world._mile = 0;
      const mile = Math.floor(progress * 4); // 0..3
      if (mile > world._mile && mile < 4) {
        world._mile = mile;
        if (mile >= 1) {
          gatorSay("Gotta go faster!", false);
          accomplishStep("mile");
        }
      }
    }
    // Goal on upper story near the end
    const gy = world.goalY || 145;
    if (
      world.player.x + world.player.w >= world.goalX &&
      world.player.y + world.player.h >= gy - 10 &&
      world.player.y < gy + 30
    ) {
      world.won = true;
      finishLevel();
    }
  }

  /* ---------- Comic quiz ---------- */
  const NPCS = [
    {
      id: "rattler",
      name: "Rita the Rattler",
      emoji: "🐍",
      tag: "SNAKE SAYS",
      openers: [
        "Ssssay… answer me this!",
        "Hold up, gator. Pop quiz time:",
        "Rattle-rattle! Knowledge check:",
        "You want past me? Prove it:",
      ],
    },
    {
      id: "raccoon",
      name: "Rascal Raccoon",
      emoji: "🦝",
      tag: "RASCAL ASKS",
      openers: [
        "Yo! Mid-heist question:",
        "Bandit brain teaser:",
        "Don't swipe wrong on this one:",
      ],
    },
    {
      id: "hawk",
      name: "Harley Hawk",
      emoji: "🦅",
      tag: "HAWK SCREECHES",
      openers: [
        "From the sky I ask:",
        "Circle once… then answer:",
        "Sharp eyes, sharper question:",
      ],
    },
    {
      id: "panther",
      name: "Prowl the Panther",
      emoji: "🐆",
      tag: "PANTHER PURRS",
      openers: [
        "Quiet… then the quiz:",
        "Shadow question incoming:",
        "Earn your path, little gator:",
      ],
    },
  ];

  function pickNpc(seed) {
    return NPCS[(seed + state.level) % NPCS.length];
  }

  function openComicQuiz() {
    if (pausedForQuiz) return;
    pausedForQuiz = true;
    const used = state.usedQ[state.level] || [];
    const q = window.GATOR_QUESTIONS.pickQuestion(state.level, used, state.playSeed);
    if (!q) {
      pausedForQuiz = false;
      return;
    }
    used.push(q.key);
    if (used.length > 80) used.shift();
    state.usedQ[state.level] = used;
    state.playSeed += 1;
    save();

    const npc = pickNpc(state.playSeed);
    const opener = npc.openers[state.playSeed % npc.openers.length];

    const overlay = $("#comic-overlay");
    const title = $("#comic-question");
    const opts = $("#comic-options");
    const fb = $("#comic-feedback");
    const cont = $("#comic-continue");
    const tag = $("#comic-tag");
    const npcName = $("#comic-npc-name");
    const npcFace = $("#comic-npc-face");
    const npcLine = $("#comic-npc-line");

    overlay.classList.add("show");
    if (tag) tag.textContent = npc.tag;
    if (npcName) npcName.textContent = npc.name;
    if (npcFace) {
      // Use your gator art in the speech pop-up face circle when available
      if (gatorImgReady) {
        npcFace.textContent = "";
        npcFace.classList.add("has-photo");
        npcFace.style.backgroundImage = "url('images/game/gator-sprite.png')";
      } else {
        npcFace.classList.remove("has-photo");
        npcFace.textContent = npc.emoji;
        npcFace.style.backgroundImage = "";
      }
    }
    if (npcLine) npcLine.textContent = opener;
    title.textContent = q.q;
    fb.className = "comic-feedback";
    fb.textContent = "";
    cont.style.display = "none";
    opts.innerHTML = "";

    gatorLine("quiz");
    // NPC speaks opener + question (meme speech)
    speak(opener + " " + q.q, "npc");

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
          fb.className = "comic-feedback show";
          fb.textContent =
            npc.emoji + " YESSS! +" + 35 + "  ·  " + q.explain;
          speak("Yes! " + q.explain, "npc");
          // Owl cheers after a correct quiz step
          setTimeout(function () {
            owlCheer(true);
          }, 900);
          world && (world._quizStep = true);
        } else {
          b.classList.add("wrong");
          const right = opts.children[q.correct];
          if (right) right.classList.add("correct");
          state.score += 5;
          fb.className = "comic-feedback show";
          fb.textContent =
            npc.emoji + " Close! " + q.explain + " (You still learned it.)";
          speak("Not quite. " + q.explain, "npc");
          setTimeout(function () {
            owlSay("Nice try! Now let's do the next!", true);
          }, 900);
        }
        updateHud();
        cont.style.display = "block";
      });
      opts.appendChild(b);
    });
  }

  function closeComicQuiz() {
    stopVoice();
    $("#comic-overlay").classList.remove("show");
    pausedForQuiz = false;
    if (world && world._quizStep) {
      world._quizStep = false;
      accomplishStep("quiz");
    }
    gatorSay("C'mon, let's keep going!", true);
  }

  function finishLevel() {
    stopLoop();
    stopVoice();
    gatorLine("win", true);
    setTimeout(function () {
      owlSay("Nice job! Now let's do the next!", true);
    }, 700);
    state.totalScore += state.score;
    state.completed[state.level] = true;
    if (state.unlocked < state.level + 2) state.unlocked = Math.min(TOTAL_LEVELS, state.level + 2);
    save();
    $("#fact-emoji").textContent = "🐊";
    $("#fact-title").textContent = "Level " + (state.level + 1) + " clear!";
    $("#fact-score").textContent =
      "Level score: " + state.score + " · Total: " + state.totalScore;
    const facts = [
      "Florida wetlands are home to American alligators and many other species.",
      "Nest temperature helps decide whether hatchlings are male or female.",
      "Gator holes hold water in dry times and help other animals too.",
      "Baby alligators have yellow stripes for camouflage.",
      "Adults bellow and slap water to communicate.",
      "Keep a safe distance from wild alligators - never feed them.",
    ];
    $("#fact-text").textContent = facts[state.level % facts.length];
    const g = $("#global-score");
    if (g) g.textContent = String(state.totalScore);
    show("fact");
  }

  /* ---------- Loop ---------- */
  function tick(ts) {
    if (!world || pausedForQuiz) {
      if (world) {
        if (world.owlCheer && world.owlCheer.t > 0) {
          // still tick cheer timer while paused lightly
        }
        drawWorld();
      }
      loopId = requestAnimationFrame(tick);
      return;
    }
    if (!world._last) world._last = ts;
    const dt = Math.min(0.05, (ts - world._last) / 1000);
    world._last = ts;
    world.time += dt;
    if (world.inv > 0) world.inv -= dt;
    if (world.owlCheer) {
      world.owlCheer.t -= dt;
      if (world.owlCheer.t <= 0) world.owlCheer = null;
    }

    updatePlayer(dt);
    updateHazards(dt);
    updateSkyDanger(dt);
    updateItems();
    updateQuizzes();
    if (!world.won) updateGoal();
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
    // reseed random-ish layout variation by playSeed
    world.hazards.forEach(function (h, i) {
      h.x += ((state.playSeed + i) % 7) * 3;
    });
    updateHud();
    $("#level-title").textContent =
      "Level " + (idx + 1) + " · " + stageName(idx);
    $("#level-blurb").textContent =
      "Dodge fire pits, closing caves, rattlers, hawks, panthers, and more. Grab snacks and beat the flag!";
    $("#play-hint").textContent =
      "Walk onto a ladder or snake-rope, then hold UP/W to climb (DOWN/S to go down). Space = jump.";
    show("play");
    world._last = 0;
    lastGatorLineAt = 0;
    lastOwlLineAt = 0;
    loopId = requestAnimationFrame(tick);
    // Exact level-start hype line (kid energy)
    gatorSay(GATOR_START_LINE, true);
  }

  function renderLevels() {
    const grid = $("#level-grid");
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
        (unlocked ? (i < 5 ? "🥚" : "🐊") : "🔒") +
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

  /* ---------- Touch pads ---------- */
  function bindTouch() {
    const map = [
      ["pad-left", "arrowleft"],
      ["pad-right", "arrowright"],
      ["pad-jump", " "],
      ["pad-up", "arrowup"],
      ["pad-down", "arrowdown"],
    ];
    map.forEach(function (pair) {
      const el = $("#" + pair[0]);
      if (!el) return;
      const key = pair[1];
      const on = function (e) {
        e.preventDefault();
        keys[key] = true;
      };
      const off = function (e) {
        e.preventDefault();
        keys[key] = false;
      };
      el.addEventListener("pointerdown", on);
      el.addEventListener("pointerup", off);
      el.addEventListener("pointerleave", off);
      el.addEventListener("pointercancel", off);
    });
  }

  function init() {
    load();
    canvas = $("#game-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;
    // Smooth for photo gator; platforms still look fine
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";

    loadBackgrounds(function () {
      // Photos ready - nothing else required; next draw uses them
    });
    loadGatorSprite(function () {
      // Custom baby gator art ready
    });

    window.addEventListener("keydown", function (e) {
      keys[e.key.toLowerCase()] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(e.key.toLowerCase()) >= 0 || e.code === "Space") {
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", function (e) {
      keys[e.key.toLowerCase()] = false;
    });

    $("#btn-start").addEventListener("click", function () {
      renderLevels();
      show("levels");
    });
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
    $("#comic-continue").addEventListener("click", closeComicQuiz);
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

    bindTouch();
    updateHud();
    syncVoiceButton();
    document.querySelectorAll("[data-voice-toggle]").forEach(function (btn) {
      btn.addEventListener("click", toggleVoice);
    });
    // Chrome loads voices async
    if (voiceSupported) {
      window.speechSynthesis.onvoiceschanged = function () {};
      try {
        window.speechSynthesis.getVoices();
      } catch (e) {}
    }
    const qc = window.GATOR_QUESTIONS ? window.GATOR_QUESTIONS.count : 0;
    const meta = $("#q-count");
    if (meta) meta.textContent = String(qc);
    show("start");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
