/**
 * Record public page views for the private metrics dashboard.
 * Does not run on metrics.html. Skips local file previews and known bots.
 */
(function (window) {
  "use strict";

  var PAGE_LABELS = {
    "index.html": "Home",
    "": "Home",
    "gallery.html": "Gallery",
    "shop.html": "Shop",
    "game.html": "Wildlife Match",
    "about.html": "About",
    "contact.html": "Contact",
  };

  var DEVICE_LABELS = {
    phone: "Phone",
    tablet: "Tablet",
    computer: "Computer",
  };

  function emptyLog() {
    return {
      v: 1,
      updated: 0,
      pageviews: 0,
      visitors: 0,
      days: {},
      pages: {},
      places: {},
      refs: {},
      devices: {},
      recent: [],
    };
  }

  function analyticsConfig() {
    return (window.SITE_CONFIG && SITE_CONFIG.analytics) || {};
  }

  function currentPage() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function pageLabel(page) {
    var key = String(page || "").split("?")[0];
    return PAGE_LABELS[key] || key || "A page";
  }

  function deviceLabel(device) {
    return DEVICE_LABELS[device] || "Unknown device";
  }

  function floridaDay(date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date || new Date());
  }

  function isLiveHost() {
    var host = window.location.hostname || "";
    if (window.location.protocol === "file:") return false;
    if (!host || host === "localhost" || host === "127.0.0.1") return false;
    return true;
  }

  function isBot() {
    var ua = navigator.userAgent || "";
    return /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternal|pingdom|pagespeed/i.test(
      ua
    );
  }

  function detectDevice() {
    var ua = navigator.userAgent || "";
    if (/iPad|Tablet|PlayBook/i.test(ua)) return "tablet";
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "phone";
    return "computer";
  }

  function visitSource() {
    var ref = document.referrer || "";
    if (!ref) return { key: "direct", label: "Typed or bookmarked" };
    try {
      var url = new URL(ref);
      var host = (url.hostname || "").replace(/^www\./, "");
      var here = (window.location.hostname || "").replace(/^www\./, "");
      if (host && here && host === here) {
        return { key: "internal", label: "Another page on this site" };
      }
      return { key: host || "other", label: host || "Another website" };
    } catch (err) {
      return { key: "other", label: "Another website" };
    }
  }

  function visitorId() {
    var key = "fnp_vid";
    var created = false;
    var id = "";
    try {
      id = localStorage.getItem(key) || "";
      if (!id) {
        id =
          "v" +
          Math.random().toString(36).slice(2, 10) +
          Date.now().toString(36);
        localStorage.setItem(key, id);
        created = true;
      }
    } catch (err) {
      id = "tmp" + String(Date.now());
      created = true;
    }
    return { id: id, isNew: created };
  }

  function bump(map, key, n) {
    if (!key) return;
    map[key] = (map[key] || 0) + (n || 1);
  }

  function pruneMap(map, keep) {
    var keys = Object.keys(map);
    if (keys.length <= keep) return map;
    keys.sort(function (a, b) {
      return (map[a] || 0) - (map[b] || 0);
    });
    var next = {};
    keys.slice(keys.length - keep).forEach(function (k) {
      next[k] = map[k];
    });
    return next;
  }

  function pruneDays(days) {
    var keys = Object.keys(days).sort();
    while (keys.length > 90) {
      delete days[keys.shift()];
    }
    return days;
  }

  function placeKey(geo) {
    var parts = [geo.city, geo.region, geo.country].filter(Boolean);
    return parts.join(", ") || "Location hidden";
  }

  function extractJson(page) {
    if (!page || !page.content) return null;
    var text = "";
    function walk(node) {
      if (typeof node === "string") text += node;
      else if (node && node.children) node.children.forEach(walk);
    }
    page.content.forEach(walk);
    if (!text) return emptyLog();
    try {
      var data = JSON.parse(text);
      if (!data || typeof data !== "object") return null;
      return normalizeLog(data);
    } catch (err) {
      return null;
    }
  }

  function normalizeLog(data) {
    var log = emptyLog();
    log.updated = Number(data.updated) || 0;
    log.pageviews = Number(data.pageviews) || 0;
    log.visitors = Number(data.visitors) || 0;
    log.days = data.days && typeof data.days === "object" ? data.days : {};
    log.pages = data.pages && typeof data.pages === "object" ? data.pages : {};
    log.places = data.places && typeof data.places === "object" ? data.places : {};
    log.refs = data.refs && typeof data.refs === "object" ? data.refs : {};
    log.devices =
      data.devices && typeof data.devices === "object" ? data.devices : {};
    log.recent = Array.isArray(data.recent) ? data.recent : [];
    return log;
  }

  function loadLog() {
    var cfg = analyticsConfig();
    var path = cfg.storePath;
    if (!path) return Promise.resolve(emptyLog());
    return fetch(
      "https://api.telegra.ph/getPage/" +
        encodeURIComponent(path) +
        "?return_content=true",
      { cache: "no-store" }
    )
      .then(function (res) {
        if (!res.ok) throw new Error("Could not read visitor log");
        return res.json();
      })
      .then(function (body) {
        if (!body || !body.ok) throw new Error("Could not read visitor log");
        var log = extractJson(body.result);
        if (!log) throw new Error("Visitor log looks damaged");
        return log;
      });
  }

  function saveLog(log) {
    var cfg = analyticsConfig();
    if (!cfg.storePath || !cfg.storeToken) {
      return Promise.reject(new Error("Visitor log is not configured"));
    }
    var payload = {
      v: 1,
      updated: log.updated,
      pageviews: log.pageviews,
      visitors: log.visitors,
      days: log.days,
      pages: log.pages,
      places: log.places,
      refs: log.refs,
      devices: log.devices,
      recent: log.recent,
    };
    var content = JSON.stringify([
      { tag: "code", children: [JSON.stringify(payload)] },
    ]);
    var body = new URLSearchParams();
    body.set("access_token", cfg.storeToken);
    body.set("title", cfg.storeTitle || "fnp-vlog-k8w3n1");
    body.set("author_name", "Florida Nature Prints");
    body.set("content", content);
    return fetch(
      "https://api.telegra.ph/editPage/" + encodeURIComponent(cfg.storePath),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      }
    ).then(function (res) {
      if (!res.ok) throw new Error("Could not save visitor log");
      return res.json();
    }).then(function (json) {
      if (!json || !json.ok) throw new Error("Could not save visitor log");
      return log;
    });
  }

  function hitCounter(name) {
    var space = analyticsConfig().counterSpace || "floridanatureprints";
    return fetch(
      "https://abacus.jasoncameron.dev/hit/" +
        encodeURIComponent(space) +
        "/" +
        encodeURIComponent(name),
      { cache: "no-store" }
    )
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .catch(function () {
        return null;
      });
  }

  function readCounter(name) {
    var space = analyticsConfig().counterSpace || "floridanatureprints";
    return fetch(
      "https://abacus.jasoncameron.dev/get/" +
        encodeURIComponent(space) +
        "/" +
        encodeURIComponent(name),
      { cache: "no-store" }
    )
      .then(function (res) {
        return res.ok ? res.json() : { value: 0 };
      })
      .then(function (json) {
        return Number(json && json.value) || 0;
      })
      .catch(function () {
        return 0;
      });
  }

  function locate() {
    return fetch("https://ipwho.is/?fields=success,city,region,country,country_code", {
      cache: "no-store",
    })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (json) {
        if (json && json.success) {
          return {
            city: json.city || "",
            region: json.region || "",
            country: json.country || "",
            cc: json.country_code || "",
          };
        }
        throw new Error("geo fallback");
      })
      .catch(function () {
        return fetch("https://get.geojs.io/v1/ip/geo.json", { cache: "no-store" })
          .then(function (res) {
            return res.ok ? res.json() : {};
          })
          .then(function (json) {
            json = json || {};
            return {
              city: json.city || "",
              region: json.region || "",
              country: json.country || "",
              cc: json.country_code || "",
            };
          });
      })
      .catch(function () {
        return { city: "", region: "", country: "", cc: "" };
      });
  }

  function applyVisit(log, visit) {
    var day = log.days[visit.day] || { p: 0, u: 0 };
    day.p += 1;
    if (visit.isNew) day.u += 1;
    log.days[visit.day] = day;
    log.days = pruneDays(log.days);

    log.pageviews += 1;
    if (visit.isNew) log.visitors += 1;

    bump(log.pages, visit.page, 1);
    bump(log.places, visit.place, 1);
    if (visit.refKey && visit.refKey !== "internal") {
      bump(log.refs, visit.refKey, 1);
    }
    bump(log.devices, visit.device, 1);

    log.pages = pruneMap(log.pages, 40);
    log.places = pruneMap(log.places, 40);
    log.refs = pruneMap(log.refs, 40);
    log.recent.unshift({
      t: visit.time,
      p: visit.page,
      c: visit.city,
      r: visit.region,
      co: visit.country,
      s: visit.refLabel,
      d: visit.device,
      n: visit.isNew ? 1 : 0,
      i: visit.tag,
    });
    if (log.recent.length > 150) log.recent.length = 150;
    log.updated = visit.time;
    return log;
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function recordVisit() {
    if (!isLiveHost() || isBot()) return Promise.resolve(null);
    if (currentPage() === "metrics.html") return Promise.resolve(null);

    var who = visitorId();
    var page = currentPage();
    var device = detectDevice();
    var source = visitSource();
    var time = Math.floor(Date.now() / 1000);
    var day = floridaDay();

    var viewsHit = hitCounter("views");
    var peopleHit = who.isNew ? hitCounter("people") : Promise.resolve(null);

    return Promise.all([locate(), viewsHit, peopleHit])
      .then(function (parts) {
        var geo = parts[0] || {};
        var visit = {
          time: time,
          day: day,
          page: page,
          device: device,
          isNew: who.isNew,
          tag: String(who.id || "").slice(-4),
          city: geo.city || "",
          region: geo.region || "",
          country: geo.country || "",
          place: placeKey(geo),
          refKey: source.key,
          refLabel: source.label,
        };

        function attempt(left) {
          return loadLog()
            .then(function (log) {
              return saveLog(applyVisit(log, visit));
            })
            .catch(function (err) {
              if (left <= 1) throw err;
              return sleep(250 + Math.random() * 400).then(function () {
                return attempt(left - 1);
              });
            });
        }

        return attempt(3);
      })
      .catch(function () {
        return null;
      });
  }

  window.FNP_ANALYTICS = {
    emptyLog: emptyLog,
    loadLog: loadLog,
    readCounter: readCounter,
    pageLabel: pageLabel,
    deviceLabel: deviceLabel,
    floridaDay: floridaDay,
    placeKey: placeKey,
    recordVisit: recordVisit,
  };

  if (currentPage() !== "metrics.html") {
    recordVisit();
  }
})(window);
