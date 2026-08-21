/**
 * 2" × 3.5" mini-scroll naming certificates — ten designs, one paper size.
 * Rolls with a ribbon into a small bottle with the shark teeth.
 * Used on name.html (preview + customer pick) and studio.html (print).
 */
(function (window) {
  "use strict";

  var DESIGNS = [
    {
      id: "gulf-dusk",
      label: "Gulf Dusk",
      note: "Warm parchment, gold rule",
    },
    {
      id: "marsh-sage",
      label: "Marsh Sage",
      note: "Soft green, botanical",
    },
    {
      id: "shell-ivory",
      label: "Shell Ivory",
      note: "Cream, quiet and classic",
    },
    {
      id: "hibiscus-blush",
      label: "Hibiscus Blush",
      note: "Dusty rose, script name",
    },
    {
      id: "storm-indigo",
      label: "Storm Indigo",
      note: "Deep navy, gold name",
    },
    {
      id: "sand-linen",
      label: "Sand Linen",
      note: "Beach linen, serif",
    },
    {
      id: "palm-grove",
      label: "Palm Grove",
      note: "Forest green, gold",
    },
    {
      id: "coral-dawn",
      label: "Coral Dawn",
      note: "Peach wash, italic",
    },
    {
      id: "moon-gulf",
      label: "Moon Gulf",
      note: "Midnight, silver type",
    },
    {
      id: "sunrise-peach",
      label: "Sunrise Peach",
      note: "Morning gold, script",
    },
  ];

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function designById(id) {
    for (var i = 0; i < DESIGNS.length; i++) {
      if (DESIGNS[i].id === id) return DESIGNS[i];
    }
    return DESIGNS[2]; // shell-ivory default
  }

  function formatDate(iso) {
    if (!iso) {
      iso = new Date().toISOString().slice(0, 10);
    }
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) d = new Date();
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function kindPhrase(kind, data) {
    if (kind === "hibiscus") {
      var flower = (data && data.sourceTitle) || "a Florida hibiscus";
      return flower;
    }
    if (kind === "photo") {
      return (data && data.sourceTitle) || "a Florida photograph";
    }
    return "Three Florida shark teeth";
  }

  function footerLine(kind) {
    if (kind === "hibiscus") return "Loved by the sun";
    if (kind === "photo") return "The name stays forever";
    return "Gulf shore · Yours to keep";
  }

  function kicker(kind) {
    if (kind === "hibiscus") return "Named Bloom";
    if (kind === "photo") return "Named Photograph";
    return "Named Teeth";
  }

  function cleanNames(list) {
    var out = [];
    (list || []).forEach(function (n) {
      var t = String(n || "").trim();
      if (t) out.push(t);
    });
    return out;
  }

  function render(data) {
    data = data || {};
    var design = designById(data.designId);
    var kind = data.kind || "teeth";
    var names = cleanNames(data.names);
    if (!names.length) names = kind === "teeth" ? ["—", "—", "—"] : ["—"];
    var ids = (data.registryIds || []).filter(Boolean);
    var nameClass =
      names.length > 1 ? "fnp-cert-names is-triple" : "fnp-cert-names is-single";
    var namesHtml = names
      .map(function (n) {
        return "<span>" + escapeHtml(n) + "</span>";
      })
      .join("");
    var idsHtml = ids.length
      ? escapeHtml(ids.join("  ·  "))
      : "Registry pending";
    var namedBy = String(data.namedBy || "").trim();
    var namedLine = namedBy
      ? '<p class="fnp-cert-by">Named by ' + escapeHtml(namedBy) + "</p>"
      : "";

    return (
      '<article class="fnp-cert" data-design="' +
      escapeHtml(design.id) +
      '">' +
      '<div class="fnp-cert-frame">' +
      '<p class="fnp-cert-brand">Florida Nature Prints</p>' +
      '<p class="fnp-cert-kicker">' +
      escapeHtml(kicker(kind)) +
      "</p>" +
      '<div class="fnp-cert-ornament" aria-hidden="true">✦</div>' +
      '<p class="fnp-cert-kind">' +
      escapeHtml(kindPhrase(kind, data)) +
      "</p>" +
      '<p class="fnp-cert-lede">now known as</p>' +
      '<div class="' +
      nameClass +
      '">' +
      namesHtml +
      "</div>" +
      namedLine +
      '<p class="fnp-cert-date">Named on ' +
      escapeHtml(formatDate(data.date)) +
      "</p>" +
      '<p class="fnp-cert-ids">' +
      idsHtml +
      "</p>" +
      '<div class="fnp-cert-ornament" aria-hidden="true">✦</div>' +
      '<p class="fnp-cert-foot">' +
      escapeHtml(footerLine(kind)) +
      "</p>" +
      '<p class="fnp-cert-url">floridanatureprints.com</p>' +
      "</div>" +
      "</article>"
    );
  }

  function mount(el, data) {
    if (!el) return;
    el.innerHTML = render(data);
  }

  function stylesheetHref() {
    try {
      return new URL("css/naming.css", window.location.href).href;
    } catch (e) {
      return "css/naming.css";
    }
  }

  function fontsHref() {
    return (
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=EB+Garamond:ital,wght@0,500;1,500&family=Great+Vibes&family=Italiana&family=Libre+Baskerville:ital@0;1&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap"
    );
  }

  function print(data, mode) {
    if (mode !== "letter" && mode !== "avery") mode = "card";
    var card = render(data);
    var w = window.open("", "_blank", "noopener,noreferrer,width=520,height=780");
    if (!w) {
      window.alert("Please allow pop-ups to print the certificate.");
      return;
    }
    var pageCss = "@page { size: letter portrait; margin: 0; }";
    var inner;
    var i;
    if (mode === "avery") {
      var avery = "";
      for (i = 0; i < 10; i++) {
        avery += '<div class="fnp-avery-cell">' + card + "</div>";
      }
      inner =
        '<div class="fnp-avery-8371">' +
        avery +
        "</div>" +
        '<p class="fnp-cut-note">Avery 8371 · tear apart · roll the 3.5″ side (scroll is 2″ tall) · ribbon bow · tall 50 ml cork bottle (~4–5″ high)</p>';
    } else if (mode === "letter") {
      var copies = "";
      for (i = 0; i < 8; i++) {
        copies += '<div class="fnp-crop-cell">' + card + "</div>";
      }
      inner =
        '<div class="fnp-sheet-8up">' +
        copies +
        "</div>" +
        '<p class="fnp-cut-note">Cut to 2″ × 3.5″ · roll along the long edge (scroll is 2″ tall) · ribbon bow · tall 50 ml cork bottle</p>';
      pageCss = "@page { size: letter portrait; margin: 0.25in 0.25in 0.4in; }";
    } else {
      inner = '<div class="fnp-print-card">' + card + "</div>";
      pageCss = "@page { size: 2in 3.5in; margin: 0; }";
    }

    w.document.open();
    w.document.write(
      "<!DOCTYPE html><html><head><meta charset='UTF-8' /><title>Certificate — Florida Nature Prints</title>" +
        "<link rel='stylesheet' href='" +
        fontsHref() +
        "' />" +
        "<link rel='stylesheet' href='" +
        stylesheetHref() +
        "' />" +
        "<style>" +
        pageCss +
        " html,body{margin:0;background:#fff;} " +
        "body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}</style>" +
        "</head><body class='fnp-print-body is-" +
        mode +
        "'>" +
        inner +
        "</body></html>"
    );
    w.document.close();

    function go() {
      try {
        w.focus();
        w.print();
      } catch (err) {}
    }

    if (w.document.fonts && w.document.fonts.ready) {
      w.document.fonts.ready.then(function () {
        setTimeout(go, 200);
      });
    } else {
      setTimeout(go, 700);
    }
  }

  window.FNPCertificates = {
    DESIGNS: DESIGNS,
    designById: designById,
    render: render,
    mount: mount,
    print: print,
    formatDate: formatDate,
    escapeHtml: escapeHtml,
  };
})(window);
