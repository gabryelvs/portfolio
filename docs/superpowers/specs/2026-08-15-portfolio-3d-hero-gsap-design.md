# Portfolio: scroll-driven 3D hero, GSAP motion system, Software Engineer repositioning

Date: 2026-08-15
Repo: `portfolio` (Next.js 16.2.9, React 19.2.4, Tailwind 4, TypeScript, Vitest)
Status: design approved, ready for implementation planning

## Goal

Two outcomes, one change set:

1. Replace the static hero with a scroll-driven 3D node-mesh rendered in WebGL, taking
   visual cues from landonorris.com (scroll-coupled camera, cinematic entrance) without
   attempting its asset-heavy production values.
2. Reposition the site's identity from "Backend Engineer" to "Software Engineer" across
   the site and the CV data source, keeping backend technologies visible as skills.

Consolidating the animation stack on GSAP falls out of (1): the site currently runs
framer-motion in two components only, so migrating them removes a dependency rather than
leaving two animation systems side by side.

## Non-goals

- No GLTF models, no loaded 3D assets, no post-processing pipeline.
- No pinned full-screen scroll sections. The page stays scannable for recruiters.
- No Lenis or other smooth-scroll hijacking.
- No LinkedIn copy changes (`cv/LINKEDIN-content.md`, `cv/Cover-Letter-General-Template.md`
  are explicitly out of scope; the user will handle those separately).
- No changes to `lib/github.ts`, the projects data pipeline, or deployment config.

## Decisions taken during brainstorming

| Question | Decision |
| --- | --- |
| What to borrow from the reference site | Scroll-driven 3D hero object only |
| What the object is | 3D evolution of the existing service-mesh motif (nodes + links) |
| Scroll reach | Hero only |
| Rendering approach | Raw `three` + GSAP ScrollTrigger, no react-three-fiber |
| Extra scope | GSAP scroll reveals sitewide, replacing framer-motion |
| Mobile / low-power | Static fallback below 768px — 3D never mounts |
| `prefers-reduced-motion` | Static single frame, no rAF loop, no scroll coupling |
| Copy reach | Site + `cv/cv-data.json` (LinkedIn later) |
| `Backend` skills-group label in About | Kept — it is a technology category, not an identity claim |
| `public/cv.pdf` | Regenerated in this work |

`three` over `@react-three/fiber` because the scene is a single procedural object, the
repo already uses an imperative canvas-in-`useEffect` pattern (`components/BackgroundFX.tsx`),
and r3f would add roughly 50KB gzipped plus a React 19 / Next 16 compatibility surface for
declarative ergonomics this scope does not need.

## Architecture

### New units

**`lib/gsap.ts`** — the single place GSAP is configured. Registers `ScrollTrigger` exactly
once (guarding against React Strict Mode double-invocation in development), exports the
configured `gsap` instance and a `prefersReducedMotion()` helper. Every animating component
imports from here; no component calls `registerPlugin` itself.

**`lib/mesh.ts`** — pure functions, no `three` import, no DOM import. Holds the geometry and
gating maths so it is testable under jsdom:

- `linkPairs(nodes, maxDistance)` — index pairs within linking distance.
- `parseAccent(hex)` — CSS custom property to RGB triplet (behaviour currently inlined at
  `components/BackgroundFX.tsx:31`).
- `clampDpr(devicePixelRatio)` — caps at 2.
- `nodeCount(width, height)` — viewport-derived node count.
- `shouldRenderMesh({ width, reducedMotion })` — the mount gate. True only when
  `width >= 768` and `reducedMotion` is false.

Extracting these is also the fix for an existing testability gap: the equivalent logic in
`BackgroundFX.tsx` is unreachable from tests today. `BackgroundFX.tsx` is refactored to
consume `lib/mesh.ts` rather than keeping its own copies.

**`components/HeroMesh.tsx`** — `"use client"`. One `useEffect` owning a `three` scene, in
the same imperative shape as the existing background canvas. Renders `THREE.Points` for
nodes and a single `THREE.LineSegments` for links. Exposes no props beyond an optional
`className`; it is a self-contained visual.

**`components/Reveal.tsx`** — `"use client"`. Wraps children in an element that fades and
rises once, driven by a ScrollTrigger with `once: true`. Under reduced motion it renders
children with no animation and no trigger registered. This is the replacement for
framer-motion's `whileInView`.

### Changed units

- `components/Hero.tsx` — framer-motion elements become a GSAP entrance timeline; mounts
  `HeroMesh` through `next/dynamic` with `ssr: false`; headline copy changes.
- `components/Projects.tsx` — `motion.div` / `whileInView` replaced with `Reveal`.
- `components/BackgroundFX.tsx` — consumes `lib/mesh.ts`; gains an opacity value driven by
  hero scroll progress so it is invisible while the 3D hero is on screen.
- `app/layout.tsx` — metadata title and description.
- `components/About.tsx` — intro sentence only. The `Backend:` skills key is unchanged.
- `components/Contact.tsx` — roles sentence.
- `cv/cv-data.json` — headline and profile paragraph.
- `README.md` — description line.
- `package.json` — add `three`, `@types/three`, `gsap`; remove `framer-motion`.

### Dependency install

Dependencies are installed inside `portfolio/`, never at the `D:\Project` root.

## Motion design

### Entrance (time-based, ~1.2s)

Nodes interpolate from randomised start positions into their lattice positions while the
headline reveals. One GSAP timeline owns both so the text and the mesh land together.

### Scroll (ScrollTrigger, scrubbed against hero section progress 0 to 1)

| Progress | Behaviour |
| --- | --- |
| 0.0 – 0.3 | Camera dollies back; mesh yaws slowly |
| 0.3 – 0.7 | Nodes disperse outward; link opacity falls to 0 |
| 0.7 – 1.0 | Scene fades out; `BackgroundFX` canvas fades in |

The final phase resolves a real conflict: a 2D node-mesh behind the whole page and a 3D
node-mesh in the hero, both visible at once, read as visual mud. The handoff gives the 3D
mesh sole ownership of the hero and the 2D canvas sole ownership of everything below it,
in one shared visual language.

### Render loop and resource handling

- rAF pauses when ScrollTrigger reports the hero out of view, and on `document.hidden`.
- Colours are read from the `--accent` and `--highlight` CSS custom properties; a
  `MutationObserver` on the root element's class list re-reads them when the theme toggles.
  This mirrors `components/BackgroundFX.tsx:116`.
- Link positions are written into a preallocated `Float32Array` and published with
  `setDrawRange`; no per-frame allocation.
- Node count: 120 on desktop, which is 7,140 pair checks per frame — comfortably cheap.
- Device pixel ratio capped at 2.
- On unmount: `cancelAnimationFrame`, `ScrollTrigger.kill()`, dispose geometries,
  materials, and the renderer, and remove the canvas.
- A `webglcontextlost` listener stops the loop and leaves the static fallback visible.

## Fallback behaviour

Both fallback conditions converge on one code path. When viewport width is under 768px or
the user prefers reduced motion, `HeroMesh` never mounts and `BackgroundFX` stays at full
opacity. `BackgroundFX` already renders a single static frame with no animation loop under
reduced motion, so no new fallback asset or second visual treatment is needed.

The gate is evaluated on the client after mount, and re-evaluated on resize. Because the
mesh is a `next/dynamic` import with `ssr: false`, no WebGL code reaches the server-rendered
HTML and the hero's text is the LCP candidate in every case.

## Copy changes

| Location | Current | Target |
| --- | --- | --- |
| `components/Hero.tsx:35` | "Backend engineer who ships" | "Software engineer who ships" |
| `app/layout.tsx:26` | "Gabryel Veríssimo — Backend Engineer" | "Gabryel Veríssimo — Software Engineer" |
| `app/layout.tsx:27` | "Backend engineer focused on fintech…" | Software engineer phrasing; technologies retained |
| `components/About.tsx:15` | "focused on backend engineering" | "focused on software engineering" |
| `components/Contact.tsx:18` | "junior / placement backend roles in London" | "junior / placement software engineering roles in London" |
| `README.md:3` | "fintech backend services and fullstack work" | software engineering phrasing |
| `cv/cv-data.json:4` | "Aspiring Backend Software Engineer · Computer Science Student" | "Software Engineer · Computer Science Student" |
| `cv/cv-data.json:19` | profile: "building production-grade backend systems…", "Seeking a junior or placement backend or fullstack developer role" | identity reframed as software engineer; concrete technologies, fintech focus, and project detail all retained |

`components/About.tsx:5` keeps its `Backend:` skills group. Project descriptions inside
`cv-data.json` that describe a system as a backend service (for example the PayLedger entry
at line 51) are factual technical descriptions and are left unchanged.

### CV artefact regeneration

`cv/cv-data.json` is the single source for both CV builders. After editing it:

- `python cv/build_cv_pdf.py` regenerates `public/cv.pdf`, which the site links from
  `components/Hero.tsx:66`.
- `node cv/build_cv.js` regenerates `Gabryel_Verissimo_CV.docx`.

Both are run, because the builders' shared source exists specifically to stop the published
PDF drifting from the .docx — a drift that has happened before, per the note at
`cv/build_cv_pdf.py:6`. Toolchain verified present: reportlab 5.0.0 on Python 3.13.14, and
the gitignored `cv/cv-contact.json` the PDF builder requires.

## Testing

The existing six test files stay green. jsdom provides no WebGL context, so tests target
behaviour reachable without one:

- `lib/mesh.ts` unit tests: link-pair search including the boundary case at exactly the
  link distance; accent parsing for valid, malformed, and missing values; DPR clamping;
  and a `shouldRenderMesh` matrix covering the width boundary at 767/768 crossed with
  reduced-motion true/false.
- `HeroMesh` renders nothing when the gate is false, and registers no ScrollTrigger.
- `Reveal` renders its children when GSAP is inert under jsdom — content must never depend
  on animation running.
- Copy regression assertions: the hero headline and the exported metadata both read
  "Software Engineer".
- `BackgroundFX` still renders after its refactor onto `lib/mesh.ts`.

Manual verification before completion: `npm run build` for bundle impact, `npm run lint`,
`npm test`, and a browser pass on the dev server checking the scroll choreography, the
theme toggle mid-animation, the sub-768px fallback, and the reduced-motion fallback.

## Risks

- **Bundle size.** `three` is roughly 150KB gzipped even tree-shaken. It is lazy-loaded and
  desktop-only, so it must not appear in the initial chunk. Verify against the build output;
  if it does appear, the dynamic import boundary is wrong.
- **Next.js 16 API drift.** Per `AGENTS.md`, this Next version departs from older
  conventions. Read the relevant pages under `node_modules/next/dist/docs/` before writing
  the dynamic import and client component code rather than relying on remembered APIs.
- **Perf regression on a site that currently scores highly.** The hero text remains the LCP
  element and WebGL is deferred, but this needs measuring, not assuming.
- **Animation feel is subjective.** The three scroll phases are a starting point and expected
  to need tuning against the real thing.
