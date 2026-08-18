/**
 * Private visitor dashboard for metrics.html
 */
(function () {
  "use strict";

  var api = window.FNP_ANALYTICS;
  if (!api) return;

  var statusEl = document.getElementById("metrics-status");
  var updatedEl = document.getElementById("metrics-updated");

  function $(id) {
    return document.getElementById(id);
  }

  function formatNumber(n) {
    return Number(n || 0).toLocaleString("en-US");
  }

  function timeAgo(unix) {
    if (!unix) return "";
    var seconds = Math.max(0, Math.floor(Date.now() / 1000) - Number(unix));
    if (seconds < 45) return "just now";
    if (seconds < 3600) {
      var mins = Math.round(seconds / 60);
      return mins + (mins === 1 ? " minute ago" : " minutes ago");
    }
    if (seconds < 86400) {
      var hours = Math.round(seconds / 3600);
      return hours + (hours === 1 ? " hour ago" : " hours ago");
    }
    var days = Math.round(seconds / 86400);
    if (days === 1) return "yesterday";
    if (days < 14) return days + " days ago";
    return new Date(unix * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function placeLine(item) {
    var parts = [item.c, item.r, item.co].filter(Boolean);
    if (!parts.length) return "Location hidden";
    return "Near " + parts.join(", ");
  }

  function ranked(map, limit) {
    return Object.keys(map || {})
      .map(function (key) {
        return { key: key, value: Number(map[key]) || 0 };
      })
      .filter(function (row) {
        return row.value > 0;
      })
      .sort(function (a, b) {
        return b.value - a.value;
      })
      .slice(0, limit || 8);
  }

  function lastDays(count) {
    var days = [];
    var now = new Date();
    for (var i = count - 1; i >= 0; i--) {
      var d = new Date(now.getTime() - i * 86400000);
      days.push(api.floridaDay(d));
    }
    return days;
  }

  function sumDays(log, keys, field) {
    return keys.reduce(function (total, key) {
      var row = (log.days && log.days[key]) || {};
      return total + (Number(row[field]) || 0);
    }, 0);
  }

  function setStatus(text, kind) {
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.className = "metrics-status" + (kind ? " is-" + kind : "");
  }

  function renderBars(id, rows, labelFn) {
    var el = $(id);
    if (!el) return;
    if (!rows.length) {
      el.innerHTML = '<p class="metrics-empty">Nothing here yet.</p>';
      return;
    }
    var max = Math.max.apply(
      null,
      rows.map(function (row) {
        return row.value;
      })
    );
    el.innerHTML = rows
      .map(function (row) {
        var width = max ? Math.max(8, Math.round((row.value / max) * 100)) : 8;
        return (
          '<div class="metrics-bar-row">' +
          '<div class="metrics-bar-label">' +
          escapeHtml(labelFn ? labelFn(row.key) : row.key) +
          "</div>" +
          '<div class="metrics-bar-track"><span style="width:' +
          width +
          '%"></span></div>' +
          '<div class="metrics-bar-num">' +
          formatNumber(row.value) +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderChart(log) {
    var el = $("metrics-chart");
    if (!el) return;
    var days = lastDays(14);
    var values = days.map(function (day) {
      var row = (log.days && log.days[day]) || {};
      return Number(row.u) || 0;
    });
    var max = Math.max.apply(null, values.concat([1]));
    el.innerHTML = days
      .map(function (day, i) {
        var value = values[i];
        var height = Math.max(4, Math.round((value / max) * 100));
        var label = day.slice(5).replace("-", "/");
        return (
          '<div class="metrics-col" title="' +
          escapeHtml(day) +
          ": " +
          value +
          ' people">' +
          '<div class="metrics-col-val">' +
          (value ? value : "") +
          "</div>" +
          '<div class="metrics-col-bar" style="height:' +
          height +
          '%"></div>' +
          '<div class="metrics-col-label">' +
          label +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderPeople(log) {
    var el = $("metrics-people");
    if (!el) return;
    var items = (log.recent || []).slice(0, 25);
    if (!items.length) {
      el.innerHTML =
        '<p class="metrics-empty">No visitors yet. After the site is online, this list fills in as people open pages.</p>';
      return;
    }
    el.innerHTML = items
      .map(function (item) {
        var who = placeLine(item);
        var page = api.pageLabel(item.p);
        var device = api.deviceLabel(item.d);
        var badge = item.n ? "New" : "Return";
        return (
          '<article class="metrics-person">' +
          '<div class="metrics-person-top">' +
          '<p class="metrics-person-where">' +
          escapeHtml(who) +
          "</p>" +
          '<span class="metrics-badge' +
          (item.n ? " is-new" : "") +
          '">' +
          badge +
          "</span>" +
          "</div>" +
          '<p class="metrics-person-meta">' +
          escapeHtml(page) +
          " · " +
          escapeHtml(timeAgo(item.t)) +
          " · " +
          escapeHtml(device) +
          (item.i ? " · visitor " + escapeHtml(item.i) : "") +
          "</p>" +
          (item.s
            ? '<p class="metrics-person-src">Arrived from ' +
              escapeHtml(item.s) +
              "</p>"
            : "") +
          "</article>"
        );
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(log, counters) {
    var today = api.floridaDay();
    var week = lastDays(7);
    var people = Math.max(Number(counters.people) || 0, Number(log.visitors) || 0);
    var views = Math.max(Number(counters.views) || 0, Number(log.pageviews) || 0);
    var todayPeople = ((log.days && log.days[today]) || {}).u || 0;
    var weekPeople = sumDays(log, week, "u");

    $("stat-people").textContent = formatNumber(people);
    $("stat-views").textContent = formatNumber(views);
    $("stat-today").textContent = formatNumber(todayPeople);
    $("stat-week").textContent = formatNumber(weekPeople);

    renderChart(log);
    renderPeople(log);
    renderBars("metrics-pages", ranked(log.pages, 8), api.pageLabel);
    renderBars("metrics-places", ranked(log.places, 8));
    renderBars("metrics-refs", ranked(log.refs, 8), function (key) {
      if (key === "direct") return "Typed or bookmarked";
      return key;
    });

    if (updatedEl) {
      updatedEl.textContent = log.updated
        ? "Last visit " + timeAgo(log.updated)
        : "Waiting for the first live visit";
    }

    if (!people && !views) {
      setStatus("No live visits yet. Counts start after the site is published.", "wait");
    } else {
      setStatus("Live visitor numbers for floridanatureprints.com", "ok");
    }
  }

  function load() {
    setStatus("Refreshing…");
    return Promise.all([
      api.loadLog().catch(function () {
        return api.emptyLog();
      }),
      api.readCounter("people"),
      api.readCounter("views"),
    ])
      .then(function (parts) {
        render(parts[0], { people: parts[1], views: parts[2] });
      })
      .catch(function () {
        setStatus("Could not load visitor numbers. Try Refresh.", "err");
      });
  }

  var refreshBtn = $("metrics-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      load();
    });
  }

  load();
  setInterval(load, 30000);
})();
