/**
 * Site-wide JavaScript: navigation, photo grids, forms, shop
 */

(function () {
  "use strict";

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
          '">Buy print</a>' +
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

  // ---- Shop: sizes, print dropdown, Stripe link ----
  const sizeList = document.getElementById("size-list");
  if (sizeList && SITE_CONFIG.printSizes) {
    sizeList.innerHTML = SITE_CONFIG.printSizes
      .map(function (s) {
        return (
          "<li><span class=\"size-label\">" +
          escapeHtml(s.label) +
          '</span><span class="size-price">$' +
          s.price +
          "</span></li>"
        );
      })
      .join("");
  }

  const sizeSelect = document.getElementById("order-size");
  if (sizeSelect && SITE_CONFIG.printSizes) {
    sizeSelect.innerHTML =
      '<option value="">Choose a size…</option>' +
      SITE_CONFIG.printSizes
        .map(function (s) {
          return (
            '<option value="' +
            escapeHtml(s.label) +
            '  - $' +
            s.price +
            '">' +
            escapeHtml(s.label) +
            "  - $" +
            s.price +
            "</option>"
          );
        })
        .join("");
  }

  const printSelect = document.getElementById("order-print");
  if (printSelect && SITE_CONFIG.photos) {
    // Group shop prints by category in the dropdown
    let opts = '<option value="">Choose a print…</option>';
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

    // Pre-select from URL ?print=Title
    const params = new URLSearchParams(window.location.search);
    const preselect = params.get("print");
    if (preselect) {
      printSelect.value = preselect;
    }
  }

  const stripeBtn = document.getElementById("stripe-payment-btn");
  if (stripeBtn) {
    stripeBtn.href = SITE_CONFIG.stripePaymentLink;
  }

  // ---- Order form ----
  setupForm("order-form", "order-message", function (form) {
    return {
      _subject: "New print order  - " + SITE_CONFIG.businessName,
      _template: "table",
      _captcha: "false",
      form_type: "Order",
      print: form.print.value,
      size: form.size.value,
      name: form.name.value,
      email: form.email.value,
      _replyto: form.email.value,
      phone: form.phone.value || "(not provided)",
      address: form.address.value,
      city: form.city.value,
      state: form.state.value,
      zip: form.zip.value,
      notes: form.notes.value || "(none)",
    };
  });

  // ---- Contact form ----
  setupForm("contact-form", "contact-message", function (form) {
    return {
      _subject: "Website contact  - " + SITE_CONFIG.businessName,
      _template: "table",
      _captcha: "false",
      form_type: "Contact",
      name: form.name.value,
      email: form.email.value,
      _replyto: form.email.value,
      message: form.message.value,
    };
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
          if (msg) {
            msg.className = "form-message success";
            msg.textContent =
              "Thank you! Your message was sent. I'll get back to you soon.";
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
