/**
 * Florida Wildlife Match — 15-level memory game
 * Cards use real gallery prints (birds, gators, and other Florida wildlife).
 * Pairs: 7 on level 1, then +1 each level, capped at 20.
 */
(function () {
  "use strict";

  const STORAGE = (window.SITE_CONFIG && SITE_CONFIG.matchReward && SITE_CONFIG.matchReward.storageKey) || "fnpMatch_v1";
  const TOTAL_LEVELS = 15;
  const CREDIT = (window.SITE_CONFIG && SITE_CONFIG.matchReward && SITE_CONFIG.matchReward.creditAmount) || 8;

  const LEVELS = [
    { pairs: 7, peekMs: 8000, mismatchMs: 1100, timeSec: 0, similar: false, points: 10 },
    { pairs: 8, peekMs: 7000, mismatchMs: 1050, timeSec: 0, similar: false, points: 11 },
    { pairs: 9, peekMs: 6000, mismatchMs: 1000, timeSec: 0, similar: false, points: 12 },
    { pairs: 10, peekMs: 5000, mismatchMs: 950, timeSec: 0, similar: false, points: 13 },
    { pairs: 11, peekMs: 4000, mismatchMs: 900, timeSec: 0, similar: false, points: 14 },
    { pairs: 12, peekMs: 2500, mismatchMs: 850, timeSec: 0, similar: false, points: 16 },
    { pairs: 13, peekMs: 0, mismatchMs: 800, timeSec: 0, similar: false, points: 18 },
    { pairs: 14, peekMs: 0, mismatchMs: 750, timeSec: 210, similar: false, points: 20 },
    { pairs: 15, peekMs: 0, mismatchMs: 700, timeSec: 200, similar: false, points: 22 },
    { pairs: 16, peekMs: 0, mismatchMs: 650, timeSec: 190, similar: false, points: 24 },
    { pairs: 17, peekMs: 0, mismatchMs: 600, timeSec: 180, similar: true, points: 26 },
    { pairs: 18, peekMs: 0, mismatchMs: 550, timeSec: 170, similar: true, points: 28 },
    { pairs: 19, peekMs: 0, mismatchMs: 500, timeSec: 160, similar: true, points: 30 },
    { pairs: 20, peekMs: 0, mismatchMs: 450, timeSec: 150, similar: true, points: 32 },
    { pairs: 20, peekMs: 0, mismatchMs: 400, timeSec: 135, similar: true, points: 35 },
  ];

  // Distinct species first (easy). Similar herons / gators later (harder).
  const EASY_FILES = [
    "gator-mid-yawn.jpeg",
    "great-blue-heron.jpeg",
    "great-egret.jpeg",
    "sandhill-crane-elegant.jpeg",
    "wood-stork-standing-tall.jpeg",
    "anhinga-portrait.JPG",
    "baby-manatee.jpeg",
    "snowy-egret-hunter.jpeg",
    "young-gator.jpeg",
    "anhinga-drying.jpeg",
    "wood-stork-profile.jpeg",
    "gator-eyes.jpeg",
    "sandhill-crane-pair.jpeg",
    "floating-gator.jpeg",
    "heron-close-portrait.jpeg",
    "farewell-egret.jpeg",
    "adult-seven-foot-gator.jpeg",
    "great-blue-command.jpeg",
    "gator-up-close.jpeg",
    "wood-stork-watchful.jpeg",
    "heron-glow.JPG",
    "focused-mister-egret.jpeg",
  ];

  const HARD_FILES = [
    "gator-mid-yawn.jpeg",
    "gator-eyes.jpeg",
    "gator-up-close.jpeg",
    "young-gator.jpeg",
    "floating-gator.jpeg",
    "adult-seven-foot-gator.jpeg",
    "gator-surface.jpeg",
    "gator-in-still-water.jpeg",
    "great-blue-heron.jpeg",
    "great-blue-command.jpeg",
    "heron-close-portrait.jpeg",
    "heron-neck-curve.jpeg",
    "golden-hour-heron.jpeg",
    "heron-glow.JPG",
    "great-egret.jpeg",
    "focused-mister-egret.jpeg",
    "farewell-egret.jpeg",
    "snowy-egret-hunter.jpeg",
    "wood-stork-standing-tall.jpeg",
    "wood-stork-profile.jpeg",
    "anhinga-portrait.JPG",
    "anhinga-drying.jpeg",
  ];

  const COOKIE_ADS = [
    {
      title: "Classic Blondie Chocolate Chip",
      file: "images/ads/maricooks/a-la-carte-classic-blondie-chocolate-chip.jpeg",
      href: "https://maricooks.com/order.html?item=a-la-carte-classic-blondie-chocolate-chip",
      blurb: "MariCooks · cookie",
    },
    {
      title: "Cookie² Cocoa Chocolate Chip",
      file: "images/ads/maricooks/a-la-carte-cookie2-cocoa-chocolate-chip.jpeg",
      href: "https://maricooks.com/order.html?item=a-la-carte-cookie2-cocoa-chocolate-chip",
      blurb: "MariCooks · cookie",
    },
    {
      title: "Orange Chocolate Chip",
      file: "images/ads/maricooks/a-la-carte-classic-orange-chocolate-chip.jpeg",
      href: "https://maricooks.com/order.html?item=a-la-carte-classic-orange-chocolate-chip",
      blurb: "MariCooks · cookie",
    },
    {
      title: "Mixed cookie basket",
      file: "images/ads/maricooks/mixed-basket.jpeg",
      href: "https://maricooks.com/order.html?item=mixed-basket",
      blurb: "MariCooks · gift basket",
    },
  ];

  const SPICE_ADS = [
    {
      title: "Homemade spice mix",
      file: "images/ads/maricooks/pantry-spice-mix-4oz.jpeg",
      href: "https://maricooks.com/order.html?item=spice-mix-4oz",
      blurb: "MariCooks · spice jar",
    },
    {
      title: "Orange extract",
      file: "images/ads/maricooks/pantry-orange-extract-2oz.jpeg",
      href: "https://maricooks.com/order.html?item=orange-extract-2oz",
      blurb: "MariCooks · pantry",
    },
  ];

  const state = {
    score: 0,
    unlocked: 1,
    completed: [],
    reward: null,
    level: 1,
    matches: 0,
    need: 0,
    lock: false,
    open: [],
    cards: [],
    timerId: null,
    leftSec: 0,
    peeking: false,
  };

  function photoByFile(file) {
    const list = (window.SITE_CONFIG && SITE_CONFIG.photos) || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].file === file) return list[i];
    }
    return null;
  }

  function poolFor(levelCfg) {
    const files = levelCfg.similar ? HARD_FILES : EASY_FILES;
    const out = [];
    files.forEach(function (f) {
      const p = photoByFile(f);
      if (p) out.push(p);
    });
    const extras = ((window.SITE_CONFIG && SITE_CONFIG.photos) || []).filter(function (p) {
      return (
        (p.category === "gators" ||
          p.category === "herons" ||
          p.category === "anhinga" ||
          p.category === "storks" ||
          p.file === "baby-manatee.jpeg") &&
        !out.some(function (x) {
          return x.file === p.file;
        })
      );
    });
    return out.concat(extras);
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE) || "{}");
      if (typeof d.score === "number") state.score = d.score;
      if (typeof d.unlocked === "number") state.unlocked = Math.max(1, Math.min(TOTAL_LEVELS, d.unlocked));
      if (Array.isArray(d.completed)) state.completed = d.completed;
      if (d.reward && d.reward.code) state.reward = d.reward;
    } catch (e) {}
  }

  function save() {
    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify({
          score: state.score,
          unlocked: state.unlocked,
          completed: state.completed,
          reward: state.reward,
        })
      );
    } catch (e) {}
  }

  function $(id) {
    return document.getElementById(id);
  }

  function showScreen(id) {
    document.querySelectorAll(".match-screen").forEach(function (el) {
      el.classList.toggle("active", el.id === id);
    });
  }

  function formatTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function paintHud() {
    const scoreEls = document.querySelectorAll("[data-match-score]");
    scoreEls.forEach(function (el) {
      el.textContent = String(state.score);
    });
    if ($("play-score")) $("play-score").textContent = String(state.score);
    if ($("play-matches")) $("play-matches").textContent = state.matches + " / " + state.need;
    if ($("play-level")) $("play-level").textContent = String(state.level);
    if ($("global-score")) $("global-score").textContent = String(state.score);
  }

  function makeCode() {
    return "MATCH-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function grantReward(kind) {
    const code = makeCode();
    const reward = {
      code: code,
      kind: kind,
      credit: kind === "credit" ? CREDIT : 0,
      earnedAt: Date.now(),
      claimed: false,
    };
    state.reward = reward;
    save();
    return reward;
  }

  function rewardLabel(reward) {
    if (!reward) return "";
    if (reward.kind === "shark-tooth") return "a shark tooth souvenir";
    if (reward.kind === "shell") return "a shell souvenir";
    return "$" + CREDIT + " toward your next purchase";
  }

  function paintStartReward() {
    const box = $("reward-box-start");
    const codeEl = $("reward-code-start");
    const textEl = $("reward-text-start");
    if (!box) return;
    if (state.reward && state.reward.code) {
      box.hidden = false;
      if (codeEl) codeEl.textContent = state.reward.code;
      if (textEl) {
        textEl.textContent =
          "You already earned " +
          rewardLabel(state.reward) +
          ". Use this code in the shop.";
      }
    } else {
      box.hidden = true;
    }
  }

  function buildLevelGrid() {
    const grid = $("level-grid");
    if (!grid) return;
    let html = "";
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const cfg = LEVELS[i - 1];
      const open = i <= state.unlocked;
      const done = state.completed.indexOf(i) !== -1;
      html +=
        '<button type="button" class="match-level-btn' +
        (open ? "" : " is-locked") +
        (done ? " is-done" : "") +
        '" data-level="' +
        i +
        '"' +
        (open ? "" : " disabled") +
        ">" +
        '<span class="lvl-num">' +
        i +
        "</span>" +
        '<span class="lvl-meta">' +
        cfg.pairs +
        " matches" +
        (cfg.timeSec ? " · timed" : "") +
        (cfg.similar ? " · look-alikes" : "") +
        "</span>" +
        (done ? '<span class="lvl-done">Cleared</span>' : open ? "" : '<span class="lvl-lock">Locked</span>') +
        "</button>";
    }
    grid.innerHTML = html;
  }

  function pickPhotos(cfg) {
    const pool = shuffle(poolFor(cfg));
    return pool.slice(0, cfg.pairs);
  }

  function columnsFor(nCards) {
    if (nCards <= 20) return 4;
    if (nCards <= 30) return 4;
    return 5;
  }

  function startLevel(n) {
    if (n < 1 || n > TOTAL_LEVELS) return;
    if (n > state.unlocked) return;
    const cfg = LEVELS[n - 1];
    state.level = n;
    state.matches = 0;
    state.need = cfg.pairs;
    state.lock = true;
    state.open = [];
    state.peeking = cfg.peekMs > 0;
    state.leftSec = cfg.timeSec;
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }

    const photos = pickPhotos(cfg);
    const deck = [];
    photos.forEach(function (p, i) {
      deck.push({ id: i, photo: p });
      deck.push({ id: i, photo: p });
    });
    state.cards = shuffle(deck);

    const board = $("match-board");
    board.removeAttribute("style");
    board.setAttribute("data-count", String(state.cards.length));
    board.setAttribute("data-cols", String(columnsFor(state.cards.length)));
    board.innerHTML = state.cards
      .map(function (card, idx) {
        return (
          '<button type="button" class="match-card' +
          (state.peeking ? " is-flipped" : "") +
          '" data-idx="' +
          idx +
          '" aria-label="Hidden card">' +
          '<span class="match-card-inner">' +
          '<span class="match-card-face match-card-back" aria-hidden="true"></span>' +
          '<span class="match-card-face match-card-front">' +
          '<img src="images/prints/' +
          card.photo.file +
          '" alt="' +
          escapeAttr(card.photo.title) +
          '" />' +
          "</span>" +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    $("play-title").textContent = "Level " + n;
    $("play-blurb").textContent = levelBlurb(cfg);
    paintHud();
    updateTimerHud();
    showScreen("screen-play");

    if (cfg.peekMs > 0) {
      $("play-hint").textContent = "Memorize the pictures…";
      setTimeout(function () {
        board.querySelectorAll(".match-card").forEach(function (el) {
          el.classList.remove("is-flipped");
        });
        state.peeking = false;
        state.lock = false;
        $("play-hint").textContent = "Find two of the same picture.";
        startTimer(cfg);
      }, cfg.peekMs);
    } else {
      state.lock = false;
      $("play-hint").textContent = "Find two of the same picture.";
      startTimer(cfg);
    }
  }

  function levelBlurb(cfg) {
    const bits = [cfg.pairs + " pairs"];
    if (cfg.peekMs) bits.push("a short peek to start");
    if (cfg.timeSec) bits.push(formatTime(cfg.timeSec) + " on the clock");
    if (cfg.similar) bits.push("look-alike birds and gators");
    bits.push("+" + cfg.points + " points per match");
    return bits.join(" · ");
  }

  function startTimer(cfg) {
    if (!cfg.timeSec) {
      $("play-timer-wrap").hidden = true;
      return;
    }
    $("play-timer-wrap").hidden = false;
    updateTimerHud();
    state.timerId = setInterval(function () {
      state.leftSec -= 1;
      updateTimerHud();
      if (state.leftSec <= 0) {
        clearInterval(state.timerId);
        state.timerId = null;
        onTimeUp();
      }
    }, 1000);
  }

  function updateTimerHud() {
    const el = $("play-timer");
    if (!el) return;
    el.textContent = formatTime(state.leftSec);
    el.classList.toggle("is-low", state.leftSec > 0 && state.leftSec <= 15);
  }

  function onTimeUp() {
    state.lock = true;
    $("fail-text").textContent =
      "Time ran out on level " + state.level + ". Your score stays — try this stretch again.";
    showScreen("screen-fail");
  }

  function onCardClick(idx) {
    if (state.lock || state.peeking) return;
    const btn = document.querySelector('.match-card[data-idx="' + idx + '"]');
    if (!btn || btn.classList.contains("is-flipped") || btn.classList.contains("is-matched")) return;
    if (state.open.length >= 2) return;

    btn.classList.add("is-flipped");
    btn.setAttribute("aria-label", state.cards[idx].photo.title);
    state.open.push(idx);

    if (state.open.length < 2) return;

    const a = state.open[0];
    const b = state.open[1];
    const ca = state.cards[a];
    const cb = state.cards[b];
    const cfg = LEVELS[state.level - 1];

    if (ca.id === cb.id) {
      state.lock = true;
      setTimeout(function () {
        markMatched(a, b, cfg.points);
      }, 220);
    } else {
      state.lock = true;
      setTimeout(function () {
        const ba = document.querySelector('.match-card[data-idx="' + a + '"]');
        const bb = document.querySelector('.match-card[data-idx="' + b + '"]');
        if (ba) {
          ba.classList.remove("is-flipped");
          ba.setAttribute("aria-label", "Hidden card");
        }
        if (bb) {
          bb.classList.remove("is-flipped");
          bb.setAttribute("aria-label", "Hidden card");
        }
        state.open = [];
        state.lock = false;
      }, cfg.mismatchMs);
    }
  }

  function markMatched(a, b, pts) {
    const ba = document.querySelector('.match-card[data-idx="' + a + '"]');
    const bb = document.querySelector('.match-card[data-idx="' + b + '"]');
    if (ba) ba.classList.add("is-matched");
    if (bb) bb.classList.add("is-matched");
    state.matches += 1;
    state.score += pts;
    state.open = [];
    paintHud();
    popPoints(bb || ba, pts);
    announceMatch(state.cards[a].photo.title, pts);

    if (state.matches >= state.need) {
      if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
      }
      setTimeout(onLevelClear, 450);
    } else {
      state.lock = false;
    }
  }

  function popPoints(el, pts) {
    if (!el) return;
    const pop = document.createElement("span");
    pop.className = "match-pop";
    pop.textContent = "+" + pts;
    el.appendChild(pop);
    setTimeout(function () {
      pop.remove();
    }, 900);
  }

  function announceMatch(title, pts) {
    const live = $("match-live");
    if (live) live.textContent = "Match: " + title + ". +" + pts + " points.";
    if ($("play-hint")) $("play-hint").textContent = "Matched " + title + "  ·  +" + pts;
  }

  function onLevelClear() {
    if (state.completed.indexOf(state.level) === -1) {
      state.completed.push(state.level);
    }
    if (state.unlocked < TOTAL_LEVELS && state.level >= state.unlocked) {
      state.unlocked = Math.min(TOTAL_LEVELS, state.level + 1);
    }
    save();
    paintHud();

    const allDone = state.completed.length >= TOTAL_LEVELS;
    $("clear-title").textContent = allDone ? "All 15 levels cleared!" : "Level " + state.level + " complete";
    $("clear-score").textContent = "Score " + state.score;
    $("clear-text").textContent = allDone
      ? "You matched every stretch. Choose a gift certificate below."
      : "Nice work. Level " + Math.min(TOTAL_LEVELS, state.level + 1) + " is open.";

    const nextBtn = $("btn-next-level");
    const rewardBox = $("reward-choose");
    if (allDone && !state.reward) {
      nextBtn.hidden = true;
      rewardBox.hidden = false;
    } else if (allDone && state.reward) {
      nextBtn.hidden = true;
      rewardBox.hidden = true;
      showExistingRewardOnClear();
    } else {
      nextBtn.hidden = false;
      nextBtn.textContent = "Level " + (state.level + 1);
      rewardBox.hidden = true;
    }

    showScreen("screen-clear");
  }

  function showExistingRewardOnClear() {
    const box = $("reward-done");
    if (!box || !state.reward) return;
    box.hidden = false;
    $("reward-done-code").textContent = state.reward.code;
    $("reward-done-text").textContent = "Your gift: " + rewardLabel(state.reward) + ".";
  }

  function chooseReward(kind) {
    const reward = grantReward(kind);
    $("reward-choose").hidden = true;
    const box = $("reward-done");
    box.hidden = false;
    $("reward-done-code").textContent = reward.code;
    $("reward-done-text").textContent =
      "Your gift certificate is for " + rewardLabel(reward) + ". The shop form will fill this in.";
    paintStartReward();
  }

  function escapeAttr(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  // ---- Unobtrusive ads (prints → shop basket; cookies/spices → MariCooks) ----
  function printAds(count) {
    const photos = shuffle((window.SITE_CONFIG && SITE_CONFIG.photos) || []);
    return photos.slice(0, count).map(function (p) {
      return {
        title: p.title,
        file: "images/prints/" + p.file,
        href: "shop.html?print=" + encodeURIComponent(p.title) + "#order-form",
        blurb: "Print · add to order",
        local: true,
      };
    });
  }

  function adHtml(ad, extraClass) {
    const target = ad.local ? "" : ' target="_blank" rel="noopener noreferrer"';
    return (
      '<a class="quiet-ad ' +
      (extraClass || "") +
      '" href="' +
      ad.href +
      '"' +
      target +
      ">" +
      '<img src="' +
      ad.file +
      '" alt="" />' +
      "<span>" +
      '<strong>' +
      escapeAttr(ad.title) +
      "</strong>" +
      '<em>' +
      escapeAttr(ad.blurb) +
      "</em>" +
      "</span>" +
      "</a>"
    );
  }

  function renderAds() {
    const prints = printAds(4);
    const cookie = COOKIE_ADS[Math.floor(Math.random() * COOKIE_ADS.length)];
    const spice = SPICE_ADS[Math.floor(Math.random() * SPICE_ADS.length)];

    const left = $("ad-rail-left");
    const right = $("ad-rail-right");
    const strip = $("ad-strip");
    if (left) {
      left.innerHTML =
        '<p class="quiet-ad-kicker">From the shop</p>' +
        adHtml(prints[0]) +
        adHtml(prints[1]);
    }
    if (right) {
      right.innerHTML =
        '<p class="quiet-ad-kicker">From MariCooks</p>' +
        adHtml(cookie) +
        adHtml(spice);
    }
    if (strip) {
      strip.innerHTML =
        adHtml(prints[2], "quiet-ad-inline") +
        adHtml(prints[3], "quiet-ad-inline") +
        adHtml(COOKIE_ADS[(COOKIE_ADS.indexOf(cookie) + 1) % COOKIE_ADS.length], "quiet-ad-inline") +
        adHtml(SPICE_ADS[(SPICE_ADS.indexOf(spice) + 1) % SPICE_ADS.length], "quiet-ad-inline");
    }
  }

  function resetProgress() {
    if (!confirm("Reset Wildlife Match progress on this device? Gift codes already earned stay until you clear them.")) {
      return;
    }
    const keep = state.reward;
    state.score = 0;
    state.unlocked = 1;
    state.completed = [];
    state.reward = keep;
    save();
    paintHud();
    buildLevelGrid();
    paintStartReward();
  }

  function quitPlay() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
    state.lock = true;
    showScreen("screen-start");
    buildLevelGrid();
    paintStartReward();
  }

  function bind() {
    $("btn-start") &&
      $("btn-start").addEventListener("click", function () {
        startLevel(state.unlocked < TOTAL_LEVELS ? state.unlocked : 1);
      });
    $("btn-levels") &&
      $("btn-levels").addEventListener("click", function () {
        buildLevelGrid();
        showScreen("screen-levels");
      });
    $("btn-how") &&
      $("btn-how").addEventListener("click", function () {
        const box = $("how-box");
        if (box) box.hidden = !box.hidden;
      });

    $("btn-levels-back") &&
      $("btn-levels-back").addEventListener("click", function () {
        showScreen("screen-start");
      });
    $("btn-reset") && $("btn-reset").addEventListener("click", resetProgress);
    $("btn-quit-play") && $("btn-quit-play").addEventListener("click", quitPlay);
    $("btn-fail-retry") &&
      $("btn-fail-retry").addEventListener("click", function () {
        startLevel(state.level);
      });
    $("btn-fail-menu") &&
      $("btn-fail-menu").addEventListener("click", function () {
        showScreen("screen-start");
      });
    $("btn-next-level") &&
      $("btn-next-level").addEventListener("click", function () {
        startLevel(Math.min(TOTAL_LEVELS, state.level + 1));
      });
    $("btn-clear-menu") &&
      $("btn-clear-menu").addEventListener("click", function () {
        showScreen("screen-start");
        buildLevelGrid();
        paintStartReward();
      });

    $("level-grid") &&
      $("level-grid").addEventListener("click", function (e) {
        const btn = e.target.closest("[data-level]");
        if (!btn || btn.disabled) return;
        startLevel(Number(btn.getAttribute("data-level")));
      });

    $("match-board") &&
      $("match-board").addEventListener("click", function (e) {
        const btn = e.target.closest(".match-card");
        if (!btn) return;
        onCardClick(Number(btn.getAttribute("data-idx")));
      });

    document.querySelectorAll("[data-reward]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        chooseReward(btn.getAttribute("data-reward"));
      });
    });
  }

  load();
  bind();
  paintHud();
  buildLevelGrid();
  paintStartReward();
  renderAds();
  showScreen("screen-start");
})();
