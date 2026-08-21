/**
 * Private naming studio: order pipeline, registry, 2×3.5 mini-scroll printer.
 * Saves to localStorage. Export a JSON backup; download named-registry.js for the live site.
 */
(function () {
  "use strict";

  if (!document.body || document.body.getAttribute("data-page") !== "studio") {
    return;
  }

  var KEY = "fnpNamingStudio_v1";
  var C = window.FNPCertificates;
  var STATUSES = [
    { id: "new", label: "New" },
    { id: "names-locked", label: "Names locked" },
    { id: "photographed", label: "Photographed" },
    { id: "printed", label: "Certificate printed" },
    { id: "packed", label: "Packed" },
    { id: "sent", label: "Sent" },
    { id: "published", label: "On gallery" },
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return C ? C.escapeHtml(str) : String(str || "");
  }

  function emptyState() {
    return { v: 1, nextOrder: 1, nextTooth: 1, nextHibiscus: 1, nextPhoto: 1, orders: [] };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return emptyState();
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.orders)) return emptyState();
      return data;
    } catch (e) {
      return emptyState();
    }
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  var state = load();
  var selectedId = "";
  var printDesign = "shell-ivory";

  function pad(n) {
    return String(n).padStart(4, "0");
  }

  function year() {
    return String(new Date().getFullYear());
  }

  function nextIds(kind, count) {
    var ids = [];
    var i;
    if (kind === "hibiscus") {
      for (i = 0; i < count; i++) ids.push("FNP-H-" + year() + "-" + pad(state.nextHibiscus++));
    } else if (kind === "photo") {
      for (i = 0; i < count; i++) ids.push("FNP-P-" + year() + "-" + pad(state.nextPhoto++));
    } else {
      for (i = 0; i < count; i++) ids.push("FNP-T-" + year() + "-" + pad(state.nextTooth++));
    }
    return ids;
  }

  function statusLabel(id) {
    for (var i = 0; i < STATUSES.length; i++) {
      if (STATUSES[i].id === id) return STATUSES[i].label;
    }
    return id;
  }

  function blankOrder() {
    return {
      id: "N-" + year() + "-" + pad(state.nextOrder++),
      created: new Date().toISOString(),
      kind: "teeth",
      status: "new",
      customerName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      names: ["", "", ""],
      sourceTitle: "",
      designId: "shell-ivory",
      delivery: "mail",
      showFirstName: false,
      notes: "",
      photoFile: "",
      tracking: "",
      registryIds: [],
      checks: {},
      paymentNote: "",
    };
  }

  function findOrder(id) {
    for (var i = 0; i < state.orders.length; i++) {
      if (state.orders[i].id === id) return state.orders[i];
    }
    return null;
  }

  function checksFor(kind) {
    if (kind === "hibiscus") {
      return [
        ["paid", "Payment matched"],
        ["flower", "Flower photo chosen / shot"],
        ["named-image", "Name added to the image"],
        ["emailed", "Named image emailed"],
        ["printed", "Mini-scroll printed (if mailing)"],
        ["published", "Ready for gallery"],
      ];
    }
    if (kind === "photo") {
      return [
        ["paid", "Payment matched ($3 digital or +$3 on a print)"],
        ["photo", "Gallery photo confirmed"],
        ["listed", "Listed in Named by You under their name"],
        ["on-print", "Name on the print (only if they ordered a print)"],
        ["published", "Ready for gallery"],
      ];
    }
    return [
      ["paid", "Payment matched"],
      ["teeth", "Three real teeth selected"],
      ["names", "Names locked + registry numbers"],
      ["photos", "Each tooth photographed with its name"],
      ["printed", "Mini-scroll printed"],
      ["packed", "Bottle corked (teeth + rolled scroll) in padded mailer"],
      ["shipped", "Shipped"],
      ["published", "Ready for gallery"],
    ];
  }

  function renderStats() {
    var el = $("studio-stats");
    if (!el) return;
    var open = state.orders.filter(function (o) {
      return o.status !== "sent" && o.status !== "published";
    }).length;
    var teeth = 0;
    var published = 0;
    state.orders.forEach(function (o) {
      if (o.kind === "teeth") teeth += (o.names || []).filter(Boolean).length;
      if (o.status === "published") published += 1;
    });
    el.innerHTML =
      '<div class="studio-stat"><b>' +
      state.orders.length +
      "</b><span>Orders</span></div>" +
      '<div class="studio-stat"><b>' +
      open +
      "</b><span>In progress</span></div>" +
      '<div class="studio-stat"><b>' +
      teeth +
      "</b><span>Named teeth</span></div>" +
      '<div class="studio-stat"><b>' +
      published +
      "</b><span>On gallery</span></div>";
  }

  function renderList() {
    var el = $("order-list");
    if (!el) return;
    var filter = ($("filter-status") && $("filter-status").value) || "";
    var list = state.orders.slice().sort(function (a, b) {
      return String(b.created).localeCompare(String(a.created));
    });
    if (filter) {
      list = list.filter(function (o) {
        return o.status === filter;
      });
    }
    if (!list.length) {
      el.innerHTML = '<p class="named-empty">No orders yet. Click New order when an email arrives.</p>';
      return;
    }
    el.innerHTML = list
      .map(function (o) {
        var names = (o.names || []).filter(Boolean).join(" · ") || "(no names yet)";
        return (
          '<button type="button" class="order-row' +
          (o.id === selectedId ? " is-on" : "") +
          '" data-id="' +
          escapeHtml(o.id) +
          '"><strong>' +
          escapeHtml(o.id) +
          " · " +
          escapeHtml(o.customerName || "Unnamed customer") +
          '</strong><span class="status-pill is-' +
          escapeHtml(o.status) +
          '">' +
          escapeHtml(statusLabel(o.status)) +
          "</span><span> " +
          escapeHtml(o.kind) +
          " · " +
          escapeHtml(names) +
          "</span></button>"
        );
      })
      .join("");
  }

  function field(label, name, value, type) {
    type = type || "text";
    return (
      '<div class="form-group"><label>' +
      escapeHtml(label) +
      '</label><input name="' +
      name +
      '" type="' +
      type +
      '" value="' +
      escapeHtml(value || "") +
      '" /></div>'
    );
  }

  function renderDetail() {
    var el = $("order-detail");
    if (!el) return;
    var o = findOrder(selectedId);
    if (!o) {
      el.innerHTML = '<p class="named-empty">Select an order, or add a new one from an email.</p>';
      return;
    }
    var checks = checksFor(o.kind);
    var checkHtml = checks
      .map(function (c) {
        return (
          '<label><input type="checkbox" data-check="' +
          c[0] +
          '"' +
          (o.checks && o.checks[c[0]] ? " checked" : "") +
          " /> " +
          escapeHtml(c[1]) +
          "</label>"
        );
      })
      .join("");
    var statusOpts = STATUSES.map(function (s) {
      return (
        '<option value="' +
        s.id +
        '"' +
        (o.status === s.id ? " selected" : "") +
        ">" +
        s.label +
        "</option>"
      );
    }).join("");
    var designOpts = (C ? C.DESIGNS : [])
      .map(function (d) {
        return (
          '<option value="' +
          d.id +
          '"' +
          (o.designId === d.id ? " selected" : "") +
          ">" +
          d.label +
          "</option>"
        );
      })
      .join("");
    el.innerHTML =
      "<h2>" +
      escapeHtml(o.id) +
      "</h2>" +
      '<p class="form-intro">Created ' +
      escapeHtml((o.created || "").slice(0, 10)) +
      (o.registryIds && o.registryIds.length
        ? " · " + escapeHtml(o.registryIds.join(" · "))
        : "") +
      "</p>" +
      '<div class="form-row"><div class="form-group"><label>Kind</label><select name="kind">' +
      '<option value="teeth"' +
      (o.kind === "teeth" ? " selected" : "") +
      ">Three shark teeth</option>" +
      '<option value="hibiscus"' +
      (o.kind === "hibiscus" ? " selected" : "") +
      ">Hibiscus</option>" +
      '<option value="photo"' +
      (o.kind === "photo" ? " selected" : "") +
      ">Gallery photo</option></select></div>" +
      '<div class="form-group"><label>Status</label><select name="status">' +
      statusOpts +
      "</select></div></div>" +
      field("Customer name", "customerName", o.customerName) +
      '<div class="form-row">' +
      field("Email", "email", o.email, "email") +
      field("Phone", "phone", o.phone, "tel") +
      "</div>" +
      field("Address", "address", o.address) +
      '<div class="form-row">' +
      field("City", "city", o.city) +
      field("State", "state", o.state) +
      "</div>" +
      field("ZIP", "zip", o.zip) +
      '<div class="form-row">' +
      field("Name 1", "n1", o.names[0]) +
      field("Name 2", "n2", o.names[1]) +
      field("Name 3", "n3", o.names[2]) +
      "</div>" +
      field("Hibiscus or photo title", "sourceTitle", o.sourceTitle) +
      '<div class="form-group"><label>Certificate design</label><select name="designId">' +
      designOpts +
      "</select></div>" +
      field("Named photo filename (in images/named/)", "photoFile", o.photoFile) +
      field("Tracking / send note", "tracking", o.tracking) +
      field("Payment note", "paymentNote", o.paymentNote) +
      '<div class="form-group"><label>Notes</label><textarea name="notes">' +
      escapeHtml(o.notes || "") +
      "</textarea></div>" +
      '<div class="form-group"><label><input type="checkbox" name="showFirstName"' +
      (o.showFirstName ? " checked" : "") +
      " /> Show first name on gallery</label></div>" +
      "<h3>Fulfillment checklist</h3>" +
      '<div class="check-list">' +
      checkHtml +
      "</div>" +
      '<div class="studio-toolbar">' +
      '<button class="btn btn-primary" type="button" data-act="save">Save</button>' +
      '<button class="btn btn-outline" type="button" data-act="lock">Lock names / assign IDs</button>' +
      '<button class="btn btn-outline" type="button" data-act="print">Print mini-scroll</button>' +
      '<button class="btn btn-outline" type="button" data-act="publish">Mark published</button>' +
      '<button class="btn btn-outline" type="button" data-act="delete">Delete</button>' +
      "</div>";
  }

  function readDetailInto(o) {
    var root = $("order-detail");
    if (!root) return;
    function val(name) {
      var el = root.querySelector('[name="' + name + '"]');
      return el ? el.value : "";
    }
    o.kind = val("kind") || o.kind;
    o.status = val("status") || o.status;
    o.customerName = val("customerName");
    o.email = val("email");
    o.phone = val("phone");
    o.address = val("address");
    o.city = val("city");
    o.state = val("state");
    o.zip = val("zip");
    o.names = [val("n1"), val("n2"), val("n3")];
    o.sourceTitle = val("sourceTitle");
    o.designId = val("designId") || o.designId;
    o.photoFile = val("photoFile");
    o.tracking = val("tracking");
    o.paymentNote = val("paymentNote");
    o.notes = val("notes");
    var show = root.querySelector('[name="showFirstName"]');
    o.showFirstName = !!(show && show.checked);
    o.checks = o.checks || {};
    root.querySelectorAll("[data-check]").forEach(function (box) {
      o.checks[box.getAttribute("data-check")] = !!box.checked;
    });
  }

  function lockNames(o) {
    var needed = o.kind === "teeth" ? 3 : 1;
    var names = (o.names || []).map(function (n) {
      return String(n || "").trim();
    });
    if (names.filter(Boolean).length < needed) {
      window.alert("Enter " + needed + " name" + (needed > 1 ? "s" : "") + " first.");
      return;
    }
    if (!o.registryIds || o.registryIds.length < needed) {
      o.registryIds = nextIds(o.kind, needed);
    }
    o.status = "names-locked";
    o.checks = o.checks || {};
    o.checks.names = true;
  }

  function orderCertData(o) {
    var first = String(o.customerName || "").trim().split(/\s+/)[0];
    return {
      kind: o.kind,
      names: o.names,
      designId: o.designId,
      sourceTitle: o.sourceTitle,
      date: (o.created || "").slice(0, 10),
      namedBy: o.showFirstName ? first : "",
      registryIds: o.registryIds || [],
    };
  }

  function publishedItems() {
    var out = [];
    state.orders.forEach(function (o) {
      if (o.status !== "published") return;
      var names = (o.names || []).filter(Boolean);
      var first = String(o.customerName || "").trim().split(/\s+/)[0];
      names.forEach(function (name, i) {
        var kind = o.kind === "teeth" ? "tooth" : o.kind;
        out.push({
          kind: kind,
          name: name,
          registryId: (o.registryIds && o.registryIds[i]) || "",
          namedBy: o.showFirstName ? first : "",
          date: (o.created || "").slice(0, 10),
          photo: o.photoFile || "",
          sourceTitle: o.sourceTitle || "",
        });
      });
    });
    return out;
  }

  function renderRegistry() {
    var body = $("registry-body");
    if (!body) return;
    var q = (($("registry-search") && $("registry-search").value) || "").toLowerCase();
    var rows = [];
    state.orders.forEach(function (o) {
      (o.names || []).forEach(function (name, i) {
        if (!String(name || "").trim()) return;
        var id = (o.registryIds && o.registryIds[i]) || "(pending)";
        var line = [id, name, o.kind, o.sourceTitle, o.customerName, o.status].join(" ").toLowerCase();
        if (q && line.indexOf(q) === -1) return;
        rows.push(
          "<tr><td>" +
            escapeHtml(id) +
            "</td><td>" +
            escapeHtml(name) +
            "</td><td>" +
            escapeHtml(o.kind) +
            "</td><td>" +
            escapeHtml(o.sourceTitle || "") +
            "</td><td>" +
            escapeHtml(o.customerName || "") +
            "</td><td>" +
            escapeHtml(statusLabel(o.status)) +
            "</td><td>" +
            escapeHtml((o.created || "").slice(0, 10)) +
            "</td></tr>"
        );
      });
    });
    body.innerHTML = rows.join("") || '<tr><td colspan="7">Nothing in the registry yet.</td></tr>';
  }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 500);
  }

  function refresh() {
    save(state);
    renderStats();
    renderList();
    renderDetail();
    renderRegistry();
    fillPrintOrders();
  }

  function fillPrintOrders() {
    var sel = $("print-order");
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML =
      '<option value="">Type names instead…</option>' +
      state.orders
        .map(function (o) {
          return (
            '<option value="' +
            escapeHtml(o.id) +
            '">' +
            escapeHtml(o.id + " · " + (o.customerName || "no name") + " · " + (o.names || []).filter(Boolean).join(", ")) +
            "</option>"
          );
        })
        .join("");
    if (current) sel.value = current;
  }

  function printDataFromForm() {
    var orderId = $("print-order") && $("print-order").value;
    if (orderId) {
      var o = findOrder(orderId);
      if (o) return orderCertData(o);
    }
    var kind = $("print-kind") && $("print-kind").value;
    var names = [
      $("print-n1") && $("print-n1").value,
      $("print-n2") && $("print-n2").value,
      $("print-n3") && $("print-n3").value,
    ];
    if (kind !== "teeth") names = [names[0]];
    var ids = (($("print-ids") && $("print-ids").value) || "")
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    return {
      kind: kind || "teeth",
      names: names,
      designId: ($("print-design") && $("print-design").value) || printDesign,
      sourceTitle: $("print-source") && $("print-source").value,
      date: $("print-date") && $("print-date").value,
      namedBy: $("print-by") && $("print-by").value,
      registryIds: ids,
    };
  }

  function updatePrintPreview() {
    if (C && $("print-live")) C.mount($("print-live"), printDataFromForm());
    var kind = $("print-kind") && $("print-kind").value;
    var triple = kind === "teeth";
    if ($("print-n2-wrap")) $("print-n2-wrap").hidden = !triple;
    if ($("print-n3-wrap")) $("print-n3-wrap").hidden = !triple;
  }

  function renderPrintDesigns() {
    var grid = $("print-designs");
    if (!grid || !C) return;
    var sample = {
      kind: "teeth",
      names: ["Poseidon", "Luffy", "Llamrei"],
      date: new Date().toISOString().slice(0, 10),
      registryIds: ["FNP-T-0001"],
    };
    grid.innerHTML = C.DESIGNS.map(function (d) {
      sample.designId = d.id;
      return (
        '<button type="button" class="design-pick" data-id="' +
        d.id +
        '"><div class="design-thumb">' +
        C.render(sample) +
        "</div><strong>" +
        escapeHtml(d.label) +
        "</strong></button>"
      );
    }).join("");
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".design-pick");
      if (!btn) return;
      printDesign = btn.getAttribute("data-id");
      if ($("print-design")) $("print-design").value = printDesign;
      grid.querySelectorAll(".design-pick").forEach(function (el) {
        el.classList.toggle("is-selected", el === btn);
      });
      updatePrintPreview();
    });
    var first = grid.querySelector('[data-id="shell-ivory"]');
    if (first) first.classList.add("is-selected");
  }

  // Tabs
  document.querySelectorAll(".studio-tabs button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.getAttribute("data-tab");
      document.querySelectorAll(".studio-tabs button").forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
      });
      document.querySelectorAll(".studio-panel").forEach(function (p) {
        p.hidden = p.getAttribute("data-panel") !== tab;
      });
    });
  });

  var filter = $("filter-status");
  if (filter) {
    filter.innerHTML =
      '<option value="">All statuses</option>' +
      STATUSES.map(function (s) {
        return '<option value="' + s.id + '">' + s.label + "</option>";
      }).join("");
    filter.addEventListener("change", renderList);
  }

  if ($("order-list")) {
    $("order-list").addEventListener("click", function (e) {
      var row = e.target.closest(".order-row");
      if (!row) return;
      selectedId = row.getAttribute("data-id");
      renderList();
      renderDetail();
    });
  }

  if ($("order-detail")) {
    $("order-detail").addEventListener("click", function (e) {
      var act = e.target.getAttribute("data-act");
      if (!act) return;
      var o = findOrder(selectedId);
      if (!o) return;
      readDetailInto(o);
      if (act === "save") {
        refresh();
      } else if (act === "lock") {
        lockNames(o);
        refresh();
      } else if (act === "print") {
        if (C) C.print(orderCertData(o), "avery");
        o.status = o.status === "new" || o.status === "names-locked" || o.status === "photographed" ? "printed" : o.status;
        o.checks = o.checks || {};
        o.checks.printed = true;
        refresh();
      } else if (act === "publish") {
        if (!o.registryIds || !o.registryIds.length) lockNames(o);
        o.status = "published";
        o.checks = o.checks || {};
        o.checks.published = true;
        refresh();
        window.alert(
          "Marked published. Open Registry and download named-registry.js, then replace js/named-registry.js on the website."
        );
      } else if (act === "delete") {
        if (!window.confirm("Delete this order?")) return;
        state.orders = state.orders.filter(function (x) {
          return x.id !== o.id;
        });
        selectedId = "";
        refresh();
      }
    });
  }

  if ($("btn-new-order")) {
    $("btn-new-order").addEventListener("click", function () {
      var o = blankOrder();
      state.orders.push(o);
      selectedId = o.id;
      refresh();
    });
  }

  if ($("btn-export")) {
    $("btn-export").addEventListener("click", function () {
      download(
        "fnp-naming-studio-backup.json",
        JSON.stringify(state, null, 2),
        "application/json"
      );
    });
  }

  if ($("import-file")) {
    $("import-file").addEventListener("change", function () {
      var file = $("import-file").files && $("import-file").files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data || !Array.isArray(data.orders)) throw new Error("bad file");
          state = data;
          selectedId = "";
          refresh();
        } catch (err) {
          window.alert("That file could not be read.");
        }
      };
      reader.readAsText(file);
    });
  }

  if ($("btn-export-registry")) {
    $("btn-export-registry").addEventListener("click", function () {
      var js =
        "/**\n * Published “Named by You” gallery.\n * Generated from studio.html\n */\nwindow.NAMED_REGISTRY = " +
        JSON.stringify(publishedItems(), null, 2) +
        ";\n";
      download("named-registry.js", js, "text/javascript");
    });
  }

  if ($("registry-search")) {
    $("registry-search").addEventListener("input", renderRegistry);
  }

  ["print-order", "print-kind", "print-n1", "print-n2", "print-n3", "print-source", "print-ids", "print-by", "print-date"].forEach(
    function (id) {
      if ($(id)) {
        $(id).addEventListener("input", updatePrintPreview);
        $(id).addEventListener("change", function () {
          if (id === "print-order" && $("print-order").value) {
            var o = findOrder($("print-order").value);
            if (o) {
              $("print-kind").value = o.kind;
              $("print-n1").value = o.names[0] || "";
              $("print-n2").value = o.names[1] || "";
              $("print-n3").value = o.names[2] || "";
              $("print-source").value = o.sourceTitle || "";
              $("print-ids").value = (o.registryIds || []).join(", ");
              var first = String(o.customerName || "").trim().split(/\s+/)[0];
              $("print-by").value = o.showFirstName ? first : "";
              $("print-date").value = (o.created || "").slice(0, 10);
              $("print-design").value = o.designId || "shell-ivory";
              printDesign = o.designId || "shell-ivory";
              document.querySelectorAll("#print-designs .design-pick").forEach(function (el) {
                el.classList.toggle("is-selected", el.getAttribute("data-id") === printDesign);
              });
            }
          }
          updatePrintPreview();
        });
      }
    }
  );

  if ($("print-date") && !$("print-date").value) {
    $("print-date").value = new Date().toISOString().slice(0, 10);
  }

  if ($("btn-print-avery")) {
    $("btn-print-avery").addEventListener("click", function () {
      if (C) C.print(printDataFromForm(), "avery");
    });
  }
  if ($("btn-print-4x6")) {
    $("btn-print-4x6").addEventListener("click", function () {
      if (C) C.print(printDataFromForm(), "card");
    });
  }
  if ($("btn-print-letter")) {
    $("btn-print-letter").addEventListener("click", function () {
      if (C) C.print(printDataFromForm(), "letter");
    });
  }

  renderPrintDesigns();
  refresh();
  updatePrintPreview();
})();
