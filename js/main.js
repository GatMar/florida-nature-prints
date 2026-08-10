/**
 * Site-wide JavaScript: navigation, photo grids, forms, shop
 */

(function () {
  "use strict";

  // ---- Hero video carousel (two muted clips, seamless crossfade) ----
  // Titles are HTML overlays with exact gallery spellings (never baked into video).
  (function initHeroVideoCarousel() {
    const a = document.getElementById("hero-video-a");
    const b = document.getElementById("hero-video-b");
    const titleEl = document.getElementById("hero-photo-title");
    if (!a || !b) return;

    // Exact titles as named on the website / in config.js
    const titlesA = [
      "Crimson Marsh",
      "Golden Gulf",
      "Gator Mid-Yawn",
      "Great Blue Heron",
      "Anhinga Portrait",
      "Wood Stork Standing Tall",
      "Sandhill Crane",
    ];
    const titlesB = [
      "Horizon Fire",
      "Footprints at Sunset",
      "Floating Gator",
      "Anhinga on the Branch",
      "Wood Stork Profile",
      "Marsh at Dusk",
    ];

    let showingA = true;
    let titleTimer = null;
    let titleIndex = 0;

    const playSafe = function (v) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(function () {});
    };

    function setTitle(text) {
      if (!titleEl) return;
      titleEl.classList.add("is-swap");
      window.setTimeout(function () {
        titleEl.textContent = text;
        titleEl.classList.remove("is-swap");
      }, 220);
    }

    function stopTitleCycle() {
      if (titleTimer) {
        window.clearInterval(titleTimer);
        titleTimer = null;
      }
    }

    function startTitleCycle(list) {
      stopTitleCycle();
      titleIndex = 0;
      setTitle(list[0]);
      // ~10s reels: spread titles evenly so names match the visual pace
      const stepMs = Math.max(1200, Math.floor(10000 / list.length));
      titleTimer = window.setInterval(function () {
        titleIndex = (titleIndex + 1) % list.length;
        setTitle(list[titleIndex]);
      }, stepMs);
    }

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
      if (titleEl) titleEl.textContent = titlesA[0];
      return;
    }

    playSafe(a);
    startTitleCycle(titlesA);

    // Crossfade to the other reel when one ends (loop disabled on active switch)
    a.loop = false;
    b.loop = false;

    function onEnded(ended, next, nextTitles) {
      next.currentTime = 0;
      playSafe(next);
      ended.classList.remove("is-active");
      next.classList.add("is-active");
      showingA = next === a;
      startTitleCycle(nextTitles);
    }

    a.addEventListener("ended", function () {
      onEnded(a, b, titlesB);
    });
    b.addEventListener("ended", function () {
      onEnded(b, a, titlesA);
    });

    // Fallback: if a clip errors, keep a single looping video
    a.addEventListener("error", function () {
      a.loop = true;
      playSafe(a);
      startTitleCycle(titlesA);
    });
    b.addEventListener("error", function () {
      a.loop = true;
      a.classList.add("is-active");
      b.classList.remove("is-active");
      playSafe(a);
      startTitleCycle(titlesA);
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

  // ---- Gallery: category covers + dropdown sections with photos ----
  const galleryAccordion = document.getElementById("gallery-accordion");
  const gallerySelect = document.getElementById("gallery-select");

  if (galleryAccordion && SITE_CONFIG.photos && SITE_CONFIG.categories) {
    function updateGalleryCount() {
      const countEl = document.getElementById("gallery-count");
      if (!countEl) return;
      const n = (SITE_CONFIG.photos || []).length;
      countEl.textContent = n + " photos total";
    }

    function openAccordionSection(catId, scroll) {
      const sections = galleryAccordion.querySelectorAll(".gallery-section");
      sections.forEach(function (sec) {
        const on = sec.getAttribute("data-category") === catId;
        sec.classList.toggle("is-open", on);
        const btn = sec.querySelector(".gallery-section-toggle");
        if (btn) btn.setAttribute("aria-expanded", on ? "true" : "false");
      });
      if (gallerySelect && catId) gallerySelect.value = catId;
      if (scroll) {
        const el = galleryAccordion.querySelector(
          '.gallery-section[data-category="' + catId + '"]'
        );
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      if (window.history && window.history.replaceState && catId) {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("cat", catId);
          window.history.replaceState({}, "", url.pathname + url.search);
        } catch (e) {}
      }
    }

    // Build one dropdown section per category (cover + all photos)
    galleryAccordion.innerHTML = SITE_CONFIG.categories
      .map(function (cat, index) {
        const list = photosInCategory(cat.id);
        const cover =
          cat.cover || (list[0] && list[0].file) || "";
        const openClass = index === 0 ? " is-open" : "";
        const expanded = index === 0 ? "true" : "false";
        const photosHtml = list.length
          ? list
              .map(function (photo) {
                return photoCardHtml(photo, true);
              })
              .join("")
          : '<p class="gallery-empty">No photos in this category yet.</p>';

        return (
          '<section class="gallery-section' +
          openClass +
          '" data-category="' +
          escapeHtml(cat.id) +
          '" id="cat-' +
          escapeHtml(cat.id) +
          '">' +
          '<button type="button" class="gallery-section-toggle" aria-expanded="' +
          expanded +
          '">' +
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
        sec.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        openAccordionSection(catId, false);
      }
    });

    if (gallerySelect) {
      gallerySelect.innerHTML =
        '<option value="">All categories</option>' +
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
          // Open all sections lightly: open first, scroll top
          openAccordionSection(SITE_CONFIG.categories[0].id, true);
          return;
        }
        openAccordionSection(v, true);
      });
    }

    updateGalleryCount();

    // Deep link: gallery.html?cat=gators
    const params = new URLSearchParams(window.location.search);
    const startCat = params.get("cat");
    if (startCat && categoryMeta(startCat)) {
      openAccordionSection(startCat, true);
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
    productSelect.addEventListener("change", syncProductType);
    // URL ?product=mug
    const paramsEarly = new URLSearchParams(window.location.search);
    if (paramsEarly.get("product") === "mug") {
      productSelect.value = "mug";
    }
    syncProductType();
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
