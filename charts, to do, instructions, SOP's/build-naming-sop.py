#!/usr/bin/env python3
"""Build the locked naming SOP PDF for Florida Nature Prints."""
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = (
    "/Users/maricooks/florida-nature-prints/"
    "charts, to do, instructions, SOP's/"
    "Naming-SOP-what-works.pdf"
)

BLUE = colors.HexColor("#1a435c")
GREEN = colors.HexColor("#3d7a56")
SAND = colors.HexColor("#f7f4ef")
CREAM = colors.HexColor("#faf9f6")
LINE = colors.HexColor("#d4e4dc")
SOFT = colors.HexColor("#4a6270")
WARN = colors.HexColor("#7a2e22")
WARN_BG = colors.HexColor("#f8ecec")


def styles():
    base = getSampleStyleSheet()
    s = {
        "title": ParagraphStyle(
            "T",
            parent=base["Title"],
            fontName="Times-Bold",
            fontSize=22,
            leading=26,
            textColor=BLUE,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "sub": ParagraphStyle(
            "S",
            parent=base["Normal"],
            fontName="Times-Italic",
            fontSize=11,
            leading=14,
            textColor=GREEN,
            alignment=TA_CENTER,
            spaceAfter=16,
        ),
        "h": ParagraphStyle(
            "H",
            parent=base["Heading1"],
            fontName="Times-Bold",
            fontSize=14,
            leading=18,
            textColor=BLUE,
            spaceBefore=12,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Times-Bold",
            fontSize=12,
            leading=15,
            textColor=GREEN,
            spaceBefore=8,
            spaceAfter=6,
        ),
        "b": ParagraphStyle(
            "B",
            parent=base["BodyText"],
            fontName="Times-Roman",
            fontSize=10,
            leading=14,
            textColor=BLUE,
            spaceAfter=6,
        ),
        "cell": ParagraphStyle(
            "C",
            parent=base["BodyText"],
            fontName="Times-Roman",
            fontSize=9,
            leading=12,
            textColor=BLUE,
        ),
        "cellb": ParagraphStyle(
            "CB",
            parent=base["BodyText"],
            fontName="Times-Bold",
            fontSize=9,
            leading=12,
            textColor=BLUE,
        ),
        "small": ParagraphStyle(
            "SM",
            parent=base["Normal"],
            fontName="Times-Italic",
            fontSize=8,
            leading=11,
            textColor=SOFT,
            alignment=TA_CENTER,
        ),
        "warn": ParagraphStyle(
            "W",
            parent=base["BodyText"],
            fontName="Times-Bold",
            fontSize=10,
            leading=13,
            textColor=WARN,
        ),
        "foot": ParagraphStyle(
            "F",
            parent=base["Normal"],
            fontName="Times-Roman",
            fontSize=8,
            textColor=SOFT,
            alignment=TA_CENTER,
        ),
    }
    return s


def P(text, st):
    return Paragraph(text, st)


def table(rows, widths, header=True):
    t = Table(rows, colWidths=widths, repeatRows=1 if header else 0)
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("BACKGROUND", (0, 1), (-1, -1), CREAM),
    ]
    if header:
        cmds.append(("BACKGROUND", (0, 0), (-1, 0), SAND))
    t.setStyle(TableStyle(cmds))
    return t


def bullets(items, st):
    return ListFlowable(
        [ListItem(P(i, st), leftIndent=8, bulletColor=GREEN) for i in items],
        bulletType="bullet",
        start="•",
        leftIndent=14,
        bulletFontName="Times-Bold",
        bulletFontSize=10,
    )


def numbered(items, st):
    return ListFlowable(
        [ListItem(P(i, st), leftIndent=8, bulletColor=BLUE) for i in items],
        bulletType="1",
        leftIndent=18,
        bulletFontName="Times-Bold",
        bulletFontSize=10,
    )


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(SOFT)
    canvas.setFont("Times-Italic", 8)
    canvas.drawString(0.75 * inch, 0.45 * inch, "Florida Nature Prints — internal SOP  ·  not for the public site")
    canvas.drawRightString(letter[0] - 0.75 * inch, 0.45 * inch, "Page %d" % doc.page)
    canvas.setStrokeColor(LINE)
    canvas.line(0.75 * inch, 0.62 * inch, letter[0] - 0.75 * inch, 0.62 * inch)
    canvas.restoreState()


def build():
    s = styles()
    c, cb = s["cell"], s["cellb"]
    story = []

    story += [
        P("Florida Nature Prints", s["title"]),
        P("Naming — what works, and exactly what to order", s["sub"]),
        P(
            "Locked specs for the Name a piece of Florida products. "
            "Keep this next to the printer. Public page: floridanatureprints.com/name.html  ·  "
            "Studio (private): floridanatureprints.com/studio.html",
            s["b"],
        ),
        P("1. The locked kit", s["h"]),
        P(
            "One paper size. One bottle. One ribbon. Every certificate design uses this. "
            "Do not mix in 4×6 photo paper or short squat jars.",
            s["b"],
        ),
    ]

    kit = [
        [P("<b>What</b>", cb), P("<b>Exact spec</b>", cb), P("<b>Where / how</b>", cb)],
        [
            P("<b>Certificate</b>", cb),
            P('2″ × 3.5″ portrait mini-scroll<br/>(US business-card size). Roll the 3.5″ side so the scroll is <b>2″ tall</b>.', c),
            P("Avery <b>8371</b> inkjet or <b>5371</b> laser. 10 tear-apart cards per letter sheet. Amazon, Office Depot, Walmart.", c),
        ],
        [
            P("<b>Bottle</b>", cb),
            P('50 ml glass with cork, about <b>4–5″ tall</b> and <b>1.4″ wide</b>. Holds three teeth + rolled card + bow.', c),
            P('Amazon search: <b>“50ml glass bottles with cork 4 inch”</b> (tall wedding-favor / apothecary style).', c),
        ],
        [
            P("<b>Ribbon</b>", cb),
            P("1/8 inch (3 mm) wide, 8-10 inches per bow. Kraft, sage, or blush.", c),
            P("Any thin satin or cotton twill. One spool lasts many orders.", c),
        ],
        [
            P("<b>Mailer</b>", cb),
            P("Small padded mailer. Flat fee $6 (packaging $2 + postage ~$4).", c),
            P("USPS. Cork the bottle first so nothing rattles loose.", c),
        ],
        [
            P("<b>Print</b>", cb),
            P("Studio → Print Avery 8371 sheet (10 cards). Load Avery sheet, 100% scale, letter, no fit-to-page.", c),
            P("floridanatureprints.com/studio.html → Certificate printer", c),
        ],
    ]
    story.append(table(kit, [1.15 * inch, 2.7 * inch, 2.9 * inch]))
    story.append(Spacer(1, 10))

    warn_row = [[P(
        "DO NOT BUY: short squat “50 ml” jars about 2″ tall (some listings say 50 ml but measure ~2.1″ high). "
        "A 2″ scroll plus a bow will not fit. Also skip 4×6 photo paper — the certificate is not that size.",
        s["warn"],
    )]]
    wt = Table(warn_row, colWidths=[6.75 * inch])
    wt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WARN_BG),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("BOX", (0, 0), (-1, -1), 0.8, WARN),
    ]))
    story.append(wt)

    story += [
        P("2. Products and prices", s["h"]),
    ]
    prods = [
        [P("<b>Offer</b>", cb), P("<b>Price</b>", cb), P("<b>Customer gets</b>", cb), P("<b>You ship</b>", cb)],
        [
            P("<b>Name 3 Shark Teeth</b>", cb),
            P("$8 + $6 shipping<br/>= <b>$14</b>", c),
            P("Three real SW Florida teeth, photographed with their names, mini-scroll of all three names, listed in Named by You.", c),
            P("Tall 50 ml cork bottle: 3 teeth + 2×3.5 card rolled with a bow. Padded mailer.", c),
        ],
        [
            P("<b>Name a Hibiscus</b>", cb),
            P("$4<br/>optional mail +$2", c),
            P("Named image by email. Joins the named hibiscus gallery.", c),
            P("Email the named photo. Print/mail the mini-scroll only if they paid +$2.", c),
        ],
        [
            P("<b>Name a Gallery Photo</b>", cb),
            P("$3<br/>optional mail +$2", c),
            P("Personalized version of a gallery photo by email. Named by You section.", c),
            P("Same as hibiscus.", c),
        ],
    ]
    story.append(table(prods, [1.5 * inch, 1.2 * inch, 2.15 * inch, 1.9 * inch]))
    story.append(P("Ten certificate designs (customer picks one; all the same 2×3.5 size): Gulf Dusk, Marsh Sage, Shell Ivory, Hibiscus Blush, Storm Indigo, Sand Linen, Palm Grove, Coral Dawn, Moon Gulf, Sunrise Peach. Default if they skip: Shell Ivory.", s["b"]))

    story.append(PageBreak())
    story += [
        P("3. SOP — Name 3 shark teeth", s["h"]),
        P("Do these in order. Check them off on the studio order.", s["b"]),
        numbered([
            "<b>Order email arrives.</b> Open floridanatureprints.com/studio.html (bookmark it). Click <b>New order</b>. Copy customer name, email, address, the three names, and the certificate design.",
            "<b>Match payment</b> to the email. Check “Payment matched.”",
            "<b>Lock names / assign IDs.</b> Studio gives numbers like FNP-T-2026-0001, 0002, 0003. Status becomes Names locked.",
            "<b>Pick three real teeth.</b> Photograph each with its name (linen, same look as the shop trio photo). Save photos in images/named/ when you want them on the website.",
            "<b>Print.</b> Studio → Certificate printer → load the order → <b>Print Avery 8371 sheet</b>. Tear out one card. (Keep extras for reprints.)",
            "<b>Roll.</b> Roll along the <b>3.5″ side</b> so the scroll is <b>2″ tall</b>. Not the other way — a 3.5″-tall roll will not fit the bottle.",
            "<b>Bow.</b> Tie 1/8 inch ribbon, small bow. Trim tails so they do not snag the cork.",
            "<b>Bottle.</b> Three teeth first, then the scroll. Cork firmly. Use only the tall 4–5″ / 1.4″ 50 ml bottle.",
            "<b>Mail.</b> Small padded mailer, USPS, $6 already collected. Add tracking on the studio order. Status: Sent.",
            "<b>Publish.</b> Mark published. Registry → Download named-registry.js → replace js/named-registry.js → upload / push the site.",
        ], s["b"]),
        P("4. SOP — Hibiscus ($4) and gallery photo ($3)", s["h"]),
        numbered([
            "Add the order in studio. Lock the name → FNP-H-… or FNP-P-…",
            "Hibiscus: use the flower they picked (or shoot a new one). Photo: use the gallery title they chose.",
            "Add the given name onto the image, small and tasteful (Photos app text is enough).",
            "Email the named image.",
            "If they paid +$2 to mail the card: print Avery 8371, mail the mini-scroll in a first-class envelope (no bottle).",
            "Mark sent, then published. Same named-registry.js download as above.",
        ], s["b"]),
        P("5. How to print (Avery 8371)", s["h"]),
        numbered([
            "Load <b>Avery 8371</b> (inkjet) or <b>5371</b> (laser) — 10 cards, 2″ × 3.5″, letter sheet.",
            "Studio → Certificate printer → Print Avery 8371 sheet.",
            "Print dialog: paper size <b>Letter</b>, scale <b>100%</b>, do <b>not</b> “fit to page.”",
            "Cards sit 2 across × 5 down. Tear on the perforations. No scissors needed.",
            "Fallback if you are out of Avery stock: Print 8-up on letter cream cardstock, cut to 2″ × 3.5″ with a paper cutter.",
        ], s["b"]),
        P("6. Studio tracker (behind the scenes)", s["h"]),
        P("Private page — not in the public menu. Bookmark <b>floridanatureprints.com/studio.html</b>. Orders save in this browser; use <b>Download backup</b> so you do not lose them.", s["b"]),
        P(
            "Status path: New → Names locked → Photographed → Certificate printed → Packed → Sent → On gallery. "
            "IDs print on the card: <b>FNP-T-</b> (tooth), <b>FNP-H-</b> (hibiscus), <b>FNP-P-</b> (photo) + year + number "
            "(example FNP-T-2026-0001).",
            s["b"],
        ),
        P("7. Restock / to-do chart", s["h"]),
        P("Keep these on the shelf. Reorder before you run out.", s["b"]),
    ]
    todo = [
        [P("<b>Item</b>", cb), P("<b>Buy</b>", cb), P("<b>Have on hand</b>", cb), P("<b>✓</b>", cb)],
        [P("Avery 8371 (inkjet) or 5371 (laser)", c), P("Amazon / Office Depot / Walmart — 2″ × 3.5″, 10/sheet", c), P("1 pack (100–250 cards)", c), P("", c)],
        [P("50 ml tall cork bottles", c), P("Amazon: “50ml glass bottles with cork 4 inch” — 4–5″ H × ~1.4″ W", c), P("12–24 bottles", c), P("", c)],
        [P("1/8 inch ribbon", c), P("Kraft, sage, or blush. 8-10 inches per order.", c), P("1 spool", c), P("", c)],
        [P("Small padded mailers", c), P("USPS-size for a 50 ml bottle", c), P("25+", c), P("", c)],
        [P("Fossil shark teeth", c), P("Your SW Florida finds", c), P("Enough for upcoming orders (3 per naming)", c), P("", c)],
        [P("Hibiscus photos", c), P("Your shots in images/hibiscus/ — listed in js/config.js", c), P("Replace starters anytime", c), P("", c)],
    ]
    story.append(table(todo, [1.7 * inch, 2.5 * inch, 1.9 * inch, 0.65 * inch]))
    story.append(Spacer(1, 8))
    story += [
        P("Each naming order (when an email comes in)", s["h2"]),
        bullets([
            "Add in studio.html",
            "Payment matched",
            "Names locked (IDs assigned)",
            "Photographed",
            "Printed (Avery 8371)",
            "Rolled + bow + bottled (teeth only)",
            "Shipped / emailed",
            "Published → download named-registry.js → upload site",
            "Download studio backup JSON",
        ], s["b"]),
        P("8. Website files (only if something breaks)", s["h"]),
        P(
            "Daily fulfillment does not need these. After you publish, replace <b>js/named-registry.js</b> from Studio. "
            "Public shop: name.html. Tracker: studio.html. Prices and bottle spec: js/config.js (naming). "
            "Designs: js/certificates.js. Hibiscus photos: images/hibiscus/. Named photos: images/named/. "
            "This SOP: charts, to do, instructions, SOP's / Naming-SOP-what-works.pdf.",
            s["b"],
        ),
        Spacer(1, 10),
        P("Florida Nature Prints  ·  floridanatureprints.com  ·  Internal use", s["small"]),
    ]

    doc = SimpleDocTemplate(
        OUT,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.8 * inch,
        title="Naming SOP — what works",
        author="Florida Nature Prints",
        subject="Locked specs, shopping list, and fulfillment SOP",
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print("Wrote", OUT)


if __name__ == "__main__":
    build()
