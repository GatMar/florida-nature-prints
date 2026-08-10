/**
 * Site-wide JavaScript: navigation, photo grids, forms, shop
 */

(function () {
  "use strict";

  // ---- Hero video carousel (two muted clips, seamless crossfade, no titles) ----
  (function initHeroVideoCarousel() {
    const a = document.getElementById("hero-video-a");
    const b = document.getElementById("hero-video-b");
    if (!a || !b) return;

    const playSafe = function (v) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    };

    // Prefer reduced motion: freeze on poster only
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      a.removeAttribute("autoplay");
      a.pause();
      b.pause();
      a.classList.add("is-active");
      b.classList.remove("is-active");
      return;
    }

    playSafe(a);

    // Crossfade to the other reel when one ends
    a.loop = false;
    b.loop = false;

    function onEnded(ended, next) {
      next.currentTime = 0;
      playSafe(next);
      ended.classList.remove("is-active");
      next.classList.add("is-active");
    }

    a.addEventListener("ended", function () {
      onEnded(a, b);
    });
    b.addEventListener("ended", function () {
      onEnded(b, a);
    });

    a.addEventListener("error", function () {
      a.loop = true;
      playSafe(a);
    });
    b.addEventListener("error", function () {
      a.loop = true;
      a.classList.add("is-active");
      b.classList.remove("is-active");
      playSafe(a);
    });
  })();

  // ---- Mobile navigation ----
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Mark current page in nav
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // ---- Helpers ----
  function photoUrl(file) {
    // Keep simple relative paths (encoding only breaks some hosts / cases)
    return "images/prints/" + String(file || "").replace(/^\/+/, "");
  }

  function formspreeReady() {
    return (
      SITE_CONFIG.formspreeFormId &&
      SITE_CONFIG.formspreeFormId !== "YOUR_FORM_ID" &&
      SITE_CONFIG.formspreeFormId.trim() !== ""
    );
  }

  function formEndpoint() {
    if (formspreeReady()) {
      return "https://formspree.io/f/" + SITE_CONFIG.formspreeFormId;
    }
    // Default: FormSubmit → emails SITE_CONFIG.yourEmail (no account required)
    return (
      "https://formsubmit.co/ajax/" +
      encodeURIComponent(SITE_CONFIG.yourEmail)
    );
  }

  function formsReady() {
    return !!(SITE_CONFIG.yourEmail && SITE_CONFIG.yourEmail.indexOf("@") > 0);
  }

  // ---- Fill business name in logo / footer ----
  document.querySelectorAll("[data-business-name]").forEach(function (el) {
    el.innerHTML =
      SITE_CONFIG.businessName.replace(
        /Nature/,
        '<span>Nature</span>'
      ) || SITE_CONFIG.businessName;
  });

  document.querySelectorAll("[data-tagline]").forEach(function (el) {
    el.textContent = SITE_CONFIG.tagline;
  });

  document.querySelectorAll("[data-your-name]").forEach(function (el) {
    el.textContent = SITE_CONFIG.yourName;
  });

  document.querySelectorAll("[data-your-email]").forEach(function (el) {
    el.textContent = SITE_CONFIG.yourEmail;
    if (el.tagName === "A") {
      el.href = "mailto:" + SITE_CONFIG.yourEmail;
    }
  });

  // ---- Photo helpers ----
  function photoCardHtml(photo, withBuy) {
    return (
      '<article class="photo-card" data-category="' +
      escapeHtml(photo.category || "") +
      '">' +
      '<div class="photo-img-wrap">' +
      '<img class="photo-img" src="' +
      photoUrl(photo.file) +
      '" alt="' +
      escapeHtml(photo.title) +
      '" loading="lazy" />' +
      "</div>" +
      '<div class="photo-body">' +
      "<h3>" +
      escapeHtml(photo.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(photo.desc) +
      "</p>" +
      (withBuy
        ? '<div class="photo-actions">' +
          '<a class="btn btn-primary" href="shop.html?print=' +
          encodeURIComponent(photo.title) +
          '">Buy print / mug</a>' +
          "</div>"
        : "") +
      "</div>" +
      "</article>"
    );
  }

  function photosInCategory(catId) {
    return (SITE_CONFIG.photos || []).filter(function (p) {
      return (p.category || "") === catId;
    });
  }

  function categoryMeta(catId) {
    const list = SITE_CONFIG.categories || [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === catId) return list[i];
    }
    return null;
  }

  /** One cover card per category — used on home + gallery front */
  function categoryChoiceHtml(cat, opts) {
    opts = opts || {};
    const count = photosInCategory(cat.id).length;
    const cover = cat.cover || (photosInCategory(cat.id)[0] || {}).file || "";
    const asLink = opts.asLink !== false;
    const tag = asLink ? "a" : "button";
    const href =
      tag === "a"
        ? ' href="gallery.html?cat=' + encodeURIComponent(cat.id) + '"'
        : ' type="button"';
    return (
      "<" +
      tag +
      href +
      ' class="category-choice" data-category="' +
      escapeHtml(cat.id) +
      '">' +
      '<div class="category-choice-img">' +
      (cover
        ? '<img src="' +
          photoUrl(cover) +
          '" alt="' +
          escapeHtml(cat.label) +
          '" loading="lazy" />'
        : "") +
      "</div>" +
      '<div class="category-choice-body">' +
      "<h3>" +
      escapeHtml(cat.label) +
      "</h3>" +
      "<p>" +
      escapeHtml(cat.blurb || "") +
      "</p>" +
      '<span class="category-choice-meta">' +
      count +
      (count === 1 ? " photo" : " photos") +
      " · Open ▾</span>" +
      "</div>" +
      "</" +
      tag +
      ">"
    );
  }

  // ---- Gallery: mixed "all" grid + category dropdown sections ----
  const galleryAccordion = document.getElementById("gallery-accordion");
  const gallerySelect = document.getElementById("gallery-select");

  if (galleryAccordion && SITE_CONFIG.photos && SITE_CONFIG.categories) {
    function shufflePhotos(list) {
      const a = list.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
      }
      return a;
    }

    function updateGalleryCount(mode, n) {
      const countEl = document.getElementById("gallery-count");
      if (!countEl) return;
      const total = (SITE_CONFIG.photos || []).length;
      if (mode === "all") {
        countEl.textContent = total + " photos · mixed order";
      } else if (typeof n === "number") {
        countEl.textContent = n + " of " + total + " photos";
      } else {
        countEl.textContent = total + " photos total";
      }
    }

    function setUrlCat(catId) {
      if (!window.history || !window.history.replaceState) return;
      try {
        const url = new URL(window.location.href);
        if (catId) url.searchParams.set("cat", catId);
        else url.searchParams.delete("cat");
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch (e) {}
    }

    // Mixed “all categories” grid — photos jumbled, not grouped by theme
    const mixedWrap = document.createElement("div");
    mixedWrap.id = "gallery-all-mixed";
    mixedWrap.className = "gallery-all-mixed";
    mixedWrap.setAttribute("aria-label", "All photos in mixed order");
    galleryAccordion.parentNode.insertBefore(mixedWrap, galleryAccordion);

    function renderMixedAll() {
      const mixed = shufflePhotos(SITE_CONFIG.photos || []);
      mixedWrap.innerHTML =
        '<div class="photo-grid">' +
        mixed
          .map(function (photo) {
            return photoCardHtml(photo, true);
          })
          .join("") +
        "</div>";
    }

    function showAllMixed(scrollTop) {
      // Category covers stay visible for navigation; photos show mixed (not grouped)
      galleryAccordion.hidden = false;
      galleryAccordion
        .querySelectorAll(".gallery-section")
        .forEach(function (sec) {
          sec.classList.remove("is-open");
          const btn = sec.querySelector(".gallery-section-toggle");
          if (btn) btn.setAttribute("aria-expanded", "false");
        });
      if (gallerySelect) gallerySelect.value = "";
      // Fresh jumble each time they pick All categories
      renderMixedAll();
      mixedWrap.hidden = false;
      updateGalleryCount("all");
      setUrlCat("");
      if (scrollTop && mixedWrap.scrollIntoView) {
        mixedWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function openAccordionSection(catId, scroll) {
      if (!catId) {
        showAllMixed(scroll);
        return;
      }
      mixedWrap.hidden = true;
      galleryAccordion.hidden = false;
      const sections = galleryAccordion.querySelectorAll(".gallery-section");
      sections.forEach(function (sec) {
        const on = sec.getAttribute("data-category") === catId;
        sec.classList.toggle("is-open", on);
        const btn = sec.querySelector(".gallery-section-toggle");
        if (btn) btn.setAttribute("aria-expanded", on ? "true" : "false");
      });
      if (gallerySelect) gallerySelect.value = catId;
      updateGalleryCount("cat", photosInCategory(catId).length);
      if (scroll) {
        const el = galleryAccordion.querySelector(
          '.gallery-section[data-category="' + catId + '"]'
        );
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      setUrlCat(catId);
    }

    // Build one dropdown section per category (cover + photos)
    galleryAccordion.innerHTML = SITE_CONFIG.categories
      .map(function (cat) {
        const list = photosInCategory(cat.id);
        const cover = cat.cover || (list[0] && list[0].file) || "";
        const photosHtml = list.length
          ? list
              .map(function (photo) {
                return photoCardHtml(photo, true);
              })
              .join("")
          : '<p class="gallery-empty">No photos in this category yet.</p>';

        return (
          '<section class="gallery-section" data-category="' +
          escapeHtml(cat.id) +
          '" id="cat-' +
          escapeHtml(cat.id) +
          '">' +
          '<button type="button" class="gallery-section-toggle" aria-expanded="false">' +
          '<div class="gallery-section-cover">' +
          (cover
            ? '<img src="' +
              photoUrl(cover) +
              '" alt="" loading="eager" />'
            : "") +
          "</div>" +
          '<div class="gallery-section-text">' +
          "<h2>" +
          escapeHtml(cat.label) +
          "</h2>" +
          "<p>" +
          escapeHtml(cat.blurb || "") +
          "</p>" +
          '<span class="category-choice-meta">' +
          list.length +
          (list.length === 1 ? " photo" : " photos") +
          " · tap to open ▾</span>" +
          "</div>" +
          '<span class="gallery-section-chevron" aria-hidden="true">▾</span>' +
          "</button>" +
          '<div class="gallery-section-panel">' +
          '<div class="photo-grid">' +
          photosHtml +
          "</div>" +
          "</div>" +
          "</section>"
        );
      })
      .join("");

    galleryAccordion.addEventListener("click", function (e) {
      const btn = e.target.closest(".gallery-section-toggle");
      if (!btn) return;
      const sec = btn.closest(".gallery-section");
      if (!sec) return;
      const catId = sec.getAttribute("data-category");
      const wasOpen = sec.classList.contains("is-open");
      if (wasOpen) {
        // Closing the only open category → back to mixed all view
        showAllMixed(false);
      } else {
        openAccordionSection(catId, false);
      }
    });

    if (gallerySelect) {
      gallerySelect.innerHTML =
        '<option value="">All categories (mixed)</option>' +
        SITE_CONFIG.categories
          .map(function (cat) {
            return (
              '<option value="' +
              escapeHtml(cat.id) +
              '">' +
              escapeHtml(cat.label) +
              " (" +
              photosInCategory(cat.id).length +
              ")</option>"
            );
          })
          .join("");
      gallerySelect.addEventListener("change", function () {
        const v = gallerySelect.value;
        if (!v) {
          showAllMixed(true);
          return;
        }
        openAccordionSection(v, true);
      });
    }

    // Deep link: gallery.html?cat=gators — else default to mixed all
    const params = new URLSearchParams(window.location.search);
    const startCat = params.get("cat");
    if (startCat && categoryMeta(startCat)) {
      openAccordionSection(startCat, true);
    } else {
      showAllMixed(false);
    }
  }

  // ---- Home: one front picture per category ----
  const featuredGrid = document.getElementById("featured-grid");
  if (featuredGrid && SITE_CONFIG.categories && SITE_CONFIG.photos) {
    featuredGrid.classList.add("category-choice-grid");
    featuredGrid.innerHTML = SITE_CONFIG.categories
      .map(function (cat) {
        return categoryChoiceHtml(cat, { asLink: true });
      })
      .join("");
  }

  // ---- Shop: prints, mugs, payments, notifications ----
  function fillSizeList(elId, items) {
    const el = document.getElementById(elId);
    if (!el || !items || !items.length) return;
    el.innerHTML = items
      .map(function (s) {
        return (
          '<li><span class="size-label">' +
          escapeHtml(s.label) +
          (s.desc ? '<span class="size-desc">' + escapeHtml(s.desc) + "</span>" : "") +
          '</span><span class="size-price">$' +
          s.price +
          "</span></li>"
        );
      })
      .join("");
  }

  fillSizeList("size-list", SITE_CONFIG.printSizes);
  fillSizeList("mug-size-list", SITE_CONFIG.mugStyles);

  // ---- Shipping panel + live order estimate ----
  (function initShipping() {
    const ship = SITE_CONFIG.shipping;
    if (!ship) return;

    const lead = document.getElementById("shipping-lead");
    const tubeEl = document.getElementById("shipping-tube");
    const table = document.getElementById("shipping-table");
    const noteEl = document.getElementById("shipping-note");
    const estBox = document.getElementById("order-shipping-estimate");
    const estAmt = document.getElementById("order-shipping-amount");
    const estDetail = document.getElementById("order-shipping-detail");

    function money(n) {
      const x = Number(n);
      if (isNaN(x)) return "—";
      return "$" + (x % 1 === 0 ? String(x) : x.toFixed(2));
    }

    function rateForSizeId(sizeId) {
      const rates = ship.printRates || [];
      for (let i = 0; i < rates.length; i++) {
        if (rates[i].sizeId === sizeId) return rates[i];
      }
      return null;
    }

    function sizeIdFromLabel(label) {
      const sizes = SITE_CONFIG.printSizes || [];
      for (let i = 0; i < sizes.length; i++) {
        if (label && label.indexOf(sizes[i].label) === 0) return sizes[i].id;
        if (label === sizes[i].id) return sizes[i].id;
      }
      // option value is like '8" × 10" print - $35'
      for (let j = 0; j < sizes.length; j++) {
        if (label && label.indexOf(sizes[j].label) !== -1) return sizes[j].id;
      }
      return "";
    }

    if (lead) {
      lead.textContent =
        "Flat shipping fees (not a live rate calculator). " +
        "Prints go out via " +
        (ship.carrier || "USPS Priority Mail") +
        ", rolled in a hard mailing tube — same tube size for every print. " +
        "Region: " +
        (ship.region || "Continental U.S.") +
        ".";
    }

    if (tubeEl && ship.tube) {
      tubeEl.innerHTML =
        "<strong>" +
        escapeHtml(ship.carrier || "USPS Priority Mail") +
        " · " +
        escapeHtml(ship.methodTitle || "Hard mailing tube") +
        " · " +
        escapeHtml(ship.tube.label || "") +
        "</strong><p>" +
        escapeHtml(ship.tube.why || "") +
        "</p>";
    }

    if (table && table.tBodies && table.tBodies[0]) {
      const tbody = table.tBodies[0];
      const rows = [];
      (SITE_CONFIG.printSizes || []).forEach(function (s) {
        const r = rateForSizeId(s.id) || { packaging: 0, postage: 0, total: 0 };
        rows.push(
          "<tr><td>" +
            escapeHtml(s.label) +
            '</td><td class="ship-muted">' +
            money(r.packaging) +
            '</td><td class="ship-muted">' +
            money(r.postage) +
            "</td><td>" +
            money(r.total) +
            "</td></tr>"
        );
      });
      if (ship.mug) {
        rows.push(
          "<tr><td>12 oz photo mug" +
            (ship.mug.methodTitle
              ? ' <span class="ship-muted">(' +
                escapeHtml(ship.mug.methodTitle) +
                ")</span>"
              : "") +
            '</td><td class="ship-muted">' +
            money(ship.mug.packaging) +
            '</td><td class="ship-muted">' +
            money(ship.mug.postage) +
            "</td><td>" +
            money(ship.mug.total) +
            "</td></tr>"
        );
      }
      tbody.innerHTML = rows.join("");
    }

    if (noteEl) {
      noteEl.textContent = ship.note || "";
    }

    function updateOrderShipping() {
      if (!estBox || !estAmt) return;
      const productEl = document.getElementById("order-product");
      const sizeEl = document.getElementById("order-size");
      const isMug = productEl && productEl.value === "mug";

      if (isMug && ship.mug) {
        estBox.hidden = false;
        estAmt.textContent = money(ship.mug.total);
        if (estDetail) {
          estDetail.textContent =
            "Flat fee · " +
            (ship.carrier || "USPS Priority Mail") +
            " · " +
            (ship.mug.methodTitle || "Padded box") +
            " (packaging " +
            money(ship.mug.packaging) +
            " + postage est. " +
            money(ship.mug.postage) +
            ")";
        }
        return;
      }

      const sizeVal = sizeEl ? sizeEl.value : "";
      if (!sizeVal) {
        estBox.hidden = true;
        return;
      }
      const sid = sizeIdFromLabel(sizeVal);
      const r = rateForSizeId(sid);
      if (!r) {
        estBox.hidden = true;
        return;
      }
      estBox.hidden = false;
      estAmt.textContent = money(r.total);
      if (estDetail) {
        estDetail.textContent =
          "Flat fee · " +
          (ship.carrier || "USPS Priority Mail") +
          " · " +
          (ship.methodTitle || "Hard mailing tube") +
          (ship.tube && ship.tube.label ? " · " + ship.tube.label : "") +
          " (packaging " +
          money(r.packaging) +
          " + postage est. " +
          money(r.postage) +
          ")";
      }
    }

    window.__fnpUpdateShipping = updateOrderShipping;

    const sizeEl = document.getElementById("order-size");
    const productEl = document.getElementById("order-product");
    if (sizeEl) sizeEl.addEventListener("change", updateOrderShipping);
    if (productEl) productEl.addEventListener("change", updateOrderShipping);
    updateOrderShipping();
  })();

  function optionsFromItems(items, emptyLabel) {
    return (
      '<option value="">' +
      escapeHtml(emptyLabel) +
      "</option>" +
      (items || [])
        .map(function (s) {
          return (
            '<option value="' +
            escapeHtml(s.label) +
            " - $" +
            s.price +
            '">' +
            escapeHtml(s.label) +
            " — $" +
            s.price +
            "</option>"
          );
        })
        .join("")
    );
  }

  const sizeSelect = document.getElementById("order-size");
  if (sizeSelect) {
    sizeSelect.innerHTML = optionsFromItems(
      SITE_CONFIG.printSizes,
      "Choose a size…"
    );
  }

  const mugSelect = document.getElementById("order-mug");
  if (mugSelect) {
    mugSelect.innerHTML = optionsFromItems(
      SITE_CONFIG.mugStyles,
      "Choose a mug style…"
    );
  }

  const productSelect = document.getElementById("order-product");
  const sizeGroup = document.getElementById("order-size-group");
  const mugGroup = document.getElementById("order-mug-group");

  function syncProductType() {
    const isMug = productSelect && productSelect.value === "mug";
    if (sizeGroup) sizeGroup.hidden = !!isMug;
    if (mugGroup) mugGroup.hidden = !isMug;
    if (sizeSelect) {
      sizeSelect.required = !isMug;
      if (isMug) sizeSelect.value = "";
    }
    if (mugSelect) {
      mugSelect.required = !!isMug;
      if (!isMug) mugSelect.value = "";
    }
    // Swap Stripe button if mug-specific link exists
    const stripeBtn = document.getElementById("stripe-payment-btn");
    if (stripeBtn) {
      const mugLink =
        SITE_CONFIG.stripeMugPaymentLink &&
        SITE_CONFIG.stripeMugPaymentLink.indexOf("REPLACE") === -1
          ? SITE_CONFIG.stripeMugPaymentLink
          : "";
      const mainLink = SITE_CONFIG.stripePaymentLink || "#";
      stripeBtn.href = isMug && mugLink ? mugLink : mainLink;
      stripeBtn.textContent = isMug
        ? "Pay with Stripe (photo mug)"
        : "Pay with Stripe (card)";
    }
  }

  if (productSelect) {
    productSelect.addEventListener("change", function () {
      syncProductType();
      if (typeof window.__fnpUpdateShipping === "function") {
        window.__fnpUpdateShipping();
      }
    });
    // URL ?product=mug
    const paramsEarly = new URLSearchParams(window.location.search);
    if (paramsEarly.get("product") === "mug") {
      productSelect.value = "mug";
    }
    syncProductType();
    if (typeof window.__fnpUpdateShipping === "function") {
      window.__fnpUpdateShipping();
    }
  }

  const printSelect = document.getElementById("order-print");
  if (printSelect && SITE_CONFIG.photos) {
    let opts = '<option value="">Choose a scene…</option>';
    if (SITE_CONFIG.categories && SITE_CONFIG.categories.length) {
      SITE_CONFIG.categories.forEach(function (cat) {
        const group = photosInCategory(cat.id);
        if (!group.length) return;
        opts +=
          '<optgroup label="' +
          escapeHtml(cat.label) +
          '">' +
          group
            .map(function (p) {
              return (
                '<option value="' +
                escapeHtml(p.title) +
                '">' +
                escapeHtml(p.title) +
                "</option>"
              );
            })
            .join("") +
          "</optgroup>";
      });
    } else {
      opts += SITE_CONFIG.photos
        .map(function (p) {
          return (
            '<option value="' +
            escapeHtml(p.title) +
            '">' +
            escapeHtml(p.title) +
            "</option>"
          );
        })
        .join("");
    }
    printSelect.innerHTML = opts;

    const params = new URLSearchParams(window.location.search);
    const preselect = params.get("print");
    if (preselect) printSelect.value = preselect;
  }

  // Payment buttons from config
  function wirePaymentBtn(id, url, label) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const ok =
      url &&
      String(url).trim() &&
      url.indexOf("REPLACE") === -1 &&
      url !== "#";
    if (ok) {
      btn.href = url;
      btn.hidden = false;
      if (label) btn.textContent = label;
    } else {
      btn.hidden = id !== "stripe-payment-btn";
      if (id === "stripe-payment-btn") {
        btn.href = SITE_CONFIG.stripePaymentLink || "#";
      }
    }
  }

  wirePaymentBtn("stripe-payment-btn", SITE_CONFIG.stripePaymentLink);
  wirePaymentBtn("paypal-payment-btn", SITE_CONFIG.paypalPaymentLink, "Pay with PayPal");
  wirePaymentBtn("venmo-payment-btn", SITE_CONFIG.venmoPaymentLink, "Pay with Venmo");

  // Public-facing payment / notify copy stays simple (TBA until setup is ready)
  const payNote = document.getElementById("payment-note-text");
  if (payNote) {
    payNote.textContent = "TBA";
  }
  const payNoteFoot = document.querySelector(".payment-note");
  if (payNoteFoot) {
    payNoteFoot.textContent = "TBA";
  }
  const notifyStatus = document.getElementById("notify-status");
  if (notifyStatus) {
    notifyStatus.textContent = "TBA";
  }

  // Build FormSubmit extras: SMS gateway + CC
  function orderNotifyFields() {
    const extra = {};
    const ccs = [];
    const sms = (SITE_CONFIG.smsAlertEmail || "").trim();
    const cc = (SITE_CONFIG.orderCcEmail || "").trim();
    if (sms) ccs.push(sms);
    if (cc) ccs.push(cc);
    if (ccs.length) extra._cc = ccs.join(",");
    // Short SMS-friendly subject
    return extra;
  }

  // ---- Order form ----
  setupForm("order-form", "order-message", function (form) {
    const product =
      (form.product_type && form.product_type.value) || "print";
    const isMug = product === "mug";
    const sizeOrMug = isMug
      ? (form.mug_style && form.mug_style.value) || ""
      : (form.size && form.size.value) || "";

    // Attach shipping line for your order email
    let shippingLine = "(not calculated)";
    let shippingTotal = "";
    const ship = SITE_CONFIG.shipping;
    if (ship) {
      if (isMug && ship.mug) {
        shippingTotal = String(ship.mug.total);
        shippingLine =
          "Mug padded box — packaging $" +
          ship.mug.packaging +
          " + postage $" +
          ship.mug.postage +
          " = $" +
          ship.mug.total;
      } else if (ship.printRates && form.size && form.size.value) {
        const sizes = SITE_CONFIG.printSizes || [];
        let sid = "";
        const val = form.size.value;
        for (let i = 0; i < sizes.length; i++) {
          if (val.indexOf(sizes[i].label) !== -1) {
            sid = sizes[i].id;
            break;
          }
        }
        for (let j = 0; j < ship.printRates.length; j++) {
          if (ship.printRates[j].sizeId === sid) {
            const r = ship.printRates[j];
            shippingTotal = String(r.total);
            shippingLine =
              (ship.methodTitle || "Tube") +
              " (" +
              (ship.tube && ship.tube.label ? ship.tube.label : "uniform tube") +
              ") — packaging $" +
              r.packaging +
              " + postage $" +
              r.postage +
              " = $" +
              r.total;
            break;
          }
        }
      }
    }

    const payload = {
      _subject:
        (isMug ? "☕ NEW MUG ORDER" : "🖼️ NEW PRINT ORDER") +
        " — " +
        SITE_CONFIG.businessName,
      _template: "table",
      _captcha: "false",
      form_type: "Order",
      product_type: isMug ? "12 oz photo mug (Circuit press)" : "Fine art print",
      scene: form.print.value,
      print: form.print.value,
      size_or_style: sizeOrMug,
      size: isMug ? "(mug)" : form.size.value,
      mug_style: isMug ? form.mug_style.value : "(print)",
      shipping: shippingLine,
      shipping_total: shippingTotal ? "$" + shippingTotal : "(n/a)",
      name: form.name.value,
      email: form.email.value,
      _replyto: form.email.value,
      phone: form.phone.value || "(not provided)",
      address: form.address.value,
      city: form.city.value,
      state: form.state.value,
      zip: form.zip.value,
      notes: form.notes.value || "(none)",
      // Plain-text block for SMS gateways (short)
      sms_summary:
        (isMug ? "MUG" : "PRINT") +
        ": " +
        form.print.value +
        " | " +
        sizeOrMug +
        " | ship $" +
        (shippingTotal || "?") +
        " | " +
        form.name.value +
        " | " +
        (form.phone.value || "no phone"),
    };
    const notify = orderNotifyFields();
    Object.keys(notify).forEach(function (k) {
      payload[k] = notify[k];
    });
    return payload;
  });

  // ---- Contact form ----
  setupForm("contact-form", "contact-message", function (form) {
    const payload = {
      _subject: "Website contact — " + SITE_CONFIG.businessName,
      _template: "table",
      _captcha: "false",
      form_type: "Contact",
      name: form.name.value,
      email: form.email.value,
      _replyto: form.email.value,
      message: form.message.value,
    };
    const notify = orderNotifyFields();
    Object.keys(notify).forEach(function (k) {
      payload[k] = notify[k];
    });
    return payload;
  });

  function setupForm(formId, messageId, buildPayload) {
    const form = document.getElementById(formId);
    const msg = document.getElementById(messageId);
    if (!form) return;

    const notice = form.querySelector(".setup-notice");
    if (notice) {
      // Only show technical notice if email is missing
      notice.style.display = formsReady() ? "none" : "block";
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (msg) {
        msg.className = "form-message";
        msg.textContent = "";
      }

      if (!formsReady()) {
        if (msg) {
          msg.className = "form-message error";
          msg.textContent =
            "Email is not set up yet. Please write to " +
            (SITE_CONFIG.yourEmail || "us") +
            " directly.";
        }
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      try {
        const payload = buildPayload(form);
        const res = await fetch(formEndpoint(), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(function () {
          return {};
        });

        if (res.ok && data.success !== "false" && !data.error) {
          form.reset();
          if (typeof syncProductType === "function") syncProductType();
          if (msg) {
            msg.className = "form-message success";
            msg.textContent =
              formId === "order-form"
                ? "Thank you! Your order details were sent. Next: use a payment button so I can match your payment."
                : "Thank you! Your message was sent. I'll get back to you soon.";
          }
          // Scroll payment into view after order
          if (formId === "order-form") {
            const pay = document.getElementById("payment-box");
            if (pay && pay.scrollIntoView) {
              setTimeout(function () {
                pay.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 200);
            }
          }
        } else {
          throw new Error(
            data.message ||
              (data.errors && data.errors[0] && data.errors[0].message) ||
              "Something went wrong. Please try again or email me directly at " +
                SITE_CONFIG.yourEmail +
                "."
          );
        }
      } catch (err) {
        if (msg) {
          msg.className = "form-message error";
          msg.textContent =
            err.message ||
            "Could not send. Please email me directly at " +
              SITE_CONFIG.yourEmail +
              ".";
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
