# Portfolio 3D Hero + GSAP Motion + Software Engineer Repositioning — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the portfolio hero a scroll-driven 3D node-mesh rendered with WebGL, move the whole site's animation onto GSAP, and reposition the site's identity from "Backend Engineer" to "Software Engineer".

**Architecture:** A pure maths module (`lib/mesh.ts`) holds all geometry and gating logic so it is unit-testable without a WebGL context. `components/HeroMesh.tsx` owns a raw `three` scene in a single `useEffect`, mounted only on desktop with motion allowed, lazily via `next/dynamic({ ssr: false })`. GSAP ScrollTrigger drives the hero's scroll choreography and, through `components/Reveal.tsx`, the sitewide scroll reveals that currently use framer-motion. The existing 2D `BackgroundFX` canvas fades in as the 3D hero fades out, so the two never share the screen.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19.2.4, TypeScript, Tailwind CSS 4, `three` 0.185.x, `gsap` 3.15.x, Vitest + React Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-08-15-portfolio-3d-hero-gsap-design.md`

## Global Constraints

- Working directory for every command is `D:\Project\portfolio`. Dependencies install inside `portfolio/`, never at the `D:\Project` root.
- Branch is `feat/3d-hero-gsap`, already created. Do not commit to `main`.
- Per `AGENTS.md`: this Next.js version departs from older conventions. Read the relevant page under `node_modules/next/dist/docs/` before using an API you are recalling from memory. `next/dynamic` with `{ ssr: false }` is confirmed valid in `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` and must be called from a Client Component.
- jsdom has no WebGL context. No test may construct `THREE.WebGLRenderer`.
- Every animated component must render its content with animation disabled — content must never depend on GSAP running.
- `prefers-reduced-motion: reduce` means no rAF loop and no scroll-coupled motion, matching the existing behaviour at `components/BackgroundFX.tsx:22`.
- The 3D mesh mounts only when viewport width >= 768 **and** reduced motion is not requested.
- `components/About.tsx:5` keeps its `Backend:` skills group key. It is a technology category, not an identity claim.
- `cv/LINKEDIN-content.md` and `cv/Cover-Letter-General-Template.md` are out of scope. Do not edit them.
- `cv/cv-data.json` is the single source for both CV builders. Never hand-edit `public/cv.pdf`.
- Exact target copy string for the hero headline: `Software engineer who ships`. Exact target metadata title: `Gabryel Veríssimo — Software Engineer`. Exact target CV headline: `Software Engineer  ·  Computer Science Student` (two spaces either side of the separator, matching the existing file).

---

## File Structure

**Created:**

| File | Responsibility |
| --- | --- |
| `lib/mesh.ts` | Pure geometry + gating maths. No DOM, no `three`, no React. |
| `lib/gsap.ts` | Single GSAP configuration point: plugin registration, reduced-motion helper, isomorphic layout effect. |
| `components/Reveal.tsx` | Scroll-triggered fade/rise wrapper. Replaces framer-motion's `whileInView`. |
| `components/HeroMesh.tsx` | The WebGL node-mesh scene and its scroll rig. |
| `tests/mesh.test.ts` | Unit tests for `lib/mesh.ts`. |
| `tests/Reveal.test.tsx` | Children always render; reduced motion registers nothing. |
| `tests/HeroMesh.test.tsx` | Gate behaviour — renders nothing when gate is false. |
| `tests/BackgroundFX.test.tsx` | The 2D canvas still renders after its refactor onto `lib/mesh.ts`. |
| `tests/copy.test.tsx` | Identity copy regression guard. |

**Modified:** `components/Hero.tsx`, `components/Projects.tsx`, `components/BackgroundFX.tsx`, `components/About.tsx`, `components/Contact.tsx`, `app/layout.tsx`, `app/globals.css`, `cv/cv-data.json`, `README.md`, `package.json`.

---

### Task 1: Identity copy + CV artefact regeneration

Ships the user's explicit ask on its own, before any animation work, so it is reviewable and revertable independently.

**Files:**
- Create: `tests/copy.test.tsx`
- Modify: `components/Hero.tsx:35`, `app/layout.tsx:26-27`, `components/About.tsx:15`, `components/Contact.tsx:18`, `cv/cv-data.json:4`, `cv/cv-data.json:19`, `README.md:3`
- Regenerate: `public/cv.pdf`, `Gabryel_Verissimo_CV.docx`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing consumed by later tasks. Later tasks must not reintroduce the word "backend" into these strings.

- [ ] **Step 1: Write the failing test**

Create `tests/copy.test.tsx`. Note it asserts `app/layout.tsx` by reading the file rather than importing it — importing the layout pulls in `next/font/google`, which needs Next's compiler and fails under plain Vitest.

```tsx
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import cv from "../cv/cv-data.json";

const layoutSource = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

describe("identity copy", () => {
  it("titles the hero as a software engineer", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/software engineer/i);
  });

  it("does not call the hero a backend engineer", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).not.toHaveTextContent(/backend engineer/i);
  });

  it("describes the about intro as software engineering", () => {
    render(<About />);
    expect(screen.getByText(/software engineering/i)).toBeInTheDocument();
  });

  it("keeps the Backend skills group", () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: "Backend" })).toBeInTheDocument();
  });

  it("offers software engineering roles in contact", () => {
    render(<Contact />);
    expect(screen.getByText(/software engineering roles/i)).toBeInTheDocument();
  });

  it("titles the page metadata as Software Engineer", () => {
    expect(layoutSource).toContain('title: "Gabryel Veríssimo — Software Engineer"');
    expect(layoutSource).not.toMatch(/backend/i);
  });

  it("headlines the CV as Software Engineer", () => {
    expect(cv.headline).toMatch(/^Software Engineer/);
    expect(cv.headline).not.toMatch(/backend/i);
    expect(cv.profile).not.toMatch(/backend/i);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npm test -- tests/copy.test.tsx
```

Expected: FAIL. The hero heading assertion fails on the current text "Backend engineer who ships reliable systems."

- [ ] **Step 3: Change the site copy**

`components/Hero.tsx:35` — replace `Backend engineer who ships{" "}` with:

```tsx
        Software engineer who ships{" "}
```

`app/layout.tsx:26-27` — replace both metadata fields with:

```tsx
  title: "Gabryel Veríssimo — Software Engineer",
  description: "Software engineer focused on fintech and reliable systems. Building with Python, FastAPI, PostgreSQL, TypeScript, React, and modern cloud infrastructure.",
```

`components/About.tsx:15` — replace the first sentence of the intro paragraph with:

```tsx
        I&apos;m a final-year Computer Science student in London focused on software engineering.
```

`components/Contact.tsx:18` — replace the paragraph text with:

```tsx
        Open to junior / placement software engineering roles in London. Let&apos;s talk.
```

`README.md:3` — replace the description line with:

```markdown
A bold, dark-mode personal portfolio showcasing fintech services and fullstack software engineering work, built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **Framer Motion** for smooth animations and modern design.
```

The "Framer Motion" mention stays for now; Task 4 removes the dependency and updates this line and the Tech Stack list together.

- [ ] **Step 4: Change the CV source data**

`cv/cv-data.json:4` — replace the headline value with:

```json
  "headline": "Software Engineer  ·  Computer Science Student",
```

`cv/cv-data.json:19` — replace the profile value with:

```json
  "profile": "Computer Science student (Year 3, University of Greenwich) building production-grade services in Python and FastAPI, with a focus on fintech APIs — payments, ledgers, idempotent transfers, and secure authentication — and shipping fullstack tools with React and TypeScript. Comfortable with PostgreSQL, REST design, Docker, and test-driven development. Seeking a junior or placement software engineering role in London.",
```

Leave every other string in the file alone. Project descriptions such as `cv/cv-data.json:51` describe systems as backend services as a matter of technical fact and are correct as written.

- [ ] **Step 5: Run the test and confirm it passes**

```bash
npm test -- tests/copy.test.tsx
```

Expected: PASS, 7 tests.

- [ ] **Step 6: Run the full suite for regressions**

```bash
npm test
```

Expected: PASS. All previously existing test files stay green.

- [ ] **Step 7: Regenerate the CV artefacts**

```bash
python cv/build_cv_pdf.py
```

Expected: writes `public/cv.pdf`, no traceback. Verified available: reportlab 5.0.0 on Python 3.13.14, and the gitignored `cv/cv-contact.json` the builder requires.

```bash
node cv/build_cv.js
```

Expected: writes `D:\Project\Gabryel_Verissimo_CV.docx` (outside this repo, so it will not appear in `git status`). Resolves `docx@9.7.1` from `D:\Project\node_modules` — do not install `docx` into `portfolio/`.

- [ ] **Step 8: Confirm the PDF actually changed**

```bash
git status --porcelain public/cv.pdf
```

Expected: ` M public/cv.pdf`. If empty, the builder did not write — stop and investigate rather than committing a stale PDF.

- [ ] **Step 9: Commit**

```bash
git add tests/copy.test.tsx components/Hero.tsx components/About.tsx components/Contact.tsx app/layout.tsx cv/cv-data.json README.md public/cv.pdf
git commit -m "feat: reposition site identity from backend engineer to software engineer"
```

---

### Task 2: Extract mesh maths into `lib/mesh.ts`

`BackgroundFX.tsx` keeps this logic inline, where no test can reach it, and `HeroMesh` needs the same maths. One tested module, two consumers.

**Files:**
- Create: `lib/mesh.ts`, `tests/mesh.test.ts`
- Modify: `components/BackgroundFX.tsx:30-59` (accent parsing, DPR, node count, link search)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Point = { x: number; y: number; z?: number }`
  - `type Link = { a: number; b: number; distance: number }`
  - `parseAccent(value: string): [number, number, number]`
  - `clampDpr(dpr: number): number`
  - `nodeCount(width: number, height: number): number`
  - `linkPairs(points: Point[], maxDistance: number): Link[]`
  - `shouldRenderMesh(input: { width: number; reducedMotion: boolean }): boolean`
  - `MESH_BREAKPOINT: 768`, `LINK_DISTANCE_2D: 155`, `HERO_NODE_COUNT: 120`, `HERO_LINK_DISTANCE: 3.2`

- [ ] **Step 1: Write the failing test**

Create `tests/mesh.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  clampDpr,
  HERO_LINK_DISTANCE,
  HERO_NODE_COUNT,
  linkPairs,
  MESH_BREAKPOINT,
  nodeCount,
  parseAccent,
  shouldRenderMesh,
} from "@/lib/mesh";

describe("parseAccent", () => {
  it("parses a six-digit hex with a hash", () => {
    expect(parseAccent("#6366f1")).toEqual([99, 102, 241]);
  });
  it("parses a six-digit hex without a hash and with surrounding space", () => {
    expect(parseAccent("  4f46e5 ")).toEqual([79, 70, 229]);
  });
  it("falls back to indigo-500 for malformed input", () => {
    expect(parseAccent("rgb(1,2,3)")).toEqual([99, 102, 241]);
    expect(parseAccent("")).toEqual([99, 102, 241]);
  });
});

describe("clampDpr", () => {
  it("caps at 2", () => {
    expect(clampDpr(3)).toBe(2);
  });
  it("passes through values between 1 and 2", () => {
    expect(clampDpr(1.5)).toBe(1.5);
  });
  it("floors at 1 for zero, negative, or non-finite input", () => {
    expect(clampDpr(0)).toBe(1);
    expect(clampDpr(-4)).toBe(1);
    expect(clampDpr(Number.NaN)).toBe(1);
  });
});

describe("nodeCount", () => {
  it("floors at 30 for tiny viewports", () => {
    expect(nodeCount(320, 480)).toBe(30);
  });
  it("caps at 90 for large viewports", () => {
    expect(nodeCount(2560, 1440)).toBe(90);
  });
  it("scales with area in between", () => {
    expect(nodeCount(1000, 800)).toBe(50);
  });
});

describe("linkPairs", () => {
  it("links points within the distance", () => {
    const links = linkPairs([{ x: 0, y: 0 }, { x: 3, y: 4 }], 10);
    expect(links).toEqual([{ a: 0, b: 1, distance: 5 }]);
  });
  it("excludes points beyond the distance", () => {
    expect(linkPairs([{ x: 0, y: 0 }, { x: 30, y: 40 }], 10)).toEqual([]);
  });
  it("includes points exactly at the distance", () => {
    expect(linkPairs([{ x: 0, y: 0 }, { x: 3, y: 4 }], 5)).toHaveLength(1);
  });
  it("uses z when present", () => {
    expect(linkPairs([{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 6 }], 5)).toEqual([]);
  });
  it("never links a point to itself and never repeats a pair", () => {
    const links = linkPairs([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], 10);
    expect(links).toHaveLength(3);
  });
});

describe("shouldRenderMesh", () => {
  it("renders at the breakpoint with motion allowed", () => {
    expect(shouldRenderMesh({ width: MESH_BREAKPOINT, reducedMotion: false })).toBe(true);
  });
  it("does not render one pixel below the breakpoint", () => {
    expect(shouldRenderMesh({ width: MESH_BREAKPOINT - 1, reducedMotion: false })).toBe(false);
  });
  it("does not render under reduced motion at any width", () => {
    expect(shouldRenderMesh({ width: 1920, reducedMotion: true })).toBe(false);
  });
});

describe("constants", () => {
  it("exposes the hero mesh sizing", () => {
    expect(HERO_NODE_COUNT).toBe(120);
    expect(HERO_LINK_DISTANCE).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
npm test -- tests/mesh.test.ts
```

Expected: FAIL — cannot resolve `@/lib/mesh`.

- [ ] **Step 3: Write `lib/mesh.ts`**

```ts
/** Pure geometry and gating maths for the node-mesh visuals.
 *  No DOM, no three.js, no React — so it is unit-testable under jsdom
 *  and shared by the 2D background canvas and the 3D hero scene. */

export type Point = { x: number; y: number; z?: number };
export type Link = { a: number; b: number; distance: number };

/** Viewport width at or above which the 3D hero mesh is allowed to mount. */
export const MESH_BREAKPOINT = 768;
/** Link radius in CSS pixels for the 2D background canvas. */
export const LINK_DISTANCE_2D = 155;
/** Node count for the 3D hero scene (fixed — the scene is a fixed-size object). */
export const HERO_NODE_COUNT = 120;
/** Link radius in world units for the 3D hero scene. */
export const HERO_LINK_DISTANCE = 3.2;

const ACCENT_FALLBACK: [number, number, number] = [99, 102, 241]; // indigo-500

/** Reads a `#rrggbb` CSS custom property value into an RGB triplet. */
export function parseAccent(value: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return ACCENT_FALLBACK;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Caps device pixel ratio at 2 so retina displays do not quadruple fill cost. */
export function clampDpr(dpr: number): number {
  if (!Number.isFinite(dpr) || dpr < 1) return 1;
  return Math.min(dpr, 2);
}

/** Viewport-area-derived node count for the 2D background canvas. */
export function nodeCount(width: number, height: number): number {
  return Math.min(90, Math.max(30, Math.floor((width * height) / 16000)));
}

/** Every unordered pair of points within `maxDistance`, inclusive of the boundary. */
export function linkPairs(points: Point[], maxDistance: number): Link[] {
  const links: Link[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dz = (points[i].z ?? 0) - (points[j].z ?? 0);
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance <= maxDistance) links.push({ a: i, b: j, distance });
    }
  }
  return links;
}

/** The 3D hero mesh mounts only on wide viewports with motion allowed. */
export function shouldRenderMesh({
  width,
  reducedMotion,
}: {
  width: number;
  reducedMotion: boolean;
}): boolean {
  return width >= MESH_BREAKPOINT && !reducedMotion;
}
```

- [ ] **Step 4: Run the test and confirm it passes**

```bash
npm test -- tests/mesh.test.ts
```

Expected: PASS, 17 tests.

- [ ] **Step 5: Refactor `BackgroundFX.tsx` onto the module**

In `components/BackgroundFX.tsx`, add the import below the existing React import:

```tsx
import { clampDpr, LINK_DISTANCE_2D, linkPairs, nodeCount, parseAccent } from "@/lib/mesh";
```

Delete the local `accentRGB` function (lines 30-39) and the `LINK_DIST` constant (line 42), and replace the accent read with:

```tsx
    function accentRGB(): [number, number, number] {
      return parseAccent(
        getComputedStyle(document.documentElement).getPropertyValue("--accent"),
      );
    }
    let [r, g, b] = accentRGB();
```

In `build()`, replace the DPR and count lines with:

```tsx
      dpr = clampDpr(window.devicePixelRatio || 1);
```

```tsx
      const count = nodeCount(width, height);
```

Replace the nested link loop inside `draw()` — the whole `for (let j = i + 1; ...)` block — with a single pass before the node drawing loop:

```tsx
    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (const link of linkPairs(nodes, LINK_DISTANCE_2D)) {
        const alpha = (1 - link.distance / LINK_DISTANCE_2D) * 0.4;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[link.a].x, nodes[link.a].y);
        ctx.lineTo(nodes[link.b].x, nodes[link.b].y);
        ctx.stroke();
      }

      for (const a of nodes) {
        ctx.fillStyle = `rgba(${r},${g},${b},0.12)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
```

- [ ] **Step 6: Cover the refactored component**

`BackgroundFX` has no test today, so nothing would catch the refactor breaking it. Create `tests/BackgroundFX.test.tsx`. jsdom's `<canvas>` has no 2D context unless the `canvas` package is installed, so the component must survive `getContext` returning `null` — which the existing early return at `components/BackgroundFX.tsx:17` already handles.

```tsx
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackgroundFX } from "@/components/BackgroundFX";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BackgroundFX", () => {
  it("renders a decorative canvas", () => {
    const { container } = render(<BackgroundFX />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("does not throw when no 2D context is available", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(() => render(<BackgroundFX />)).not.toThrow();
  });

  it("unmounts cleanly", () => {
    const { unmount } = render(<BackgroundFX />);
    expect(() => unmount()).not.toThrow();
  });
});
```

```bash
npm test -- tests/BackgroundFX.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Run lint and the full suite**

```bash
npm run lint
```

Expected: no errors. If an unused-variable error appears, a leftover from the deleted inline maths was missed.

```bash
npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/mesh.ts tests/mesh.test.ts tests/BackgroundFX.test.tsx components/BackgroundFX.tsx
git commit -m "refactor: extract node-mesh maths into a tested lib/mesh module"
```

---

### Task 3: GSAP foundation and `Reveal`, migrating `Projects`

**Files:**
- Create: `lib/gsap.ts`, `components/Reveal.tsx`, `tests/Reveal.test.tsx`
- Modify: `package.json` (add `gsap`), `components/Projects.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `lib/gsap.ts` exports `gsap`, `ScrollTrigger`, `prefersReducedMotion(): boolean`, `useIsomorphicLayoutEffect` (React's `useLayoutEffect` in the browser, `useEffect` on the server).
  - `components/Reveal.tsx` exports `Reveal({ children, delay?, className? })`.

- [ ] **Step 1: Install GSAP**

```bash
npm install gsap@^3.15.0
```

Expected: `package.json` dependencies gain `"gsap": "^3.15.0"`. GSAP core, ScrollTrigger, and SplitText are free under the standard licence as of 3.13 — no Club membership needed.

- [ ] **Step 2: Write the failing test**

Create `tests/Reveal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/Reveal";

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: reduce,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("renders its children under reduced motion", () => {
    stubReducedMotion(true);
    render(<Reveal>visible content</Reveal>);
    expect(screen.getByText("visible content")).toBeInTheDocument();
  });

  it("renders its children with motion enabled", () => {
    stubReducedMotion(false);
    render(<Reveal>visible content</Reveal>);
    expect(screen.getByText("visible content")).toBeInTheDocument();
  });

  it("leaves content visible after unmount", () => {
    stubReducedMotion(false);
    const { unmount } = render(<Reveal>visible content</Reveal>);
    expect(() => unmount()).not.toThrow();
  });

  it("passes through a className", () => {
    stubReducedMotion(true);
    const { container } = render(<Reveal className="grid-item">x</Reveal>);
    expect(container.querySelector(".grid-item")).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run the test and confirm it fails**

```bash
npm test -- tests/Reveal.test.tsx
```

Expected: FAIL — cannot resolve `@/components/Reveal`.

- [ ] **Step 4: Write `lib/gsap.ts`**

```ts
"use client";

import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once at module scope. Every animating component imports gsap from
// here rather than registering plugins itself, so a second registration cannot
// happen during React Strict Mode's double-invoked effects in development.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** useLayoutEffect in the browser, useEffect on the server — animation setup must
 *  run before paint, but useLayoutEffect warns during server rendering. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** True when the user has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
```

- [ ] **Step 5: Write `components/Reveal.tsx`**

```tsx
"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";

/** Fades and rises its children once, when they scroll into view.
 *  Renders children unconditionally — content never depends on animation running. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, el);

    // revert() kills the tween and its ScrollTrigger and restores inline styles,
    // so an unmount mid-animation cannot leave content stuck at opacity 0.
    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Run the test and confirm it passes**

```bash
npm test -- tests/Reveal.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 7: Migrate `Projects.tsx` off framer-motion**

Replace the whole file with:

```tsx
"use client";

import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import type { Project } from "@/lib/github";

export function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeading index="01" title="Projects" />
      {projects.length === 0 ? (
        <p className="text-[var(--fg-muted)]">No projects to show yet — check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            // stagger capped at 6 cards so a long list never delays the last card
            <Reveal key={project.name} delay={Math.min(i, 5) * 0.06}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 8: Run the existing Projects tests**

```bash
npm test -- tests/Projects.test.tsx
```

Expected: PASS, 2 tests. Cards must still render — this is the check that `Reveal` does not gate content behind a scroll trigger that never fires in jsdom.

- [ ] **Step 9: Run the full suite and lint**

```bash
npm test
```

Expected: PASS.

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json lib/gsap.ts components/Reveal.tsx tests/Reveal.test.tsx components/Projects.tsx
git commit -m "feat: add GSAP foundation and migrate project reveals off framer-motion"
```

---

### Task 4: Hero entrance on GSAP, framer-motion removed

**Files:**
- Modify: `components/Hero.tsx`, `package.json` (remove `framer-motion`), `README.md:3` and the Tech Stack list

**Interfaces:**
- Consumes: `gsap`, `prefersReducedMotion`, `useIsomorphicLayoutEffect` from `@/lib/gsap`.
- Produces: a `<section id="top">` carrying `data-hero` on the root and `data-hero-item` on each animated block. Task 5 mounts the mesh inside this section and Task 6 uses the section as its ScrollTrigger trigger.

- [ ] **Step 1: Rewrite `components/Hero.tsx`**

The copy already changed in Task 1; this replaces the framer-motion elements with plain markup plus one GSAP timeline. Note `relative` on the section — Task 5 positions the mesh against it.

```tsx
"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";

const metrics = [
  { value: "6", label: "shipped projects" },
  { value: "220+", label: "automated tests" },
  { value: "5", label: "live deployments" },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-item]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      data-hero
      className="relative mx-auto flex min-h-[88svh] max-w-5xl flex-col justify-center px-6 py-20"
    >
      <p
        data-hero-item
        className="mb-6 font-[family-name:var(--font-mono)] text-sm text-[var(--fg-muted)]"
      >
        <span className="text-[var(--ok)]">~/gabryel</span>{" "}
        <span className="text-[var(--accent-text)]">$</span> whoami
      </p>

      <h1
        data-hero-item
        className="font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
      >
        Software engineer who ships{" "}
        <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--highlight)] bg-clip-text text-transparent">
          reliable systems
        </span>
        .
      </h1>

      <p
        data-hero-item
        className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--fg-muted)]"
      >
        Computer Science student building production-grade APIs in Python (FastAPI) and
        Java (Spring Boot) — payments, ledgers, async services, and reliable delivery —
        plus fullstack tools with React and TypeScript.
      </p>

      <div data-hero-item className="mt-10 flex flex-wrap gap-3">
        <a
          href="#projects"
          className="rounded-lg bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--accent-contrast)] transition-colors hover:opacity-90"
        >
          View projects
        </a>
        <a
          href="/cv.pdf"
          className="rounded-lg border border-[var(--border-strong)] px-6 py-3 font-semibold transition-colors hover:bg-[var(--surface)]"
        >
          Download CV
        </a>
      </div>

      <dl
        data-hero-item
        className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-[var(--border)] pt-8"
      >
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="tnum font-[family-name:var(--font-mono)] text-3xl font-bold text-[var(--accent-text)]">
              {m.value}
            </dt>
            <dd className="mt-1 text-sm text-[var(--fg-muted)]">{m.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 2: Run the copy tests to confirm the hero still renders**

```bash
npm test -- tests/copy.test.tsx
```

Expected: PASS, 7 tests. The heading and CTAs must render with GSAP inert under jsdom.

- [ ] **Step 3: Remove framer-motion**

```bash
npm uninstall framer-motion
```

- [ ] **Step 4: Verify nothing still imports it**

```bash
git grep -n "framer-motion" -- "*.tsx" "*.ts"
```

Expected: no output. Any hit is a missed migration — fix it before continuing.

- [ ] **Step 5: Update the README stack references**

`README.md:3` — replace the description line with:

```markdown
A bold, dark-mode personal portfolio showcasing fintech services and fullstack software engineering work, built with **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, and **GSAP** for scroll-driven animation and a WebGL hero.
```

`README.md:10` — replace the animations line with:

```markdown
- **Animations**: GSAP (ScrollTrigger) + three.js (WebGL hero)
```

- [ ] **Step 6: Run the full suite and lint**

```bash
npm test
```

Expected: PASS.

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add components/Hero.tsx package.json package-lock.json README.md
git commit -m "feat: move hero entrance to GSAP and drop framer-motion"
```

---

### Task 5: The WebGL hero mesh

Entrance and idle motion only. Task 6 adds the scroll rig. Splitting them keeps a WebGL bring-up failure separable from choreography tuning.

**Files:**
- Create: `components/HeroMesh.tsx`, `tests/HeroMesh.test.tsx`
- Modify: `package.json` (add `three`, `@types/three`), `components/Hero.tsx`

**Interfaces:**
- Consumes: `clampDpr`, `parseAccent`, `linkPairs`, `HERO_NODE_COUNT`, `HERO_LINK_DISTANCE`, `shouldRenderMesh` from `@/lib/mesh`; `prefersReducedMotion` from `@/lib/gsap`.
- Produces: `components/HeroMesh.tsx` exports `HeroMesh({ className? })`. Task 6 extends this same component's effect with the ScrollTrigger rig.

- [ ] **Step 1: Install three.js**

```bash
npm install three@^0.185.1
```

```bash
npm install -D @types/three@^0.185.4
```

- [ ] **Step 2: Write the failing test**

Create `tests/HeroMesh.test.tsx`. It only exercises the gate — jsdom cannot create a WebGL context, so the enabled path is never rendered here.

```tsx
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroMesh } from "@/components/HeroMesh";

function stubEnvironment({ width, reduce }: { width: number; reduce: boolean }) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: reduce,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HeroMesh gate", () => {
  it("renders nothing below the breakpoint", () => {
    stubEnvironment({ width: 500, reduce: false });
    const { container } = render(<HeroMesh />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing under reduced motion on a wide viewport", () => {
    stubEnvironment({ width: 1440, reduce: true });
    const { container } = render(<HeroMesh />);
    expect(container.firstChild).toBeNull();
  });

  it("leaves the background canvas at full opacity when gated off", () => {
    stubEnvironment({ width: 500, reduce: false });
    render(<HeroMesh />);
    expect(
      document.documentElement.style.getPropertyValue("--bg-fx-opacity"),
    ).not.toBe("0");
  });
});
```

- [ ] **Step 3: Run the test and confirm it fails**

```bash
npm test -- tests/HeroMesh.test.tsx
```

Expected: FAIL — cannot resolve `@/components/HeroMesh`.

- [ ] **Step 4: Write `components/HeroMesh.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/gsap";
import {
  clampDpr,
  HERO_LINK_DISTANCE,
  HERO_NODE_COUNT,
  linkPairs,
  parseAccent,
  shouldRenderMesh,
  type Point,
} from "@/lib/mesh";

/** A 3D evolution of the site's service-mesh motif: nodes on a rough spherical
 *  shell, linked where they are close. Desktop-only, motion-allowed-only; the 2D
 *  BackgroundFX canvas is the fallback everywhere else. */
export function HeroMesh({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  // Gate is evaluated on the client and re-evaluated on resize, so rotating a
  // tablet across the breakpoint mounts or unmounts the scene.
  useEffect(() => {
    const evaluate = () =>
      setEnabled(
        shouldRenderMesh({
          width: window.innerWidth,
          reducedMotion: prefersReducedMotion(),
        }),
      );
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  useEffect(() => {
    if (!enabled || !host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL: leave the 2D background canvas as the hero visual.
      return;
    }

    renderer.setPixelRatio(clampDpr(window.devicePixelRatio || 1));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      host.clientWidth / Math.max(host.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.set(0, 0, 14);

    const group = new THREE.Group();
    scene.add(group);

    // Home positions: a flattened spherical shell, so the mesh reads as a volume
    // rather than a ball. Every frame's positions are home * spread.
    const home = new Float32Array(HERO_NODE_COUNT * 3);
    const homePoints: Point[] = [];
    for (let i = 0; i < HERO_NODE_COUNT; i++) {
      const radius = 5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
      const z = radius * Math.cos(phi);
      home[i * 3] = x;
      home[i * 3 + 1] = y;
      home[i * 3 + 2] = z;
      homePoints.push({ x, y, z });
    }

    // Link topology is computed once from the home positions and then held fixed,
    // so dispersing the nodes stretches the existing links instead of rewiring
    // the graph every frame.
    const links = linkPairs(homePoints, HERO_LINK_DISTANCE);

    const nodePositions = new Float32Array(home);
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));

    const linkPositions = new Float32Array(links.length * 6);
    const linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute("position", new THREE.BufferAttribute(linkPositions, 3));

    const [r, g, b] = parseAccent(
      getComputedStyle(document.documentElement).getPropertyValue("--accent"),
    );
    const accent = new THREE.Color(r / 255, g / 255, b / 255);

    const nodeMaterial = new THREE.PointsMaterial({
      color: accent,
      size: 0.14,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const linkMaterial = new THREE.LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    });

    group.add(new THREE.Points(nodeGeometry, nodeMaterial));
    group.add(new THREE.LineSegments(linkGeometry, linkMaterial));

    // Single source of animated truth. Task 6's scroll rig writes to `spread`,
    // `linkOpacity` and `cameraZ`; the entrance tween writes `spread` too.
    const state = { spread: 3, linkOpacity: 0.28, cameraZ: 14 };
    const entranceStart = performance.now();
    const ENTRANCE_MS = 1200;

    function writePositions() {
      for (let i = 0; i < HERO_NODE_COUNT * 3; i++) {
        nodePositions[i] = home[i] * state.spread;
      }
      for (let i = 0; i < links.length; i++) {
        const a = links[i].a * 3;
        const c = links[i].b * 3;
        linkPositions[i * 6] = nodePositions[a];
        linkPositions[i * 6 + 1] = nodePositions[a + 1];
        linkPositions[i * 6 + 2] = nodePositions[a + 2];
        linkPositions[i * 6 + 3] = nodePositions[c];
        linkPositions[i * 6 + 4] = nodePositions[c + 1];
        linkPositions[i * 6 + 5] = nodePositions[c + 2];
      }
      nodeGeometry.attributes.position.needsUpdate = true;
      linkGeometry.attributes.position.needsUpdate = true;
    }

    let raf = 0;
    let running = false;

    function tick(now: number) {
      // Entrance: nodes fly in from 3x their home radius over 1.2s, ease-out cubic.
      const t = Math.min((now - entranceStart) / ENTRANCE_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      if (t < 1) state.spread = 3 - 2 * eased;

      group.rotation.y += 0.0008;
      camera.position.z = state.cameraZ;
      linkMaterial.opacity = state.linkOpacity;
      writePositions();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onResize() {
      renderer.setSize(host!.clientWidth, host!.clientHeight, false);
      camera.aspect = host!.clientWidth / Math.max(host!.clientHeight, 1);
      camera.updateProjectionMatrix();
    }

    function onContextLost(event: Event) {
      event.preventDefault();
      stop();
      renderer.domElement.style.opacity = "0";
    }

    // Re-read the accent when the theme toggles, same trick as BackgroundFX.
    const themeObserver = new MutationObserver(() => {
      const [nr, ng, nb] = parseAccent(
        getComputedStyle(document.documentElement).getPropertyValue("--accent"),
      );
      nodeMaterial.color.setRGB(nr / 255, ng / 255, nb / 255);
      linkMaterial.color.setRGB(nr / 255, ng / 255, nb / 255);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    start();

    return () => {
      stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      nodeGeometry.dispose();
      linkGeometry.dispose();
      nodeMaterial.dispose();
      linkMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [enabled, host]);

  if (!enabled) return null;
  return <div ref={setHost} aria-hidden="true" className={className} />;
}
```

- [ ] **Step 5: Run the test and confirm it passes**

```bash
npm test -- tests/HeroMesh.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 6: Mount the mesh in the hero**

In `components/Hero.tsx`, add below the existing imports:

```tsx
import dynamic from "next/dynamic";

// ssr: false keeps three.js out of the server-rendered HTML and out of the
// initial chunk, so the hero text stays the LCP element.
const HeroMesh = dynamic(() => import("@/components/HeroMesh").then((m) => m.HeroMesh), {
  ssr: false,
});
```

Insert as the first child of the `<section>`, before the `~/gabryel` paragraph:

```tsx
      <HeroMesh className="pointer-events-none absolute inset-0 -z-10" />
```

- [ ] **Step 7: Verify in the browser**

Start the dev server via the preview tooling using the existing `.claude/launch.json` config named `portfolio`, then check the console for errors and take a screenshot of the hero. Expected: a rotating indigo node-mesh behind the headline, no console errors, nodes visibly flying inward over the first ~1.2 seconds after load.

- [ ] **Step 8: Run the full suite and lint**

```bash
npm test
```

Expected: PASS.

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json components/HeroMesh.tsx tests/HeroMesh.test.tsx components/Hero.tsx
git commit -m "feat: add WebGL node-mesh hero behind the headline"
```

---

### Task 6: Scroll choreography and the background handoff

**Files:**
- Modify: `components/HeroMesh.tsx` (add the ScrollTrigger rig), `components/BackgroundFX.tsx` (opacity driven by a CSS variable), `app/globals.css` (declare the variable)

**Interfaces:**
- Consumes: `ScrollTrigger` from `@/lib/gsap`; the `data-hero` attribute on the hero section from Task 4.
- Produces: the CSS custom property `--bg-fx-opacity` on `document.documentElement`, read by `BackgroundFX`. Default 1; the hero mesh drives it to 0 while it owns the screen.

- [ ] **Step 1: Declare the variable and wire the background canvas**

In `app/globals.css`, add to the `:root` block, after `--grid`:

```css
  /* 1 by default; the 3D hero drives this to 0 while it owns the viewport. */
  --bg-fx-opacity: 1;
```

In `components/BackgroundFX.tsx`, replace the returned canvas with:

```tsx
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ opacity: "var(--bg-fx-opacity, 1)" }}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
```

- [ ] **Step 2: Add the scroll rig to `HeroMesh.tsx`**

Extend the import from `@/lib/gsap` — add `ScrollTrigger` only. Do not import `gsap` or `useIsomorphicLayoutEffect` here; this component uses neither and lint will fail on the unused bindings.

```tsx
import { prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
```

Immediately after `start();` in the WebGL effect, insert the rig:

```tsx
    // Scroll choreography, scrubbed against the hero section's own progress.
    //   0.0-0.3  camera dollies back
    //   0.3-0.7  nodes disperse, links fade out
    //   0.7-1.0  scene fades out, the 2D background canvas fades in
    const trigger = host.closest("[data-hero]") ?? host;
    const scrollState = { progress: 0 };

    function applyProgress(p: number) {
      state.cameraZ = 14 + 6 * p;
      state.spread = 1 + 1.8 * Math.min(Math.max((p - 0.3) / 0.4, 0), 1);
      state.linkOpacity = 0.28 * (1 - Math.min(Math.max((p - 0.3) / 0.4, 0), 1));
      const handoff = Math.min(Math.max((p - 0.7) / 0.3, 0), 1);
      nodeMaterial.opacity = 0.95 * (1 - handoff);
      document.documentElement.style.setProperty("--bg-fx-opacity", String(handoff));
    }

    const scrollTrigger = ScrollTrigger.create({
      trigger: trigger as Element,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: (self) => {
        scrollState.progress = self.progress;
        applyProgress(self.progress);
      },
      onToggle: (self) => {
        // Stop burning frames once the hero is off screen.
        if (self.isActive) start();
        else stop();
      },
    });

    applyProgress(0);
```

Guard the entrance tween so it stops fighting the scroll rig — replace the entrance lines inside `tick` with:

```tsx
      const t = Math.min((now - entranceStart) / ENTRANCE_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      if (t < 1 && scrollState.progress < 0.05) state.spread = 3 - 2 * eased;
```

Add to the cleanup return, before `nodeGeometry.dispose()`:

```tsx
      scrollTrigger.kill();
      document.documentElement.style.setProperty("--bg-fx-opacity", "1");
```

- [ ] **Step 3: Reset the variable when the mesh is gated off**

In the gate effect, after `evaluate();` add the reset so a resize below the breakpoint restores the background immediately:

```tsx
    if (!shouldRenderMesh({ width: window.innerWidth, reducedMotion: prefersReducedMotion() })) {
      document.documentElement.style.setProperty("--bg-fx-opacity", "1");
    }
```

- [ ] **Step 4: Extend the gate test**

Append to `tests/HeroMesh.test.tsx` inside the existing `describe`:

```tsx
  it("restores the background canvas opacity when gated off", () => {
    document.documentElement.style.setProperty("--bg-fx-opacity", "0");
    stubEnvironment({ width: 500, reduce: false });
    render(<HeroMesh />);
    expect(document.documentElement.style.getPropertyValue("--bg-fx-opacity")).toBe("1");
  });
```

- [ ] **Step 5: Run the tests**

```bash
npm test -- tests/HeroMesh.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 6: Verify the choreography in the browser**

With the dev server running, scroll the hero out of view and confirm: the camera pulls back, nodes spread apart, links fade, the 3D scene fades out as the 2D background canvas fades in, and the two are never both strongly visible. Read the console for errors. Take a screenshot at roughly half-scroll.

- [ ] **Step 7: Run the full suite and lint**

```bash
npm test
```

Expected: PASS.

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add components/HeroMesh.tsx components/BackgroundFX.tsx app/globals.css tests/HeroMesh.test.tsx
git commit -m "feat: scroll-drive the hero mesh and hand off to the background canvas"
```

---

### Task 7: Verification pass

No new behaviour. This task exists because the spec's risks are measurable claims, and claiming them without measurement is how a high-scoring site quietly regresses.

**Files:**
- Modify: none expected. Fix anything this task surfaces.

**Interfaces:**
- Consumes: everything built above.
- Produces: nothing.

- [ ] **Step 1: Production build**

```bash
npm run build
```

Expected: build succeeds. Record the First Load JS figure for `/`.

- [ ] **Step 2: Confirm three.js is not in the initial chunk**

Read the route table `npm run build` prints. `/` First Load JS must not have grown by anything close to three.js's ~150KB gzipped versus the pre-change baseline. Then confirm three.js landed in its own lazy chunk:

```bash
grep -rl "WebGLRenderer" .next/static/chunks | head
```

Expected: one or more chunk files, none of which is the shared framework or main-app chunk referenced by every route. If three.js appears in the initial chunk, the `next/dynamic` boundary is wrong — the import must not be reachable from a statically imported module path.

- [ ] **Step 3: Full test suite**

```bash
npm test
```

Expected: PASS across all test files, including the six that predate this work.

- [ ] **Step 4: Lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 5: Browser checks**

With the dev server running, verify each of these and capture a screenshot for the first:

1. Desktop, default theme: mesh visible, entrance plays, scroll choreography runs.
2. Theme toggle mid-animation: node and link colours follow the accent, no crash.
3. Viewport resized to the mobile preset and reloaded: no `<canvas>` from `HeroMesh` in the hero, `BackgroundFX` visible at full opacity, no WebGL errors in the console.
4. Console and network panels clean across all of the above.

- [ ] **Step 6: Reduced-motion check**

In the browser console, confirm the gate short-circuits without needing an OS setting change:

```js
window.matchMedia("(prefers-reduced-motion: reduce)").matches
```

Then verify by emulating reduced motion in the rendering settings and reloading: no hero canvas, background canvas static, no rAF loop running.

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: address verification findings for the 3D hero"
```

If nothing needed fixing, skip this step rather than making an empty commit.

---

## Notes for the implementer

- `git grep -n "framer-motion"` returning nothing is the completion signal for the migration, not "the site looks fine".
- If `THREE.WebGLRenderer` construction throws in a real browser, that is a genuine failure worth investigating; the `try`/`catch` exists for hostile environments and headless contexts, not to paper over a broken scene.
- The three scroll phases in Task 6 are a starting point. Tuning the numbers after seeing them move is expected and does not require revisiting the spec.
