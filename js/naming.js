/**
 * Public naming page: products, live 2×3.5 mini-scroll preview, order form.
 */
(function () {
  "use strict";

  var C = window.FNPCertificates;
  var cfg = (window.SITE_CONFIG && SITE_CONFIG.naming) || {};
  var products = cfg.products || [];
  var hibiscus = cfg.hibiscus || [];
  var isNamingPage =
    document.body && document.body.getAttribute("data-page") === "naming";

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    if (C && C.escapeHtml) return C.escapeHtml(str);
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function productById(id) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return products[0] || null;
  }

  function imgSrc(folder, file) {
    if (folder === "souvenirs") return "images/souvenirs/" + file;
    if (folder === "hibiscus") return "images/hibiscus/" + file;
    return "images/prints/" + file;
  }

  function money(n) {
    var x = Number(n);
    if (isNaN(x)) return "$0";
    return x % 1 === 0 ? "$" + x : "$" + x.toFixed(2);
  }

  function currentKind() {
    return ($("naming-kind") && $("naming-kind").value) || "teeth";
  }

  function currentNames() {
    var a = ($("name-one") && $("name-one").value) || "";
    var b = ($("name-two") && $("name-two").value) || "";
    var c = ($("name-three") && $("name-three").value) || "";
    if (currentKind() === "teeth") return [a, b, c];
    return [a];
  }

  function sourceTitle() {
    var kind = currentKind();
    if (kind === "hibiscus") {
      var hid = $("naming-hibiscus") && $("naming-hibiscus").value;
      for (var i = 0; i < hibiscus.length; i++) {
        if (hibiscus[i].id === hid) return hibiscus[i].title;
      }
      return "";
    }
    if (kind === "photo") {
      return ($("naming-photo") && $("naming-photo").value) || "";
    }
    return "";
  }

  function certData() {
    var first = (($("order-name") && $("order-name").value) || "").trim().split(/\s+/)[0];
    var show = document.querySelector('input[name="show_first_name"]');
    return {
      kind: currentKind(),
      names: currentNames(),
      designId: ($("naming-design") && $("naming-design").value) || "shell-ivory",
      sourceTitle: sourceTitle(),
      date: new Date().toISOString().slice(0, 10),
      namedBy: show && show.checked ? first : "",
      registryIds: [],
    };
  }

  function updatePreview() {
    if (C && $("cert-live")) C.mount($("cert-live"), certData());
  }

  function shippingFor() {
    var kind = currentKind();
    var ship = cfg.shipping || {};
    if (kind === "teeth") return ship.teeth;
    var delivery = $("naming-delivery") && $("naming-delivery").value;
    if (delivery === "mail") return ship.card;
    return ship.digital;
  }

  function fillDeliveryOptions(kind) {
    var sel = $("naming-delivery");
    var hint = $("delivery-hint");
    if (!sel) return;
    if (kind === "photo") {
      sel.innerHTML =
        '<option value="digital">Digital only — keep it in the gallery under this name ($3)</option>' +
        '<option value="print-addon">Name it on a print I order (print price + $3)</option>';
      if (hint) {
        hint.textContent =
          "Digital only means the photo stays in Named by You. We do not email a personalized file. Naming on a print is an extra $3 when you order the print.";
      }
    } else {
      sel.innerHTML =
        '<option value="email">Email the named image (included)</option>' +
        '<option value="mail">Also mail the mini certificate — $2</option>';
      if (hint) {
        hint.textContent = "Hibiscus naming includes the named image by email.";
      }
    }
  }

  function updateTotals() {
    var p = productById(currentKind());
    var ship = shippingFor() || { total: 0, methodTitle: "" };
    var box = $("naming-totals");
    if (!p || !box) return;
    var delivery = $("naming-delivery") && $("naming-delivery").value;
    var total = Number(p.price) + Number(ship.total || 0);
    var detail;
    if (p.id === "photo" && delivery === "print-addon") {
      total = 0;
      detail =
        "No charge on this form. When you order the print, naming is an extra $3 on top of the print and shipping.";
    } else if (p.id === "photo") {
      total = Number(p.price);
      detail =
        money(p.price) +
        " digital only — the photo is kept in our gallery under your name. We do not email a personalized file.";
    } else if (p.physical) {
      detail =
        "Includes " +
        money(p.price) +
        " for naming + " +
        money(ship.total) +
        " shipping (" +
        (ship.methodTitle || "mailer") +
        ").";
    } else if (ship.total) {
      detail =
        "Includes " +
        money(p.price) +
        " for naming + " +
        money(ship.total) +
        " to mail the mini certificate.";
    } else {
      detail = "Includes " + money(p.price) + ". Named image sent by email — no shipping.";
    }
    box.querySelector("strong").textContent =
      total === 0
        ? "Due here: $0 — pay naming with the print"
        : "Total due after you submit: " + money(total);
    box.querySelector("p").textContent = detail;
  }

  function setKind(id, scroll) {
    var p = productById(id);
    if (!p) return;
    if ($("naming-kind")) $("naming-kind").value = p.id;
    if ($("naming-kind-label")) {
      $("naming-kind-label").textContent = p.label + " — $" + p.price;
    }
    document.querySelectorAll(".offer-card").forEach(function (card) {
      card.classList.toggle("is-selected", card.getAttribute("data-id") === p.id);
    });
    var triple = p.namesNeeded > 1;
    if ($("name-two-wrap")) $("name-two-wrap").hidden = !triple;
    if ($("name-three-wrap")) $("name-three-wrap").hidden = !triple;
    if ($("name-two")) $("name-two").required = triple;
    if ($("name-three")) $("name-three").required = triple;
    if ($("hibiscus-group")) $("hibiscus-group").hidden = p.id !== "hibiscus";
    if ($("photo-group")) $("photo-group").hidden = p.id !== "photo";
    if ($("delivery-group")) $("delivery-group").hidden = !!p.physical;
    if (!p.physical) fillDeliveryOptions(p.id);
    var delivery = $("naming-delivery") && $("naming-delivery").value;
    var needShip =
      !!p.physical || (delivery === "mail" && !p.physical);
    setShippingRequired(needShip);
    updateTotals();
    updatePreview();
    if (scroll && $("order")) {
      $("order").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setShippingRequired(on) {
    ["order-address", "order-city", "order-state", "order-zip"].forEach(function (id) {
      var el = $(id);
      if (el) el.required = !!on;
    });
  }

  function renderOffers() {
    var wrap = $("naming-offers");
    if (!wrap) return;
    wrap.innerHTML = products
      .map(function (p) {
        return (
          '<button type="button" class="offer-card" data-id="' +
          escapeHtml(p.id) +
          '">' +
          '<img src="' +
          escapeHtml(imgSrc(p.folder, p.file)) +
          '" alt="' +
          escapeHtml(p.label) +
          '" />' +
          '<div class="offer-body">' +
          '<span class="offer-kicker">' +
          escapeHtml(p.kicker || "") +
          "</span>" +
          "<h3>" +
          escapeHtml(p.label) +
          "</h3>" +
          '<div class="offer-price">$' +
          p.price +
          "</div>" +
          "<p>" +
          escapeHtml(p.lede || "") +
          "</p>" +
          "<p>" +
          escapeHtml(p.body || "") +
          "</p>" +
          (p.galleryNote ? "<p>" + escapeHtml(p.galleryNote) + "</p>" : "") +
          '<p class="offer-closing">' +
          escapeHtml(p.closing || "") +
          "</p>" +
          "</div></button>"
        );
      })
      .join("");
    wrap.addEventListener("click", function (e) {
      var card = e.target.closest(".offer-card");
      if (!card) return;
      setKind(card.getAttribute("data-id"), true);
    });
  }

  function renderDesigns() {
    var grid = $("design-grid");
    if (!grid || !C) return;
    var sample = {
      kind: "teeth",
      names: ["Poseidon", "Luffy", "Llamrei"],
      date: new Date().toISOString().slice(0, 10),
      registryIds: ["FNP-T-0001", "FNP-T-0002", "FNP-T-0003"],
    };
    grid.innerHTML = C.DESIGNS.map(function (d) {
      sample.designId = d.id;
      return (
        '<button type="button" class="design-pick" data-id="' +
        escapeHtml(d.id) +
        '"><div class="design-thumb">' +
        C.render(sample) +
        "</div><strong>" +
        escapeHtml(d.label) +
        "</strong><span>" +
        escapeHtml(d.note) +
        "</span></button>"
      );
    }).join("");
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".design-pick");
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      if ($("naming-design")) $("naming-design").value = id;
      grid.querySelectorAll(".design-pick").forEach(function (el) {
        el.classList.toggle("is-selected", el === btn);
      });
      updatePreview();
    });
    var current = ($("naming-design") && $("naming-design").value) || "shell-ivory";
    var selected = grid.querySelector('[data-id="' + current + '"]');
    if (selected) selected.classList.add("is-selected");
  }

  function renderHibiscus() {
    var grid = $("hibiscus-picker");
    if (!grid) return;
    grid.innerHTML = hibiscus
      .map(function (h) {
        return (
          '<button type="button" class="picker-item" data-id="' +
          escapeHtml(h.id) +
          '"><img src="images/hibiscus/' +
          escapeHtml(h.file) +
          '" alt="' +
          escapeHtml(h.title) +
          '" /><span>' +
          escapeHtml(h.title) +
          "</span></button>"
        );
      })
      .join("");
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".picker-item");
      if (!btn) return;
      if ($("naming-hibiscus")) $("naming-hibiscus").value = btn.getAttribute("data-id");
      grid.querySelectorAll(".picker-item").forEach(function (el) {
        el.classList.toggle("is-selected", el === btn);
      });
      updatePreview();
    });
    if (hibiscus[0] && $("naming-hibiscus") && !$("naming-hibiscus").value) {
      $("naming-hibiscus").value = hibiscus[0].id;
      var first = grid.querySelector('[data-id="' + hibiscus[0].id + '"]');
      if (first) first.classList.add("is-selected");
    }
  }

  function renderPhotos(filter) {
    var grid = $("photo-picker");
    if (!grid || !SITE_CONFIG.photos) return;
    var q = String(filter || "").toLowerCase();
    var list = SITE_CONFIG.photos.filter(function (p) {
      if (!q) return true;
      return (
        (p.title || "").toLowerCase().indexOf(q) !== -1 ||
        (p.desc || "").toLowerCase().indexOf(q) !== -1 ||
        (p.category || "").toLowerCase().indexOf(q) !== -1
      );
    });
    grid.innerHTML = list
      .slice(0, 60)
      .map(function (p) {
        return (
          '<button type="button" class="picker-item" data-title="' +
          escapeHtml(p.title) +
          '"><img src="images/prints/' +
          escapeHtml(p.file) +
          '" alt="' +
          escapeHtml(p.title) +
          '" /><span>' +
          escapeHtml(p.title) +
          "</span></button>"
        );
      })
      .join("");
    var current = $("naming-photo") && $("naming-photo").value;
    if (current) {
      var on = grid.querySelector('[data-title="' + current.replace(/"/g, "") + '"]');
      if (on) on.classList.add("is-selected");
    }
  }

  function wirePhotoPicker() {
    var grid = $("photo-picker");
    var search = $("photo-search");
    if (grid) {
      grid.addEventListener("click", function (e) {
        var btn = e.target.closest(".picker-item");
        if (!btn) return;
        var title = btn.getAttribute("data-title") || "";
        if ($("naming-photo")) $("naming-photo").value = title;
        grid.querySelectorAll(".picker-item").forEach(function (el) {
          el.classList.toggle("is-selected", el === btn);
        });
        updatePreview();
      });
    }
    if (search) {
      search.addEventListener("input", function () {
        renderPhotos(search.value);
      });
    }
    renderPhotos("");
  }

  function renderNamedGallery() {
    var el = $("named-gallery");
    if (!el) return;
    var items = window.NAMED_REGISTRY || [];
    if (!items.length) {
      el.innerHTML =
        '<p class="named-empty" style="grid-column:1/-1">No names yet — be the first. A shark tooth, a hibiscus, or a wild Florida scene is waiting.</p>';
      return;
    }
    var shown = items.slice(-12).reverse();
    el.innerHTML = shown
      .map(function (item) {
        var img = item.photo
          ? '<img src="images/named/' + escapeHtml(item.photo) + '" alt="' + escapeHtml(item.name) + '" />'
          : '<div class="named-fallback">' + escapeHtml(item.name) + "</div>";
        var kind =
          item.kind === "hibiscus"
            ? "Named hibiscus"
            : item.kind === "photo"
              ? "Named photograph"
              : "Named shark tooth";
        var extra = item.sourceTitle ? " · " + item.sourceTitle : "";
        var by = item.namedBy ? " · named by " + item.namedBy : "";
        return (
          '<article class="named-card">' +
          img +
          "<h3>" +
          escapeHtml(item.name) +
          "</h3>" +
          "<p>" +
          escapeHtml(kind + extra + by) +
          (item.registryId ? "<br />" + escapeHtml(item.registryId) : "") +
          "</p></article>"
        );
      })
      .join("");
  }

  function formEndpoint() {
    var email = SITE_CONFIG.yourEmail || "";
    if (SITE_CONFIG.formspreeFormId && SITE_CONFIG.formspreeFormId.indexOf("YOUR") === -1 && SITE_CONFIG.formspreeFormId.trim()) {
      return "https://formspree.io/f/" + SITE_CONFIG.formspreeFormId;
    }
    return "https://formsubmit.co/ajax/" + encodeURIComponent(email);
  }

  function wireForm() {
    var form = $("naming-form");
    var msg = $("naming-message");
    if (!form) return;

    ["name-one", "name-two", "name-three", "order-name"].forEach(function (id) {
      if ($(id)) $(id).addEventListener("input", updatePreview);
    });
    var show = document.querySelector('input[name="show_first_name"]');
    if (show) show.addEventListener("change", updatePreview);
    if ($("naming-delivery")) {
      $("naming-delivery").addEventListener("change", function () {
        var p = productById(currentKind());
        var need = p && p.physical ? true : $("naming-delivery").value === "mail";
        setShippingRequired(need);
        updateTotals();
      });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (msg) {
        msg.className = "form-message";
        msg.textContent = "";
      }
      var p = productById(currentKind());
      var names = currentNames().map(function (n) {
        return n.trim();
      });
      if (p.id === "teeth" && names.filter(Boolean).length < 3) {
        if (msg) {
          msg.className = "form-message error";
          msg.textContent = "Please enter all three names.";
        }
        return;
      }
      if (p.id !== "teeth" && !names[0]) {
        if (msg) {
          msg.className = "form-message error";
          msg.textContent = "Please enter a name.";
        }
        return;
      }
      if (p.id === "hibiscus" && !$("naming-hibiscus").value) {
        if (msg) {
          msg.className = "form-message error";
          msg.textContent = "Please choose a hibiscus.";
        }
        return;
      }
      if (p.id === "photo" && !$("naming-photo").value) {
        if (msg) {
          msg.className = "form-message error";
          msg.textContent = "Please choose a gallery photo.";
        }
        return;
      }
      var deliveryChoice = $("naming-delivery") && $("naming-delivery").value;
      if (p.id === "photo" && deliveryChoice === "print-addon") {
        var shopUrl =
          "shop.html?product=print&print=" +
          encodeURIComponent($("naming-photo").value || "") +
          "&nameit=1&given_name=" +
          encodeURIComponent(names[0] || "");
        window.location.href = shopUrl;
        return;
      }
      if (!SITE_CONFIG.yourEmail || SITE_CONFIG.yourEmail.indexOf("@") < 0) {
        if (msg) {
          msg.className = "form-message error";
          msg.textContent = "Email is not set up yet. Please write to us directly.";
        }
        return;
      }

      var ship = shippingFor() || { total: 0, methodTitle: "none" };
      var total = Number(p.price) + Number(ship.total || 0);
      if (p.id === "photo") total = Number(p.price);
      var design = C && C.designById($("naming-design").value);
      var payload = {
        _subject: "🌿 NEW NAMING ORDER — " + p.label + " — " + SITE_CONFIG.businessName,
        _template: "table",
        _captcha: "false",
        form_type: "Naming",
        product_type: p.label,
        product_id: p.id,
        price: "$" + p.price,
        names: names.filter(Boolean).join(" · "),
        name_1: names[0] || "",
        name_2: names[1] || "",
        name_3: names[2] || "",
        hibiscus: sourceTitle() || "(n/a)",
        photo: p.id === "photo" ? $("naming-photo").value : "(n/a)",
        certificate_design: design ? design.label + " (" + design.id + ")" : $("naming-design").value,
        paper: '2" × 3.5" mini scroll (rolls into bottle)',
        delivery: p.physical
          ? "Mail bottle of teeth + rolled certificate"
          : $("naming-delivery").value === "print-addon"
            ? "Name on a print order (+$3 with the print; no personalized file emailed)"
            : $("naming-delivery").value === "mail"
              ? "Email image + mail mini certificate"
              : p.id === "photo"
                ? "Digital only — named in the gallery (no personalized file emailed)"
                : "Email named image",
        shipping: ship.methodTitle + " — $" + ship.total,
        shipping_total: "$" + ship.total,
        order_total: "$" + total,
        name: form.name.value,
        email: form.email.value,
        _replyto: form.email.value,
        phone: form.phone.value || "(not provided)",
        address: form.address.value || "(none)",
        city: form.city.value || "",
        state: form.state.value || "",
        zip: form.zip.value || "",
        show_first_name: form.show_first_name && form.show_first_name.checked ? "yes" : "no",
        notes: form.notes.value || "(none)",
        sms_kind: "NAMING",
        sms_summary:
          "NAMING " +
          p.id +
          ": " +
          names.filter(Boolean).join("/") +
          " | " +
          money(total) +
          " | " +
          form.name.value,
      };
      var ccs = [];
      if ((SITE_CONFIG.smsAlertEmail || "").trim()) ccs.push(SITE_CONFIG.smsAlertEmail.trim());
      if ((SITE_CONFIG.orderCcEmail || "").trim()) ccs.push(SITE_CONFIG.orderCcEmail.trim());
      if (ccs.length) payload._cc = ccs.join(",");

      var btn = form.querySelector('button[type="submit"]');
      var original = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }
      try {
        var res = await fetch(formEndpoint(), {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        var data = await res.json().catch(function () {
          return {};
        });
        if (res.ok && data.success !== "false" && !data.error) {
          if (msg) {
            msg.className = "form-message success";
            msg.textContent =
              p.id === "photo"
                ? "Thank you. Your name will appear in the gallery. We do not email a personalized file. Next: use a payment button for the $3."
                : "Thank you. Your names were sent. Next: use a payment button so I can match your payment.";
          }
          var pay = $("payment-box");
          if (pay && pay.scrollIntoView) {
            setTimeout(function () {
              pay.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 200);
          }
        } else {
          throw new Error(data.message || "Could not send. Please email " + SITE_CONFIG.yourEmail + ".");
        }
      } catch (err) {
        if (msg) {
          msg.className = "form-message error";
          msg.textContent = err.message || "Could not send.";
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
        }
      }
    });
  }

  if (isNamingPage) {
    renderOffers();
    renderDesigns();
    renderHibiscus();
    wirePhotoPicker();
    wireForm();

    var params = new URLSearchParams(window.location.search);
    var kind = params.get("kind") || "teeth";
    if (kind === "souvenir") kind = "teeth";
    setKind(kind, false);
    var printTitle = params.get("print");
    if (printTitle && $("naming-photo")) {
      $("naming-photo").value = printTitle;
      setKind("photo", false);
      renderPhotos($("photo-search") && $("photo-search").value);
    }

    updatePreview();
    updateTotals();
  }
  renderNamedGallery();
})();
