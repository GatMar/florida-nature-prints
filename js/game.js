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
  const T = { BLOCK: 1, RIVER: 2, FISH: 3, BIGFISH: 4, ROAD: 5, HILL: 6 };

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

  const BG_FILES = [
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
  ];

  const $ = function (s) {
    return document.querySelector(s);
  };

  function haptic(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {}
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
    if (document.body) {
      document.body.classList.toggle("is-playing", name === "play");
    }
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

  function loadBackgrounds() {
    BG_FILES.forEach(function (file) {
      const img = new Image();
      img.onload = function () {
        if (img.naturalWidth) bgImages.push(img);
      };
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
    gatorImg.src = "images/game/gator-sprite.png?v=6";
  }

  function isWalkable(cell) {
    return (
      cell === T.RIVER ||
      cell === T.FISH ||
      cell === T.BIGFISH ||
      cell === T.ROAD ||
      cell === T.HILL
    );
  }

  function isBlocked(g, x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
    return g[y][x] === T.BLOCK;
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

    // Scatter fish on river tiles
    let fishLeft = 0;
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        if (g[y][x] !== T.RIVER) continue;
        if (x === start.x && y === start.y) continue;
        const r = seeded(idx, x * 31 + y * 17);
        if (r > 0.38) {
          g[y][x] = T.FISH;
          fishLeft++;
        } else if (r > 0.33) {
          g[y][x] = T.BIGFISH;
          fishLeft++;
        }
      }
    }
    // Guarantee some fish
    if (fishLeft < 12) {
      for (let y = 1; y < ROWS - 1 && fishLeft < 16; y++) {
        for (let x = 1; x < COLS - 1 && fishLeft < 16; x++) {
          if (g[y][x] === T.RIVER && !(x === start.x && y === start.y)) {
            g[y][x] = T.FISH;
            fishLeft++;
          }
        }
      }
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
      fishLeft: fishLeft,
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
      },
      bigs: bigs,
      inv: 0,
      time: 0,
      won: false,
      flash: 0,
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

  /* ---------- Drawing: river swamp (not arcade maze) ---------- */
  function drawPhotoBg() {
    const img = bgForLevel(world.idx);
    if (img) {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(W / iw, H / ih) * 1.05;
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = "#0c281c";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = "rgba(6, 18, 14, 0.38)";
    ctx.fillRect(0, 0, W, H);
  }

  function drawWorld() {
    const g = world.grid;
    const t = world.time;
    drawPhotoBg();

    // Soft land wash on blocked cells
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = g[y][x];
        const px = x * TILE;
        const py = y * TILE;
        if (cell === T.BLOCK) {
          ctx.fillStyle = "rgba(28, 48, 28, 0.28)";
          ctx.fillRect(px, py, TILE, TILE);
          // reeds
          if ((x + y) % 3 === 0) {
            ctx.strokeStyle = "rgba(50, 100, 55, 0.45)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px + 8, py + TILE);
            ctx.quadraticCurveTo(
              px + 10 + Math.sin(t + x) * 2,
              py + 8,
              px + 6,
              py + 2
            );
            ctx.stroke();
          }
        } else if (cell === T.RIVER || cell === T.FISH || cell === T.BIGFISH) {
          // Swirly river water
          const wave = Math.sin(t * 2 + x * 0.7 + y * 0.5) * 2;
          const grd = ctx.createLinearGradient(px, py, px + TILE, py + TILE);
          grd.addColorStop(0, "rgba(30, 110, 130, 0.72)");
          grd.addColorStop(0.5, "rgba(40, 140, 120, 0.65)");
          grd.addColorStop(1, "rgba(25, 90, 110, 0.7)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.moveTo(px, py + 4 + wave);
          ctx.quadraticCurveTo(px + TILE / 2, py - 2 + wave, px + TILE, py + 4 - wave);
          ctx.lineTo(px + TILE, py + TILE - 2);
          ctx.quadraticCurveTo(px + TILE / 2, py + TILE + 2, px, py + TILE - 2);
          ctx.closePath();
          ctx.fill();
          // bank edge
          ctx.strokeStyle = "rgba(90, 140, 70, 0.55)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (cell === T.ROAD) {
          ctx.fillStyle = "rgba(70, 65, 55, 0.78)";
          ctx.fillRect(px + 1, py + 6, TILE - 2, TILE - 12);
          ctx.strokeStyle = "rgba(230, 210, 80, 0.7)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(px + 2, py + TILE / 2);
          ctx.lineTo(px + TILE - 2, py + TILE / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (cell === T.HILL) {
          // Grassy hill mound
          ctx.fillStyle = "rgba(55, 110, 50, 0.82)";
          ctx.beginPath();
          ctx.ellipse(
            px + TILE / 2,
            py + TILE * 0.65,
            TILE * 0.48,
            TILE * 0.38,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
          ctx.fillStyle = "rgba(100, 160, 70, 0.7)";
          ctx.beginPath();
          ctx.ellipse(
            px + TILE / 2,
            py + TILE * 0.5,
            TILE * 0.32,
            TILE * 0.22,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Fish
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = g[y][x];
        if (cell !== T.FISH && cell !== T.BIGFISH) continue;
        const cx = x * TILE + TILE / 2;
        const cy = y * TILE + TILE / 2 + Math.sin(t * 4 + x) * 1.5;
        drawFish(cx, cy, cell === T.BIGFISH, t + x);
      }
    }

    // Big gators
    world.bigs.forEach(function (b) {
      drawBigGator(b);
    });

    // Little player gator
    drawLittleGator();

    // HUD strip
    ctx.fillStyle = "rgba(5, 18, 12, 0.72)";
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = "#e8f5ec";
    ctx.font = "bold 11px system-ui,sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      "Lv " +
        (world.idx + 1) +
        " · " +
        stageName(world.idx) +
        " · Fish " +
        world.fishLeft,
      8,
      12
    );

    // Splat + OUCH overlay
    if (world.splat > 0) {
      const a = Math.min(1, world.splat);
      // red splash blobs
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
      ctx.fillStyle = "#fff";
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
      ctx.fillStyle = "rgba(255,220,180," + Math.min(0.4, world.flash) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawFish(cx, cy, big, phase) {
    const s = big ? 1.35 : 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(phase * 2) * 0.25);
    ctx.fillStyle = big ? "#ffb347" : "#7ec8e3";
    ctx.beginPath();
    ctx.ellipse(0, 0, 6 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6 * s, 0);
    ctx.lineTo(-10 * s, -4 * s);
    ctx.lineTo(-10 * s, 4 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(3 * s, -0.5 * s, 1 * s, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.rotate(ang + Math.sin(b.wiggle) * 0.08);
    // Large menacing body
    const len = TILE * 1.55;
    const thick = TILE * 0.55;
    ctx.fillStyle = "#1f5c32";
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.45, thick * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    // snout
    ctx.fillStyle = "#2a7a42";
    ctx.beginPath();
    ctx.ellipse(len * 0.28, 0, len * 0.22, thick * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    // eye
    ctx.fillStyle = "#f0e060";
    ctx.beginPath();
    ctx.arc(len * 0.2, -thick * 0.2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(len * 0.22, -thick * 0.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // teeth hint
    ctx.fillStyle = "#fff";
    ctx.fillRect(len * 0.35, 2, 3, 2);
    ctx.fillRect(len * 0.42, 2, 3, 2);
    // label
    ctx.rotate(-ang);
    ctx.fillStyle = "rgba(255,80,80,0.9)";
    ctx.font = "bold 9px system-ui,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BIG", 0, -TILE * 0.55);
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

    ctx.save();
    ctx.translate(p.px, p.py + (onLand ? 0 : Math.sin(p.bob) * 2));
    ctx.rotate(ang);

    if (world.inv > 0 && Math.floor(world.time * 14) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Swim wake in water
    if (!onLand) {
      ctx.fillStyle = "rgba(200, 240, 255, 0.35)";
      ctx.beginPath();
      ctx.ellipse(-TILE * 0.35, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (gatorImgReady && gatorImg) {
      const s = TILE * 1.25;
      ctx.imageSmoothingEnabled = true;
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(0, s * 0.28, s * 0.28, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(gatorImg, -s / 2, -s / 2, s, s);
    } else {
      // fallback baby gator
      ctx.fillStyle = "#3cb371";
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(5, -2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Climb marker on hills/roads
    if (onLand) {
      ctx.rotate(-ang);
      ctx.fillStyle = "rgba(255, 230, 120, 0.9)";
      ctx.font = "bold 9px system-ui,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(cell === T.HILL ? "⬆ hill" : "road", 0, -TILE * 0.55);
    }

    ctx.restore();
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
    if (cell === T.FISH) {
      world.grid[p.y][p.x] = T.RIVER;
      world.fishLeft--;
      state.score += 15;
      haptic(8);
      updateHud();
      if (world.fishLeft <= 0) winLevel();
    } else if (cell === T.BIGFISH) {
      world.grid[p.y][p.x] = T.RIVER;
      world.fishLeft--;
      state.score += 40;
      world.flash = 0.25;
      haptic([10, 20, 10]);
      updateHud();
      if (world.fishLeft <= 0) winLevel();
    }
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
    $("#fact-emoji").textContent = "🐊";
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
    updateHud();
    const title = $("#level-title");
    if (title) {
      title.textContent = "Level " + (idx + 1) + " · " + stageName(idx);
    }
    const hint = $("#play-hint");
    if (hint) {
      hint.textContent =
        "Swim rivers · Climb hills & roads · Eat fish · Avoid BIG gators!";
    }
    show("play");
    world._last = 0;
    loopId = requestAnimationFrame(tick);
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

  function bindSwipe() {
    const stage = $("#stage-wrap") || canvas;
    if (!stage) return;
    let start = null;
    let lastDir = null;
    const pt = function (e) {
      if (e.touches && e.touches[0])
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    };
    const onStart = function (e) {
      if (pausedForQuiz) return;
      start = pt(e);
      lastDir = null;
      if (e.cancelable) e.preventDefault();
    };
    const onMove = function (e) {
      if (!start || !world) return;
      if (e.cancelable) e.preventDefault();
      const p = pt(e);
      const dx = p.x - start.x;
      const dy = p.y - start.y;
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
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
    const onEnd = function () {
      start = null;
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
