/* Owner stats from GoatCounter (page views, visits, photo views, sources, devices).
 * The API key is typed in by the owner and kept only in this browser (localStorage).
 * It is never written into the site files. */
(function (window, document) {
  "use strict";

  var KEY_STORE = "fnp-gc-api-key";
  var CODE_STORE = "fnp-gc-site-code";
  var cfg = (window.SITE_CONFIG && window.SITE_CONFIG.analytics) || {};
  var photos = (window.SITE_CONFIG && window.SITE_CONFIG.photos) || [];
  var categories = (window.SITE_CONFIG && window.SITE_CONFIG.categories) || [];

  function $(id) {
    return document.getElementById(id);
  }

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function num(n) {
    return Number(n || 0).toLocaleString("en-US");
  }

  function store(k, v) {
    try {
      if (v === undefined) return window.localStorage.getItem(k) || "";
      if (v === "") window.localStorage.removeItem(k);
      else window.localStorage.setItem(k, v);
    } catch (e) {
      return "";
    }
    return v;
  }

  function siteCode() {
    var c = String(store(CODE_STORE) || cfg.goatcounterCode || "").trim();
    return /^[a-z0-9-]+$/i.test(c) ? c : "";
  }

  function setStatus(msg) {
    var el = $("gc-status");
    if (el) el.textContent = msg;
  }

  function isoDay(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function toApiTime(dayStr, endOfDay) {
    var p = dayStr.split("-").map(Number);
    var d = endOfDay ? new Date(p[0], p[1] - 1, p[2] + 1) : new Date(p[0], p[1] - 1, p[2]);
    if (endOfDay && d > new Date()) {
      d = new Date();
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() + 1);
    }
    return d.toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  // GoatCounter allows about 4 requests a second, so space calls out.
  var lastCall = 0;
  function api(path, params) {
    var key = store(KEY_STORE);
    var code = siteCode();
    if (!key || !code) return Promise.reject(new Error("Add your site code and API key first."));
    var qs = [];
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null || v === "") return;
      (Array.isArray(v) ? v : [v]).forEach(function (one) {
        qs.push(encodeURIComponent(k) + "=" + encodeURIComponent(one));
      });
    });
    var url = "https://" + code + ".goatcounter.com/api/v0" + path + (qs.length ? "?" + qs.join("&") : "");
    var wait = Math.max(0, lastCall + 300 - Date.now());
    lastCall = Date.now() + wait;
    return new Promise(function (r) {
      setTimeout(r, wait);
    })
      .then(function () {
        return fetch(url, {
          headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        });
      })
      .then(function (res) {
        if (res.status === 401 || res.status === 403) throw new Error("GoatCounter did not accept the API key.");
        if (res.status === 429) throw new Error("Too many requests. Wait a minute and press Load again.");
        if (!res.ok) throw new Error("GoatCounter answered " + res.status + ".");
        return res.json();
      });
  }

  // ---- Photo paths look like photo/<category>/<file> ----
  function parsePhotoPath(path) {
    var m = /^\/?photo\/([^/]+)\/(.+)$/.exec(String(path || ""));
    return m ? { category: m[1], file: m[2] } : null;
  }

  function photoTitle(file) {
    for (var i = 0; i < photos.length; i++) if (photos[i].file === file) return photos[i].title;
    return file;
  }

  function catLabel(id) {
    for (var i = 0; i < categories.length; i++) if (categories[i].id === id) return categories[i].label;
    return id;
  }

  function sourceLabel(name) {
    return name ? name : "Direct or unknown";
  }

  function allHits(range) {
    var out = [];
    function page(exclude, left) {
      return api("/stats/hits", { start: range.start, end: range.end, limit: 100, daily: true, exclude_paths: exclude }).then(
        function (json) {
          var hits = json.hits || [];
          out = out.concat(hits);
          if (json.more && hits.length && left > 1) {
            return page(
              out.map(function (h) {
                return h.path_id;
              }),
              left - 1
            );
          }
          return out;
        }
      );
    }
    return page([], 5);
  }

  function bars(id, rows) {
    var el = $(id);
    if (!el) return;
    if (!rows.length) {
      el.innerHTML = '<p class="metrics-empty">Nothing here yet.</p>';
      return;
    }
    var max = Math.max.apply(
      null,
      rows.map(function (r) {
        return r.value;
      })
    );
    el.innerHTML = rows
      .map(function (r) {
        var w = max ? Math.max(8, Math.round((r.value / max) * 100)) : 8;
        return (
          '<div class="metrics-bar-row"><div class="metrics-bar-label">' +
          esc(r.label) +
          '</div><div class="metrics-bar-track"><span style="width:' +
          w +
          '%"></span></div><div class="metrics-bar-num">' +
          num(r.value) +
          "</div></div>"
        );
      })
      .join("");
  }

  function readFilters() {
    var today = isoDay(new Date());
    var from = $("gc-from").value || isoDay(new Date(Date.now() - 29 * 864e5));
    var to = $("gc-to").value || today;
    if (from > to) {
      var t = from;
      from = to;
      to = t;
    }
    return {
      start: toApiTime(from, false),
      end: toApiTime(to, true),
      category: $("gc-category").value,
      photo: $("gc-photo").value,
      source: $("gc-source").value,
    };
  }

  function fillPhotoChoices() {
    var cat = $("gc-category").value;
    var sel = $("gc-photo");
    var keep = sel.value;
    var list = photos.filter(function (p) {
      return !cat || cat === "pages" || p.category === cat;
    });
    sel.innerHTML =
      '<option value="">All photos</option>' +
      list
        .map(function (p) {
          return '<option value="' + esc(p.file) + '">' + esc(p.title) + "</option>";
        })
        .join("");
    sel.disabled = cat === "pages";
    if (keep && list.some(function (p) { return p.file === keep; })) sel.value = keep;
  }

  function load() {
    var f = readFilters();
    setStatus("Loading from GoatCounter…");
    var state = {};
    allHits(f)
      .then(function (hits) {
        var pageHits = [];
        var photoHits = [];
        hits.forEach(function (h) {
          var ph = h.event ? parsePhotoPath(h.path) : null;
          if (ph) {
            h.photo = ph;
            photoHits.push(h);
          } else if (!h.event) pageHits.push(h);
        });
        // Apply category / photo filter
        var selected = null;
        if (f.category === "pages") selected = pageHits;
        else if (f.photo)
          selected = photoHits.filter(function (h) {
            return h.photo.file === f.photo;
          });
        else if (f.category)
          selected = photoHits.filter(function (h) {
            return h.photo.category === f.category;
          });
        state.pageHits = pageHits;
        state.photoHits = selected && f.category !== "pages" ? selected : f.category === "pages" ? [] : photoHits;
        state.selectedIds = selected
          ? selected.map(function (h) {
              return h.path_id;
            })
          : null;
        if (state.selectedIds && !state.selectedIds.length) state.selectedIds = [-1];
        return api("/stats/total", { start: f.start, end: f.end, include_paths: state.selectedIds || undefined });
      })
      .then(function (total) {
        state.total = total;
        return api("/stats/toprefs", { start: f.start, end: f.end, limit: 20, include_paths: state.selectedIds || undefined });
      })
      .then(function (refs) {
        state.refs = refs.stats || [];
        return api("/stats/sizes", { start: f.start, end: f.end, limit: 20, include_paths: state.selectedIds || undefined });
      })
      .then(function (sizes) {
        state.sizes = sizes.stats || [];
        if (!f.source) return null;
        // Source filter: look up referrers for the top paths in the current view
        var targets = (state.selectedIds ? state.photoHits.concat(f.category === "pages" ? state.pageHits : []) : state.photoHits.concat(state.pageHits))
          .slice()
          .sort(function (a, b) {
            return b.count - a.count;
          })
          .slice(0, 20);
        var rows = [];
        return targets
          .reduce(function (p, h) {
            return p.then(function () {
              return api("/stats/hits/" + h.path_id, { start: f.start, end: f.end, limit: 100 }).then(function (j) {
                (j.refs || []).forEach(function (r) {
                  if (sourceLabel(r.name) === f.source) rows.push({ hit: h, value: r.count });
                });
              });
            });
          }, Promise.resolve())
          .then(function () {
            state.sourceRows = rows;
          });
      })
      .then(function () {
        render(f, state);
        setStatus("Updated " + new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " (Florida time).");
      })
      .catch(function (err) {
        setStatus(
          (err && err.message) ||
            "Could not reach GoatCounter. If this keeps happening, the browser may be blocking the request (see STATS-SETUP.md)."
        );
      });
  }

  function render(f, s) {
    var total = s.total || {};
    var events = total.total_events || 0;
    var pageViews = s.pageHits.reduce(function (a, h) {
      return a + (h.count || 0);
    }, 0);
    var photoViews = s.photoHits.reduce(function (a, h) {
      return a + (h.count || 0);
    }, 0);
    var photoFilter = (f.category && f.category !== "pages") || f.photo;
    $("gc-visits").textContent = photoFilter ? "n/a" : num(Math.max(0, (total.total || 0) - events));
    $("gc-pageviews").textContent = num(f.category && f.category !== "pages" ? 0 : pageViews);
    $("gc-photoviews").textContent = num(f.category === "pages" ? 0 : photoViews);

    bars(
      "gc-top-photos",
      s.photoHits
        .slice()
        .sort(function (a, b) {
          return b.count - a.count;
        })
        .slice(0, 15)
        .map(function (h) {
          return { label: photoTitle(h.photo.file) + " (" + catLabel(h.photo.category) + ")", value: h.count };
        })
    );
    var byCat = {};
    s.photoHits.forEach(function (h) {
      byCat[h.photo.category] = (byCat[h.photo.category] || 0) + h.count;
    });
    bars(
      "gc-categories",
      Object.keys(byCat)
        .map(function (k) {
          return { label: catLabel(k), value: byCat[k] };
        })
        .sort(function (a, b) {
          return b.value - a.value;
        })
    );
    bars(
      "gc-pages",
      s.pageHits
        .slice()
        .sort(function (a, b) {
          return b.count - a.count;
        })
        .slice(0, 12)
        .map(function (h) {
          return { label: h.title ? h.title + " (" + h.path + ")" : h.path, value: h.count };
        })
    );
    var refs = s.refs.map(function (r) {
      return { label: sourceLabel(r.name), value: r.count };
    });
    bars("gc-sources", refs);
    var srcSel = $("gc-source");
    var keep = srcSel.value;
    srcSel.innerHTML =
      '<option value="">All sources</option>' +
      refs
        .map(function (r) {
          return '<option value="' + esc(r.label) + '">' + esc(r.label) + "</option>";
        })
        .join("");
    if (keep) {
      if (!refs.some(function (r) { return r.label === keep; }))
        srcSel.insertAdjacentHTML("beforeend", '<option value="' + esc(keep) + '">' + esc(keep) + "</option>");
      srcSel.value = keep;
    }
    bars(
      "gc-devices",
      s.sizes.map(function (r) {
        return { label: r.name || "Unknown", value: r.count };
      })
    );
    var srcBox = $("gc-source-panel");
    if (f.source && s.sourceRows) {
      srcBox.hidden = false;
      $("gc-source-name").textContent = f.source;
      bars(
        "gc-source-detail",
        s.sourceRows
          .sort(function (a, b) {
            return b.value - a.value;
          })
          .map(function (r) {
            var h = r.hit;
            return { label: h.photo ? photoTitle(h.photo.file) : h.title || h.path, value: r.value };
          })
      );
    } else {
      srcBox.hidden = true;
    }
  }

  function init() {
    if (!$("gc-panel")) return;
    var today = new Date();
    $("gc-to").value = isoDay(today);
    $("gc-from").value = isoDay(new Date(today.getTime() - 29 * 864e5));
    $("gc-category").innerHTML =
      '<option value="">Everything</option><option value="pages">Pages only</option>' +
      categories
        .map(function (c) {
          return '<option value="' + esc(c.id) + '">Photos: ' + esc(c.label) + "</option>";
        })
        .join("");
    fillPhotoChoices();
    $("gc-category").addEventListener("change", fillPhotoChoices);
    $("gc-code").value = siteCode();
    $("gc-key").value = store(KEY_STORE) ? "saved" : "";
    $("gc-key").addEventListener("focus", function () {
      if (this.value === "saved") this.value = "";
    });
    $("gc-save").addEventListener("click", function () {
      var code = $("gc-code").value.trim();
      var key = $("gc-key").value.trim();
      if (code && code !== cfg.goatcounterCode) store(CODE_STORE, code);
      if (!code) store(CODE_STORE, "");
      if (key && key !== "saved") store(KEY_STORE, key);
      $("gc-key").value = store(KEY_STORE) ? "saved" : "";
      setStatus(siteCode() && store(KEY_STORE) ? "Saved in this browser. Press Load." : "Add both a site code and an API key.");
    });
    $("gc-forget").addEventListener("click", function () {
      store(KEY_STORE, "");
      store(CODE_STORE, "");
      $("gc-key").value = "";
      $("gc-code").value = siteCode();
      setStatus("Key removed from this browser.");
    });
    $("gc-load").addEventListener("click", load);
    if (siteCode() && store(KEY_STORE)) load();
    else setStatus("Not set up yet. Add your GoatCounter site code and API key (see STATS-SETUP.md).");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window, document);
