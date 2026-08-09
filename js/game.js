/**
 * Gator Life - original Florida wetland pixel adventure
 * 50 levels, mid-run comic quiz popups, localStorage progress
 * (Inspired by classic side-scrollers; original art/design - not affiliated with any trademarked game)
 */
(function () {
  "use strict";

  const STORAGE = "gatorLifeProgress_v2";
  const W = 320;
  const H = 180;
  const GRAV = 0.28;
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
  };

  let canvas, ctx;
  let loopId = null;
  let keys = {};
  let world = null;
  let pausedForQuiz = false;

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

  function bgForLevel(idx) {
    if (!bgImages.length) return null;
    return bgImages[idx % bgImages.length];
  }

  function stageName(i) {
    if (i < 10) return "Nestling";
    if (i < 20) return "Hatchling";
    if (i < 30) return "Juvenile";
    if (i < 40) return "Sub-adult";
    return "Adult";
  }

  function gatorScale(i) {
    if (i < 10) return 0.7;
    if (i < 20) return 0.85;
    if (i < 30) return 1;
    if (i < 40) return 1.15;
    return 1.35;
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
    const quizzes = [];
    const items = [];
    const len = 900 + idx * 28;
    const groundY = 150;

    // ground segments with gaps
    let x = 0;
    while (x < len) {
      const w = 80 + Math.floor(Math.random() * 60) + (idx < 5 ? 40 : 0);
      platforms.push({ x: x, y: groundY, w: w, h: 30 });
      const gap = 20 + Math.min(50, 10 + idx);
      x += w + (idx > 3 && Math.random() < 0.35 ? gap : 8);
    }
    // floating pads
    for (let i = 0; i < 4 + Math.floor(idx / 5); i++) {
      platforms.push({
        x: 120 + i * 140 + (idx % 7) * 9,
        y: 100 - (i % 3) * 18,
        w: 48 + (idx % 5) * 4,
        h: 10,
      });
    }

    // hazards
    const kinds = ["raccoon", "bird", "log", "snake", "boat", "rival"];
    const count = 3 + Math.floor(idx / 3);
    for (let i = 0; i < count; i++) {
      const k = kinds[Math.min(kinds.length - 1, Math.floor(i / 2) + Math.floor(idx / 12))];
      hazards.push({
        x: 160 + i * (90 - Math.min(40, idx)) + Math.random() * 30,
        y: groundY - 12,
        w: 14,
        h: 12,
        kind: k,
        vx: k === "bird" ? 0.6 + idx * 0.02 : k === "boat" ? 0.9 : 0.35,
        baseY: groundY - 12,
        phase: Math.random() * 10,
      });
    }

    // mid-level quiz triggers (2-4)
    const qn = 2 + (idx % 3);
    for (let i = 0; i < qn; i++) {
      quizzes.push({
        x: 180 + ((i + 1) * len) / (qn + 2),
        y: groundY - 40,
        hit: false,
      });
    }

    // snacks
    for (let i = 0; i < 8 + (idx % 5); i++) {
      items.push({
        x: 100 + i * 70,
        y: groundY - 28 - (i % 3) * 20,
        taken: false,
      });
    }

    return {
      idx: idx,
      len: len,
      platforms: platforms,
      hazards: hazards,
      quizzes: quizzes,
      items: items,
      goalX: len - 40,
      camera: 0,
      time: 0,
      inv: 0,
      won: false,
      player: {
        x: 40,
        y: 100,
        vx: 0,
        vy: 0,
        w: 16 * gatorScale(idx),
        h: 10 * gatorScale(idx),
        onGround: false,
        facing: 1,
      },
    };
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
    // Soft darken so pixel characters stay readable (not a second landscape)
    ctx.fillStyle = "rgba(10, 25, 18, 0.28)";
    ctx.fillRect(0, 0, W, H);
    // Light bottom shade for platform readability only
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.imageSmoothingEnabled = false;
  }

  function drawPlatforms(cam) {
    world.platforms.forEach(function (p) {
      const x = Math.floor(p.x - cam);
      if (x > W || x + p.w < 0) return;
      // Semi-transparent ledges so your photo still shows through
      ctx.fillStyle = "rgba(40, 55, 35, 0.55)";
      ctx.fillRect(x, p.y, p.w, p.h);
      ctx.fillStyle = "rgba(90, 140, 70, 0.75)";
      ctx.fillRect(x, p.y, p.w, 3);
    });
  }

  function drawPixelGator(p, scale, facing) {
    const x = Math.floor(p.x - world.camera);
    const y = Math.floor(p.y);
    const s = scale;
    ctx.save();
    if (facing < 0) {
      ctx.translate(x + p.w / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(x + p.w / 2), 0);
    }
    // body blocks - original design
    ctx.fillStyle = "#2f6b3a";
    ctx.fillRect(x, y + 2 * s, 12 * s, 6 * s);
    ctx.fillStyle = "#3d8a4a";
    ctx.fillRect(x + 2 * s, y + 1 * s, 8 * s, 3 * s);
    // head
    ctx.fillStyle = "#357a42";
    ctx.fillRect(x + 10 * s, y + 2 * s, 7 * s, 5 * s);
    // snout
    ctx.fillStyle = "#2a6035";
    ctx.fillRect(x + 15 * s, y + 4 * s, 5 * s, 2 * s);
    // eye
    ctx.fillStyle = "#f0e060";
    ctx.fillRect(x + 13 * s, y + 2 * s, 2 * s, 2 * s);
    ctx.fillStyle = "#111";
    ctx.fillRect(x + 14 * s, y + 2 * s, 1 * s, 1 * s);
    // legs
    ctx.fillStyle = "#245530";
    ctx.fillRect(x + 2 * s, y + 7 * s, 3 * s, 3 * s);
    ctx.fillRect(x + 8 * s, y + 7 * s, 3 * s, 3 * s);
    // hatchling stripes
    if (world.idx < 20) {
      ctx.fillStyle = "#e8d060";
      ctx.fillRect(x + 3 * s, y + 2 * s, 1 * s, 5 * s);
      ctx.fillRect(x + 6 * s, y + 2 * s, 1 * s, 5 * s);
      ctx.fillRect(x + 9 * s, y + 2 * s, 1 * s, 5 * s);
    }
    // egg form early
    if (world.idx < 5) {
      ctx.fillStyle = "#f0e8c8";
      ctx.fillRect(x + 2 * s, y, 10 * s, 12 * s);
      ctx.fillStyle = "#e0d0a0";
      ctx.fillRect(x + 4 * s, y + 2 * s, 2 * s, 2 * s);
    }
    ctx.restore();
  }

  function drawHazard(h, cam) {
    const x = Math.floor(h.x - cam);
    const y = Math.floor(h.y);
    if (x < -20 || x > W + 20) return;
    if (h.kind === "bird") {
      ctx.fillStyle = "#4a4a4a";
      ctx.fillRect(x, y, 12, 6);
      ctx.fillRect(x + 10, y - 2, 6, 4);
      ctx.fillStyle = "#222";
      ctx.fillRect(x + 2, y + 2, 3, 2);
    } else if (h.kind === "boat") {
      ctx.fillStyle = "#8b4513";
      ctx.fillRect(x, y, 20, 8);
      ctx.fillStyle = "#c0c0c0";
      ctx.fillRect(x + 6, y - 6, 3, 6);
    } else if (h.kind === "raccoon") {
      ctx.fillStyle = "#6b5b4b";
      ctx.fillRect(x, y, 12, 8);
      ctx.fillStyle = "#111";
      ctx.fillRect(x + 2, y + 2, 8, 2);
    } else if (h.kind === "snake") {
      ctx.fillStyle = "#5a7a3a";
      ctx.fillRect(x, y + 4, 16, 3);
      ctx.fillRect(x + 12, y, 4, 5);
    } else if (h.kind === "rival") {
      drawPixelGator({ x: h.x, y: h.y - 4, w: 18, h: 12 }, 1.1, -1);
      return;
    } else {
      ctx.fillStyle = "#5c4030";
      ctx.fillRect(x, y + 2, 16, 6);
    }
  }

  function drawWorld() {
    const p = world.player;
    const cam = world.camera;
    drawBackground(cam, world.time, world.idx);
    drawPlatforms(cam);

    // items
    world.items.forEach(function (it) {
      if (it.taken) return;
      const x = Math.floor(it.x - cam);
      ctx.fillStyle = "#e8c040";
      ctx.fillRect(x, it.y, 6, 6);
      ctx.fillStyle = "#fff8c0";
      ctx.fillRect(x + 1, it.y + 1, 2, 2);
    });

    // quiz markers (comic stars)
    world.quizzes.forEach(function (q) {
      if (q.hit) return;
      const x = Math.floor(q.x - cam);
      ctx.fillStyle = "#ffe566";
      ctx.fillRect(x, q.y, 12, 12);
      ctx.fillStyle = "#111";
      ctx.font = "bold 10px monospace";
      ctx.fillText("?", x + 3, q.y + 10);
    });

    // goal flag
    const gx = Math.floor(world.goalX - cam);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(gx, 100, 3, 50);
    ctx.fillStyle = "#3cb371";
    ctx.fillRect(gx + 3, 100, 14, 10);

    world.hazards.forEach(function (h) {
      drawHazard(h, cam);
    });

    drawPixelGator(p, gatorScale(world.idx), p.facing);

    // HUD strip on canvas
    ctx.fillStyle = "rgba(10,30,18,0.55)";
    ctx.fillRect(0, 0, W, 14);
    ctx.fillStyle = "#e8f5ec";
    ctx.font = "10px monospace";
    ctx.fillText(
      "LV " + (world.idx + 1) + "  " + stageName(world.idx) + "  SCORE " + state.score,
      4,
      10
    );
  }

  /* ---------- Physics ---------- */
  function solidAt(x, y, w, h) {
    for (let i = 0; i < world.platforms.length; i++) {
      const p = world.platforms[i];
      if (x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y) return p;
    }
    return null;
  }

  function updatePlayer(dt) {
    const p = world.player;
    const sp = 1.35 + Math.min(0.8, world.idx * 0.015);
    let move = 0;
    if (keys["arrowleft"] || keys["a"]) move -= 1;
    if (keys["arrowright"] || keys["d"]) move += 1;
    p.vx = move * sp;
    if (move) p.facing = move > 0 ? 1 : -1;
    if ((keys["arrowup"] || keys["w"] || keys[" "] || keys["z"]) && p.onGround) {
      p.vy = -4.6 - Math.min(0.8, world.idx * 0.02);
      p.onGround = false;
    }
    p.vy += GRAV;
    if (p.vy > 6) p.vy = 6;

    // horizontal
    p.x += p.vx;
    let hit = solidAt(p.x, p.y, p.w, p.h);
    if (hit) {
      if (p.vx > 0) p.x = hit.x - p.w - 0.01;
      else if (p.vx < 0) p.x = hit.x + hit.w + 0.01;
      p.vx = 0;
    }
    // vertical
    p.y += p.vy;
    p.onGround = false;
    hit = solidAt(p.x, p.y, p.w, p.h);
    if (hit) {
      if (p.vy > 0) {
        p.y = hit.y - p.h - 0.01;
        p.onGround = true;
      } else if (p.vy < 0) {
        p.y = hit.y + hit.h + 0.01;
      }
      p.vy = 0;
    }

    if (p.y > H + 20) {
      hurt();
      p.x = 40;
      p.y = 80;
      p.vy = 0;
      world.camera = 0;
    }

    world.camera = Math.max(0, Math.min(world.len - W, p.x - 80));
  }

  function hurt() {
    if (world.inv > 0) return;
    state.lives -= 1;
    world.inv = 1.2;
    updateHud();
    if (state.lives <= 0) {
      // gentle restart level
      state.lives = 3;
      state.score = Math.max(0, state.score - 20);
      startLevel(state.level, true);
    }
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function updateHazards(dt) {
    world.hazards.forEach(function (h) {
      h.phase += dt;
      if (h.kind === "bird") {
        h.x += h.vx * (Math.sin(h.phase) > 0 ? 1 : -1);
        h.y = h.baseY - 40 + Math.sin(h.phase * 2) * 16;
      } else if (h.kind === "boat") {
        h.x += h.vx * 0.8;
        if (h.x > world.len) h.x = -20;
      } else {
        h.x += Math.sin(h.phase) * h.vx * 0.5;
      }
      const box = { x: h.x, y: h.y, w: h.w || 14, h: h.h || 12 };
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
    if (world.player.x + world.player.w >= world.goalX) {
      world.won = true;
      finishLevel();
    }
  }

  /* ---------- Comic quiz ---------- */
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

    const overlay = $("#comic-overlay");
    const title = $("#comic-question");
    const opts = $("#comic-options");
    const fb = $("#comic-feedback");
    const cont = $("#comic-continue");
    overlay.classList.add("show");
    title.textContent = q.q;
    fb.className = "comic-feedback";
    fb.textContent = "";
    cont.style.display = "none";
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
          fb.className = "comic-feedback show";
          fb.textContent = "POW! Correct! +" + 35 + "  " + q.explain;
        } else {
          b.classList.add("wrong");
          const right = opts.children[q.correct];
          if (right) right.classList.add("correct");
          state.score += 5;
          fb.className = "comic-feedback show";
          fb.textContent = "Nice try! " + q.explain;
        }
        updateHud();
        cont.style.display = "block";
      });
      opts.appendChild(b);
    });
  }

  function closeComicQuiz() {
    $("#comic-overlay").classList.remove("show");
    pausedForQuiz = false;
  }

  function finishLevel() {
    stopLoop();
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
      if (world && !pausedForQuiz) drawWorld();
      else if (world) drawWorld();
      loopId = requestAnimationFrame(tick);
      return;
    }
    if (!world._last) world._last = ts;
    const dt = Math.min(0.05, (ts - world._last) / 1000);
    world._last = ts;
    world.time += dt;
    if (world.inv > 0) world.inv -= dt;

    updatePlayer(dt);
    updateHazards(dt);
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
      "Guide your gator through Florida wetlands. Jump gaps, dodge trouble, grab snacks, and answer comic quiz pop-ups!";
    $("#play-hint").textContent =
      "Move: arrows/WASD or on-screen pads · Jump: UP/W/SPACE/Z · Reach the green flag";
    show("play");
    world._last = 0;
    loopId = requestAnimationFrame(tick);
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
    ctx.imageSmoothingEnabled = false;

    loadBackgrounds(function () {
      // Photos ready - nothing else required; next draw uses them
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
    const qc = window.GATOR_QUESTIONS ? window.GATOR_QUESTIONS.count : 0;
    const meta = $("#q-count");
    if (meta) meta.textContent = String(qc);
    show("start");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
