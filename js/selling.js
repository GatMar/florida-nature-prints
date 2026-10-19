/* Selling switch. Reads SITE_CONFIG.sellingEnabled.
 * Every selling element carries a data-sell attribute and is hidden by CSS while
 * <html> has the class "selling-off" (the default written in each page).
 * ?preview=buy shows them greyed out as DRAFT for review; clicks and form
 * submits inside them are blocked. ?preview=off ends the preview. */
(function (window, document) {
  "use strict";
  var KEY = "fnp-preview-buy";
  var on = !!(window.SITE_CONFIG && window.SITE_CONFIG.sellingEnabled === true);
  var preview = false;
  try {
    var q = new URLSearchParams(window.location.search).get("preview");
    if (q === "buy") window.sessionStorage.setItem(KEY, "1");
    if (q === "off") window.sessionStorage.removeItem(KEY);
    preview = !on && window.sessionStorage.getItem(KEY) === "1";
  } catch (e) {
    preview = false;
  }
  var root = document.documentElement;
  root.classList.remove("selling-off", "selling-on", "selling-preview");
  root.classList.add(on ? "selling-on" : preview ? "selling-preview" : "selling-off");

  window.FNP_SELLING = { enabled: on, preview: preview, visible: on || preview };

  if (!preview) return;

  function blocked(e) {
    var el = e.target && e.target.closest && e.target.closest("[data-sell]");
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
  }
  document.addEventListener("click", blocked, true);
  document.addEventListener("submit", blocked, true);

  function banner() {
    if (document.getElementById("sell-preview-banner")) return;
    var b = document.createElement("div");
    b.id = "sell-preview-banner";
    b.className = "sell-preview-banner";
    b.setAttribute("role", "status");
    b.innerHTML =
      "DRAFT preview: selling is off. Greyed items are hidden on the live site. " +
      '<a href="?preview=off">End preview</a>';
    document.body.appendChild(b);
  }
  if (document.body) banner();
  else document.addEventListener("DOMContentLoaded", banner);
})(window, document);
