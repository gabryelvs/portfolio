"""Renders cv-data.json (+ cv-contact.json) to portfolio/public/cv.pdf.

Content lives in cv-data.json and nowhere else — build_cv.js renders the same
file to Gabryel_Verissimo_CV.docx. Two builders exist because docx and PDF need
different libraries, not because the content differs. Edit the JSON.

This file previously carried its own copy of the content and drifted: the
published PDF sat three projects behind the .docx for two months.
"""

import html
import json
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, ListFlowable, ListItem, HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

ROOT = Path(__file__).resolve().parent
CV = json.loads((ROOT / "cv-data.json").read_text(encoding="utf-8"))

# Contact details (address, phone) live in a gitignored file so this public repo
# carries the CV's content without the scrapeable personal identifiers.
CONTACT = ROOT / "cv-contact.json"
if not CONTACT.exists():
    raise SystemExit("Missing cv-contact.json — copy cv-contact.example.json and fill it in.")
CV.update(json.loads(CONTACT.read_text(encoding="utf-8")))

OUT = ROOT.parent / "public" / "cv.pdf"

NAVY = HexColor("#1F3864")
ACCENT = HexColor("#2E75B6")
GREY = HexColor("#595959")

styles = getSampleStyleSheet()
S = {
    "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=22, textColor=NAVY,
                           alignment=1, spaceAfter=2, leading=24),
    "title": ParagraphStyle("title", fontName="Helvetica", fontSize=11, textColor=ACCENT,
                            alignment=1, spaceAfter=4),
    "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=9, textColor=GREY,
                              alignment=1, spaceAfter=2),
    "links": ParagraphStyle("links", fontName="Helvetica", fontSize=9, textColor=ACCENT,
                            alignment=1, spaceAfter=6),
    "h": ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=11, textColor=NAVY,
                        spaceBefore=10, spaceAfter=4),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.5, leading=13,
                           alignment=TA_JUSTIFY, spaceAfter=3),
    "ptitle": ParagraphStyle("ptitle", fontName="Helvetica-Bold", fontSize=10, textColor=NAVY,
                             spaceBefore=6, spaceAfter=1),
    "meta": ParagraphStyle("meta", fontName="Helvetica-Oblique", fontSize=8.5, textColor=GREY,
                           spaceAfter=2),
    "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=9.5, leading=12.5),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=9, textColor=GREY),
}

SEP = " &nbsp;|&nbsp; "


def esc(text):
    """reportlab parses its own mini-markup, so & and < from the JSON must be escaped."""
    return html.escape(text, quote=False)


def rule():
    return HRFlowable(width="100%", thickness=0.8, color=ACCENT, spaceBefore=1, spaceAfter=4)


def bullets(items):
    """Items must already be escaped/marked up — callers own that, because some
    bullets legitimately carry <b> markup and escaping here would print the tags."""
    return ListFlowable(
        [ListItem(Paragraph(t, S["bullet"]), leftIndent=10, value="•") for t in items],
        bulletType="bullet", start="•", leftIndent=8, spaceAfter=2,
    )


def anchor(label, url):
    return f'<a href="{url}">{esc(label)}</a>'


story = []

# ---- header ----
story.append(Paragraph(esc(CV["name"]), S["name"]))
story.append(Paragraph(esc(CV["headline"].replace("  ·  ", " · ")), S["title"]))
story.append(Paragraph(esc(CV["contact"].replace("  ·  ", " · ")), S["contact"]))
story.append(Paragraph(SEP.join(anchor(l["label"], l["url"]) for l in CV["links"]), S["links"]))
story.append(rule())

# ---- profile ----
story.append(Paragraph("PROFILE", S["h"]))
story.append(Paragraph(esc(CV["profile"]), S["body"]))

# ---- skills ----
story.append(Paragraph("TECHNICAL SKILLS", S["h"]))
for skill in CV["skills"]:
    story.append(Paragraph(f"<b>{esc(skill['label'])}:</b> {esc(skill['value'])}", S["body"]))

# ---- projects ----
story.append(Paragraph("PROJECTS", S["h"]))
for project in CV["projects"]:
    meta = [esc(project["tech"]), anchor(project["github"]["label"], project["github"]["url"])]
    if project["live"]:
        meta.append(anchor("live demo", project["live"]["url"]))
    story.append(Paragraph(esc(project["name"]), S["ptitle"]))
    story.append(Paragraph(SEP.join(meta), S["meta"]))
    story.append(bullets([esc(b) for b in project["bullets"]]))

# ---- academic ----
story.append(Paragraph(f"<i>{esc(CV['academic']['heading'])}</i>", S["small"]))
story.append(bullets([
    f"<b>{esc(item['name'])}</b> ({esc(item['tech'])}) — {esc(item['bullets'][0])}"
    for item in CV["academic"]["items"]
] + [esc(CV["academic"]["closing"])]))

# ---- experience ----
story.append(Paragraph("WORK EXPERIENCE", S["h"]))
for job in CV["experience"]:
    story.append(Paragraph(
        f"<b>{esc(job['role'])}</b>, {esc(job['org'])} — {esc(job['period'])}", S["ptitle"]))
    story.append(bullets([esc(b) for b in job["bullets"]]))

# ---- education ----
story.append(Paragraph("EDUCATION", S["h"]))
primary = [e for e in CV["education"] if e.get("primary")]
rest = [e for e in CV["education"] if not e.get("primary")]
for e in primary:
    story.append(Paragraph(
        f"<b>{esc(e['institution'])}</b> ({esc(e['period'])}): {esc(e['detail'])}", S["body"]))
if rest:
    story.append(Paragraph(
        " ".join(f"{esc(e['institution'])} ({esc(e['period'])}): {esc(e['detail'])}." for e in rest),
        S["small"]))

# ---- languages ----
story.append(Paragraph("LANGUAGES", S["h"]))
story.append(Paragraph(
    " &nbsp;&nbsp; ".join(f"<b>{esc(l['name'])}:</b> {esc(l['level'])}" for l in CV["languages"]),
    S["body"]))

doc = SimpleDocTemplate(
    str(OUT), pagesize=A4,
    topMargin=14 * mm, bottomMargin=14 * mm, leftMargin=16 * mm, rightMargin=16 * mm,
    title="Gabryel Verissimo - CV", author="Gabryel Verissimo",
)
doc.build(story)
print(f"{OUT} written")
