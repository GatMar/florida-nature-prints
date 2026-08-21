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

  // ---- Visitor counts (js/visitors.js). Skips the private metrics page. ----
  (function initAnalytics() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "metrics.html" || page === "studio.html") return;
    const s = document.createElement("script");
    s.async = true;
    s.src = "js/visitors.js?v=visitors1";
    document.head.appendChild(s);
  })();

  // Mark current page in nav
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    const href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // ---- Print of the day (home) ----
  (function initPrintOfTheDay() {
    const el = document.getElementById("print-of-day");
    if (!el || !SITE_CONFIG.photos || !SITE_CONFIG.photos.length) return;
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    let n = 0;
    for (let i = 0; i < day.length; i++) {
      const c = day.charCodeAt(i);
      if (c >= 48 && c <= 57) n = n * 10 + (c - 48);
    }
    const photo = SITE_CONFIG.photos[n % SITE_CONFIG.photos.length];
    const src = photoUrl(photo.file);
    const nameHref =
      "name.html?kind=photo&print=" + encodeURIComponent(photo.title);
    el.innerHTML =
      '<img src="' +
      src +
      '" alt="' +
      escapeHtml(photo.title) +
      '" />' +
      '<div class="home-offer-body">' +
      '<p class="keep-kicker">Print of the day</p>' +
      "<h3>" +
      escapeHtml(photo.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(photo.desc || "A Florida moment from the gallery.") +
      "</p>" +
      '<a class="btn btn-primary" href="' +
      nameHref +
      '">Name this print</a>' +
      "</div>";
  })();

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
    const src = photoUrl(photo.file);
    const buyHref = withBuy
      ? "shop.html?print=" + encodeURIComponent(photo.title)
      : "";
    return (
      '<article class="photo-card" data-category="' +
      escapeHtml(photo.category || "") +
      '">' +
      '<button type="button" class="photo-img-wrap photo-zoom" data-src="' +
      escapeHtml(src) +
      '" data-title="' +
      escapeHtml(photo.title) +
      '" data-desc="' +
      escapeHtml(photo.desc) +
      '" data-buy-href="' +
      escapeHtml(buyHref) +
      '" data-buy-label="Buy print / mug" aria-label="View larger photo of ' +
      escapeHtml(photo.title) +
      '">' +
      '<img class="photo-img" src="' +
      src +
      '" alt="' +
      escapeHtml(photo.title) +
      '" loading="lazy" />' +
      '<span class="photo-zoom-hint" aria-hidden="true">View larger</span>' +
      "</button>" +
      '<div class="photo-body">' +
      "<h3>" +
      escapeHtml(photo.title) +
      "</h3>" +
      "<p>" +
      escapeHtml(photo.desc) +
      "</p>" +
      (withBuy
        ? '<div class="photo-actions">' +
          '<a class="btn btn-primary" href="' +
          escapeHtml(buyHref) +
          '">Buy print / mug</a>' +
          '<a class="btn btn-outline" href="name.html?kind=photo&amp;print=' +
          encodeURIComponent(photo.title) +
          '">Name it · $3</a>' +
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
        const priceText = s.custom ? "from $" + s.price : "$" + s.price;
        const extra = s.custom
          ? "Custom order"
          : s.desc
            ? s.desc
            : "";
        return (
          '<li><span class="size-label">' +
          escapeHtml(s.label) +
          (extra
            ? '<span class="size-desc">' + escapeHtml(extra) + "</span>"
            : "") +
          '</span><span class="size-price">' +
          escapeHtml(priceText) +
          "</span></li>"
        );
      })
      .join("");
  }

  fillSizeList("size-list", SITE_CONFIG.printSizes);
  fillSizeList("mug-size-list", SITE_CONFIG.mugStyles);
  fillSizeList("souvenir-size-list", SITE_CONFIG.souvenirs);

  // Souvenir cards on the shop page
  const souvenirGrid = document.getElementById("souvenir-grid");
  if (souvenirGrid && SITE_CONFIG.souvenirs) {
    souvenirGrid.innerHTML = SITE_CONFIG.souvenirs
      .map(function (s) {
        return (
          '<article class="souvenir-card">' +
          '<button type="button" class="souvenir-img-wrap photo-zoom" data-src="images/souvenirs/' +
          escapeHtml(s.file) +
          '" data-title="' +
          escapeHtml(s.label) +
          '" data-desc="' +
          escapeHtml(s.desc || "") +
          '" data-buy-href="shop.html?product=souvenir&amp;item=' +
          encodeURIComponent(s.id) +
          '#order-form" data-buy-label="Add to order" aria-label="View larger photo of ' +
          escapeHtml(s.label) +
          '">' +
          '<img src="images/souvenirs/' +
          escapeHtml(s.file) +
          '" alt="' +
          escapeHtml(s.label) +
          '" loading="lazy" />' +
          '<span class="photo-zoom-hint" aria-hidden="true">View larger</span>' +
          "</button>" +
          "<h3>" +
          escapeHtml(s.label) +
          "</h3>" +
          "<p>" +
          escapeHtml(s.desc || "") +
          "</p>" +
          '<div class="souvenir-meta">' +
          '<span class="size-price">$' +
          s.price +
          "</span>" +
          '<a class="btn btn-primary" href="shop.html?product=souvenir&amp;item=' +
          encodeURIComponent(s.id) +
          '#order-form">Add to order</a>' +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

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
            (s.custom
              ? ' <span class="ship-muted">(custom order)</span>'
              : "") +
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
      if (ship.souvenir) {
        rows.push(
          "<tr><td>Jar of 15 shark teeth" +
            (ship.souvenir.methodTitle
              ? ' <span class="ship-muted">(' +
                escapeHtml(ship.souvenir.methodTitle) +
                ")</span>"
              : "") +
            '</td><td class="ship-muted">' +
            money(ship.souvenir.packaging) +
            '</td><td class="ship-muted">' +
            money(ship.souvenir.postage) +
            "</td><td>" +
            money(ship.souvenir.total) +
            "</td></tr>"
        );
      }
      const namingShip =
        SITE_CONFIG.naming && SITE_CONFIG.naming.shipping
          ? SITE_CONFIG.naming.shipping
          : null;
      if (namingShip && namingShip.teeth) {
        rows.push(
          "<tr><td>Name 3 shark teeth" +
            (namingShip.teeth.methodTitle
              ? ' <span class="ship-muted">(' +
                escapeHtml(namingShip.teeth.methodTitle) +
                ")</span>"
              : "") +
            '</td><td class="ship-muted">' +
            money(namingShip.teeth.packaging) +
            '</td><td class="ship-muted">' +
            money(namingShip.teeth.postage) +
            "</td><td>" +
            money(namingShip.teeth.total) +
            "</td></tr>"
        );
      }
      if (namingShip && namingShip.card) {
        rows.push(
          "<tr><td>Mail a mini naming certificate" +
            '</td><td class="ship-muted">' +
            money(namingShip.card.packaging) +
            '</td><td class="ship-muted">' +
            money(namingShip.card.postage) +
            "</td><td>" +
            money(namingShip.card.total) +
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
      const type = productEl ? productEl.value : "print";
      const isMug = type === "mug";
      const isSouvenir = type === "souvenir";

      if (isSouvenir && ship.souvenir) {
        estBox.hidden = false;
        estAmt.textContent = money(ship.souvenir.total);
        if (estDetail) {
          estDetail.textContent =
            "Flat fee · " +
            (ship.carrier || "USPS Priority Mail") +
            " · " +
            (ship.souvenir.methodTitle || "Padded mailer") +
            " (packaging " +
            money(ship.souvenir.packaging) +
            " + postage est. " +
            money(ship.souvenir.postage) +
            ")";
        }
        return;
      }

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
          const tag = s.custom
            ? escapeHtml(s.label) + " (custom order) — from $" + s.price
            : escapeHtml(s.label) + " — $" + s.price;
          const val = s.custom
            ? escapeHtml(s.label) + " (custom order) - from $" + s.price
            : escapeHtml(s.label) + " - $" + s.price;
          return '<option value="' + val + '">' + tag + "</option>";
        })
        .join("")
    );
  }

  const sizeSelect = document.getElementById("order-size");
  if (sizeSelect) {
    const regular = (SITE_CONFIG.printSizes || []).filter(function (s) {
      return !s.custom;
    });
    const custom = (SITE_CONFIG.printSizes || []).filter(function (s) {
      return s.custom;
    });
    let sizeOpts = '<option value="">Choose a size…</option>';
    regular.forEach(function (s) {
      sizeOpts +=
        '<option value="' +
        escapeHtml(s.label) +
        " - $" +
        s.price +
        '">' +
        escapeHtml(s.label) +
        " — $" +
        s.price +
        "</option>";
    });
    if (custom.length) {
      sizeOpts += '<optgroup label="Custom order">';
      custom.forEach(function (s) {
        sizeOpts +=
          '<option value="' +
          escapeHtml(s.label) +
          " (custom order) - from $" +
          s.price +
          '">' +
          escapeHtml(s.label) +
          " — custom, from $" +
          s.price +
          "</option>";
      });
      sizeOpts += "</optgroup>";
    }
    sizeSelect.innerHTML = sizeOpts;
  }

  const mugSelect = document.getElementById("order-mug");
  if (mugSelect) {
    mugSelect.innerHTML = optionsFromItems(
      SITE_CONFIG.mugStyles,
      "Choose a mug style…"
    );
  }

  const souvenirSelect = document.getElementById("order-souvenir");
  if (souvenirSelect && SITE_CONFIG.souvenirs) {
    souvenirSelect.innerHTML = optionsFromItems(
      SITE_CONFIG.souvenirs,
      "Choose a souvenir…"
    );
  }

  const productSelect = document.getElementById("order-product");
  const sizeGroup = document.getElementById("order-size-group");
  const mugGroup = document.getElementById("order-mug-group");
  const souvenirGroup = document.getElementById("order-souvenir-group");
  const printGroup = document.getElementById("order-print-group");

  function syncProductType() {
    const type = productSelect ? productSelect.value : "print";
    const isMug = type === "mug";
    const isSouvenir = type === "souvenir";
    const isPrint = !isMug && !isSouvenir;
    if (sizeGroup) sizeGroup.hidden = !isPrint;
    if (mugGroup) mugGroup.hidden = !isMug;
    if (souvenirGroup) souvenirGroup.hidden = !isSouvenir;
    if (printGroup) printGroup.hidden = isSouvenir;
    const namePrintGroup = document.getElementById("order-name-print-group");
    if (namePrintGroup) namePrintGroup.hidden = !isPrint;
    if (!isPrint) {
      const np = document.getElementById("order-name-print");
      const gn = document.getElementById("order-print-given-name");
      if (np) np.checked = false;
      if (gn) {
        gn.hidden = true;
        gn.required = false;
        gn.value = "";
      }
    }
    if (sizeSelect) {
      sizeSelect.required = isPrint;
      if (!isPrint) sizeSelect.value = "";
    }
    if (mugSelect) {
      mugSelect.required = !!isMug;
      if (!isMug) mugSelect.value = "";
    }
    if (souvenirSelect) {
      souvenirSelect.required = !!isSouvenir;
      if (!isSouvenir) souvenirSelect.value = "";
    }
    const printEl = document.getElementById("order-print");
    if (printEl) {
      printEl.required = !isSouvenir;
      if (isSouvenir) printEl.value = "";
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
    // URL ?product=mug | souvenir
    const paramsEarly = new URLSearchParams(window.location.search);
    if (paramsEarly.get("product") === "mug") {
      productSelect.value = "mug";
    }
    if (paramsEarly.get("product") === "souvenir") {
      productSelect.value = "souvenir";
    }
    if (paramsEarly.get("product") === "print") {
      productSelect.value = "print";
    }
    syncProductType();
    const itemId = paramsEarly.get("item");
    if (itemId && souvenirSelect && SITE_CONFIG.souvenirs) {
      const found = SITE_CONFIG.souvenirs.filter(function (s) {
        return s.id === itemId;
      })[0];
      if (found) {
        souvenirSelect.value = found.label + " - $" + found.price;
      }
    }
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
    const namePrint = document.getElementById("order-name-print");
    const givenName = document.getElementById("order-print-given-name");
    if (namePrint && givenName) {
      namePrint.addEventListener("change", function () {
        givenName.hidden = !namePrint.checked;
        givenName.required = !!namePrint.checked;
        if (!namePrint.checked) givenName.value = "";
      });
      if (params.get("nameit") === "1") {
        namePrint.checked = true;
        givenName.hidden = false;
        givenName.required = true;
      }
      const gn = params.get("given_name");
      if (gn) givenName.value = gn;
    }
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
    const isSouvenir = product === "souvenir";
    const sizeOrMug = isSouvenir
      ? (form.souvenir && form.souvenir.value) || ""
      : isMug
        ? (form.mug_style && form.mug_style.value) || ""
        : (form.size && form.size.value) || "";

    // Attach shipping line for your order email
    let shippingLine = "(not calculated)";
    let shippingTotal = "";
    const ship = SITE_CONFIG.shipping;
    if (ship) {
      if (isSouvenir && ship.souvenir) {
        shippingTotal = String(ship.souvenir.total);
        shippingLine =
          "Souvenir padded mailer — packaging $" +
          ship.souvenir.packaging +
          " + postage $" +
          ship.souvenir.postage +
          " = $" +
          ship.souvenir.total;
      } else if (isMug && ship.mug) {
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
        (isSouvenir
          ? "🐚 NEW SOUVENIR ORDER"
          : isMug
            ? "☕ NEW MUG ORDER"
            : "🖼️ NEW PRINT ORDER") +
        " — " +
        SITE_CONFIG.businessName,
      _template: "table",
      _captcha: "false",
      form_type: "Order",
      product_type: isSouvenir
        ? "Jar of 15 Florida shark teeth"
        : isMug
          ? "12 oz photo mug (Circuit press)"
          : "Fine art print",
      scene: isSouvenir ? "(souvenir)" : form.print.value,
      print: isSouvenir ? "(souvenir)" : form.print.value,
      souvenir: isSouvenir ? sizeOrMug : "(none)",
      size_or_style: sizeOrMug,
      size: isSouvenir ? "(souvenir)" : isMug ? "(mug)" : form.size.value,
      mug_style: isMug ? form.mug_style.value : isSouvenir ? "(souvenir)" : "(print)",
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
      name_the_print:
        !isMug &&
        !isSouvenir &&
        form.name_the_print &&
        form.name_the_print.checked
          ? "YES — +$3. Given name: " +
            ((form.print_given_name && form.print_given_name.value) || "(blank)") +
            ". List in Named by You. Do not email a personalized file."
          : "(no)",
      print_given_name:
        form.print_given_name && form.print_given_name.value
          ? form.print_given_name.value
          : "(none)",
      gator_coupon: (form.gator_coupon && form.gator_coupon.value) || "(none)",
      gift_code: (form.gator_coupon && form.gator_coupon.value) || "(none)",
      print_discount: describeGiftCode(form.gator_coupon && form.gator_coupon.value),
      sms_kind: isSouvenir ? "SOUVENIR" : isMug ? "MUG" : "PRINT",
      // Plain-text block for SMS gateways (short)
      sms_summary:
        (isSouvenir ? "SOUVENIR" : isMug ? "MUG" : "PRINT") +
        ": " +
        (isSouvenir ? sizeOrMug : form.print.value) +
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

  function describeGiftCode(code) {
    if (!code) return "(none)";
    try {
      const matchKey =
        (SITE_CONFIG.matchReward && SITE_CONFIG.matchReward.storageKey) ||
        "fnpMatch_v1";
      const d = JSON.parse(localStorage.getItem(matchKey) || "{}");
      if (d.reward && d.reward.code === code) {
        if (d.reward.kind === "shark-tooth") {
          return "Wildlife Match gift — honor a free jar of 15 shark teeth. Code " + code;
        }

        return (
          "Wildlife Match gift — apply $" +
          (d.reward.credit || 8) +
          " credit toward this order. Code " +
          code
        );
      }
    } catch (e) {}
    return "Apply game / gift code " + code;
  }

  (function fillGameReward() {
    const input = document.getElementById("order-coupon");
    const note = document.getElementById("coupon-shop-note");
    if (!input) return;
    try {
      const matchKey =
        (SITE_CONFIG.matchReward && SITE_CONFIG.matchReward.storageKey) ||
        "fnpMatch_v1";
      const match = JSON.parse(localStorage.getItem(matchKey) || "{}");
      if (match.reward && match.reward.code) {
        input.value = match.reward.code;
        if (note) {
          note.textContent = describeGiftCode(match.reward.code);
        }
        const paramsNow = new URLSearchParams(window.location.search);
        const urlPicked =
          paramsNow.get("print") ||
          paramsNow.get("item") ||
          paramsNow.get("product") === "mug" ||
          paramsNow.get("product") === "print" ||
          paramsNow.get("product") === "souvenir";
        if (
          !urlPicked &&
          match.reward.kind === "shark-tooth"
        ) {
          if (productSelect) {
            productSelect.value = "souvenir";
            syncProductType();
          }
          if (souvenirSelect && SITE_CONFIG.souvenirs) {
            const want = SITE_CONFIG.souvenirs.filter(function (s) {
              return s.giftKind === match.reward.kind;
            })[0];
            if (want) souvenirSelect.value = want.label + " - $" + want.price;
          }
        }
        return;
      }
      const d = JSON.parse(localStorage.getItem("gatorLife_v1") || "{}");
      if (d.coupon && d.coupon.code) {
        input.value = d.coupon.code;
        if (note) {
          note.textContent =
            "Saved print coupon " + d.coupon.code + " (10% off prints).";
        }
      }
    } catch (e) {}
  })();

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---- Photo lightbox: click a photo to view it large, not the shop ----
  (function initPhotoLightbox() {
    let items = [];
    let index = 0;
    let lastFocus = null;
    let touchStartX = 0;

    const overlay = document.createElement("div");
    overlay.id = "photo-lightbox";
    overlay.className = "photo-lightbox";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "photo-lightbox-title");
    overlay.innerHTML =
      '<div class="photo-lightbox-backdrop" data-lightbox-close="1"></div>' +
      '<div class="photo-lightbox-frame">' +
      '<button type="button" class="photo-lightbox-close" aria-label="Close large photo">&times;</button>' +
      '<button type="button" class="photo-lightbox-nav is-prev" aria-label="Previous photo">‹</button>' +
      '<figure class="photo-lightbox-figure">' +
      '<img class="photo-lightbox-img" alt="" />' +
      '<figcaption class="photo-lightbox-caption">' +
      '<div class="photo-lightbox-copy">' +
      '<h3 id="photo-lightbox-title"></h3>' +
      '<p class="photo-lightbox-desc"></p>' +
      "</div>" +
      '<a class="btn btn-primary photo-lightbox-buy" href="shop.html">Buy print / mug</a>' +
      "</figcaption>" +
      "</figure>" +
      '<button type="button" class="photo-lightbox-nav is-next" aria-label="Next photo">›</button>' +
      "</div>";
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector(".photo-lightbox-img");
    const titleEl = overlay.querySelector("#photo-lightbox-title");
    const descEl = overlay.querySelector(".photo-lightbox-desc");
    const buyEl = overlay.querySelector(".photo-lightbox-buy");
    const prevBtn = overlay.querySelector(".is-prev");
    const nextBtn = overlay.querySelector(".is-next");
    const closeBtn = overlay.querySelector(".photo-lightbox-close");

    function collectItems() {
      return Array.prototype.slice
        .call(document.querySelectorAll(".photo-zoom"))
        .filter(function (el) {
          return el.offsetParent !== null;
        })
        .map(function (el) {
          const img = el.querySelector("img");
          return {
            src: el.getAttribute("data-src") || (img && img.getAttribute("src")) || "",
            title: el.getAttribute("data-title") || "",
            desc: el.getAttribute("data-desc") || "",
            buyHref: el.getAttribute("data-buy-href") || "",
            buyLabel: el.getAttribute("data-buy-label") || "Buy print / mug",
          };
        });
    }

    function show(i) {
      if (!items.length) return;
      index = ((i % items.length) + items.length) % items.length;
      const item = items[index];
      imgEl.src = item.src;
      imgEl.alt = item.title;
      titleEl.textContent = item.title;
      descEl.textContent = item.desc;
      descEl.hidden = !item.desc;
      if (item.buyHref) {
        buyEl.hidden = false;
        buyEl.href = item.buyHref;
        buyEl.textContent = item.buyLabel;
      } else {
        buyEl.hidden = true;
      }
      const many = items.length > 1;
      prevBtn.hidden = !many;
      nextBtn.hidden = !many;
    }

    function openFrom(el) {
      items = collectItems();
      const src = el.getAttribute("data-src") || "";
      const title = el.getAttribute("data-title") || "";
      let i = 0;
      for (let n = 0; n < items.length; n++) {
        if (items[n].src === src && items[n].title === title) {
          i = n;
          break;
        }
      }
      lastFocus = document.activeElement;
      overlay.hidden = false;
      document.body.classList.add("lightbox-open");
      show(i);
      closeBtn.focus();
    }

    function close() {
      if (overlay.hidden) return;
      overlay.hidden = true;
      document.body.classList.remove("lightbox-open");
      imgEl.removeAttribute("src");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function focusables() {
      return Array.prototype.slice
        .call(overlay.querySelectorAll("button, a[href]"))
        .filter(function (el) {
          return !el.hidden;
        });
    }

    document.addEventListener("click", function (e) {
      const zoom = e.target.closest(".photo-zoom");
      if (zoom) {
        e.preventDefault();
        openFrom(zoom);
        return;
      }
      if (e.target.closest("[data-lightbox-close]")) {
        close();
      }
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () {
      show(index - 1);
    });
    nextBtn.addEventListener("click", function () {
      show(index + 1);
    });

    document.addEventListener("keydown", function (e) {
      if (overlay.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        show(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        show(index + 1);
      } else if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    overlay.addEventListener(
      "touchstart",
      function (e) {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    overlay.addEventListener(
      "touchend",
      function (e) {
        if (!e.changedTouches || !e.changedTouches[0]) return;
        const dx = e.changedTouches[0].screenX - touchStartX;
        if (dx > 60) show(index - 1);
        else if (dx < -60) show(index + 1);
      },
      { passive: true }
    );
  })();

  // ---- Optional beach music (off until the visitor turns it on) ----
  (function initBeachMusic() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    if (page === "metrics.html" || page === "studio.html") return;

    const STORAGE_KEY = "fnpMusicOn";
    const VOL_KEY = "fnpMusicVolStep";
    const STEPS = [0.12, 0.22, 0.32, 0.48, 0.68, 0.88];
    const DEFAULT_STEP = 2;
    const SRC = "audio/my-last-mojito.m4a";

    function wanted() {
      try {
        return localStorage.getItem(STORAGE_KEY) === "1";
      } catch (e) {
        return false;
      }
    }

    function setWanted(on) {
      try {
        localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
      } catch (e) {}
    }

    function readStep() {
      try {
        const n = parseInt(localStorage.getItem(VOL_KEY), 10);
        if (!isNaN(n) && n >= 0 && n < STEPS.length) return n;
      } catch (e) {}
      return DEFAULT_STEP;
    }

    function writeStep(n) {
      try {
        localStorage.setItem(VOL_KEY, String(n));
      } catch (e) {}
    }

    let step = readStep();

    const audio = document.createElement("audio");
    audio.setAttribute("loop", "");
    audio.setAttribute("preload", "none");
    audio.setAttribute("playsinline", "");
    audio.volume = STEPS[step];
    const source = document.createElement("source");
    source.src = SRC;
    source.type = "audio/mp4";
    audio.appendChild(source);
    document.body.appendChild(audio);

    const dock = document.createElement("div");
    dock.className = "music-dock";
    dock.innerHTML =
      '<button type="button" class="music-vol is-down" aria-label="Quieter">−</button>' +
      '<button type="button" class="music-toggle" aria-pressed="false" title="Optional beach music — My Last Mojito by Michael Ramir C. (Mixkit, royalty-free)">' +
      '<span class="music-toggle-icon" aria-hidden="true">♪</span>' +
      '<span class="music-toggle-label">Music</span>' +
      "</button>" +
      '<button type="button" class="music-vol is-up" aria-label="Louder">+</button>';
    document.body.appendChild(dock);

    const btn = dock.querySelector(".music-toggle");
    const quieter = dock.querySelector(".is-down");
    const louder = dock.querySelector(".is-up");

    function isPlaying() {
      return !audio.paused && !audio.ended;
    }

    function applyVolume() {
      audio.volume = STEPS[step];
      quieter.disabled = step <= 0;
      louder.disabled = step >= STEPS.length - 1;
      quieter.setAttribute(
        "aria-label",
        "Quieter, level " + (step + 1) + " of " + STEPS.length
      );
      louder.setAttribute(
        "aria-label",
        "Louder, level " + (step + 1) + " of " + STEPS.length
      );
    }

    function paint() {
      const on = wanted();
      const playing = isPlaying();
      dock.classList.toggle("is-on", on && playing);
      dock.classList.toggle("is-waiting", on && !playing);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Stop beach music" : "Play beach music");
      btn.querySelector(".music-toggle-label").textContent = on ? "On" : "Music";
      applyVolume();
    }

    audio.addEventListener("play", paint);
    audio.addEventListener("pause", paint);

    function tryPlay() {
      applyVolume();
      const p = audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () {
          paint();
        });
      }
      paint();
    }

    function stop() {
      audio.pause();
      paint();
    }

    function nudge(dir) {
      const next = Math.max(0, Math.min(STEPS.length - 1, step + dir));
      if (next === step) return;
      step = next;
      writeStep(step);
      applyVolume();
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (wanted()) {
        setWanted(false);
        stop();
        return;
      }
      setWanted(true);
      tryPlay();
    });

    quieter.addEventListener("click", function (e) {
      e.stopPropagation();
      nudge(-1);
    });
    louder.addEventListener("click", function (e) {
      e.stopPropagation();
      nudge(1);
    });

    document.addEventListener(
      "pointerdown",
      function (e) {
        if (e.target && e.target.closest && e.target.closest(".music-dock")) {
          return;
        }
        if (wanted() && !isPlaying()) tryPlay();
      },
      true
    );

    if (wanted()) {
      tryPlay();
    } else {
      paint();
    }
  })();
})();
