/**
 * Gator Life - original Florida wetland pixel adventure
 * 50 levels, mid-run comic quiz popups, localStorage progress
 * (Inspired by classic side-scrollers; original art/design - not affiliated with any trademarked game)
 */
(function () {
  "use strict";

  const STORAGE = "gatorLifeProgress_v4";
  // Portrait playfield: taller than wide so the action reads vertically
  const W = 360;
  const H = 560;
  // Soft gravity + easy jumps (kid-friendly)
  const GRAV = 0.38;
  const JUMP = -9.4;
  const MOVE_SPEED = 3.15;
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

  /* ---------- Voice disabled for now ---------- */
  function stopVoice() {}
  function speak() {}
  function gatorSay() {}
  function owlSay() {}
  function gatorLine() {}
  function owlCheer() {}

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
    // cache-bust so browsers load the transparent figurine
    gatorImg.src = "images/game/gator-sprite.png?v=3";
  }

  function bgForLevel(idx) {
    if (!bgImages.length) return null;
    return bgImages[idx % bgImages.length];
  }

  /** Display size for gator by stage - grows a little, stays easy to control */
  function gatorDrawSize(idx) {
    // Keep sizes modest so movement feels simple on a phone screen
    if (idx < 10) return { w: 56, h: 84 }; // baby
    if (idx < 25) return { w: 64, h: 96 }; // young
    if (idx < 40) return { w: 72, h: 108 }; // teen
    return { w: 80, h: 120 }; // adult
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

  /* ---------- Swamp labyrinth (no ladders — jump/step only) ---------- */
  function seeded(idx, n) {
    // Stable pseudo-random 0..1 for level layout
    const x = Math.sin(idx * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function addSteps(platforms, fromY, toY, startX, dir) {
    // Walkable mud steps between maze floors (NOT ladders)
    const rise = fromY - toY;
    const steps = Math.max(4, Math.round(rise / 28));
    const run = 36;
    for (let s = 0; s < steps; s++) {
      const x = dir > 0 ? startX + s * run : startX - s * run;
      platforms.push({
        x: x,
        y: fromY - ((s + 1) / steps) * rise,
        w: run + 14,
        h: 14,
        moss: true,
        step: true,
      });
    }
  }

  function buildLevel(idx) {
    const platforms = [];
    const hazards = [];
    const quizzes = [];
    const items = [];
    const water = [];
    const decor = [];
    const len = 1000 + Math.min(380, idx * 10);
    // Three swamp corridors (bottom → mid → top)
    const floors = [490, 355, 220];
    const groundY = floors[0];

    // --- Mud banks / corridor floors (segmented labyrinth) ---
    for (let f = 0; f < floors.length; f++) {
      const fy = floors[f];
      // Zigzag openings so it feels like a maze
      const openLeft = f % 2 === 0;
      let x = 0;
      let seg = 0;
      while (x < len) {
        // Wider banks early; slightly choppier later
        const bankW =
          130 +
          Math.floor(seeded(idx, f * 20 + seg) * 90) +
          (f === 0 ? 40 : 0) -
          Math.min(30, idx);
        const gap =
          f === 0
            ? 28 + Math.floor(seeded(idx, 100 + seg) * (20 + Math.min(30, idx)))
            : 22 + Math.floor(seeded(idx, 200 + seg) * 18);

        // Skip first gap on a floor if it would strand the player
        const placeGap = seg > 0 && !(f > 0 && seg === 1 && openLeft);

        if (placeGap && x + gap < len - 80) {
          // Swamp water under the gap
          water.push({ x: x, y: fy + 8, w: gap, h: H - fy });
          decor.push({ kind: "lily", x: x + gap * 0.3, y: fy + 6 });
          decor.push({ kind: "reed", x: x + 4, y: fy });
          decor.push({ kind: "reed", x: x + gap - 14, y: fy });
          x += gap;
        }

        const w = Math.min(bankW, len - x);
        if (w > 20) {
          platforms.push({
            x: x,
            y: fy,
            w: w,
            h: f === 0 ? 80 : 16,
            moss: true,
            floor: f,
          });
          // Snacks on banks
          if (seg % 2 === 0) {
            items.push({
              x: x + w * 0.45,
              y: fy - 32,
              taken: false,
            });
          }
          // Cypress knee / mud walls as maze blockers (not on first segment of start floor)
          if (seg > 0 && seg % 2 === 1 && f < floors.length - 1) {
            const wallH = floors[f] - floors[f + 1] - 20;
            const wx = openLeft ? x + w - 18 : x + 4;
            platforms.push({
              x: wx,
              y: floors[f + 1] + 12,
              w: 18,
              h: wallH,
              wall: true,
              cypress: true,
            });
            decor.push({ kind: "vine", x: wx, y: floors[f + 1] + 12, h: wallH });
          }
          // Reeds along mud
          if (seeded(idx, 300 + f * 10 + seg) > 0.4) {
            decor.push({ kind: "reed", x: x + 20, y: fy });
            decor.push({ kind: "reed", x: x + w * 0.6, y: fy });
          }
        }
        x += Math.max(w, 1);
        seg++;
      }
      // Side walls of the swamp tunnel
      platforms.push({ x: -8, y: fy - 100, w: 16, h: 110, wall: true, cypress: true });
      platforms.push({
        x: len - 8,
        y: fy - 100,
        w: 16,
        h: 110,
        wall: true,
        cypress: true,
      });
    }

    // --- Step-up mud paths between floors (jumpable stairs, no ladders) ---
    // Bottom → mid near left or right depending on level
    const stepA = 140 + Math.floor(seeded(idx, 7) * 80);
    addSteps(platforms, floors[0], floors[1], stepA, 1);
    // Mid → top further along
    const stepB = 420 + Math.floor(seeded(idx, 9) * (len * 0.25));
    addSteps(platforms, floors[1], floors[2], stepB, 1);
    // Alternate route mid → bottom near the end (for maze feel)
    if (idx >= 2) {
      addSteps(platforms, floors[0], floors[1], len - 280, -1);
    }
    // Extra mid floating moss pads
    for (let i = 0; i < 3; i++) {
      const px = 260 + i * 220 + (idx % 5) * 12;
      const py = floors[1] - 55 - (i % 2) * 20;
      if (px < len - 100) {
        platforms.push({ x: px, y: py, w: 88, h: 14, moss: true });
        items.push({ x: px + 36, y: py - 28, taken: false });
      }
    }

    // Hazards: swamp gas fires + slow critters on corridors
    const fireCount = idx === 0 ? 0 : idx < 6 ? 1 : idx < 18 ? 2 : 3;
    for (let i = 0; i < fireCount; i++) {
      const f = i % floors.length;
      const fx =
        200 +
        i * Math.floor((len - 280) / Math.max(1, fireCount)) +
        Math.floor(seeded(idx, 50 + i) * 40);
      hazards.push({
        kind: "fire",
        x: fx,
        y: floors[f] - 2,
        w: 34,
        h: 32,
        vx: 0,
        baseY: floors[f] - 2,
        phase: i,
        tall: 26,
      });
    }

    if (idx >= 2) {
      const kinds = ["rattler", "raccoon", "bird"];
      const k = kinds[idx % kinds.length];
      const f = idx % floors.length;
      const fly = k === "bird";
      hazards.push({
        kind: k,
        x: len * (0.35 + seeded(idx, 11) * 0.3),
        y: fly ? floors[f] - 110 : floors[f] - 38,
        w: 32,
        h: 30,
        vx: 0.4 + Math.min(0.3, idx * 0.008),
        baseY: fly ? floors[f] - 110 : floors[f] - 38,
        phase: 0,
      });
    }

    // Quiz on mid corridor
    if (idx >= 1) {
      quizzes.push({
        x: Math.floor(len * 0.5),
        y: floors[1] - 88,
        hit: false,
      });
    }

    // Flag on the top corridor near the far end
    const goalFloor = floors[floors.length - 1];
    const goalX = len - 100;
    // Ensure solid ground under the flag
    platforms.push({
      x: goalX - 40,
      y: goalFloor,
      w: 140,
      h: 16,
      moss: true,
    });

    const sz = gatorDrawSize(idx);
    const pw = sz.w;
    const ph = sz.h;
    return {
      idx: idx,
      len: len,
      floors: floors,
      platforms: platforms,
      water: water,
      decor: decor,
      climbs: [],
      hazards: hazards,
      quizzes: quizzes,
      items: items,
      explosions: [],
      asteroids: [],
      astroTimer: 9999,
      goalX: goalX,
      goalY: goalFloor,
      camera: 0,
      time: 0,
      inv: 0,
      won: false,
      steps: 0,
      nextStepAt: 3,
      owlCheer: null,
      climbHint: false,
      player: {
        x: 36,
        y: groundY - ph - 2,
        vx: 0,
        vy: 0,
        w: pw,
        h: ph,
        onGround: true,
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

  /* ---------- Swamp labyrinth drawing ---------- */
  function drawBackground(cam, t, idx) {
    const img = bgForLevel(idx);
    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";

    if (img) {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(W / iw, H / ih) * 1.1;
      const dw = iw * scale;
      const dh = ih * scale;
      const maxShift = Math.max(0, dw - W);
      const shift = maxShift ? ((cam * 0.12) % maxShift) : 0;
      ctx.drawImage(img, -shift, (H - dh) * 0.4, dw, dh);
    } else {
      // Deep swamp gradient fallback
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1a3a28");
      g.addColorStop(0.55, "#0f2a1c");
      g.addColorStop(1, "#0a1a12");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // Murky swamp wash (green-brown fog)
    ctx.fillStyle = "rgba(12, 40, 28, 0.42)";
    ctx.fillRect(0, 0, W, H);
    // Soft canopy shade at top
    const canopy = ctx.createLinearGradient(0, 0, 0, 120);
    canopy.addColorStop(0, "rgba(5, 20, 12, 0.55)");
    canopy.addColorStop(1, "rgba(5, 20, 12, 0)");
    ctx.fillStyle = canopy;
    ctx.fillRect(0, 0, W, 120);
    // Mist bands
    const mistY = 180 + Math.sin((t || 0) * 0.6) * 8;
    ctx.fillStyle = "rgba(160, 200, 170, 0.07)";
    ctx.fillRect(0, mistY, W, 40);
    ctx.fillRect(0, mistY + 90, W, 28);
  }

  function drawWater(cam, t) {
    if (!world.water) return;
    world.water.forEach(function (w) {
      const x = Math.floor(w.x - cam);
      if (x > W || x + w.w < 0) return;
      // Murky pool
      const g = ctx.createLinearGradient(0, w.y, 0, w.y + 50);
      g.addColorStop(0, "rgba(30, 70, 55, 0.85)");
      g.addColorStop(1, "rgba(15, 40, 30, 0.95)");
      ctx.fillStyle = g;
      ctx.fillRect(x, w.y, w.w, Math.min(w.h, H - w.y));
      // Ripple lines
      ctx.strokeStyle = "rgba(120, 180, 140, 0.35)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const yy = w.y + 8 + i * 10 + Math.sin((t || 0) * 3 + i + w.x) * 2;
        ctx.beginPath();
        ctx.moveTo(x + 4, yy);
        ctx.lineTo(x + w.w - 4, yy + Math.sin((t || 0) * 2 + i) * 2);
        ctx.stroke();
      }
      // Danger lip
      ctx.fillStyle = "rgba(40, 90, 60, 0.5)";
      ctx.fillRect(x, w.y, w.w, 4);
    });
  }

  function drawDecor(cam, t) {
    if (!world.decor) return;
    world.decor.forEach(function (d) {
      const x = Math.floor(d.x - cam);
      if (x < -40 || x > W + 40) return;
      if (d.kind === "reed") {
        ctx.strokeStyle = "rgba(60, 110, 50, 0.9)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const sway = Math.sin((t || 0) * 2 + d.x + i) * 3;
          ctx.beginPath();
          ctx.moveTo(x + i * 5, d.y);
          ctx.quadraticCurveTo(
            x + i * 5 + sway,
            d.y - 28,
            x + i * 5 + sway * 0.5,
            d.y - 48 - (i % 2) * 8
          );
          ctx.stroke();
          // Cattail tip
          ctx.fillStyle = "rgba(90, 60, 30, 0.85)";
          ctx.fillRect(x + i * 5 + sway * 0.5 - 2, d.y - 52 - (i % 2) * 8, 5, 10);
        }
      } else if (d.kind === "lily") {
        ctx.fillStyle = "rgba(50, 120, 70, 0.75)";
        ctx.beginPath();
        ctx.ellipse(x, d.y + 4, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(220, 180, 60, 0.7)";
        ctx.beginPath();
        ctx.arc(x + 2, d.y + 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (d.kind === "vine") {
        ctx.strokeStyle = "rgba(50, 100, 45, 0.7)";
        ctx.lineWidth = 2;
        for (let yy = 0; yy < (d.h || 40); yy += 12) {
          const wob = Math.sin(yy * 0.2 + (t || 0)) * 3;
          ctx.beginPath();
          ctx.moveTo(x + 4, d.y + yy);
          ctx.lineTo(x + 10 + wob, d.y + yy + 10);
          ctx.stroke();
        }
      }
    });
  }

  function drawPlatforms(cam) {
    world.platforms.forEach(function (p) {
      const x = Math.floor(p.x - cam);
      if (x > W + 4 || x + p.w < -4) return;

      if (p.wall || p.cypress) {
        // Cypress / mud pillar walls
        ctx.fillStyle = "rgba(55, 42, 28, 0.92)";
        ctx.fillRect(x, p.y, p.w, p.h);
        ctx.fillStyle = "rgba(40, 70, 40, 0.55)";
        for (let yy = p.y; yy < p.y + p.h; yy += 9) {
          ctx.fillRect(x + 2, yy, p.w - 4, 3);
        }
        // Moss cap
        ctx.fillStyle = "rgba(70, 120, 55, 0.8)";
        ctx.fillRect(x - 2, p.y, p.w + 4, 6);
        return;
      }

      // Mud bank body
      if (p.h > 30) {
        ctx.fillStyle = "rgba(48, 38, 24, 0.88)";
        ctx.fillRect(x, p.y, p.w, p.h);
        // Waterline under bank
        ctx.fillStyle = "rgba(25, 55, 42, 0.5)";
        ctx.fillRect(x, p.y + 10, p.w, 6);
      } else {
        ctx.fillStyle = "rgba(55, 45, 28, 0.82)";
        ctx.fillRect(x, p.y, p.w, p.h);
      }
      // Mossy top edge
      ctx.fillStyle = p.step
        ? "rgba(120, 160, 70, 0.95)"
        : "rgba(70, 130, 60, 0.92)";
      ctx.fillRect(x, p.y, p.w, 5);
      // Soft highlight so path is readable
      ctx.fillStyle = "rgba(160, 200, 100, 0.25)";
      ctx.fillRect(x + 2, p.y + 1, Math.max(0, p.w - 4), 2);
    });
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
    // Falling fireballs / sky hazards (read as burning rocks)
    world.asteroids.forEach(function (a) {
      const x = a.x - cam;
      const y = a.y;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a.rot);
      // long bright flame trail
      ctx.fillStyle = "rgba(255,80,0,0.55)";
      ctx.beginPath();
      ctx.moveTo(0, -a.r);
      ctx.lineTo(-10, -a.r - 28);
      ctx.lineTo(10, -a.r - 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,200,40,0.8)";
      ctx.beginPath();
      ctx.moveTo(0, -a.r + 2);
      ctx.lineTo(-5, -a.r - 18);
      ctx.lineTo(5, -a.r - 18);
      ctx.closePath();
      ctx.fill();
      // rock core
      ctx.fillStyle = "#3a2818";
      ctx.beginPath();
      ctx.arc(0, 0, a.r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6a4a30";
      ctx.beginPath();
      ctx.arc(-2, -2, a.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // hot rim
      ctx.strokeStyle = "#ff9a20";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, a.r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
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
      // Bright, obvious campfire / bonfire
      const t = world ? world.time : 0;
      const tall = 26 + flick * 10 + Math.sin(t * 10 + h.phase) * 3;
      const cx = x + h.w / 2;
      // logs
      ctx.fillStyle = "#4a2a12";
      ctx.fillRect(x + 2, y + 12, h.w - 4, 8);
      ctx.fillStyle = "#2a1608";
      ctx.fillRect(x + 4, y + 14, h.w - 8, 4);
      // outer flame
      ctx.fillStyle = "#ff3b00";
      ctx.beginPath();
      ctx.moveTo(cx, y + 14 - tall);
      ctx.quadraticCurveTo(cx + 16, y + 4, cx + 14, y + 16);
      ctx.lineTo(cx - 14, y + 16);
      ctx.quadraticCurveTo(cx - 16, y + 4, cx, y + 14 - tall);
      ctx.fill();
      // mid flame
      ctx.fillStyle = "#ff9a00";
      ctx.beginPath();
      ctx.moveTo(cx, y + 16 - tall * 0.75);
      ctx.quadraticCurveTo(cx + 10, y + 8, cx + 8, y + 16);
      ctx.lineTo(cx - 8, y + 16);
      ctx.quadraticCurveTo(cx - 10, y + 8, cx, y + 16 - tall * 0.75);
      ctx.fill();
      // bright core
      ctx.fillStyle = "#fff06a";
      ctx.beginPath();
      ctx.moveTo(cx, y + 18 - tall * 0.45);
      ctx.quadraticCurveTo(cx + 5, y + 12, cx + 4, y + 16);
      ctx.lineTo(cx - 4, y + 16);
      ctx.quadraticCurveTo(cx - 5, y + 12, cx, y + 18 - tall * 0.45);
      ctx.fill();
      // glow
      ctx.fillStyle = "rgba(255, 160, 40, 0.25)";
      ctx.beginPath();
      ctx.arc(cx, y + 8, 22, 0, Math.PI * 2);
      ctx.fill();
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
    drawWater(cam, world.time);
    drawPlatforms(cam);
    drawDecor(cam, world.time);

    // snacks - big golden bites
    world.items.forEach(function (it) {
      if (it.taken) return;
      const x = Math.floor(it.x - cam);
      const bob = Math.sin((world.time || 0) * 4 + it.x * 0.05) * 3;
      ctx.fillStyle = "#f0c040";
      ctx.beginPath();
      ctx.arc(x + 8, it.y + 8 + bob, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff8c0";
      ctx.beginPath();
      ctx.arc(x + 5, it.y + 5 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // quiz markers - big yellow ?
    world.quizzes.forEach(function (q) {
      if (q.hit) return;
      const x = Math.floor(q.x - cam);
      const bob = Math.sin((world.time || 0) * 3) * 4;
      ctx.fillStyle = "#ffe566";
      ctx.fillRect(x - 4, q.y + bob, 28, 28);
      ctx.strokeStyle = "#2f6b43";
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 4, q.y + bob, 28, 28);
      ctx.fillStyle = "#143d22";
      ctx.font = "bold 20px system-ui,sans-serif";
      ctx.fillText("?", x + 4, q.y + 21 + bob);
    });

    // goal flag - big and obvious at the end of the path
    const gx = Math.floor(world.goalX - cam);
    const gy = (world.goalY || 470) - 90;
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(gx, gy, 6, 90);
    ctx.fillStyle = "#3cb371";
    ctx.beginPath();
    ctx.moveTo(gx + 6, gy);
    ctx.lineTo(gx + 42, gy + 14);
    ctx.lineTo(gx + 6, gy + 28);
    ctx.closePath();
    ctx.fill();
    // "GO" marker above flag
    ctx.fillStyle = "rgba(255, 245, 160, 0.95)";
    ctx.font = "bold 14px system-ui,sans-serif";
    ctx.fillText("FLAG →", gx - 8, gy - 8);

    world.hazards.forEach(function (h) {
      drawHazard(h, cam);
    });

    drawPixelGator(p, gatorScale(world.idx), p.facing);
    drawOwlCompanion(p);

    // Simple top HUD
    ctx.fillStyle = "rgba(10,30,18,0.55)";
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = "#e8f5ec";
    ctx.font = "bold 12px system-ui,sans-serif";
    ctx.fillText(
      "Level " + (world.idx + 1) + "  ·  Score " + state.score,
      8,
      13
    );

    // Maze tip early in the level
    if (p.x < world.len * 0.22) {
      ctx.fillStyle = "rgba(255, 245, 180, 0.9)";
      ctx.fillRect(W / 2 - 118, H - 36, 236, 28);
      ctx.fillStyle = "#143d22";
      ctx.font = "bold 12px system-ui,sans-serif";
      ctx.fillText("Jump the mud steps · flag on top!", W / 2 - 100, H - 17);
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
  function solidAt(x, y, w, h) {
    for (let i = 0; i < world.platforms.length; i++) {
      const p = world.platforms[i];
      if (x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y) return p;
    }
    return null;
  }

  function inSwampWater(p) {
    if (!world.water) return false;
    for (let i = 0; i < world.water.length; i++) {
      const w = world.water[i];
      // Only count if feet dip into the murky gap
      if (
        p.x + p.w * 0.3 < w.x + w.w &&
        p.x + p.w * 0.7 > w.x &&
        p.y + p.h > w.y + 6 &&
        p.y + p.h < w.y + 50
      ) {
        return true;
      }
    }
    return false;
  }

  function updatePlayer(dt) {
    const p = world.player;
    let move = 0;
    if (keys["arrowleft"] || keys["a"]) move -= 1;
    if (keys["arrowright"] || keys["d"]) move += 1;

    const jumpKey = keys[" "] || keys["z"] || keys["arrowup"] || keys["w"];

    p.onClimb = false;
    p.vx = move * MOVE_SPEED;
    if (move) p.facing = move > 0 ? 1 : -1;

    if (jumpKey && p.onGround) {
      p.vy = JUMP;
      p.onGround = false;
    } else {
      p.vy += GRAV;
      if (p.vy > 10) p.vy = 10;
    }

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
        p.vy = 0;
      } else if (p.vy < 0) {
        p.y = hit.y + hit.h + 0.01;
        p.vy = 0;
      }
    }

    // Soft walls at ends of the level
    if (p.x < 8) p.x = 8;
    if (p.x + p.w > world.len - 8) p.x = world.len - 8 - p.w;

    // Fell into swamp water or off the map — soft respawn nearby
    if (inSwampWater(p) || p.y > H + 20) {
      hurt();
      // Snap back onto nearest lower bank
      const fy = (world.floors && world.floors[0]) || 490;
      p.x = Math.max(24, p.x - 70);
      p.y = fy - p.h - 2;
      p.vy = 0;
      p.onGround = true;
    }

    world.camera = Math.max(0, Math.min(world.len - W, p.x - 90));
    world.climbHint = false;
  }

  function hurt() {
    if (world.inv > 0) return;
    state.lives -= 1;
    world.inv = 2.0; // long invincibility - very forgiving
    // Knock back a little so you aren't stuck in the hazard
    if (world.player) {
      world.player.vx = -world.player.facing * 2;
      world.player.vy = -4;
      world.player.onGround = false;
    }
    updateHud();
    gatorLine("hurt");
    if (state.lives <= 0) {
      // gentle restart level - keep most of your score
      state.lives = 3;
      state.score = Math.max(0, state.score - 5);
      gatorSay("Reset! Let's go again!", true);
      startLevel(state.level, true);
    }
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function updateHazards(dt) {
    // Shrunk hurt-box vs drawn size so close jumps still feel fair
    function hurtBox(h) {
      const pad = 10;
      return {
        x: h.x + pad,
        y: h.y + pad * 0.5,
        w: Math.max(10, (h.w || 20) - pad * 2),
        h: Math.max(10, (h.h || 20) - pad),
      };
    }

    world.hazards.forEach(function (h) {
      h.phase += dt;

      if (h.kind === "fire") {
        h.y = h.baseY;
        const box = {
          x: h.x + 10,
          y: h.y - 18,
          w: Math.max(12, h.w - 20),
          h: 22,
        };
        const near =
          Math.abs(world.player.x - h.x) < 50 &&
          Math.abs(world.player.y - h.y) < 60;
        if (near && Math.random() < 0.008) gatorLine("fire");
        if (world.inv <= 0 && aabb(world.player, box)) hurt();
        return;
      }

      // Slow, predictable patrol
      if (h.kind === "hawk" || h.kind === "bird") {
        h.x += Math.sin(h.phase * 0.9) * h.vx;
        h.y = h.baseY + Math.sin(h.phase * 1.4) * 10;
      } else {
        h.x += Math.sin(h.phase * 0.7) * h.vx;
        h.y = h.baseY;
      }

      if (world.inv <= 0 && aabb(world.player, hurtBox(h))) hurt();
    });
  }

  function updateItems() {
    world.items.forEach(function (it) {
      if (it.taken) return;
      // Large pickup radius - easy snacks
      if (
        aabb(world.player, {
          x: it.x - 12,
          y: it.y - 12,
          w: 34,
          h: 34,
        })
      ) {
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
      // Generous touch zone for the yellow ?
      if (
        aabb(world.player, {
          x: q.x - 16,
          y: q.y - 16,
          w: 48,
          h: 48,
        })
      ) {
        q.hit = true;
        openComicQuiz();
      }
    });
  }

  function updateGoal() {
    const dist = world.goalX - (world.player.x + world.player.w);
    if (dist < 160 && dist > 20 && Math.random() < 0.012) gatorLine("nearFlag");
    if (world && world.len) {
      if (!world._mile) world._mile = 0;
      const mile = Math.floor((world.player.x / world.len) * 3);
      if (mile > world._mile && mile < 3) {
        world._mile = mile;
        if (mile >= 1) {
          gatorSay("Almost there!", false);
          accomplishStep("mile");
        }
      }
    }
    // Flag sits on the top swamp corridor — reach it to clear
    const gy = world.goalY || 220;
    if (
      world.player.x + world.player.w >= world.goalX - 24 &&
      world.player.y + world.player.h >= gy - 30 &&
      world.player.y < gy + 40
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
      // Figurines only (transparent PNG) in quiz bubble - never full photo frame
      if (gatorImgReady) {
        npcFace.textContent = "";
        npcFace.classList.add("has-photo");
        npcFace.style.backgroundImage =
          "url('images/game/gator-sprite.png?v=4')";
        npcFace.style.backgroundSize = "contain";
        npcFace.style.backgroundRepeat = "no-repeat";
        npcFace.style.backgroundPosition = "center bottom";
        npcFace.style.backgroundColor = "transparent";
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
    // Sky hazards removed - keep the game simple and calm
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
    updateHud();
    $("#level-title").textContent =
      "Level " + (idx + 1) + " · " + stageName(idx);
    const blurb = $("#level-blurb");
    if (blurb) {
      blurb.style.display = "none";
      blurb.textContent = "";
    }
    $("#play-hint").textContent =
      "← → move · Jump mud steps · Flag is on the top path →";
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

  /* ---------- Touch pads (Left · Jump · Right) ---------- */
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
      // Jump straight into the first unfinished unlocked level (less friction)
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
    $("#comic-continue").addEventListener("click", closeComicQuiz);
    const quitPlay = $("#btn-quit-play");
    if (quitPlay) {
      quitPlay.addEventListener("click", function () {
        stopLoop();
        stopVoice();
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
