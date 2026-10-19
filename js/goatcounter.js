/**
 * GoatCounter page views and photo views for the owner stats page (metrics.html).
 * Counting happens on GoatCounter's own server; nothing is stored or edited from the browser.
 * Inert until SITE_CONFIG.analytics.goatcounterCode is filled in. Never runs on
 * metrics.html or studio.html, on local previews, or for known bots.
 */
(function (window, document) {
  "use strict";

  var queue = [];

  function analyticsConfig() {
    return (window.SITE_CONFIG && window.SITE_CONFIG.analytics) || {};
  }

  function currentPage() {
    return window.location.pathname.split("/").pop() || "index.html";
  }

  function isLiveHost() {
    var host = window.location.hostname || "";
    if (window.location.protocol === "file:") return false;
    if (!host || host === "localhost" || host === "127.0.0.1") return false;
    return true;
  }

  function isBot() {
    var ua = navigator.userAgent || "";
    return /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternal|pingdom|pagespeed/i.test(ua);
  }

  function goatcounterCode() {
    var code = String(analyticsConfig().goatcounterCode || "").trim();
    return /^[a-z0-9-]+$/i.test(code) ? code : "";
  }

  function allowed() {
    var page = currentPage();
    return !!goatcounterCode() && isLiveHost() && !isBot() && page !== "metrics.html" && page !== "studio.html";
  }

  function ready() {
    return !!(window.goatcounter && typeof window.goatcounter.count === "function");
  }

  function flush() {
    if (!ready()) return;
    while (queue.length) {
      try {
        window.goatcounter.count(queue.shift());
      } catch (e) {
        /* ignore */
      }
    }
  }

  function load() {
    if (!allowed()) return;
    if (document.querySelector("script[data-goatcounter]")) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + goatcounterCode() + ".goatcounter.com/count");
    s.onload = flush;
    document.head.appendChild(s);
  }

  // Called by the lightbox each time a photo is opened or enlarged.
  // Recorded as an event with the path photo/<category>/<file>.
  function trackPhoto(file, category, title) {
    if (!allowed() || !file) return;
    var cat = String(category || "other").replace(/[^a-z0-9-]/gi, "") || "other";
    var name = String(file).replace(/^.*\//, "");
    queue.push({ path: "photo/" + cat + "/" + name, title: String(title || name), event: true });
    if (queue.length > 50) queue.shift();
    flush();
  }

  window.FNP_ANALYTICS = { trackPhoto: trackPhoto, goatcounterCode: goatcounterCode };
  load();
})(window, document);
