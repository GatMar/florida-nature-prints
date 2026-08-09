/**
 * Gator Grow - Florida American alligator life adventure
 * Kid-friendly, educational, localStorage progress
 */
(function () {
  "use strict";

  const STORAGE_KEY = "gatorGrowProgress_v1";

  const LEVELS = [
    {
      id: 0,
      name: "Egg Nest",
      year: "Year 0",
      emoji: "🥚",
      blurb: "You are an egg in a warm Florida nest. Stay safe until you hatch!",
      challenge: "nest",
      goalLabel: "Stay safe until hatch time",
      duration: 28,
      fact: "Nest temperature decides if babies are boys or girls! Cooler nests often mean girls; warmer nests often mean boys.",
      player: "🥚",
      playerSize: "",
    },
    {
      id: 1,
      name: "Hatchling",
      year: "Year 1",
      emoji: "🐊",
      blurb: "You hatched! Tiny with yellow stripes. Stay near Mom and hide from danger.",
      challenge: "hatchling",
      goalLabel: "Stay near Mom and avoid dangers",
      duration: 32,
      fact: "Baby alligators have bright yellow stripes for camouflage in sunny grass and water plants.",
      player: "🐊",
      playerSize: "",
    },
    {
      id: 2,
      name: "Young Juvenile",
      year: "Years 2-4",
      emoji: "🐊",
      blurb: "Find water holes and catch small snacks. Watch out for bigger gators!",
      challenge: "juvenile",
      goalLabel: "Catch snacks and find water",
      needCatch: 6,
      fact: "Young alligators eat insects, frogs, and small fish. As they grow, their menu gets bigger too!",
      player: "🐊",
      playerSize: "big",
    },
    {
      id: 3,
      name: "Sub-adult",
      year: "Years 5-8",
      emoji: "🐊",
      blurb: "Cross dry land to find new territory. Avoid boats and other big gators.",
      challenge: "subadult",
      goalLabel: "Reach the new wetland safely",
      fact: "Alligators dig dens called 'gator holes' that hold water in dry seasons and help other animals too!",
      player: "🐊",
      playerSize: "big",
    },
    {
      id: 4,
      name: "Adult Gator",
      year: "Years 9+",
      emoji: "🐊",
      blurb: "Claim your territory, bellow, and protect your nest. You are a full Florida gator!",
      challenge: "adult",
      goalLabel: "Build nest points and hold territory",
      needNest: 5,
      fact: "Adult alligators bellow and slap the water with their heads to talk, attract mates, and show strength - without fighting every time.",
      player: "🐊",
      playerSize: "huge",
    },
  ];

  const QUIZZES = {
    0: [
      {
        q: "What decides if baby alligators are boys or girls?",
        choices: ["The moon", "Nest temperature", "How many eggs", "The father's size"],
        correct: 1,
        explain: "Nest temperature decides! This is called temperature-dependent sex determination.",
        power: "health",
      },
      {
        q: "Who often guards the nest?",
        choices: ["Nobody", "The mother alligator", "Only birds", "Fish"],
        correct: 1,
        explain: "Mom alligator usually stays near and guards the nest.",
        power: "hide",
      },
      {
        q: "What is a danger to alligator eggs?",
        choices: ["Raccoons", "Butterflies", "Clouds", "Palm trees"],
        correct: 0,
        explain: "Raccoons (and flooding or too much heat) can harm eggs.",
        power: "points",
      },
      {
        q: "Where do American alligators live in this game?",
        choices: ["Only deserts", "Florida wetlands and swamps", "Deep ocean only", "Snowy mountains"],
        correct: 1,
        explain: "American alligators love Florida wetlands, marshes, and swamps.",
        power: "speed",
      },
    ],
    1: [
      {
        q: "Baby alligators have yellow stripes for…",
        choices: ["Looking pretty only", "Camouflage in grass", "Attracting friends", "Swimming faster"],
        correct: 1,
        explain: "Stripes help them blend into grass and plants - camouflage!",
        power: "hide",
      },
      {
        q: "How long do moms usually protect the hatchlings?",
        choices: ["A few days", "About 1-2 years", "Forever", "Until bigger than her"],
        correct: 1,
        explain: "Mom often protects young for about one to two years.",
        power: "health",
      },
      {
        q: "What might hunt a tiny hatchling?",
        choices: ["Big birds", "Ladybugs", "Frogs only", "Flowers"],
        correct: 0,
        explain: "Birds, big fish, snakes, and other animals can be dangers.",
        power: "speed",
      },
      {
        q: "Hatchlings are best at…",
        choices: ["Driving boats", "Staying near Mom and hiding", "Building houses", "Flying"],
        correct: 1,
        explain: "Staying near Mom and hiding keeps tiny gators safer.",
        power: "points",
      },
    ],
    2: [
      {
        q: "What might a young juvenile eat?",
        choices: ["Only leaves", "Insects, frogs, and small fish", "Only coconuts", "Metal cans"],
        correct: 1,
        explain: "Small prey first - insects, frogs, and little fish!",
        power: "bite",
      },
      {
        q: "Why are water holes important?",
        choices: ["They are toys", "They hold water in dry times", "They scare birds only", "They make noise"],
        correct: 1,
        explain: "Water holes help gators (and other wildlife) survive dry seasons.",
        power: "health",
      },
      {
        q: "Should a small gator pick a fight with a huge gator?",
        choices: ["Yes always", "No - better to avoid bigger gators", "Only on Tuesdays", "Only if dancing"],
        correct: 1,
        explain: "Young gators stay safer by avoiding much bigger alligators.",
        power: "hide",
      },
      {
        q: "American alligators are native to…",
        choices: ["Antarctica", "Parts of the southeastern USA like Florida", "The Moon", "Only Europe"],
        correct: 1,
        explain: "They live in the southeastern United States, including Florida!",
        power: "points",
      },
    ],
    3: [
      {
        q: "What is a 'gator hole'?",
        choices: ["A golf course", "A den that holds water", "A type of boat", "A bird nest"],
        correct: 1,
        explain: "Gator holes are dens that keep water available in dry seasons.",
        power: "health",
      },
      {
        q: "Why might a sub-adult travel over dry land?",
        choices: ["To find new territory or water", "To buy ice cream", "To go to school", "To fly"],
        correct: 0,
        explain: "They may search for territory, water, or mates as they grow.",
        power: "speed",
      },
      {
        q: "What should gators try to avoid near people?",
        choices: ["Sunlight", "Boats and close contact with pets/people", "Rain", "Reeds"],
        correct: 1,
        explain: "Boats and close human or pet encounters can be dangerous for both sides.",
        power: "hide",
      },
      {
        q: "As gators grow, their diet…",
        choices: ["Stays only insects", "Often includes larger prey", "Becomes only fruit", "Stops completely"],
        correct: 1,
        explain: "Bigger gators can take larger prey as their jaws and size grow.",
        power: "bite",
      },
    ],
    4: [
      {
        q: "Why do adult alligators bellow?",
        choices: ["To sing pop songs", "To communicate and attract mates", "To call pizza", "To scare clouds"],
        correct: 1,
        explain: "Bellowing helps them communicate, show strength, and attract mates.",
        power: "points",
      },
      {
        q: "Head-slapping the water can mean…",
        choices: ["They are bored only", "A signal during courtship or display", "It is an accident always", "They dislike water"],
        correct: 1,
        explain: "Slapping and displays are part of alligator communication.",
        power: "bite",
      },
      {
        q: "Who usually builds and guards the nest?",
        choices: ["The mother", "A raccoon", "A tourist", "A fish"],
        correct: 0,
        explain: "Female alligators build nests of vegetation and guard them.",
        power: "health",
      },
      {
        q: "Large males may…",
        choices: ["Share every snack politely always", "Defend territory from other big males", "Turn into lizards", "Hibernate in trees"],
        correct: 1,
        explain: "Big males often hold and defend territories.",
        power: "speed",
      },
    ],
  };

  const state = {
    screen: "start",
    score: 0,
    totalScore: 0,
    unlocked: 1,
    completed: {},
    levelId: 0,
    health: 3,
    maxHealth: 3,
    powers: { speed: 0, hide: 0, bite: 0 },
    quizIndex: 0,
    quizOrder: [],
    phase: "play", // play | quiz | fact
  };

  let play = null;
  let raf = null;
  let keys = {};

  const $ = (sel) => document.querySelector(sel);
  const screens = {
    start: $("#screen-start"),
    levels: $("#screen-levels"),
    play: $("#screen-play"),
    quiz: $("#screen-quiz"),
    fact: $("#screen-fact"),
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      state.totalScore = data.totalScore || 0;
      state.unlocked = data.unlocked || 1;
      state.completed = data.completed || {};
    } catch (e) {
      /* ignore */
    }
  }

  function saveProgress() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        totalScore: state.totalScore,
        unlocked: state.unlocked,
        completed: state.completed,
      })
    );
  }

  function showScreen(name) {
    state.screen = name;
    Object.keys(screens).forEach(function (k) {
      screens[k].classList.toggle("active", k === name);
    });
  }

  function updateGlobalHud() {
    const el = $("#global-score");
    if (el) el.textContent = String(state.totalScore);
  }

  function heartString() {
    let s = "";
    for (let i = 0; i < state.maxHealth; i++) {
      s += i < state.health ? "❤️" : "🖤";
    }
    return s;
  }

  function powerLabels() {
    const parts = [];
    if (state.powers.speed > 0) parts.push("⚡ Speed");
    if (state.powers.hide > 0) parts.push("🌿 Hide");
    if (state.powers.bite > 0) parts.push("🦷 Bite");
    return parts.length
      ? parts.map(function (p) {
          return '<span class="power-badge">' + p + "</span>";
        }).join("")
      : "";
  }

  function toast(area, text) {
    let t = area.querySelector(".msg-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "msg-toast";
      area.appendChild(t);
    }
    t.textContent = text;
    t.classList.add("show");
    setTimeout(function () {
      t.classList.remove("show");
    }, 900);
  }

  function renderLevelSelect() {
    const grid = $("#level-grid");
    grid.innerHTML = "";
    LEVELS.forEach(function (lv, i) {
      const unlocked = i < state.unlocked;
      const done = !!state.completed[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "level-card" + (done ? " done" : "");
      btn.disabled = !unlocked;
      btn.innerHTML =
        '<span class="emoji">' +
        (unlocked ? lv.emoji : "🔒") +
        "</span>" +
        '<div class="name">' +
        lv.name +
        "</div>" +
        '<div class="meta">' +
        lv.year +
        (done ? " · ★ done" : unlocked ? "" : " · locked") +
        "</div>";
      if (unlocked) {
        btn.addEventListener("click", function () {
          startLevel(i);
        });
      }
      grid.appendChild(btn);
    });
    updateGlobalHud();
  }

  function startLevel(id) {
    stopPlayLoop();
    state.levelId = id;
    state.score = 0;
    state.health = 3;
    state.maxHealth = 3;
    state.powers = { speed: 0, hide: 0, bite: 0 };
    state.phase = "play";
    state.quizIndex = 0;
    const qs = QUIZZES[id].slice();
    // shuffle quiz order lightly
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = qs[i];
      qs[i] = qs[j];
      qs[j] = tmp;
    }
    state.quizOrder = qs;

    const lv = LEVELS[id];
    $("#level-title").textContent = lv.emoji + " " + lv.name;
    $("#level-blurb").textContent = lv.blurb;
    $("#play-hud-hearts").innerHTML = heartString();
    $("#play-hud-score").textContent = "0";
    $("#play-hud-powers").innerHTML = powerLabels();
    $("#goal-label").textContent = lv.goalLabel;
    $("#goal-fill").style.width = "0%";

    showScreen("play");
    initChallenge(lv);
  }

  function speedMul() {
    return state.powers.speed > 0 ? 1.45 : 1;
  }

  function hideActive() {
    return state.powers.hide > 0;
  }

  function biteMul() {
    return state.powers.bite > 0 ? 2 : 1;
  }

  function tickPowerTimers(dt) {
    ["speed", "hide", "bite"].forEach(function (k) {
      if (state.powers[k] > 0) {
        state.powers[k] -= dt;
        if (state.powers[k] < 0) state.powers[k] = 0;
      }
    });
  }

  function hurt(amount) {
    if (hideActive() && Math.random() < 0.55) {
      toast(play.area, "Hidden! 🌿");
      return;
    }
    state.health -= amount || 1;
    if (state.health < 0) state.health = 0;
    $("#play-hud-hearts").innerHTML = heartString();
    toast(play.area, "Ouch! Be careful");
    if (state.health <= 0) {
      // gentle retry - no harsh game over story
      endPlay(false);
    }
  }

  function addScore(n) {
    state.score += n;
    $("#play-hud-score").textContent = String(state.score);
  }

  function endPlay(won) {
    stopPlayLoop();
    if (!won) {
      // soft fail: still allow quiz with encouragement
      state.score = Math.max(state.score, 20);
    }
    beginQuiz();
  }

  function beginQuiz() {
    state.phase = "quiz";
    state.quizIndex = 0;
    showScreen("quiz");
    renderQuiz();
  }

  function applyPower(type) {
    if (type === "health") {
      state.health = Math.min(state.maxHealth, state.health + 1);
    } else if (type === "speed") {
      state.powers.speed = 12;
    } else if (type === "hide") {
      state.powers.hide = 12;
    } else if (type === "bite") {
      state.powers.bite = 12;
    } else if (type === "points") {
      addScore(25);
      state.score += 0;
    }
  }

  function renderQuiz() {
    const list = state.quizOrder;
    const i = state.quizIndex;
    const item = list[i];
    $("#quiz-progress").textContent =
      "Question " + (i + 1) + " of " + list.length;
    $("#quiz-question").textContent = item.q;
    const box = $("#quiz-options");
    box.innerHTML = "";
    const fb = $("#quiz-feedback");
    fb.className = "quiz-feedback";
    fb.textContent = "";
    $("#quiz-next-wrap").style.display = "none";

    item.choices.forEach(function (c, idx) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opt";
      b.textContent = String.fromCharCode(97 + idx) + ") " + c;
      b.addEventListener("click", function () {
        answerQuiz(idx, item, b, box);
      });
      box.appendChild(b);
    });

    $("#quiz-hud-score").textContent = String(state.score);
    $("#quiz-hud-hearts").innerHTML = heartString();
  }

  function answerQuiz(idx, item, btn, box) {
    const buttons = box.querySelectorAll(".quiz-opt");
    buttons.forEach(function (b) {
      b.disabled = true;
    });
    const fb = $("#quiz-feedback");
    if (idx === item.correct) {
      btn.classList.add("correct");
      addScore(40);
      applyPower(item.power);
      fb.className = "quiz-feedback show good";
      fb.textContent =
        "Yes! +" +
        40 +
        " points. " +
        item.explain +
        (item.power && item.power !== "points"
          ? " Bonus skill ready for later levels!"
          : "");
    } else {
      btn.classList.add("wrong");
      buttons[item.correct].classList.add("correct");
      fb.className = "quiz-feedback show learn";
      fb.textContent = "Good try! " + item.explain + " You still learned something cool.";
      addScore(5);
    }
    $("#quiz-hud-score").textContent = String(state.score);
    $("#quiz-hud-hearts").innerHTML = heartString();
    $("#quiz-next-wrap").style.display = "flex";
  }

  function nextQuiz() {
    state.quizIndex++;
    if (state.quizIndex >= state.quizOrder.length) {
      showFact();
    } else {
      renderQuiz();
    }
  }

  function showFact() {
    state.phase = "fact";
    const lv = LEVELS[state.levelId];
    state.totalScore += state.score;
    state.completed[state.levelId] = true;
    if (state.unlocked < state.levelId + 2) {
      state.unlocked = Math.min(LEVELS.length, state.levelId + 2);
    }
    // complete all unlock flag
    if (state.levelId === LEVELS.length - 1) {
      state.unlocked = LEVELS.length;
    }
    saveProgress();
    updateGlobalHud();

    $("#fact-emoji").textContent = lv.emoji + "🎉";
    $("#fact-title").textContent = lv.name + " complete!";
    $("#fact-text").textContent = lv.fact;
    $("#fact-score").textContent =
      "Level score: " + state.score + " · Total: " + state.totalScore;
    showScreen("fact");
  }

  /* ---------- Challenges ---------- */

  function stopPlayLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    play = null;
  }

  function initChallenge(lv) {
    const area = $("#play-area");
    area.innerHTML = "";
    area.className = "play-area";
    if (lv.challenge === "hatchling" || lv.challenge === "juvenile") {
      area.classList.add("water-more");
    }

    const rect = function () {
      return area.getBoundingClientRect();
    };

    play = {
      area: area,
      lv: lv,
      t: 0,
      last: performance.now(),
      w: 0,
      h: 0,
      player: { x: 0.5, y: 0.7 },
      entities: [],
      caught: 0,
      nestPts: 0,
      invuln: 0,
      won: false,
    };

    resizePlay();

    // player
    const pEl = document.createElement("div");
    pEl.className = "entity player " + (lv.playerSize || "");
    pEl.textContent = lv.player;
    pEl.id = "player-el";
    area.appendChild(pEl);

    if (lv.challenge === "nest") {
      const nest = document.createElement("div");
      nest.className = "nest-zone";
      nest.textContent = "🪺";
      nest.style.left = "50%";
      nest.style.top = "62%";
      area.appendChild(nest);
      play.player.x = 0.5;
      play.player.y = 0.62;
    }

    if (lv.challenge === "hatchling") {
      const mom = document.createElement("div");
      mom.className = "entity mom";
      mom.textContent = "🐊";
      mom.dataset.role = "mom";
      area.appendChild(mom);
      play.mom = { x: 0.5, y: 0.55, el: mom, phase: 0 };
      play.player.x = 0.48;
      play.player.y = 0.62;
    }

    if (lv.challenge === "subadult") {
      play.player.x = 0.12;
      play.player.y = 0.72;
      const flag = document.createElement("div");
      flag.className = "entity good";
      flag.textContent = "🏁";
      flag.style.left = "88%";
      flag.style.top = "70%";
      area.appendChild(flag);
      play.goal = { x: 0.88, y: 0.7 };
    }

    if (lv.challenge === "adult") {
      play.player.x = 0.5;
      play.player.y = 0.65;
    }

    bindPlayInput(area);
    $("#play-hint").textContent = hintFor(lv.challenge);

    function loop(now) {
      if (!play) return;
      const dt = Math.min(0.05, (now - play.last) / 1000);
      play.last = now;
      play.t += dt;
      if (play.invuln > 0) play.invuln -= dt;
      tickPowerTimers(dt);
      $("#play-hud-powers").innerHTML = powerLabels();
      updateChallenge(dt);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }

  function hintFor(type) {
    switch (type) {
      case "nest":
        return "Drag or use arrows/WASD to stay in the nest. Avoid raccoons! 🦝";
      case "hatchling":
        return "Stay close to Mom 🐊 · Avoid birds and danger · Drag or arrows";
      case "juvenile":
        return "Collect bugs & frogs 🐸 · Touch water holes 💧 · Avoid big gators";
      case "subadult":
        return "Cross to the flag 🏁 · Avoid boats 🚤 and rival gators";
      case "adult":
        return "Tap/click nest spots 🪺 · Bellow with SPACE or double-tap · Hold territory";
      default:
        return "Move with fingers, mouse, or arrow keys";
    }
  }

  function resizePlay() {
    if (!play) return;
    const r = play.area.getBoundingClientRect();
    play.w = r.width;
    play.h = r.height;
  }

  function bindPlayInput(area) {
    keys = {};
    window.onkeydown = function (e) {
      keys[e.key.toLowerCase()] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(e.key.toLowerCase()) >= 0 || e.key === " ") {
        e.preventDefault();
      }
      if ((e.key === " " || e.code === "Space") && play && play.lv.challenge === "adult") {
        bellow();
      }
    };
    window.onkeyup = function (e) {
      keys[e.key.toLowerCase()] = false;
    };

    let dragging = false;
    let lastTap = 0;

    function pointerPos(e) {
      const r = area.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return {
        x: (t.clientX - r.left) / r.width,
        y: (t.clientY - r.top) / r.height,
      };
    }

    area.onpointerdown = function (e) {
      dragging = true;
      area.setPointerCapture(e.pointerId);
      const p = pointerPos(e);
      play.player.x = clamp(p.x, 0.05, 0.95);
      play.player.y = clamp(p.y, 0.2, 0.92);
      if (play.lv.challenge === "adult") {
        tryNest(p.x, p.y);
        const now = Date.now();
        if (now - lastTap < 320) bellow();
        lastTap = now;
      }
    };
    area.onpointermove = function (e) {
      if (!dragging || !play) return;
      const p = pointerPos(e);
      play.player.x = clamp(p.x, 0.05, 0.95);
      play.player.y = clamp(p.y, 0.2, 0.92);
    };
    area.onpointerup = function () {
      dragging = false;
    };
    area.onpointercancel = function () {
      dragging = false;
    };
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function movePlayer(dt) {
    let dx = 0;
    let dy = 0;
    if (keys["arrowleft"] || keys["a"]) dx -= 1;
    if (keys["arrowright"] || keys["d"]) dx += 1;
    if (keys["arrowup"] || keys["w"]) dy -= 1;
    if (keys["arrowdown"] || keys["s"]) dy += 1;
    if (dx || dy) {
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const sp = 0.55 * speedMul() * dt;
      play.player.x = clamp(play.player.x + (dx / len) * sp, 0.05, 0.95);
      play.player.y = clamp(play.player.y + (dy / len) * sp, 0.2, 0.92);
    }
    const el = document.getElementById("player-el");
    if (el) {
      el.style.left = play.player.x * 100 + "%";
      el.style.top = play.player.y * 100 + "%";
      el.style.opacity = hideActive() ? "0.55" : "1";
    }
  }

  function spawnEntity(kind, emoji, x, y, vx, vy) {
    const el = document.createElement("div");
    el.className = "entity " + (kind === "danger" ? "danger" : "good");
    el.textContent = emoji;
    play.area.appendChild(el);
    const ent = { kind: kind, emoji: emoji, x: x, y: y, vx: vx || 0, vy: vy || 0, el: el, life: 8 };
    play.entities.push(ent);
    return ent;
  }

  function updateEntities(dt) {
    play.entities = play.entities.filter(function (e) {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.life -= dt;
      e.el.style.left = e.x * 100 + "%";
      e.el.style.top = e.y * 100 + "%";
      if (e.x < -0.1 || e.x > 1.1 || e.y < -0.1 || e.y > 1.1 || e.life <= 0) {
        e.el.remove();
        return false;
      }
      return true;
    });
  }

  function collideEntities() {
    play.entities.forEach(function (e) {
      if (dist(play.player, e) < 0.08) {
        if (e.kind === "danger") {
          if (play.invuln <= 0) {
            hurt(1);
            play.invuln = 1.1;
          }
          e.life = 0;
        } else if (e.kind === "food") {
          play.caught += biteMul();
          addScore(15 * biteMul());
          toast(play.area, "Yum! +" + 15 * biteMul());
          e.life = 0;
        } else if (e.kind === "water") {
          play.caught += 1;
          addScore(20);
          toast(play.area, "Water hole! 💧");
          e.life = 0;
        }
      }
    });
  }

  function setGoal(pct) {
    $("#goal-fill").style.width = clamp(pct, 0, 100) + "%";
  }

  function updateChallenge(dt) {
    movePlayer(dt);
    const lv = play.lv;
    const type = lv.challenge;

    if (type === "nest") {
      // stay in nest, avoid raccoons
      if (Math.random() < 0.02 + play.t * 0.0008) {
        const side = Math.random() < 0.5 ? 0 : 1;
        spawnEntity(
          "danger",
          "🦝",
          side ? 1.05 : -0.05,
          0.4 + Math.random() * 0.4,
          side ? -0.25 : 0.25,
          (Math.random() - 0.5) * 0.1
        );
      }
      if (Math.random() < 0.008) {
        spawnEntity("danger", "💧", Math.random(), -0.05, 0, 0.3);
      }
      updateEntities(dt);
      collideEntities();
      const inNest = dist(play.player, { x: 0.5, y: 0.62 }) < 0.14;
      if (!inNest && play.t > 1 && play.invuln <= 0 && Math.random() < 0.01) {
        // mild warning only when far
      }
      const progress = (play.t / lv.duration) * 100;
      setGoal(progress);
      if (inNest) addScore(Math.floor(dt * 8));
      if (play.t >= lv.duration) endPlay(true);
    }

    if (type === "hatchling") {
      play.mom.phase += dt;
      play.mom.x = 0.5 + Math.sin(play.mom.phase * 0.7) * 0.18;
      play.mom.y = 0.52 + Math.cos(play.mom.phase * 0.5) * 0.06;
      play.mom.el.style.left = play.mom.x * 100 + "%";
      play.mom.el.style.top = play.mom.y * 100 + "%";

      if (Math.random() < 0.025) {
        spawnEntity("danger", "🐦", Math.random(), -0.05, (Math.random() - 0.5) * 0.2, 0.28);
      }
      if (Math.random() < 0.012) {
        spawnEntity("danger", "🐍", -0.05, 0.6 + Math.random() * 0.2, 0.3, 0);
      }
      updateEntities(dt);
      collideEntities();
      const nearMom = dist(play.player, play.mom) < 0.16;
      if (nearMom) addScore(Math.floor(dt * 10));
      else if (play.t > 2 && play.invuln <= 0 && Math.random() < 0.004) {
        toast(play.area, "Stay near Mom!");
      }
      setGoal((play.t / lv.duration) * 100);
      if (play.t >= lv.duration) endPlay(true);
    }

    if (type === "juvenile") {
      if (Math.random() < 0.03) {
        const foods = ["🐛", "🐸", "🐟", "🦗"];
        spawnEntity("food", foods[Math.floor(Math.random() * foods.length)], Math.random() * 0.9 + 0.05, Math.random() * 0.5 + 0.35, 0, 0);
      }
      if (Math.random() < 0.01) {
        spawnEntity("water", "💧", Math.random() * 0.8 + 0.1, Math.random() * 0.4 + 0.45, 0, 0);
      }
      if (Math.random() < 0.012) {
        spawnEntity("danger", "🐊", Math.random() < 0.5 ? -0.05 : 1.05, 0.5 + Math.random() * 0.3, Math.random() < 0.5 ? 0.22 : -0.22, 0);
      }
      updateEntities(dt);
      collideEntities();
      const need = lv.needCatch || 6;
      setGoal((play.caught / need) * 100);
      if (play.caught >= need) endPlay(true);
      // time soft limit
      if (play.t > 90) endPlay(play.caught >= need * 0.5);
    }

    if (type === "subadult") {
      if (Math.random() < 0.018) {
        spawnEntity("danger", "🚤", -0.05, 0.35 + Math.random() * 0.2, 0.35, 0);
      }
      if (Math.random() < 0.012) {
        spawnEntity("danger", "🐊", 1.05, 0.55 + Math.random() * 0.25, -0.28, 0);
      }
      updateEntities(dt);
      collideEntities();
      const d = dist(play.player, play.goal);
      setGoal(clamp((1 - d / 1.2) * 100, 0, 99));
      if (d < 0.1) {
        setGoal(100);
        addScore(50);
        endPlay(true);
      }
      if (play.t > 75) endPlay(false);
    }

    if (type === "adult") {
      if (Math.random() < 0.01) {
        spawnEntity("danger", "🐊", Math.random() < 0.5 ? -0.05 : 1.05, 0.5 + Math.random() * 0.3, Math.random() < 0.5 ? 0.2 : -0.2, 0);
      }
      updateEntities(dt);
      collideEntities();
      const need = lv.needNest || 5;
      setGoal((play.nestPts / need) * 100);
      if (play.nestPts >= need) endPlay(true);
      if (play.t > 80) endPlay(play.nestPts >= 3);
    }
  }

  function tryNest(x, y) {
    if (!play || play.lv.challenge !== "adult") return;
    if (play._nestCd && play._nestCd > 0) return;
    play.nestPts += 1;
    addScore(20);
    toast(play.area, "Nest work! 🪺");
    const n = document.createElement("div");
    n.className = "nest-zone";
    n.textContent = "🪺";
    n.style.left = x * 100 + "%";
    n.style.top = y * 100 + "%";
    n.style.width = "40px";
    n.style.height = "30px";
    n.style.fontSize = "0.9rem";
    play.area.appendChild(n);
    play._nestCd = 0.8;
    // cooldown tick via invuln style
    const iv = setInterval(function () {
      if (!play) {
        clearInterval(iv);
        return;
      }
      play._nestCd -= 0.1;
      if (play._nestCd <= 0) clearInterval(iv);
    }, 100);
  }

  function bellow() {
    if (!play || play.lv.challenge !== "adult") return;
    addScore(10);
    toast(play.area, "BELLOW! 🔊");
    // scare nearby dangers
    play.entities.forEach(function (e) {
      if (e.kind === "danger" && dist(play.player, e) < 0.25) {
        e.vx *= -1.5;
        e.life = Math.min(e.life, 1);
      }
    });
  }

  /* ---------- Wire UI ---------- */

  function init() {
    loadProgress();
    updateGlobalHud();

    $("#btn-start").addEventListener("click", function () {
      renderLevelSelect();
      showScreen("levels");
    });
    $("#btn-how").addEventListener("click", function () {
      $("#how-box").style.display =
        $("#how-box").style.display === "none" ? "block" : "none";
    });
    $("#btn-levels-back").addEventListener("click", function () {
      showScreen("start");
    });
    $("#btn-reset").addEventListener("click", function () {
      if (confirm("Reset all Gator Grow progress on this device?")) {
        localStorage.removeItem(STORAGE_KEY);
        state.totalScore = 0;
        state.unlocked = 1;
        state.completed = {};
        renderLevelSelect();
        updateGlobalHud();
      }
    });
    $("#btn-quiz-next").addEventListener("click", nextQuiz);
    $("#btn-fact-levels").addEventListener("click", function () {
      stopPlayLoop();
      renderLevelSelect();
      showScreen("levels");
    });
    $("#btn-fact-next").addEventListener("click", function () {
      const next = state.levelId + 1;
      if (next < LEVELS.length && next < state.unlocked) {
        startLevel(next);
      } else {
        renderLevelSelect();
        showScreen("levels");
      }
    });

    window.addEventListener("resize", resizePlay);
    showScreen("start");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
