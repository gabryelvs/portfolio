// Renders cv-data.json (+ cv-contact.json) to ../../Gabryel_Verissimo_CV.docx.
//
// Content lives in cv-data.json and nowhere else — build_cv_pdf.py renders the
// same file to portfolio/public/cv.pdf. Two builders exist because docx and PDF
// need different libraries, not because the content differs. Edit the JSON.

// --- Reproducible output ---------------------------------------------------
// This script regenerates a checked-in artefact, so two builds of unchanged
// input must produce a byte-identical file. Otherwise every rebuild shows as a
// diff and a real content change is lost in the noise.
//
// Two sources of per-run variance have to be pinned before docx is loaded:
//   * Relationship IDs — docx mints them with nanoid, whose non-secure build
//     draws from Math.random().
//   * docProps/core.xml timestamps and zip entry mtimes — plain new Date().
//
// Patching the globals is safe here: this is a one-shot generator that exits
// as soon as the file is written, so the patch cannot reach anything else.
const BUILD_EPOCH = Date.UTC(2024, 0, 1);

let seed = 0x9e3779b9;
Math.random = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const RealDate = Date;
global.Date = class extends RealDate {
  constructor(...args) {
    super(...(args.length ? args : [BUILD_EPOCH]));
  }
  static now() {
    return BUILD_EPOCH;
  }
};

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat,
  ExternalHyperlink, BorderStyle, TabStopType, TabStopPosition,
} = require("docx");

// Contact details (address, phone) live in a gitignored file so this public
// repo carries the CV's content without the scrapeable personal identifiers.
// Copy cv-contact.example.json to cv-contact.json to build.
const cv = JSON.parse(fs.readFileSync(`${__dirname}/cv-data.json`, "utf8"));
const contactPath = `${__dirname}/cv-contact.json`;
if (!fs.existsSync(contactPath)) {
  console.error("Missing cv-contact.json — copy cv-contact.example.json and fill it in.");
  process.exit(1);
}
Object.assign(cv, JSON.parse(fs.readFileSync(contactPath, "utf8")));

const NAVY = "1F3864";
const ACCENT = "2E75B6";
const GREY = "595959";

// ---- helpers ----
const ruleBorder = {
  bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 },
};

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    border: ruleBorder,
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, color: NAVY })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 20 })],
  });
}

function projectTitle(name, meta) {
  const kids = [new TextRun({ text: name, bold: true, size: 21, color: NAVY })];
  if (meta) kids.push(new TextRun({ text: "  —  " + meta, italics: true, size: 19, color: GREY }));
  return new Paragraph({ spacing: { before: 120, after: 20 }, children: kids });
}

function link(label, url) {
  return new ExternalHyperlink({
    link: url,
    children: [new TextRun({ text: label, style: "Hyperlink", size: 20 })],
  });
}

/** The "GitHub: … Live demo: …" line under a project title. */
function linkLine(project) {
  const kids = [
    new TextRun({ text: "GitHub: ", bold: true, size: 19, color: GREY }),
    link(project.github.label, project.github.url),
  ];
  if (project.live) {
    kids.push(new TextRun({ text: "    Live demo: ", bold: true, size: 19, color: GREY }));
    kids.push(link(project.live.label, project.live.url));
  }
  return new Paragraph({ spacing: { after: 20 }, children: kids });
}

/** Right-aligned date against a bold left-hand label, e.g. a job or a school. */
function datedLine(runs, period) {
  return new Paragraph({
    spacing: { before: 60, after: 4 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [...runs, new TextRun({ text: `\t${period}`, size: 19, color: GREY })],
  });
}

function labelledLine(label, value) {
  return new Paragraph({ spacing: { after: 20 }, children: [
    new TextRun({ text: `${label}: `, bold: true, size: 20 }),
    new TextRun({ text: value, size: 20 }),
  ]});
}

// ---- content ----
const headerLinks = [];
cv.links.forEach((l, i) => {
  if (i > 0) headerLinks.push(new TextRun({ text: "    ", size: 19 }));
  headerLinks.push(link(l.label, l.url));
});

const projectBlocks = cv.projects.flatMap((p) => [
  projectTitle(p.name, p.tech),
  linkLine(p),
  ...p.bullets.map(bullet),
]);

const academicBlocks = cv.academic ? [
  new Paragraph({ spacing: { before: 140, after: 30 }, children: [
    new TextRun({ text: cv.academic.heading, italics: true, size: 19, color: GREY }),
  ]}),
  ...cv.academic.items.flatMap((a) => [projectTitle(a.name, a.tech), ...a.bullets.map(bullet)]),
  bullet(cv.academic.closing),
] : [];

const experienceBlocks = cv.experience.flatMap((job) => [
  datedLine(
    [
      new TextRun({ text: job.role, bold: true, size: 21 }),
      new TextRun({ text: `, ${job.org}`, size: 21 }),
    ],
    job.period,
  ),
  ...job.bullets.map(bullet),
]);

const educationBlocks = cv.education.flatMap((e) => [
  datedLine([new TextRun({ text: e.institution, bold: true, size: e.primary ? 21 : 20 })], e.period),
  new Paragraph({ spacing: { after: 30 }, children: [
    new TextRun({ text: e.detail, size: 19, color: GREY }),
  ]}),
]);

const languageRuns = cv.languages.flatMap((l, i) => [
  new TextRun({ text: `${i > 0 ? "      " : ""}${l.name}: `, bold: true, size: 20 }),
  new TextRun({ text: l.level, size: 20 }),
]);

// ---- document ----
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: NAVY },
        paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 0 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 200 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4 (UK)
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }, // 0.75"
      },
    },
    children: [
      // ===== HEADER =====
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 20 },
        children: [new TextRun({ text: cv.name, bold: true, size: 40, color: NAVY })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [new TextRun({ text: cv.headline, size: 22, color: ACCENT })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 40 },
        children: [new TextRun({ text: cv.contact, size: 19, color: GREY })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 40 },
        border: ruleBorder,
        children: headerLinks,
      }),

      // ===== PROFILE =====
      sectionHeading("Profile"),
      new Paragraph({
        spacing: { after: 40 }, alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: cv.profile, size: 20 })],
      }),

      // ===== TECHNICAL SKILLS =====
      sectionHeading("Technical Skills"),
      ...cv.skills.map((s) => labelledLine(s.label, s.value)),

      // ===== PROJECTS =====
      sectionHeading("Projects"),
      ...projectBlocks,
      ...academicBlocks,

      // ===== WORK EXPERIENCE =====
      sectionHeading("Work Experience"),
      ...experienceBlocks,

      // ===== EDUCATION =====
      sectionHeading("Education"),
      ...educationBlocks,

      // ===== LANGUAGES =====
      sectionHeading("Languages"),
      new Paragraph({ children: languageRuns }),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(`${__dirname}/../../Gabryel_Verissimo_CV.docx`, buffer);
  console.log("Gabryel_Verissimo_CV.docx written");
});
