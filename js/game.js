/**
 * Gator Life — Pac-Man style Florida swamp maze
 * Original educational game (not affiliated with any trademarked game).
 */
(function () {
  "use strict";

  const STORAGE = "gatorLifeProgress_v5_pac";
  const COLS = 15;
  const ROWS = 19;
  const TILE = 24;
  const W = COLS * TILE; // 360
  const H = ROWS * TILE; // 456
  const TOTAL_LEVELS = 50;
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
  let touchStart = null;
  const bgImages = [];
  let bgReady = false;

  // Same gallery photos used on the site (maze plays over these)
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
    "footprints-at-sunset.jpeg",
    "orange-afterglow.jpeg",
    "pink-bay-clouds.jpg",
    "sky-on-fire.jpeg",
    "sun-over-the-gulf.jpeg",
    "heron-silhouette.jpeg",
    "gator-in-the-green.jpeg",
    "great-blue-heron.jpeg",
  ];

  const $ = function (s) {
    return document.querySelector(s);
  };

  function loadBackgrounds() {
    let left = BG_FILES.length;
    if (!left) {
      bgReady = true;
      return;
    }
    BG_FILES.forEach(function (file) {
      const img = new Image();
      img.onload = img.onerror = function () {
        if (img.naturalWidth) bgImages.push(img);
        left -= 1;
        if (left <= 0) bgReady = true;
      };
      img.src = "images/prints/" + file;
    });
  }

  function bgForLevel(idx) {
    if (!bgImages.length) return null;
    return bgImages[idx % bgImages.length];
  }

  /* ---------- Haptics ---------- */
  function haptic(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (e) {}
  }

  /* ---------- Save / load ---------- */
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
    // Mobile: lock page chrome / bounce while playing
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
    if (i < 20) return "Juvenile";
    if (i < 35) return "Sub-adult";
    return "Adult";
  }

  /* ---------- Classic Pac-Man style maze templates ---------- */
  // # wall  . path  (pellets filled later)  15 wide × 19 tall
  // Designed as TOP-DOWN corridors (not platform terraces)
  const MAZE_TEMPLATES = [
    [
      "###############",
      "#.............#",
      "#.###.#.###.#.#",
      "#o#...#...#...#",
      "#.#.#####.#.###",
      "#.#.......#...#",
      "#.#####.#.###.#",
      "#.....#.#.....#",
      "###.#.#.#.#####",
      "....#.#.#.....#",
      "###.#.###.#####",
      "#.....#.......#",
      "#.###.#.#####.#",
      "#o#...#.....#.#",
      "#.#.#######.#.#",
      "#.#.........#.#",
      "#.#####.###.#.#",
      "#............o#",
      "###############",
    ],
    [
      "###############",
      "#......#......#",
      "#.####.#.####.#",
      "#o...........o#",
      "###.#.#####.###",
      "#...#...#.....#",
      "#.#####.#.###.#",
      "#.#.....#...#.#",
      "#.#.###.###.#.#",
      "....#.....#....",
      "#.#.###.###.#.#",
      "#.#...#.....#.#",
      "#.###.#.#####.#",
      "#.....#...#...#",
      "###.#####.#.###",
      "#o...........o#",
      "#.####.#.####.#",
      "#......#......#",
      "###############",
    ],
    [
      "###############",
      "#.............#",
      "#.##.#####.##.#",
      "#o#.........#o#",
      "#.#.##.#.##.#.#",
      "#...#..#..#...#",
      "###.#.###.#.###",
      "#...#.....#...#",
      "#.#.#######.#.#",
      "....#.....#....",
      "#.#.#######.#.#",
      "#...#.....#...#",
      "###.#.###.#.###",
      "#...#..#..#...#",
      "#.#.##.#.##.#.#",
      "#o#.........#o#",
      "#.##.#####.##.#",
      "#.............#",
      "###############",
    ],
  ];

  function seeded(idx, n) {
    const x = Math.sin(idx * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function templateToGrid(rows) {
    const g = [];
    for (let y = 0; y < ROWS; y++) {
      g[y] = [];
      const line = rows[y] || "###############";
      for (let x = 0; x < COLS; x++) {
        const ch = line[x] || "#";
        if (ch === "#") g[y][x] = 1;
        else if (ch === "o") g[y][x] = 3;
        else g[y][x] = 0; // path, pellets added next
      }
    }
    return g;
  }

  function mirrorH(rows) {
    return rows.map(function (line) {
      return line.split("").reverse().join("");
    });
  }

  function buildMaze(idx) {
    const base = MAZE_TEMPLATES[idx % MAZE_TEMPLATES.length];
    let rows = base.slice();
    if (Math.floor(idx / MAZE_TEMPLATES.length) % 2 === 1) {
      rows = mirrorH(rows);
    }
    // Light per-level tweak: flip a few interior wall/path cells (keep border)
    const g = templateToGrid(rows);
    for (let i = 0; i < 6 + (idx % 5); i++) {
      const x = 2 + Math.floor(seeded(idx, i) * (COLS - 4));
      const y = 2 + Math.floor(seeded(idx, i + 40) * (ROWS - 4));
      // Don't touch center house band or tunnels
      if (y === Math.floor(ROWS / 2)) continue;
      if (y >= 8 && y <= 10 && x >= 5 && x <= 9) continue;
      if (g[y][x] === 1 && seeded(idx, i + 70) > 0.55) g[y][x] = 0;
      else if (g[y][x] === 0 && seeded(idx, i + 90) > 0.72) {
        // only place wall if neighbors keep connectivity-ish
        let openN = 0;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
          const nx = x + d[0];
          const ny = y + d[1];
          if (nx > 0 && ny > 0 && nx < COLS - 1 && ny < ROWS - 1 && g[ny][nx] !== 1)
            openN++;
        });
        if (openN >= 3) g[y][x] = 1;
      }
    }

    // Ghost house (open center box) — classic Pac layout
    for (let y = 8; y <= 10; y++) {
      for (let x = 5; x <= 9; x++) g[y][x] = 0;
    }
    // House walls ring
    for (let x = 5; x <= 9; x++) {
      if (x !== 7) g[7][x] = 1;
      g[11][x] = 1;
    }
    g[8][5] = 1;
    g[9][5] = 1;
    g[10][5] = 1;
    g[8][9] = 1;
    g[9][9] = 1;
    g[10][9] = 1;
    g[7][7] = 0; // door

    // Side tunnels always open
    const midY = Math.floor(ROWS / 2);
    g[midY][0] = 0;
    g[midY][COLS - 1] = 0;
    g[midY][1] = 0;
    g[midY][COLS - 2] = 0;

    // Player start bottom center-ish
    const start = { x: 7, y: ROWS - 2 };
    // Ensure path at start
    g[start.y][start.x] = 0;
    g[start.y][start.x - 1] = 0;
    g[start.y][start.x + 1] = 0;
    g[start.y - 1][start.x] = 0;

    // Connectivity fix
    const reach = flood(g, start.x, start.y);
    for (let y = 1; y < ROWS - 1; y++) {
      for (let x = 1; x < COLS - 1; x++) {
        if (g[y][x] === 1) continue;
        if (reach[y][x]) continue;
        let cx = x;
        let cy = y;
        let guard = 0;
        while (!reach[cy][cx] && guard++ < 40) {
          if (cx > start.x) cx--;
          else if (cx < start.x) cx++;
          else if (cy > start.y) cy--;
          else if (cy < start.y) cy++;
          g[cy][cx] = 0;
          reach[cy][cx] = true;
        }
      }
    }

    // Pellets on paths (not in ghost house)
    let pellets = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (g[y][x] === 1) continue;
        if (y >= 8 && y <= 10 && x >= 5 && x <= 9) {
          g[y][x] = 0;
          continue;
        }
        if (g[y][x] === 3) {
          pellets++;
          continue;
        }
        // skip pure tunnel portals
        if (y === midY && (x === 0 || x === COLS - 1)) {
          g[y][x] = 0;
          continue;
        }
        g[y][x] = 2;
        pellets++;
      }
    }
    // Guarantee 4 power pellets if missing
    const powerSpots = [
      [1, 1],
      [COLS - 2, 1],
      [1, ROWS - 2],
      [COLS - 2, ROWS - 2],
    ];
    powerSpots.forEach(function (s) {
      let x = s[0];
      let y = s[1];
      if (g[y][x] === 1) {
        // nudge inward
        x = x < COLS / 2 ? x + 1 : x - 1;
        y = y < ROWS / 2 ? y + 1 : y - 1;
      }
      if (g[y][x] !== 1) {
        if (g[y][x] !== 3) {
          g[y][x] = 3;
          pellets++;
        }
      }
    });

    // recount
    pellets = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (g[y][x] === 2 || g[y][x] === 3) pellets++;
      }
    }

    const enemyCount = Math.min(6, 2 + Math.floor(idx / 5));
    const enemies = [];
    const kinds = ["🐦", "🐍", "🦝", "🚤", "🦅", "🐗"];
    const colors = ["#ff6b8a", "#7dcea0", "#f0c040", "#6eb5ff", "#c77dff", "#ff9f43"];
    for (let i = 0; i < enemyCount; i++) {
      const hx = 6 + (i % 3);
      const hy = 9;
      enemies.push({
        x: hx,
        y: hy,
        px: (hx + 0.5) * TILE,
        py: (hy + 0.5) * TILE,
        dir: DIR_KEYS[i % 4],
        kind: kinds[i % kinds.length],
        color: colors[i % colors.length],
        speed: 1.35 + Math.min(1.1, idx * 0.03) + i * 0.05,
        scatter: i % 2 === 0,
        homeX: hx,
        homeY: hy,
        eaten: false,
        release: 1.0 + i * 1.0,
      });
    }

    return {
      grid: g,
      pelletsLeft: pellets,
      player: {
        x: start.x,
        y: start.y,
        px: (start.x + 0.5) * TILE,
        py: (start.y + 0.5) * TILE,
        dir: "left",
        nextDir: "left",
        speed: 2.2,
        mouth: 0,
      },
      enemies: enemies,
      power: 0,
      inv: 0,
      time: 0,
      won: false,
      flash: 0,
      idx: idx,
    };
  }

  function flood(g, sx, sy) {
    const seen = [];
    for (let y = 0; y < ROWS; y++) {
      seen[y] = [];
      for (let x = 0; x < COLS; x++) seen[y][x] = false;
    }
    const q = [{ x: sx, y: sy }];
    seen[sy][sx] = true;
    while (q.length) {
      const c = q.shift();
      for (let i = 0; i < DIR_KEYS.length; i++) {
        const d = DIRS[DIR_KEYS[i]];
        let nx = c.x + d.x;
        let ny = c.y + d.y;
        // wrap tunnels
        if (ny === Math.floor(ROWS / 2)) {
          if (nx < 0) nx = COLS - 1;
          if (nx >= COLS) nx = 0;
        }
        if (ny < 0 || ny >= ROWS || nx < 0 || nx >= COLS) continue;
        if (g[ny][nx] === 1) continue;
        if (seen[ny][nx]) continue;
        seen[ny][nx] = true;
        q.push({ x: nx, y: ny });
      }
    }
    return seen;
  }

  function isWall(g, x, y) {
    // tunnel wrap on middle row
    if (y === Math.floor(ROWS / 2)) {
      if (x < 0 || x >= COLS) return false;
    }
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
    return g[y][x] === 1;
  }

  function tileCenter(tx, ty) {
    return { x: (tx + 0.5) * TILE, y: (ty + 0.5) * TILE };
  }

  /* ---------- Drawing (Pac-Man look over gallery photo) ---------- */
  function wallAt(g, x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
    return g[y][x] === 1;
  }

  function drawPhotoBackground() {
    const img = bgForLevel(world.idx);
    if (img) {
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = "#0a1a12";
      ctx.fillRect(0, 0, W, H);
    }
    // Darken so neon maze + dots read clearly
    ctx.fillStyle = "rgba(4, 12, 18, 0.52)";
    ctx.fillRect(0, 0, W, H);
  }

  function drawMaze() {
    const g = world.grid;
    const t = world.time;

    drawPhotoBackground();

    // Soft path tint only (not solid platforms)
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (g[y][x] === 1) continue;
        ctx.fillStyle = "rgba(0, 20, 40, 0.22)";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }

    // Classic Pac-Man style wall outlines (rounded corridors)
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const wallColor = world.power > 0 ? "#9ec9ff" : "#3ec6ff";
    const wallOuter = world.power > 0 ? "#cfe6ff" : "#7de0ff";

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (g[y][x] !== 1) continue;
        const px = x * TILE;
        const py = y * TILE;
        const m = 3.5;
        // Fill very subtle so photo still shows through walls
        ctx.fillStyle = "rgba(10, 40, 70, 0.35)";
        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(px + m, py + m, TILE - m * 2, TILE - m * 2, 5)
          : ctx.rect(px + m, py + m, TILE - m * 2, TILE - m * 2);
        ctx.fill();

        // Draw edges only where wall meets path (classic maze lines)
        ctx.strokeStyle = wallOuter;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        // top
        if (!wallAt(g, x, y - 1)) {
          ctx.moveTo(px + m, py + m);
          ctx.lineTo(px + TILE - m, py + m);
        }
        // bottom
        if (!wallAt(g, x, y + 1)) {
          ctx.moveTo(px + m, py + TILE - m);
          ctx.lineTo(px + TILE - m, py + TILE - m);
        }
        // left
        if (!wallAt(g, x - 1, y)) {
          ctx.moveTo(px + m, py + m);
          ctx.lineTo(px + m, py + TILE - m);
        }
        // right
        if (!wallAt(g, x + 1, y)) {
          ctx.moveTo(px + TILE - m, py + m);
          ctx.lineTo(px + TILE - m, py + TILE - m);
        }
        ctx.stroke();

        // Inner neon edge
        ctx.strokeStyle = wallColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // Pellets + power dots
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = g[y][x];
        const cx = x * TILE + TILE / 2;
        const cy = y * TILE + TILE / 2;
        if (cell === 2) {
          ctx.fillStyle = "#ffe566";
          ctx.shadowColor = "rgba(255, 230, 100, 0.7)";
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (cell === 3) {
          const pulse = 5.5 + Math.sin(t * 7 + x + y) * 1.4;
          ctx.fillStyle = "#fff8dc";
          ctx.shadowColor = "rgba(255, 255, 180, 0.9)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Ghost house — pink door like classic Pac-Man
    ctx.strokeStyle = "rgba(255, 160, 200, 0.85)";
    ctx.lineWidth = 2;
    ctx.strokeRect(5 * TILE + 4, 7 * TILE + 4, 5 * TILE - 8, 4 * TILE - 8);
    ctx.fillStyle = "rgba(255, 120, 180, 0.9)";
    ctx.fillRect(7 * TILE + 2, 7 * TILE + 2, TILE - 4, 4);
  }

  function drawPlayer() {
    const p = world.player;
    const powered = world.power > 0;
    ctx.save();
    ctx.translate(p.px, p.py);
    const ang =
      p.dir === "right"
        ? 0
        : p.dir === "down"
          ? Math.PI / 2
          : p.dir === "left"
            ? Math.PI
            : -Math.PI / 2;
    ctx.rotate(ang);

    if (world.inv > 0 && Math.floor(world.time * 12) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    // Pac-Man style chomp body (reads top-down, not climbing)
    const mouth = 0.28 + Math.abs(Math.sin(p.mouth)) * 0.32;
    ctx.fillStyle = powered ? "#b8ff6a" : "#3ddc84";
    ctx.beginPath();
    ctx.arc(0, 0, TILE * 0.4, mouth, Math.PI * 2 - mouth, false);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    // Eye
    ctx.fillStyle = "#0a2010";
    ctx.beginPath();
    ctx.arc(TILE * 0.06, -TILE * 0.16, 2.3, 0, Math.PI * 2);
    ctx.fill();

    // Tiny gator face cue inside the chomp circle
    if (gatorImgReady && gatorImg) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      const s = TILE * 0.55;
      ctx.drawImage(gatorImg, -s * 0.35, -s * 0.45, s * 0.7, s * 0.7);
      ctx.restore();
    }

    if (powered) {
      ctx.strokeStyle = "rgba(255, 255, 120, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, TILE * 0.52 + Math.sin(world.time * 12) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawEnemies() {
    world.enemies.forEach(function (e) {
      if (e.eaten && world.power <= 0) {
        // eyes only returning home
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(e.px - 4, e.py - 2, 3, 0, Math.PI * 2);
        ctx.arc(e.px + 4, e.py - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#223";
        ctx.beginPath();
        ctx.arc(e.px - 3, e.py - 2, 1.2, 0, Math.PI * 2);
        ctx.arc(e.px + 5, e.py - 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      const scared = world.power > 0 && !e.eaten;
      const r = TILE * 0.4;
      ctx.fillStyle = scared
        ? world.power < 2 && Math.floor(world.time * 8) % 2
          ? "#fff"
          : "#4a6cff"
        : e.color;
      // Ghost body
      ctx.beginPath();
      ctx.arc(e.px, e.py - 2, r, Math.PI, 0);
      ctx.lineTo(e.px + r, e.py + r * 0.7);
      for (let i = 0; i < 3; i++) {
        const fx = e.px + r - (i + 0.5) * ((2 * r) / 3);
        ctx.quadraticCurveTo(
          fx + r / 6,
          e.py + r * 0.2,
          fx,
          e.py + r * 0.7
        );
      }
      ctx.closePath();
      ctx.fill();
      // Face / emoji
      ctx.font = scared ? "10px serif" : "13px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(scared ? "😰" : e.kind, e.px, e.py - 1);
    });
  }

  function drawHudStrip() {
    ctx.fillStyle = "rgba(5, 20, 12, 0.75)";
    ctx.fillRect(0, 0, W, 18);
    ctx.fillStyle = "#e8f5ec";
    ctx.font = "bold 11px system-ui,sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(
      "Lv " +
        (world.idx + 1) +
        "  ·  " +
        stageName(world.idx) +
        "  ·  Snacks " +
        world.pelletsLeft,
      8,
      12
    );
    if (world.power > 0) {
      ctx.fillStyle = "#ffe566";
      ctx.fillText("POWER " + world.power.toFixed(1) + "s", W - 100, 12);
    }
  }

  function drawWorld() {
    drawMaze();
    drawEnemies();
    drawPlayer();
    drawHudStrip();
    if (world.flash > 0) {
      ctx.fillStyle = "rgba(255,255,200," + Math.min(0.45, world.flash) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ---------- Movement helpers ---------- */
  function nearCenter(px, py, tx, ty) {
    const c = tileCenter(tx, ty);
    return Math.abs(px - c.x) < 2.2 && Math.abs(py - c.y) < 2.2;
  }

  function trySetDir(entity, dir, isPlayer) {
    const d = DIRS[dir];
    if (!d) return false;
    // Can turn if next tile is free (from current tile)
    const tx = entity.x;
    const ty = entity.y;
    let nx = tx + d.x;
    let ny = ty + d.y;
    if (ty === Math.floor(ROWS / 2)) {
      if (nx < 0) nx = COLS - 1;
      if (nx >= COLS) nx = 0;
    }
    if (isWall(world.grid, nx, ny)) return false;
    entity.dir = dir;
    return true;
  }

  function moveEntity(entity, speed, isPlayer) {
    // Snap toward grid center on axis not moving
    const d = DIRS[entity.dir] || DIRS.left;
    const c = tileCenter(entity.x, entity.y);

    // Queued turn for player at centers
    if (isPlayer && entity.nextDir && entity.nextDir !== entity.dir) {
      if (nearCenter(entity.px, entity.py, entity.x, entity.y)) {
        if (trySetDir(entity, entity.nextDir, true)) {
          entity.px = c.x;
          entity.py = c.y;
        }
      }
    }

    // If about to hit wall, stop at center (player) or pick new dir (enemy)
    let nx = entity.x + d.x;
    let ny = entity.y + d.y;
    if (entity.y === Math.floor(ROWS / 2)) {
      if (nx < -1) nx = COLS;
      if (nx > COLS) nx = -1;
    }
    const blocked = isWall(world.grid, nx, ny);
    if (blocked) {
      // approach center then stop / turn
      const ax = d.x !== 0;
      if (ax) {
        if ((d.x > 0 && entity.px >= c.x) || (d.x < 0 && entity.px <= c.x)) {
          entity.px = c.x;
          if (!isPlayer) pickEnemyDir(entity);
          return;
        }
      } else {
        if ((d.y > 0 && entity.py >= c.y) || (d.y < 0 && entity.py <= c.y)) {
          entity.py = c.y;
          if (!isPlayer) pickEnemyDir(entity);
          return;
        }
      }
    }

    entity.px += d.x * speed;
    entity.py += d.y * speed;

    // Update tile when crossing midlines
    const newTx = Math.floor(entity.px / TILE);
    const newTy = Math.floor(entity.py / TILE);
    // Tunnel wrap
    if (entity.py >= Math.floor(ROWS / 2) * TILE && entity.py < (Math.floor(ROWS / 2) + 1) * TILE) {
      if (entity.px < 0) entity.px += W;
      if (entity.px >= W) entity.px -= W;
    }
    const tx2 = ((Math.floor(entity.px / TILE) % COLS) + COLS) % COLS;
    const ty2 = Math.floor(entity.py / TILE);
    if (ty2 >= 0 && ty2 < ROWS && !isWall(world.grid, tx2, ty2)) {
      entity.x = tx2;
      entity.y = ty2;
    }

    // Keep on path centers for opposite axis
    if (d.x !== 0) entity.py += (c.y - entity.py) * 0.35;
    if (d.y !== 0) entity.px += (c.x - entity.px) * 0.35;
  }

  function pickEnemyDir(e) {
    const options = [];
    const reverse = {
      left: "right",
      right: "left",
      up: "down",
      down: "up",
    };
    DIR_KEYS.forEach(function (dir) {
      if (dir === reverse[e.dir] && options.length) return; // prefer not reverse
      const d = DIRS[dir];
      const nx = e.x + d.x;
      const ny = e.y + d.y;
      if (!isWall(world.grid, nx, ny)) options.push(dir);
    });
    if (!options.length) {
      DIR_KEYS.forEach(function (dir) {
        const d = DIRS[dir];
        if (!isWall(world.grid, e.x + d.x, e.y + d.y)) options.push(dir);
      });
    }
    if (!options.length) return;

    const p = world.player;
    // Target: chase player, or run away when powered, or go home if eaten
    let tx = p.x;
    let ty = p.y;
    if (e.eaten) {
      tx = e.homeX;
      ty = e.homeY;
    } else if (world.power > 0) {
      tx = e.homeX;
      ty = e.homeY;
    } else if (e.scatter) {
      tx = e.homeX + (e.kind.length % 3);
      ty = 1;
    }

    let best = options[0];
    let bestScore = 1e9;
    options.forEach(function (dir) {
      const d = DIRS[dir];
      const nx = e.x + d.x;
      const ny = e.y + d.y;
      const dist = Math.abs(nx - tx) + Math.abs(ny - ty);
      // slight randomness
      const score = dist + seeded(world.idx, e.x * 3 + e.y + world.time) * 0.4;
      if (score < bestScore) {
        bestScore = score;
        best = dir;
      }
    });
    e.dir = best;
  }

  /* ---------- Game logic ---------- */
  function collectAtPlayer() {
    const p = world.player;
    const cell = world.grid[p.y][p.x];
    if (cell === 2) {
      world.grid[p.y][p.x] = 0;
      world.pelletsLeft--;
      state.score += 10;
      haptic(8);
      updateHud();
      if (world.pelletsLeft <= 0) winLevel();
    } else if (cell === 3) {
      world.grid[p.y][p.x] = 0;
      world.pelletsLeft--;
      state.score += 50;
      world.power = 6.5;
      world.flash = 0.35;
      haptic([12, 30, 12]);
      updateHud();
      // Revive eaten enemies flags
      world.enemies.forEach(function (e) {
        if (e.eaten && e.x === e.homeX) e.eaten = false;
      });
      if (world.pelletsLeft <= 0) winLevel();
      // Occasional quiz on power pellet (every other level)
      if (world.idx % 2 === 1 && Math.random() < 0.35) {
        openComicQuiz();
      }
    }
  }

  function collideEnemies() {
    const p = world.player;
    world.enemies.forEach(function (e) {
      if (e.release > 0) return;
      const dx = p.px - e.px;
      const dy = p.py - e.py;
      if (dx * dx + dy * dy > (TILE * 0.55) * (TILE * 0.55)) return;
      if (world.power > 0 && !e.eaten) {
        e.eaten = true;
        state.score += 100;
        haptic([10, 20, 30]);
        updateHud();
      } else if (!e.eaten && world.inv <= 0) {
        hurt();
      }
    });
  }

  function hurt() {
    state.lives -= 1;
    world.inv = 2.2;
    world.flash = 0.4;
    haptic([40, 40, 60]);
    updateHud();
    // Reset positions
    const start = { x: 2, y: ROWS - 3 };
    world.player.x = start.x;
    world.player.y = start.y;
    world.player.px = (start.x + 0.5) * TILE;
    world.player.py = (start.y + 0.5) * TILE;
    world.player.dir = "right";
    world.player.nextDir = "right";
    world.enemies.forEach(function (e, i) {
      e.x = e.homeX;
      e.y = e.homeY;
      e.px = (e.homeX + 0.5) * TILE;
      e.py = (e.homeY + 0.5) * TILE;
      e.eaten = false;
      e.release = 0.8 + i * 0.6;
    });
    if (state.lives <= 0) {
      state.lives = 3;
      state.score = Math.max(0, state.score - 30);
      startLevel(state.level, true);
    }
  }

  function winLevel() {
    if (world.won) return;
    world.won = true;
    stopLoop();
    haptic([20, 40, 20, 40, 60]);
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
      "American alligators live in Florida wetlands, lakes, and swamps.",
      "Gators are ambush hunters — patience is a superpower.",
      "Baby alligators have bright yellow stripes for camouflage.",
      "Never feed wild alligators — it teaches them to approach people.",
      "Gator holes hold water in dry season and help other wildlife too.",
      "A full-grown American alligator can be over 10 feet long.",
    ];
    $("#fact-text").textContent = facts[state.level % facts.length];
    const g = $("#global-score");
    if (g) g.textContent = String(state.totalScore);
    show("fact");
  }

  function update(dt) {
    if (!world || world.won || pausedForQuiz) return;
    world.time += dt;
    if (world.power > 0) world.power -= dt;
    if (world.inv > 0) world.inv -= dt;
    if (world.flash > 0) world.flash -= dt;

    const p = world.player;
    // Input → nextDir
    if (keys["arrowleft"] || keys["a"]) p.nextDir = "left";
    if (keys["arrowright"] || keys["d"]) p.nextDir = "right";
    if (keys["arrowup"] || keys["w"]) p.nextDir = "up";
    if (keys["arrowdown"] || keys["s"]) p.nextDir = "down";

    // reverse immediately if free
    if (p.nextDir) {
      const rev = { left: "right", right: "left", up: "down", down: "up" };
      if (p.nextDir === rev[p.dir] || nearCenter(p.px, p.py, p.x, p.y)) {
        trySetDir(p, p.nextDir, true);
      }
    }

    moveEntity(p, p.speed, true);
    p.mouth += dt * 14;
    collectAtPlayer();

    world.enemies.forEach(function (e) {
      if (e.release > 0) {
        e.release -= dt;
        return;
      }
      // Decision at tile centers
      if (nearCenter(e.px, e.py, e.x, e.y)) {
        e.px = (e.x + 0.5) * TILE;
        e.py = (e.y + 0.5) * TILE;
        pickEnemyDir(e);
        if (e.eaten && e.x === e.homeX && e.y === e.homeY) {
          e.eaten = false;
        }
      }
      const spd =
        e.eaten ? 3.2 : world.power > 0 ? e.speed * 0.65 : e.speed;
      moveEntity(e, spd, false);
    });

    collideEnemies();
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
    world = buildMaze(idx);
    updateHud();
    $("#level-title").textContent =
      "Level " + (idx + 1) + " · " + stageName(idx);
    const blurb = $("#level-blurb");
    if (blurb) blurb.style.display = "none";
    $("#play-hint").textContent =
      "Top-down maze · Eat all dots · Big dots = power · Swipe or D-pad";
    show("play");
    world._last = 0;
    loopId = requestAnimationFrame(tick);
    haptic(15);
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

  /* ---------- Quiz (kept light) ---------- */
  const NPCS = [
    {
      name: "Rita the Rattler",
      emoji: "🐍",
      tag: "SNAKE SAYS",
      openers: ["Ssssnack break quiz!", "Quick swamp question:"],
    },
    {
      name: "Rascal Raccoon",
      emoji: "🦝",
      tag: "RASCAL ASKS",
      openers: ["Hold up — quiz time!", "Bandit brain teaser:"],
    },
  ];

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

    const npc = NPCS[state.playSeed % NPCS.length];
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
      npcFace.classList.remove("has-photo");
      npcFace.textContent = npc.emoji;
      npcFace.style.backgroundImage = "";
    }
    if (npcLine) npcLine.textContent = opener;
    title.textContent = q.q;
    fb.className = "comic-feedback";
    fb.textContent = "";
    cont.style.display = "none";
    opts.innerHTML = "";
    haptic(10);

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
          fb.className = "comic-feedback show";
          fb.textContent = npc.emoji + " Yes! " + q.explain;
          haptic([10, 20, 10]);
        } else {
          b.classList.add("wrong");
          const right = opts.children[q.correct];
          if (right) right.classList.add("correct");
          state.score += 5;
          fb.className = "comic-feedback show";
          fb.textContent = npc.emoji + " Close! " + q.explain;
          haptic(25);
        }
        updateHud();
        cont.style.display = "block";
      });
      opts.appendChild(b);
    });
  }

  function closeComicQuiz() {
    const overlay = $("#comic-overlay");
    if (overlay) overlay.classList.remove("show");
    pausedForQuiz = false;
  }

  /* ---------- Input (mobile-first) ---------- */
  function setDir(dir) {
    if (!dir) return;
    keys["arrow" + dir] = true;
    // clear other arrow keys so only one direction is held
    DIR_KEYS.forEach(function (d) {
      if (d !== dir) keys["arrow" + d] = false;
    });
    if (world && world.player) {
      world.player.nextDir = dir;
      // reverse immediately feels snappy on phone
      const rev = { left: "right", right: "left", up: "down", down: "up" };
      if (world.player.dir === rev[dir]) {
        trySetDir(world.player, dir, true);
      }
    }
  }

  function clearDir(dir) {
    if (dir) keys["arrow" + dir] = false;
  }

  function bindPads() {
    const dpad = $("#dpad");
    const buttons = ["pad-left", "pad-right", "pad-up", "pad-down"];
    buttons.forEach(function (id) {
      const el = $("#" + id);
      if (!el) return;
      const dir = el.getAttribute("data-dir");
      const on = function (e) {
        e.preventDefault();
        e.stopPropagation();
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
      // Don't clear on leave if capture holds — only when pointer ends
      el.addEventListener("lostpointercapture", off);
    });

    // Sliding finger across the D-pad switches direction
    if (dpad) {
      dpad.addEventListener(
        "pointermove",
        function (e) {
          if (e.buttons === 0 && e.pressure === 0) return;
          const target = document.elementFromPoint(e.clientX, e.clientY);
          if (!target) return;
          const btn = target.closest("[data-dir]");
          if (!btn) return;
          const dir = btn.getAttribute("data-dir");
          if (dir) setDir(dir);
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

    const point = function (e) {
      if (e.touches && e.touches[0]) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const onStart = function (e) {
      // Don't steal quiz taps
      if (pausedForQuiz) return;
      if (e.target && e.target.closest && e.target.closest(".comic-overlay.show"))
        return;
      const p = point(e);
      start = { x: p.x, y: p.y };
      lastDir = null;
      // prevent page scroll while swiping on maze
      if (e.cancelable) e.preventDefault();
    };

    const onMove = function (e) {
      if (!start || !world || !world.player) return;
      if (e.cancelable) e.preventDefault();
      const p = point(e);
      const dx = p.x - start.x;
      const dy = p.y - start.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      // Continuous swipe steering (feels like a virtual stick)
      if (absX < 16 && absY < 16) return;
      let dir;
      if (absX > absY) dir = dx > 0 ? "right" : "left";
      else dir = dy > 0 ? "down" : "up";
      if (dir !== lastDir) {
        lastDir = dir;
        setDir(dir);
        haptic(4);
        // reset origin so small course-corrections work
        start = { x: p.x, y: p.y };
      }
    };

    const onEnd = function (e) {
      if (!start || !world || !world.player) {
        start = null;
        return;
      }
      const p =
        e.changedTouches && e.changedTouches[0]
          ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
          : point(e);
      const dx = p.x - start.x;
      const dy = p.y - start.y;
      start = null;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
      else setDir(dy > 0 ? "down" : "up");
    };

    // Pointer events (works for mouse + touch)
    stage.addEventListener("pointerdown", onStart, { passive: false });
    stage.addEventListener("pointermove", onMove, { passive: false });
    stage.addEventListener("pointerup", onEnd, { passive: true });
    stage.addEventListener("pointercancel", function () {
      start = null;
    });

    // Extra touch listeners for older iOS
    stage.addEventListener("touchstart", onStart, { passive: false });
    stage.addEventListener("touchmove", onMove, { passive: false });
    stage.addEventListener("touchend", onEnd, { passive: true });
  }

  function loadGator() {
    gatorImg = new Image();
    gatorImg.onload = function () {
      gatorImgReady = true;
    };
    gatorImg.onerror = function () {
      gatorImgReady = false;
    };
    gatorImg.src = "images/game/gator-sprite.png?v=5";
  }

  function init() {
    load();
    canvas = $("#game-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;
    // Polyfill roundRect if missing
    if (!ctx.roundRect) {
      ctx.roundRect = function (x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
      };
    }

    loadBackgrounds();
    loadGator();

    window.addEventListener("keydown", function (e) {
      const k = e.key.toLowerCase();
      keys[k] = true;
      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(k) >=
          0 ||
        e.code === "Space"
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
    $("#comic-continue").addEventListener("click", closeComicQuiz);
    const quitPlay = $("#btn-quit-play");
    if (quitPlay) {
      quitPlay.addEventListener("click", function () {
        stopLoop();
        closeComicQuiz();
        show("start");
      });
    }

    // Stop iOS rubber-band scroll while on play screen
    document.addEventListener(
      "touchmove",
      function (e) {
        if (!document.body.classList.contains("is-playing")) return;
        // allow scrolling inside quiz popup
        if (e.target && e.target.closest && e.target.closest(".comic-overlay.show"))
          return;
        if (e.target && e.target.closest && e.target.closest(".comic-options"))
          return;
        // block background scroll
        if (e.cancelable) e.preventDefault();
      },
      { passive: false }
    );
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
