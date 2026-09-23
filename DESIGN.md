---
name: Gabryel Verissimo — Portfolio
description: Evidence-first engineering portfolio; monochrome, hairline-built, dark by default.
colors:
  bg: "#08090a"
  surface-1: "#0e0f11"
  surface-2: "#141518"
  surface-3: "#1b1c20"
  line: "#202226"
  line-strong: "#2f3137"
  fg: "#f7f8f8"
  fg-2: "#b6bac1"
  muted: "#8a8f98"
  accent: "#9296fb"
  live: "#3ecf8e"
  grid: "rgba(255, 255, 255, 0.04)"
  selection: "rgba(146, 150, 251, 0.32)"
  bg-light: "#fafafa"
  surface-1-light: "#ffffff"
  surface-2-light: "#f3f3f4"
  surface-3-light: "#ececee"
  line-light: "#e8e8e8"
  line-strong-light: "#d6d6d8"
  fg-light: "#171717"
  fg-2-light: "#404047"
  muted-light: "#6b6b70"
  accent-light: "#4f46e5"
  live-light: "#15803d"
  grid-light: "rgba(0, 0, 0, 0.045)"
  selection-light: "rgba(79, 70, 229, 0.18)"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.3rem + 4.4vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.038em"
    fontFeature: "\"cv11\", \"ss01\""
    fontVariation: "opsz auto"
  page-title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.4rem + 3vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  statement:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1rem + 2vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "-0.01em"
  lede:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  prose:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"cv11\", \"ss01\""
  ui:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "\"calt\" 0"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
    fontFeature: "\"calt\" 0"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  full: "50%"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "56px"
  section: "72px"
  hero: "96px"
components:
  button-solid:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.bg}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-solid-hover:
    backgroundColor: "color-mix(in srgb, #f7f8f8 86%, #08090a)"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-line-hover:
    backgroundColor: "{colors.surface-2}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.fg-2}"
    rounded: "{rounded.sm}"
    size: "32px"
  nav-link:
    textColor: "{colors.muted}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  nav-link-active:
    textColor: "{colors.accent}"
  diagram-frame:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.md}"
    padding: "28px 28px 20px"
  code-block:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.fg-2}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "18px 20px"
  inline-code:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.fg}"
    rounded: "{rounded.xs}"
    padding: "1px 5px"
  evidence-note:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: "2px 0 2px 12px"
    width: "220px"
---

# Design System: Gabryel Verissimo — Portfolio

## Overview

**Creative North Star: "The Annotated Design Doc"**

The site reads like an engineer's design document: every project is written up with its problem, its hard parts and its proof, and the proof sits in the margin as a pinned link to the exact lines of code. The visual system is monochrome and built from hairlines instead of fills or shadows. Inter carries every sentence. JetBrains Mono appears only where a machine would write: section indices, metadata, dates, captions, code and diagram labels. The single indigo accent marks what you can act on or where you are, and nothing else.

Density is calm and document-like. The home page is one column of numbered sections separated by 1px rules. The case-study page is a three-column reading layout (outline, 680px text column, margin notes). The only decorative material is a faint 56px grid under the hero, the engineering notebook's paper, which fades out before the work begins. Motion is CSS only, short, and never gates content. Dark is the default theme and light is a first-class toggle; both themes share one set of token names.

**Key Characteristics:**
- Dark-first, with Linear-style stepped surfaces (bg, then three surface steps); light theme mirrors every token.
- Hairline construction: 1px `line` / `line-strong` rules divide sections, rows, metadata and figures.
- One accent, rationed to links, focus, current location and the interactive hot path.
- Mono for labels, metadata, code and diagrams; never for paragraphs.
- Hand-authored SVG diagrams in a fixed grammar of hairline links, small nodes and mono labels.
- Claims carry margin evidence notes that link to code at a pinned commit.

## Colors

A near-greyscale neutral ladder with one indigo accent and one green reserved for "live". Every colour is a CSS custom property in `app/styles/tokens.css`: light values on `:root`, dark on `.dark`. The frontmatter lists dark as the base keys (dark is the default) and light as `-light` siblings.

### Primary
- **Signal Indigo** (dark `accent`, light `accent-light`): the only chromatic colour a visitor can act on. It is used for text links at rest (inline prose links, the email link, metadata links, evidence-note links, More-work Repo/Live demo links, "Read the case study"), the hover colour of headline links (work titles, More-work names, previous/next case-study titles), focus rings, the current nav item and the active outline entry, the text caret, the selection tint (`selection`), and the hover/focus draw along a work thumbnail's hot path. Dark indigo is lifted for contrast on the near-black canvas (7.6:1 on `bg`); light indigo is 6.0:1 on `bg-light`.

### Tertiary
- **Live Green** (`live` / `live-light`): the 6px status dot beside "Live demo" and "Live", with a 3px halo of itself at 18%. It means "this is deployed" and nothing else.

### Neutral
- **Canvas** (`bg` / `bg-light`): page background, the nav's 92% translucent fill, and the solid button's text colour.
- **Surface 1** (`surface-1` / `surface-1-light`): diagram frames, work-thumbnail figures, code blocks (the `code-bg` alias).
- **Surface 2** (`surface-2` / `surface-2-light`): inline code chips, diagram nodes, outline-button hover fill.
- **Surface 3** (`surface-3` / `surface-3-light`): emphasised diagram nodes (`node-strong`) only.
- **Hairline** (`line` / `line-light`): section tops, row dividers, metadata grid rules, figure borders, the outline rail.
- **Strong Hairline** (`line-strong` / `line-strong-light`): outline-button and icon-button borders, evidence-note rule, diagram node strokes and links, scrollbar thumb.
- **Ink** (`fg` / `fg-light`): headings, strong text, and the solid button fill (the `btn-bg` alias; `btn-fg` aliases the canvas).
- **Body Grey** (`fg-2` / `fg-2-light`): paragraphs, ledes, summaries, metadata values, diagram primary labels and the at-rest hot path.
- **Muted Grey** (`muted` / `muted-light`): section indices, dates, captions, label terms, nav links at rest, secondary diagram labels. Light muted is darkened to 5.1:1 on the canvas so it passes AA at 12px.
- **Grid Line** (`grid` / `grid-light`): the hero's background grid only.

### Named Rules
**The Accent Means Act-or-Here Rule.** Indigo appears only on links, focus rings, the current nav/outline item, the caret and selection, and the interactive hot-path draw. Buttons are never indigo; the primary button is solid ink.

**The Green Means Deployed Rule.** `live` is used for the deployed-status dot and for nothing else: no success states, no highlights.

**The Two-Theme Parity Rule.** Every colour is a token defined in both `:root` and `.dark`. Components never hard-code a hex; they reference the variable so both themes stay correct.

## Typography

**Display Font:** Inter, variable with the optical-size axis (`font-optical-sizing: auto`), fallback `ui-sans-serif, system-ui, sans-serif`
**Body Font:** Inter, with character variants `cv11` and `ss01` enabled on `body`
**Label/Mono Font:** JetBrains Mono, fallback `ui-monospace, monospace`, with contextual alternates off (`calt` 0)

**Character:** A neutral, tightly tracked grotesque for everything read as language, and a plain monospace for everything read as data. Weights stop at 600.

### Hierarchy
- **Display** (600, fluid 40–68px, 1.02, −0.038em, balanced wrap): the home hero `h1` only, name in ink and role line in muted grey.
- **Page title** (600, fluid 36–52px, 1.05, −0.035em): the `/work` and case-study `h1`.
- **Statement** (600, fluid 24–36px, 1.2, −0.03em, max 22ch): the contact line, trailing clause in muted grey.
- **Headline** (600, 24/32, −0.02em): section `h2`s, work-entry titles, case-study `h2`s.
- **Title** (600, 18/28, −0.01em): case-study `h3`, previous/next titles; the Experience row `h3` runs at 17/26.
- **Summary** (400, 20px, 1.5, max 54ch): the case-study one-line summary under the title.
- **Lede / Prose** (400, 18px, 1.6 / 1.65, max 58–68ch): hero lede and case-study body, which steps down to 17px below 900px.
- **Body** (400, 16px, 1.6, max 56–66ch): work problem statements, About paragraphs; supporting copy runs at 15px (section subtitles, More-work names).
- **UI** (500, 14px): buttons, nav links, "Read the case study".
- **Label** (mono 400, 12–13px, 1.55): section indices (13), dates (13), metadata terms (12), captions (12), evidence notes (12), outline heading (12).
- **Code** (mono 400, 13/20): code blocks; inline code at 0.84em.

### Named Rules
**The Mono Is Data Rule.** JetBrains Mono sets indices, dates, metadata keys, facts, captions, evidence notes, code and diagram text. It never sets a paragraph.

**The Literal Glyphs Rule.** Code and diagram text render the characters as written: mono carries `font-feature-settings: "calt" 0`, and code, inline code and diagram labels also set `font-variant-ligatures: none`, so `->`, `!=` and `>=` never collapse into ligatures.

**The 600 Ceiling Rule.** No weight above 600. Hierarchy comes from size, tracking and the ink / body-grey / muted ladder.

## Layout

A single centred container, `min(1120px, 100% − 48px)`, narrowing to `100% − 32px` below 640px. The nav is a sticky 56px bar. The home page stacks numbered sections, each with 72px vertical padding and a 1px top rule; the hero takes 96px above and 72px below. Section headings put a mono index (`01`–`05`) on the baseline beside the `h2`, with an optional muted subtitle capped at 60ch.

Home content is organised as ruled lists rather than cards: work entries are two columns (text, 400px diagram figure, 48px gap) separated by rules; Experience rows are a 200px date column plus text; More-work rows are a four-column table (name 220px, description, language 110px, links 150px); About is two equal columns. Everything collapses to one column between 560px and 900px, and the work thumbnail is dropped below 560px.

Case studies use a three-column reading grid: a 180px sticky outline, a text column up to 680px, and a 220px margin, 56px apart. A `Claim` block pairs prose with its evidence note in that margin. Below 1180px the outline disappears and the text column widens; below 900px each evidence note drops under its paragraph. The metadata block is a four-column ruled grid (two columns below 820px) with a full-width "How it was built" row.

The spacing rhythm steps 8 / 16 / 24 / 40 / 56 / 72 / 96px, with local 28px and 36px gaps around hero actions and figures.

## Elevation & Depth

Flat. There are no drop shadows on any surface. Depth comes from the stepped surface ladder (canvas, surface 1, 2, 3) and from 1px hairlines; the sticky nav separates itself with a 92% canvas fill and a bottom rule. The only `box-shadow` in the build is the live dot's 3px halo, a status signal, not elevation.

### Shadow Vocabulary
- **Live halo** (`box-shadow: 0 0 0 3px color-mix(in srgb, var(--live) 18%, transparent)`): the deployed-status dot only.

### Named Rules
**The Rules Not Shadows Rule.** Separation is a 1px `line` rule or a one-step surface change. If a new element seems to need a shadow, give it a hairline border and the next surface step instead.

## Shapes

Small, consistent corners on a rectilinear, rule-divided page. 4px on the smallest pieces (inline code, diagram nodes, the focus ring), 6px on interactive controls (buttons, icon button, nav links, skip link), 8px on framed figures and code blocks. The only round shape is the 6px live dot. Borders are always 1px; lists, tables and metadata have no outer frame, only horizontal (and in metadata, vertical) rules. The case-study outline and evidence notes use a single 1px left rule as their spine.

## Components

### Buttons
Quiet, compact and ink-first.
- **Shape:** gently squared (6px), 40px tall, 16px horizontal padding, 14px/500 label, optional 14px stroked SVG icon with an 8px gap.
- **Solid:** ink fill with canvas text; hover mixes the fill 14% toward the canvas. Used once per view for the primary action ("Selected work").
- **Line:** transparent with a `line-strong` border and ink text; hover shifts the border to muted and fills with surface 2. Used for secondary actions (Download CV, GitHub, LinkedIn).
- **Icon button:** 32px square, 6px radius, `line-strong` border, body-grey icon; hover brightens icon and border. Used for the theme toggle, with inline SVG sun/moon icons.
- **Transitions:** colour, background and border at 150ms ease-out.

### Navigation
- **Style:** sticky 56px bar, name at 15px/600 left, links at 14px in muted grey right, 6px × 10px hit area, 6px radius.
- **States:** hover to ink; current item (`aria-current`) in accent. On phones below 720px only Work and Contact remain beside the toggle.
- **Skip link:** solid-ink pill that drops in from above on focus.

### Case-study outline
A 180px sticky rail ("On this page") with a 1px left rule. Entries are muted 13px; hover goes to ink; the entry in view takes the accent in both its text and its segment of the rule.

### Work entry
The signature home component. Headline title linked (accent on hover), optional live status, a body-grey problem statement, a mono facts list (104px term column), and "Read the case study" in accent with an arrow that nudges 3px right on hover of the whole entry. On the right, a framed diagram thumbnail (surface 1, 1px `line`, 8px) with a mono caption. Hovering or focusing anywhere in the entry draws the thumbnail's hot path in accent.

### Live status
A 6px `live` dot with its halo, then a 12px mono label in muted grey. Appears only when a real deployment exists.

### Evidence note (Claim + Evidence)
The system's proof device. A `Claim` wraps a prose block with at most one `Evidence` note. The note is a mono 12/1.55 aside with a 1px `line-strong` left rule: the file name in body grey on the first line, then the claim text as an accent link to the exact lines at a pinned commit. Long identifiers break at underscores and camelCase humps. On wide screens it sits in the 220px margin beside its paragraph; below 900px it follows the paragraph.

### Case-study header and metadata
Breadcrumb (Work / title, 13px muted), page title, 20px summary, then a ruled metadata grid of mono terms over 14px values (Role, Stack, Status with live dot and links, Tests, and a full-width "How it was built"), then the sequence diagram.

### Code
Blocks sit on surface 1 with a 1px `line` border, 8px radius, 18×20px padding, 13/20 mono in body grey, tab size 4, horizontal scroll. Inline code is a surface-2 chip with a 1px `line` border, 4px radius, 0.84em mono in ink.

### Previous / next
A two-cell ruled grid under the article: a mono 12px direction label over an 18px/600 title; the title turns accent on hover.

### Diagrams
Hand-authored inline SVG React components with `role="img"`, `<title>` and `<desc>`, coloured entirely by the theme variables.
- **Grammar:** 1px `line-strong` links (dashed `2 4` for sequence lifelines, `3 3` for side paths); nodes as 4px-radius rects on surface 2 with a `line-strong` stroke, emphasised nodes on surface 3 with a muted stroke; 2–3px dot markers; mono labels at 11–12.5px, primary labels in body grey and secondary ones muted.
- **Hot path:** at rest the hot path is a 1.5px body-grey stroke with body-grey dots, in greyscale. In work thumbnails an accent stroke overlays it and draws along the path (dash offset 1 to 0, 900ms, ease-out-expo) on entry hover or focus, and the hot dots turn accent after a 250ms delay.
- **Sequence diagram:** lanes as dashed lifelines under muted mono lane labels, messages as rows 34px apart with arrow dots, notes as surface-3 pills. Below 700px it switches to a vertical 340px-wide variant: one spine, one dot per step, a short main label and, where the step label contains a two-space separator, a muted 11px detail line underneath.
- **Frame:** the case-study diagram sits in a surface-1 figure with a 1px `line` border, 8px radius, 28px padding (20×14px on phones) and a 12px mono caption.

### Motion
- **Hero entrance:** each hero line rises 8px from transparent in 500ms with `cubic-bezier(0.16, 1, 0.3, 1)`, staggered 60ms.
- **Scroll reveal:** work entries, Experience rows and More-work rows translate up 12px as they enter the viewport, via `animation-timeline: view()` (entry 0–40%). It is transform-only, with no fade, so text is never shown at reduced contrast. It runs only inside `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`; otherwise content is simply there.
- **Hover:** 150ms ease-out colour and border transitions; 200ms ease-out-expo arrow nudge.
- **Reduced motion:** every animation and transition is disabled, and smooth scrolling turns off.

## Do's and Don'ts

### Do:
- **Do** reference colours only through the theme variables (`var(--fg)`, `var(--line)`, …) so both themes stay correct.
- **Do** keep the accent to links, focus rings, the current nav/outline item, caret/selection and the interactive hot-path draw.
- **Do** separate content with 1px `line` rules and surface steps, not cards with shadows.
- **Do** set section indices, dates, metadata, captions, evidence and code in JetBrains Mono with `calt` off, and paragraphs in Inter.
- **Do** attach at most one evidence note per claim, linking to the exact lines at a pinned commit.
- **Do** draw new diagrams in the established grammar (hairline links, 4px nodes on surface 2/3, mono labels, greyscale hot path at rest) and give them a vertical variant if they can't stay legible at 375px.
- **Do** gate every scroll animation behind `@supports` and `prefers-reduced-motion: no-preference`, and keep scroll reveals transform-only.

### Don't:
- **Don't** colour a button, badge, heading or background indigo; the primary button is solid ink.
- **Don't** use `live` green for anything except the deployed-status dot.
- **Don't** set paragraphs in mono or use weights above 600.
- **Don't** add drop shadows or elevation layers; the only shadow is the live halo.
- **Don't** extend the background grid beyond the hero or remove its fade-out mask.
- **Don't** hide content until JavaScript runs, or add a fade to scroll reveals.
