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
    return "images/prints/" + encodeURIComponent(file);
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

  // ---- Gallery cards (shared markup) ----
  function photoCardHtml(photo, withBuy) {
    return (
      '<article class="photo-card" data-category="' +
      escapeHtml(photo.category || "all") +
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

  // ---- Gallery with category tabs ----
  const galleryGrid = document.getElementById("gallery-grid");
  const galleryTabs = document.getElementById("gallery-tabs");
  if (galleryGrid && SITE_CONFIG.photos) {
    function renderGallery(category) {
      const cat = category || "all";
      const list = SITE_CONFIG.photos.filter(function (photo) {
        if (cat === "all") return true;
        return (photo.category || "") === cat;
      });
      if (!list.length) {
        galleryGrid.innerHTML =
          '<p class="gallery-empty">No photos in this category yet.</p>';
        return;
      }
      galleryGrid.innerHTML = list
        .map(function (photo) {
          return photoCardHtml(photo, true);
        })
        .join("");
      const countEl = document.getElementById("gallery-count");
      if (countEl) {
        countEl.textContent =
          list.length + (list.length === 1 ? " photo" : " photos");
      }
    }

    if (galleryTabs && SITE_CONFIG.categories) {
      galleryTabs.innerHTML = SITE_CONFIG.categories
        .map(function (c, i) {
          return (
            '<button type="button" class="gallery-tab' +
            (i === 0 ? " is-active" : "") +
            '" data-category="' +
            escapeHtml(c.id) +
            '" role="tab" aria-selected="' +
            (i === 0 ? "true" : "false") +
            '">' +
            escapeHtml(c.label) +
            "</button>"
          );
        })
        .join("");

      galleryTabs.addEventListener("click", function (e) {
        const btn = e.target.closest(".gallery-tab");
        if (!btn) return;
        const cat = btn.getAttribute("data-category") || "all";
        galleryTabs.querySelectorAll(".gallery-tab").forEach(function (tab) {
          const on = tab === btn;
          tab.classList.toggle("is-active", on);
          tab.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderGallery(cat);
      });
    }

    // Deep link: gallery.html?cat=gators
    const params = new URLSearchParams(window.location.search);
    const startCat = params.get("cat") || "all";
    if (galleryTabs && startCat !== "all") {
      const match = galleryTabs.querySelector(
        '.gallery-tab[data-category="' + startCat + '"]'
      );
      if (match) {
        galleryTabs.querySelectorAll(".gallery-tab").forEach(function (tab) {
          const on = tab === match;
          tab.classList.toggle("is-active", on);
          tab.setAttribute("aria-selected", on ? "true" : "false");
        });
      }
    }
    renderGallery(startCat);
  }

  const featuredGrid = document.getElementById("featured-grid");
  if (featuredGrid && SITE_CONFIG.photos) {
    const featured = SITE_CONFIG.photos.slice(0, 3);
    featuredGrid.innerHTML = featured
      .map(function (photo) {
        return photoCardHtml(photo, false);
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
    printSelect.innerHTML =
      '<option value="">Choose a print…</option>' +
      SITE_CONFIG.photos
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
