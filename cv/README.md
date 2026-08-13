# CV source

`cv-data.json` is the single source of truth for the CV. Two builders render it:

| Command | Output |
| --- | --- |
| `node build_cv.js` | `../../Gabryel_Verissimo_CV.docx` (the copy sent to employers) |
| `python build_cv_pdf.py` | `../public/cv.pdf` (what the site's "Download CV" button serves) |

Two builders exist because docx and PDF need different libraries (`docx` on npm,
`reportlab` on PyPI) — **not** because the content differs. Edit `cv-data.json`
and run both. They previously each held their own copy of the content and
drifted: the published PDF sat three projects behind the .docx for two months.

## Contact details

Address and phone number live in `cv-contact.json`, which is gitignored — this
repo is public, and a JSON file is far easier to scrape than the rendered PDF.
Both builders fail with a clear message if it is missing.

```bash
cp cv-contact.example.json cv-contact.json   # then fill in the real values
```

## Requirements

- `reportlab` (`pip install reportlab`)
- the `docx` npm package, currently resolved from `D:\Project\node_modules` by
  Node walking up the directory tree. A fresh clone elsewhere needs
  `npm install docx` first.

## A caveat worth remembering

Keeping both documents in step is now automatic. Keeping them *true* is not —
test counts, coverage figures and Lighthouse scores in `cv-data.json` are
hand-written and go stale as the projects change.
