# Portfolio redesign: professional, evidence-first, still technical

Date: 2026-09-23
Repo: `portfolio` (Next.js 16.2.9, React 19.2.4, Tailwind 4, TypeScript, Vitest)
Branch: `redesign`
Status: decisions agreed in grilling sessions. Project fixes are in flight; the mockup comes next, then the plan.

## Goal

Make the site read like a working engineer's portfolio, not a student showcase, while
keeping a technical identity. Three changes carry it:

1. **Calmer surface.** Vercel-style monochrome with monospace details, dark by default.
   The 3D hero, animated background canvas and GSAP go.
2. **Depth over breadth.** Three written case studies at `/work/<slug>`, each set out
   like a short design doc, lead the page. The automatic GitHub `showcase` list stays
   below them as "More work".
3. **Grown-up copy.** No boasting counters and no gradient text. Specific numbers move
   into the case studies, where they have context.

The identity wording ("Software Engineer", no "student") shipped separately in
gabryelvs/portfolio#17 and is not part of this work.

## Audience

Primary and only design target: **hiring managers and engineers evaluating a graduate
or junior software engineer in London** (roles starting summer 2027). They usually
arrive from a CV or application and skim. Freelance clients are no longer a design
target. Client work appears only as factual experience.

## Non-goals

- No blog or notes section. The case studies are the writing.
- No photo.
- No CV layout change. The CV keeps its plain, ATS-safe layout.
- The restaurant and volunteer roles stay on the CV only.
- No changes to `lib/github.ts` fetching or ranking logic, or to ISR timing.
- No custom-domain code beyond a single `SITE_URL` constant (DNS is a separate step
  after the domain is bought).
- No new animation library of any kind.

## Decisions (from the 2026-09-23 grilling session)

| Topic | Decision |
| --- | --- |
| Reference feel | Vercel/Geist (monochrome, mono details) + a touch of an engineering notebook |
| Theme | Dark by default, light toggle kept. Dark surfaces follow Linear's stepped-surface model; spacing and type follow Vercel's |
| Fonts | Inter (display and body) + JetBrains Mono. Space Grotesk removed. Mono only for labels, metadata and code, never paragraphs |
| Accent | One indigo, used only for links, focus rings and the active nav item. The main button is solid ink (white on dark). Cyan token and gradient text removed. A green dot means "live" and nothing else |
| Background | Subtle CSS grid only. The service-mesh canvas is removed; the motif lives on in the case-study diagrams |
| Motion | CSS only: hero entrance fade and hover states, plus scroll reveals via CSS scroll-driven animations where supported. No GSAP, no three.js |
| Kept identity | Indigo accent (toned), JetBrains Mono, numbered sections, dark default |
| Dropped identity | 3D WebGL hero, `~/gabryel $ whoami` line, `gv/dev` logo (replaced by the name), hero counters |
| Case studies | PayLedger, Webhook Inspector, Taskboard API, each as its own page with a shareable preview card |
| Case-study authoring | Claude drafts from the repos; Gabryel edits. Every claim links to code, tests or the live demo |
| Client work | Auto Boutique London appears in Experience, marked pro bono. No case study |
| Domain | `gabryelverissimo.dev` (Cloudflare Registrar, bought by Gabryel), `hello@` forwarding to Gmail, old `.vercel.app` URL redirects |
| Analytics | Vercel Web Analytics (cookieless, no consent banner) |
| Quality bar | WCAG 2.2 AA, Lighthouse 95+ in all four categories, reduced motion respected, CI green |

## Information architecture

```
/                 Home
/work             Index of the three case studies (so a trimmed URL never 404s)
/work/payledger
/work/webhook-inspector
/work/taskboard-api
/cv.pdf           Unchanged
/sitemap.xml      New
/robots.txt       New
```

### Home, in order

1. **Nav**: "Gabryel Veríssimo" (links home) · Work · Experience · About · Contact · theme
   toggle. Active section shows the accent.
2. **Hero**
   - Name as the `h1`.
   - Role line "Software Engineer".
   - One-sentence subtitle carrying "fintech & reliable systems" and the stack.
   - Availability line in mono: graduate and junior roles, London, summer 2027.
   - Buttons: **Selected work** (solid ink) and **Download CV** (outline).
   - No counters.
3. **01 / Selected work**: three case-study cards. Each card has:
   - title and a one-line problem statement
   - 2–3 hard facts in mono (e.g. "row-level locking · idempotency keys · 31 tests")
   - the stack
   - a live dot if deployed
   - "Read case study →"
4. **02 / Experience**
   - Freelance Software Engineer (Auto Boutique London, pro bono, links to the live site).
   - Education: BSc Computer Science, University of Greenwich, expected Jul 2027.
5. **03 / More work**: the GitHub `showcase` list, minus the three featured repos, as
   compact rows (name, one-line description, language, repo and demo links), not cards.
   The empty, partial and error states from `PRODUCT.md` still apply.
6. **04 / About**: a short paragraph plus skill groups (Languages, Backend, Front-end,
   Tools). The "Backend" group label stays; it names a category, not an identity.
7. **05 / Contact**: availability line; Email, GitHub, LinkedIn, CV. Email is the Gmail
   address until `hello@` forwarding is verified, then swaps.
8. **Footer**: name, year, "Source on GitHub" link.

### Case study page

- **Header**
  - Eyebrow "Case study" in mono; title; one-line summary.
  - A metadata block: Role (solo), Stack, Status (live or repo only), Links (repo, live
    demo), and 2–4 key numbers, each traceable.
- **Body**: one text column around 680–720px wide, 18/28 type. Fixed outline:
  1. The problem
  2. Constraints
  3. Architecture, with one diagram
  4. Hard problems (2–3, each: what could go wrong, how it's solved, the test that proves it)
  5. How it's tested
  6. What I'd change
  7. Links (repo, live demo, specific test files)
- **Footer**: previous / next case study, back to all work.
- **Length**: 800–1,200 words (a 4–6 minute read).
- **Code references**: link to GitHub at a pinned commit, so line numbers never drift.

### Diagrams

- One per case study, hand-authored inline SVG as a React component.
- Colours come from CSS variables so they work in both themes.
- Nodes and links echo the old service-mesh motif: 1px hairlines, small node markers,
  mono labels. Only the accent may mark the "hot path".
- `role="img"` with `<title>` and `<desc>`, and a text equivalent in the surrounding prose.
- Must stay legible at 375px wide. If a horizontal layout can't, the diagram switches to
  a vertical variant below the `sm` breakpoint.

## Visual system

Final values are set in the mockup and recorded in `DESIGN.md` after the build. Starting
points:

**Type** (Vercel scale, Inter, weights capped at 600, negative tracking at display sizes):
48/48 −2.4px · 32/40 −1.28px · 24/32 −0.96px · 20/28 −0.6px · body 16/24 (18/28 in case
studies) · 14/20 · mono caption 12/16 · code 13/20.

**Dark tokens** (Linear-style stepped surfaces):
- canvas ≈ `#08090a`, then three surface steps
- hairline ≈ `#23252a`, strong hairline one step up
- text ≈ `#f7f8f8`, muted ≈ `#8a8f98`
- accent: a lighter indigo tuned for AA contrast on the canvas

**Light tokens** (Vercel):
- canvas `#fafafa` / card `#ffffff`
- ink `#171717`, body `#4d4d4d`, mute `#888888`
- hairline `#ebebeb`
- accent `#4f46e5`

**Rationing rule**:
- Accent = links, focus rings, active nav. Nothing else.
- Green = live status. Nothing else.
- Everything else is greyscale.

**Shape**: 8px radius on cards, 6px on inputs and buttons. Borders do the work; shadows
are at most the Vercel 1px ring plus one soft layer.

**Grid**: the existing 56px background grid, fainter, and masked so it fades out below
the hero.

## Motion

- Hero entrance: CSS keyframes, opacity plus 8px rise, 60ms stagger, ≤400ms, ease-out.
- Section reveals: `animation-timeline: view()` inside
  `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion:
  no-preference)`. Where either condition fails, content is simply visible. No JavaScript
  runs, so content is never stuck hidden.
- Hover and focus: 150–200ms colour and border transitions.
- No parallax, no scroll-jacking, no canvas.

## Architecture

### Removed

| Path | Reason |
| --- | --- |
| `components/HeroMesh.tsx`, `lib/mesh.ts` | 3D hero dropped |
| `components/BackgroundFX.tsx` | Animated canvas dropped (static grid is CSS) |
| `components/Reveal.tsx`, `lib/gsap.ts` | GSAP dropped |
| `components/ProjectCard.tsx`, `components/Projects.tsx` | Replaced by case-study cards and "More work" rows |
| deps: `gsap`, `three`, `@types/three` | No longer used |
| tests for all of the above | They test deleted features. Replacements are listed below |

### New

- **`lib/site.ts`**: `SITE_URL` (the `.vercel.app` URL until the domain is live), the
  name, availability copy, and contact links. It's the single source for both metadata
  and the UI.
- **`lib/work.ts`**: the typed case-study registry, one entry per slug, holding:
  - title and summary
  - problem one-liner and card facts
  - stack, repo URL, live URL (or null)
  - key numbers
  - a pinned commit SHA for code links
  - the ordering

  Pages, cards, metadata, OG images and the sitemap all read from this registry.
- **Case-study bodies**: `content/work/<slug>.mdx`, rendered with `@next/mdx`.
  - Setup: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`;
    `createMDX()` in `next.config.ts`; `pageExtensions` extended; a root
    `mdx-components.tsx`, which the App Router requires.
  - The 16.2.9 docs (`02-guides/mdx.md`) confirm it works with Turbopack, but remark
    and rehype plugins must be passed as strings. None are needed.
  - No frontmatter: bodies are prose only, and all structured data lives in
    `lib/work.ts`.
  - Pages load a body with `await import(`@/content/work/${slug}.mdx`)`, alongside
    `generateStaticParams` and `dynamicParams = false`.
  - MDX was chosen over TSX so Gabryel can edit the prose without touching React.
- **`app/work/[slug]/page.tsx`**: static generation for the three slugs, with
  `dynamicParams = false` so unknown slugs return 404, and `generateMetadata` built from
  the registry. `params` is a Promise in Next 16 and must be awaited.
- **Root layout** gains `metadataBase: new URL(SITE_URL)`. Next 16 fails the build on
  relative OG URLs without it.
- **`app/work/page.tsx`**: the index.
- **`app/work/[slug]/opengraph-image.tsx`** plus a root `opengraph-image.tsx`: preview
  cards rendered at build, monochrome, title plus one line.
  - `ImageResponse` comes from `next/og`.
  - Inter is loaded from a committed TTF under `assets/fonts/` (OFL). ImageResponse
    accepts only ttf, otf or woff.
  - Layout is flexbox only; the bundle is capped at 500KB.
- **`app/sitemap.ts`, `app/robots.ts`.**
- **Components**: `Hero`, `SelectedWork` + `WorkCard`, `Experience`, `MoreWork` +
  `WorkRow`, `About`, `Contact`, `Footer`, `CaseStudyHeader`, `CaseStudyNav`, and one
  diagram component per case study.
- **`@vercel/analytics`**: `<Analytics />` in the root layout. The script and beacon are
  same-origin (`/_vercel/insights/*`), so the existing CSP holds. The CSP comment's
  stale Framer Motion mention is corrected.

### Unchanged

`lib/github.ts` (fetching, ranking, fallback), `data/projects.fallback.json`, the
security headers, ISR `revalidate = 86400`, `ThemeToggle` behaviour and the no-flash
inline theme script, `/cv.pdf`.

"More work" filters the three featured repos out of `getShowcaseProjects()` by repo name
taken from the registry, so a project is never listed twice.

## Honesty rules (from PRODUCT.md, restated because the case studies add claims)

- Every number in a case study or card maps to something countable: a test count from
  the repo, a limit in code, a commit. Otherwise it is cut.
- "Live" means the demo URL answered a real route when checked before merge. The dot is
  a static field; the plan includes probing every live URL before the PR is opened.
- Code links point at a pinned commit.
- AI assistance is disclosed (see "How the projects were built").

## Testing

Replaces the deleted feature tests (about 57 of the current 92):

- **Registry**: slugs unique; every entry has the required fields; URLs are https; the
  commit SHA is 40 hex chars; the order is stable.
- **Routes**: `generateStaticParams` returns exactly the three slugs; each page renders
  its title and all seven outline headings; an unknown slug calls `notFound`.
- **Home**: sections render in the agreed order with their numbered headings; the hero
  has the name as `h1`, "Software Engineer", both buttons, and no counters.
- **More work**: excludes featured repos; empty, partial and error states still render
  honestly (existing `lib/github` tests stay).
- **Copy guards**: the #17 student-framing and CV tests stay. Hero assertions are
  updated for the new structure.
- **Accessibility smoke**: every diagram has `role="img"` plus a title; exactly one `h1`
  per page; the theme toggle keeps its label.
- **Metadata**: each case study has a title, description and an OG image route.
- **Outside Vitest**: Lighthouse (mobile and desktop) and a keyboard-only pass against a
  local production build, run in the verification task. Results go in the PR.

## Rollout

1. Mockup of the home page and the PayLedger case study, as static HTML in the new
   direction, using real drafted content. **Gabryel signs off.**
2. Implementation plan (`docs/superpowers/plans/2026-09-23-portfolio-redesign.md`),
   written after sign-off so it reflects the approved visuals.
3. Build on `redesign`, task by task, tests first.
4. Case-study drafts → Gabryel edits → final copy.
5. Verification: tests, lint, build, Lighthouse, keyboard pass, live-URL probes, both
   themes, 375px.
6. `DESIGN.md` written from the finished site; `PRODUCT.md` updated to the new audience
   and principles, then committed.
7. PR with Vercel preview → Gabryel merges.
8. After the domain is bought (in parallel, not blocking):
   - DNS to Vercel
   - redirect `.vercel.app`
   - flip `SITE_URL`
   - verify `hello@` forwarding, then swap the email on the site and CV
   - enable Web Analytics in the Vercel dashboard

## Prerequisite project fixes (agreed 2026-09-23)

Researching the case studies surfaced gaps a close reader would find. They are fixed,
or described accurately, before any case study goes live. Each is a separate PR in its
own repo, done test-first.

**PayLedger (`gabryelvs/payledger`)**
- Ownership checks on transfers, wallet reads and transaction reads. Today any
  authenticated user can move money out of any wallet (an IDOR).
- Idempotency made safe under concurrency. Today two requests with the same key both
  transfer, and the second then returns a 500.
- A demo deposit path, so the live demo can actually move money.
- Redis claims removed from the README, docs and CV stack line, since nothing uses it.
- The unmerged `fix/dockerfile-build-order` merged.

**Webhook Inspector (`gabryelvs/webhook-inspector`)**
- Confirm the rate limiter keys on the Fly proxy IP. If it does, key it on the real
  client IP.
- Add a GitHub Actions workflow running both the backend and frontend test suites.
- Tests stay on SQLite. That gap is disclosed in "What I'd change".

**Taskboard API (`gabryelvs/taskboard-api`)**
- No code change.
- Describe reuse revocation accurately everywhere: it revokes every session for that
  user, not one token family.
- README test count 55 → 62.
- The missing database constraint on positions is disclosed in "What I'd change".

Once the fixes land, the CV, LinkedIn copy and GitHub profile README get matching
corrections:
- Redis out of PayLedger's stack.
- Accurate rate-limit and revocation wording.
- Updated test counts.

Case-study code links pin the post-fix commits.

## How the projects were built (agreed 2026-09-23)

Each case study's metadata block carries one line along these lines:

> Built with AI-assisted development (Claude Code). I set the design and direction,
> reviewed each change, and verified it with the tests below.

About gets one matching sentence. Gabryel adjusts the wording until every word is true
for him, and treats each case-study draft as interview prep: anything he can't explain
himself is rewritten or cut before publishing.
