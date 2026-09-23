# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio as an evidence-first, Vercel-style monochrome site with three case studies at `/work/<slug>`. The 3D hero, animated canvas and GSAP go.

**Architecture:**
- Next.js 16 App Router pages are server components by default. The only client components are the theme toggle and the case-study table of contents.
- Case-study metadata lives in a typed registry, `lib/work.ts`. Prose lives in MDX files under `content/work/`.
- Diagrams are inline SVG React components. Styling is plain CSS files ported from the approved mockup, with Tailwind 4 kept for utilities.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, TypeScript, Tailwind CSS 4, `@next/mdx` 16.2.9, `@vercel/analytics`, `@fontsource/inter` (preview images only), Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-23-portfolio-redesign-design.md`
**Approved mockup:** `docs/superpowers/mockups/2026-09-23-redesign-mockup.html`. Open it in a browser; it's the visual contract.

## Global Constraints

- Branch `redesign`. Never push to `main`. Commit after every task, and end every commit message with:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Next 16: `params` is a Promise and must be awaited. Read `node_modules/next/dist/docs/` before using any Next API not shown in this plan (`AGENTS.md`).
- **Fonts:** Inter and JetBrains Mono only. Space Grotesk is removed. Mono is for labels, metadata, data and code, never paragraphs.
- **Accent** (`--accent`) appears only on links, focus rings and the active nav item. The only other place is a diagram's hot path while its entry is hovered or focused.
- **Green** (`--live`) is used only for the live-status dot.
- No gradient text, no hero counters, no GSAP, no three.js, no canvas.
- **Motion:** CSS only. Content is visible by default, and everything honours `prefers-reduced-motion`.
- **Copy guards stay green.** No "student", "aspiring", "final-year" or "placement" in identity copy, and no "backend" in the page title or the CV headline (`tests/copy.test.tsx`).
- **Honesty:** every number maps to something countable. Every GitHub code link is pinned to a 40-character commit SHA.
- **Theme:** keep the `.dark` class on `<html>`, the inline no-flash script, and `ThemeToggle`'s behaviour. Dark is the default.
- The security headers in `next.config.ts` are unchanged except the CSP comment.
- **Quality bar:** WCAG 2.2 AA, Lighthouse 95+ in all four categories, lint and tests green, `next build` green.
- **Run from the repo root:** `npm test`, `npm run lint`, `npm run build`.

---

## File map

| Path | Responsibility |
| --- | --- |
| `lib/site.ts` | Site-wide constants: URL, name, role, availability, contact links, "how it was built" line |
| `lib/work.ts` | Case-study registry and pure helpers (lookup, neighbours, featured filter, slugify, pinned code URLs) |
| `lib/sequences.ts` | Data for each case study's sequence diagram |
| `lib/content.ts` | Loads a case study's MDX body by slug (mocked in tests) |
| `app/globals.css` | Tailwind import, theme bridge, imports of the style files below |
| `app/styles/tokens.css` | Colour tokens, light (`:root`) and dark (`.dark`) |
| `app/styles/base.css` | Body, selection, focus, `.wrap`, nav, buttons, section heads, footer, reveal, reduced motion |
| `app/styles/home.css` | Hero, work entries, experience, more work, about, contact |
| `app/styles/diagrams.css` | Shared SVG diagram styles and the hover draw |
| `app/styles/case-study.css` | Case-study header, metadata, body grid, TOC, prose, evidence notes, prev/next |
| `components/Nav.tsx`, `Footer.tsx`, `SectionHeading.tsx`, `LiveStatus.tsx` | Shared chrome |
| `components/Hero.tsx`, `SelectedWork.tsx`, `WorkEntry.tsx`, `Experience.tsx`, `MoreWork.tsx`, `About.tsx`, `Contact.tsx` | Home sections |
| `components/diagrams/WorkThumb.tsx` | The three bespoke home-page diagram thumbnails |
| `components/diagrams/SequenceDiagram.tsx` | Data-driven sequence diagram (wide + narrow variants) |
| `components/case-study/CaseStudyHeader.tsx`, `CaseStudyToc.tsx` (client), `CaseStudyNav.tsx`, `Evidence.tsx`, `Claim.tsx` | Case-study page parts |
| `mdx-components.tsx` | MDX element mapping (h2 ids, Claim, Evidence fallback) |
| `content/work/*.mdx` | Case-study prose |
| `app/work/page.tsx`, `app/work/[slug]/page.tsx` | Work index and case-study route |
| `app/opengraph-image.tsx`, `app/work/[slug]/opengraph-image.tsx` | Share-preview images |
| `app/sitemap.ts`, `app/robots.ts` | SEO files |

**Deleted:**
- Components: `components/HeroMesh.tsx`, `components/BackgroundFX.tsx`, `components/Reveal.tsx`, `components/Projects.tsx`, `components/ProjectCard.tsx`
- Libraries: `lib/mesh.ts`, `lib/gsap.ts`
- Tests: `tests/HeroMesh.test.tsx`, `tests/BackgroundFX.test.tsx`, `tests/mesh.test.ts`, `tests/Reveal.test.tsx`, `tests/Projects.test.tsx`, `tests/ProjectCard.test.tsx`
- Dependencies: `gsap`, `three`, `@types/three`

---

### Task 1: Foundation: site constants, tokens, fonts, layout

**Files:**
- Create: `lib/site.ts`, `tests/site.test.ts`, `app/styles/tokens.css`, `app/styles/base.css`
- Modify: `app/globals.css` (full rewrite), `app/layout.tsx`
- Delete: `components/BackgroundFX.tsx`, `tests/BackgroundFX.test.tsx`

**Interfaces:**
- Produces:
  - `SITE_URL: string` (no trailing slash), `SITE_NAME`, `ROLE`
  - `AVAILABILITY: { roles: string; place: string; when: string }`, `CONTACT_LINE: string`, `BUILT_WITH: string`
  - `LINKS: { email; emailLabel; github; linkedin; cv; source }`
  - The CSS custom properties in `tokens.css`; the classes `.wrap`, `.mono`, `.btn`, `.btn-solid`, `.btn-line`, `.nav`, `.sec-head`, `.sec-sub`, `section.block`, `.foot`, `.reveal`, `.skip`
  - The font variables `--font-inter` and `--font-jetbrains`

- [ ] **Step 1: Write the failing test** `tests/site.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { AVAILABILITY, BUILT_WITH, CONTACT_LINE, LINKS, ROLE, SITE_NAME, SITE_URL } from "@/lib/site";

describe("site constants", () => {
  it("uses an https site URL without a trailing slash", () => {
    expect(SITE_URL).toMatch(/^https:\/\/[^/]+$/);
  });

  it("names the person and the role", () => {
    expect(SITE_NAME).toBe("Gabryel Veríssimo");
    expect(ROLE).toBe("Software Engineer");
  });

  it("states availability for graduate and junior roles from summer 2027", () => {
    expect(CONTACT_LINE).toBe(
      "Open to graduate and junior software engineer roles in London from summer 2027.",
    );
    expect(AVAILABILITY).toEqual({
      roles: "Open to graduate & junior roles",
      place: "London",
      when: "from summer 2027",
    });
  });

  it("discloses AI-assisted development", () => {
    expect(BUILT_WITH).toMatch(/AI-assisted development \(Claude Code\)/);
  });

  it("links to real destinations", () => {
    expect(LINKS.email).toBe("mailto:gabryelverissimo12@gmail.com");
    expect(LINKS.github).toBe("https://github.com/gabryelvs");
    expect(LINKS.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
    expect(LINKS.cv).toBe("/cv.pdf");
    expect(LINKS.source).toBe("https://github.com/gabryelvs/portfolio");
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/site.test.ts`
Expected: FAIL, `Cannot find module '@/lib/site'`.

- [ ] **Step 3: Create `lib/site.ts`**

```ts
/** Site-wide facts. The single source for metadata, UI copy and links. */

// Swap to https://gabryelverissimo.dev once the domain is live (see spec, Rollout step 8).
export const SITE_URL = "https://portfolio-gabryelverissimo.vercel.app";

export const SITE_NAME = "Gabryel Veríssimo";
export const ROLE = "Software Engineer";

export const AVAILABILITY = {
  roles: "Open to graduate & junior roles",
  place: "London",
  when: "from summer 2027",
} as const;

export const CONTACT_LINE =
  "Open to graduate and junior software engineer roles in London from summer 2027.";

export const BUILT_WITH =
  "AI-assisted development (Claude Code). I set the design and direction, reviewed each change, and verified it with the tests below.";

export const LINKS = {
  email: "mailto:gabryelverissimo12@gmail.com",
  emailLabel: "gabryelverissimo12@gmail.com",
  github: "https://github.com/gabryelvs",
  linkedin: "https://www.linkedin.com/in/gabryel-ver%C3%ADssimo-b1b931261",
  cv: "/cv.pdf",
  source: "https://github.com/gabryelvs/portfolio",
} as const;
```

- [ ] **Step 4: Run it to see it pass**

Run: `npx vitest run tests/site.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Write `app/styles/tokens.css`**

```css
/* Colour tokens. Light on :root, dark on .dark (dark is the default via the inline script in layout). */
:root {
  --bg: #fafafa;
  --surface-1: #ffffff;
  --surface-2: #f3f3f4;
  --surface-3: #ececee;
  --line: #e8e8e8;
  --line-strong: #d6d6d8;
  --fg: #171717;
  --fg-2: #404047;
  --muted: #6b6b70;
  --accent: #4f46e5;
  --accent-soft: rgba(79, 70, 229, 0.1);
  --live: #15803d;
  --grid: rgba(0, 0, 0, 0.045);
  --btn-bg: #171717;
  --btn-fg: #fafafa;
  --code-bg: #ffffff;
  --selection: rgba(79, 70, 229, 0.18);
  color-scheme: light;
}

.dark {
  --bg: #08090a;
  --surface-1: #0e0f11;
  --surface-2: #141518;
  --surface-3: #1b1c20;
  --line: #202226;
  --line-strong: #2f3137;
  --fg: #f7f8f8;
  --fg-2: #b6bac1;
  --muted: #8a8f98;
  --accent: #9296fb;
  --accent-soft: rgba(146, 150, 251, 0.14);
  --live: #3ecf8e;
  --grid: rgba(255, 255, 255, 0.04);
  --btn-bg: #f7f8f8;
  --btn-fg: #08090a;
  --code-bg: #0e0f11;
  --selection: rgba(146, 150, 251, 0.32);
  color-scheme: dark;
}
```

- [ ] **Step 6: Write `app/styles/base.css`**

```css
html {
  background: var(--bg);
  color: var(--fg);
  scrollbar-color: var(--line-strong) var(--bg);
  -webkit-text-size-adjust: 100%;
}
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans);
  font-optical-sizing: auto;
  font-size: 16px;
  line-height: 1.6;
  font-feature-settings: "cv11", "ss01";
  -webkit-font-smoothing: antialiased;
  caret-color: var(--accent);
}
::selection { background: var(--selection); color: var(--fg); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }
.mono { font-family: var(--font-mono); font-feature-settings: "calt" 0; }
.wrap { width: min(1120px, 100% - 48px); margin-inline: auto; }
@media (max-width: 640px) { .wrap { width: calc(100% - 32px); } }

.skip {
  position: absolute; left: 16px; top: -48px; z-index: 30;
  padding: 8px 12px; border-radius: 6px; background: var(--btn-bg); color: var(--btn-fg);
  font-size: 14px; font-weight: 500;
}
.skip:focus { top: 12px; }

/* nav */
.nav { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--bg) 92%, transparent); border-bottom: 1px solid var(--line); }
.nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 56px; gap: 16px; }
.nav .name { font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
.nav ul { display: flex; gap: 4px; list-style: none; margin: 0; padding: 0; align-items: center; }
.nav ul a { display: block; padding: 6px 10px; font-size: 14px; color: var(--muted); border-radius: 6px; transition: color 0.15s ease-out; }
.nav ul a:hover { color: var(--fg); }
.nav ul a[aria-current] { color: var(--accent); }
@media (max-width: 720px) { .nav ul li.opt { display: none; } }
.icon-btn {
  display: grid; place-items: center; width: 32px; height: 32px; margin-left: 6px;
  border: 1px solid var(--line-strong); border-radius: 6px; background: transparent; color: var(--fg-2);
  cursor: pointer; transition: border-color 0.15s ease-out, color 0.15s ease-out;
}
.icon-btn:hover { color: var(--fg); border-color: var(--muted); }

/* buttons */
.btn {
  display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px;
  font-size: 14px; font-weight: 500; border-radius: 6px; border: 1px solid transparent;
  transition: background-color 0.15s ease-out, border-color 0.15s ease-out, color 0.15s ease-out;
}
.btn-solid { background: var(--btn-bg); color: var(--btn-fg); }
.btn-solid:hover { background: color-mix(in srgb, var(--btn-bg) 86%, var(--bg)); }
.btn-line { border-color: var(--line-strong); color: var(--fg); }
.btn-line:hover { border-color: var(--muted); background: var(--surface-2); }
.btn svg { width: 14px; height: 14px; }

/* sections */
section.block { padding: 72px 0; border-top: 1px solid var(--line); scroll-margin-top: 56px; }
.sec-head { display: flex; align-items: baseline; gap: 14px; margin: 0 0 8px; }
.sec-head h2 { margin: 0; font-size: 24px; line-height: 32px; font-weight: 600; letter-spacing: -0.02em; }
.sec-head .num { font-size: 13px; color: var(--muted); }
.sec-head.solo { margin-bottom: 36px; }
.sec-sub { margin: 0 0 40px; color: var(--muted); font-size: 15px; max-width: 60ch; }

/* footer */
.foot { border-top: 1px solid var(--line); padding: 28px 0 48px; font-size: 13px; color: var(--muted); }
.foot .wrap { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.foot a:hover { color: var(--fg); }

/* scroll reveal: CSS scroll-driven animation only where supported and wanted; visible otherwise */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% entry 40%; }
    @keyframes reveal { from { opacity: 0; transform: translateY(12px); } }
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 7: Rewrite `app/globals.css`**

The file imports style files that Tasks 2, 4 and 8 create. Until then, create each as an empty file so the build resolves them:
`touch app/styles/home.css app/styles/diagrams.css app/styles/case-study.css`

```css
@import "tailwindcss";
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/home.css";
@import "./styles/diagrams.css";
@import "./styles/case-study.css";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
}
```

- [ ] **Step 8: Update `app/layout.tsx`**

Replace the font imports and the `BackgroundFX` mount, and add `metadataBase`. Keep the title and description strings exactly as they are; the copy tests check them. The full file:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Gabryel Veríssimo — Software Engineer",
  description: "Software engineer focused on fintech and reliable systems. Building with Python, FastAPI, PostgreSQL, TypeScript, React, and modern cloud infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')!=='light')document.documentElement.classList.add('dark')}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Delete the canvas and its test**

Run: `git rm components/BackgroundFX.tsx tests/BackgroundFX.test.tsx`

- [ ] **Step 10: Run the whole suite, lint and a build**

Run: `npm test && npm run lint && npm run build`
Expected: all green. The old Hero, Projects and About components still render, just unstyled, until later tasks replace them.

- [ ] **Step 11: Commit**

```bash
git add lib/site.ts tests/site.test.ts app/styles app/globals.css app/layout.tsx
git commit -m "feat(redesign): site constants, colour tokens, Inter + JetBrains Mono, drop canvas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Chrome and hero: Nav, SectionHeading, LiveStatus, Footer, Hero (drops the 3D hero)

**Files:**
- Create: `components/Footer.tsx`, `components/LiveStatus.tsx`, `tests/Nav.test.tsx`, `tests/Footer.test.tsx`
- Modify (full rewrite): `components/Nav.tsx`, `components/SectionHeading.tsx`, `components/Hero.tsx`, `components/ThemeToggle.tsx` (classes only), `tests/Hero.test.tsx`, `tests/copy.test.tsx`
- Write: `app/styles/home.css` (hero rules; later tasks append)
- Delete: `components/HeroMesh.tsx`, `lib/mesh.ts`, `tests/HeroMesh.test.tsx`, `tests/mesh.test.ts`

**Interfaces:**
- Consumes: `lib/site.ts` (Task 1).
- Produces:
  - `Nav({ current?: "work" })` (the active item marks the current *page*: Work on `/work` pages. The spec's "active section shows the accent" is simplified here on purpose. Section-level scroll tracking on the home page would need another client component for little value.)
  - `SectionHeading({ index: string; title: string; id: string; sub?: string })`
  - `LiveStatus({ label: string })`
  - `Footer()`
  - `Hero()`

- [ ] **Step 1: Write the failing tests**

`tests/Nav.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Nav } from "@/components/Nav";

describe("Nav", () => {
  it("links the name home and offers a skip link", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Gabryel Veríssimo" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
  });

  it("links every home section", () => {
    render(<Nav />);
    for (const [name, href] of [
      ["Work", "/#work"],
      ["Experience", "/#experience"],
      ["About", "/#about"],
      ["Contact", "/#contact"],
    ]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it("marks Work as current on case-study pages only", () => {
    const { rerender } = render(<Nav />);
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current");
    rerender(<Nav current="work" />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps the theme toggle", async () => {
    render(<Nav />);
    expect(await screen.findByRole("button", { name: /theme/i })).toBeInTheDocument();
  });
});
```

`tests/Footer.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";

describe("Footer", () => {
  it("credits the name and links the source", () => {
    render(<Footer />);
    expect(screen.getByText(/© \d{4} Gabryel Veríssimo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/gabryelvs/portfolio",
    );
  });
});
```

Replace `tests/Hero.test.tsx` entirely:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/Hero";

describe("Hero", () => {
  it("uses the name as the only h1, with the role inside it", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Gabryel Veríssimo");
    expect(h1).toHaveTextContent("Software Engineer");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("states the focus and availability", () => {
    const { container } = render(<Hero />);
    expect(container).toHaveTextContent(/reliable systems for fintech/i);
    expect(container).toHaveTextContent(/Open to graduate & junior roles · London · from summer 2027/);
  });

  it("offers Selected work and Download CV", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "Selected work" })).toHaveAttribute("href", "#work");
    expect(screen.getByRole("link", { name: /Download CV/ })).toHaveAttribute("href", "/cv.pdf");
  });

  it("shows no vanity counters", () => {
    const { container } = render(<Hero />);
    expect(container).not.toHaveTextContent(/automated tests|live deployments|shipped projects/i);
    expect(container.querySelector("dl")).toBeNull();
  });
});
```

In `tests/copy.test.tsx`, make these edits:
1. Delete the `vi.mock("@/components/HeroMesh", ...)` block and the comment above it. Remove `vi` from the vitest import.
2. Replace the test `"titles the hero as a software engineer"` body with:
   ```tsx
   render(<Hero />);
   expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/software engineer/i);
   ```
   (unchanged behaviour; it still passes because the role sits inside the h1).

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run tests/Nav.test.tsx tests/Footer.test.tsx tests/Hero.test.tsx`
Expected: FAIL. Footer is missing, Nav has no skip link, and Hero has no "Selected work" link.

- [ ] **Step 3: Implement the components**

`components/LiveStatus.tsx`:
```tsx
export function LiveStatus({ label }: { label: string }) {
  return (
    <span className="status mono">
      <i aria-hidden="true" />
      {label}
    </span>
  );
}
```

`components/SectionHeading.tsx`:
```tsx
export function SectionHeading({
  index,
  title,
  id,
  sub,
}: {
  index: string;
  title: string;
  id: string;
  sub?: string;
}) {
  return (
    <>
      <div className={sub ? "sec-head" : "sec-head solo"}>
        <span className="num mono">{index}</span>
        <h2 id={id}>{title}</h2>
      </div>
      {sub ? <p className="sec-sub">{sub}</p> : null}
    </>
  );
}
```

`components/Nav.tsx`:
```tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAME } from "@/lib/site";

const LINKS = [
  { label: "Work", href: "/#work", key: "work", optional: false },
  { label: "Experience", href: "/#experience", key: "experience", optional: true },
  { label: "About", href: "/#about", key: "about", optional: true },
  { label: "Contact", href: "/#contact", key: "contact", optional: false },
] as const;

export function Nav({ current }: { current?: "work" }) {
  return (
    <header className="nav">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="wrap">
        <Link className="name" href="/">
          {SITE_NAME}
        </Link>
        <nav aria-label="Primary">
          <ul>
            {LINKS.map((l) => (
              <li key={l.key} className={l.optional ? "opt" : undefined}>
                <a href={l.href} aria-current={current === l.key ? "page" : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
```

`components/ThemeToggle.tsx`: keep the logic unchanged. Replace only the button's `className` with `"icon-btn"`, and use 15px icons with `strokeWidth="1.8"`:
```tsx
"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const isDark = localStorage.getItem("theme") !== "light"; // default dark
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="icon-btn"
    >
      {dark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
```
(Check that the current light-mode icon path in the file matches this moon path. If the current file uses a different moon path, keep the existing one.)

`components/Footer.tsx`:
```tsx
import { LINKS, SITE_NAME } from "@/lib/site";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <span>
          © {new Date().getFullYear()} {SITE_NAME}
        </span>
        <a href={LINKS.source}>Source on GitHub</a>
      </div>
    </footer>
  );
}
```

`components/Hero.tsx`:
```tsx
import type { CSSProperties } from "react";
import { AVAILABILITY, LINKS, ROLE, SITE_NAME } from "@/lib/site";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <h1 id="hero-title">
          <span data-in style={step(0)}>
            {SITE_NAME}
          </span>{" "}
          <span className="role" data-in style={step(1)}>
            {ROLE}
          </span>
        </h1>
        <p className="lede" data-in style={step(2)}>
          I build reliable systems for fintech: payments, ledgers and the services around them, in
          Python, Java and TypeScript. Every project here is tested, deployed and open to read.
        </p>
        <p className="avail mono" data-in style={step(3)}>
          <b>{AVAILABILITY.roles}</b> · {AVAILABILITY.place} · {AVAILABILITY.when}
        </p>
        <div className="actions" data-in style={step(4)}>
          <a className="btn btn-solid" href="#work">
            Selected work
          </a>
          <a className="btn btn-line" href={LINKS.cv}>
            Download CV
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
```

`app/styles/home.css` (start the file with the hero rules):
```css
/* hero */
.hero { position: relative; padding: 96px 0 72px; isolation: isolate; }
.hero::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 56px 56px; background-position: center top;
  mask-image: linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%);
}
.hero h1 { margin: 0; font-weight: 600; font-size: clamp(2.5rem, 1.3rem + 4.4vw, 4.25rem); line-height: 1.02; letter-spacing: -0.038em; text-wrap: balance; }
.hero h1 > span { display: block; }
.hero h1 .role { color: var(--muted); }
.hero .lede { margin: 28px 0 0; max-width: 58ch; font-size: 18px; line-height: 1.6; color: var(--fg-2); text-wrap: pretty; }
.hero .avail { margin: 20px 0 0; font-size: 13px; color: var(--muted); }
.hero .avail b { color: var(--fg-2); font-weight: 500; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 36px; }
@media (prefers-reduced-motion: no-preference) {
  .hero [data-in] { animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: calc(var(--i, 0) * 60ms); }
  @keyframes rise { from { opacity: 0; transform: translateY(8px); } }
}
.status { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted); font-weight: 400; letter-spacing: 0; }
.status i { width: 6px; height: 6px; border-radius: 50%; background: var(--live); box-shadow: 0 0 0 3px color-mix(in srgb, var(--live) 18%, transparent); }
```

- [ ] **Step 4: Delete the 3D hero**

Run: `git rm components/HeroMesh.tsx lib/mesh.ts tests/HeroMesh.test.tsx tests/mesh.test.ts`

- [ ] **Step 5: Run the suite and lint**

Run: `npm test && npm run lint`
Expected: PASS. The remaining old files (`Projects`, `ProjectCard`, `Reveal`, `lib/gsap`) still compile and pass their own tests.

- [ ] **Step 6: Commit**

```bash
git add -A components tests lib app/styles/home.css
git commit -m "feat(redesign): new nav, hero and footer; remove the WebGL hero

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Case-study registry and helpers

**Files:**
- Create: `lib/work.ts`, `tests/work.test.ts`

**Interfaces:**
- Consumes: `Project` type from `lib/github.ts`.
- Produces:
  - `type Slug = "payledger" | "webhook-inspector" | "taskboard-api"`
  - `type Fact = { label: string; value: string }`
  - `type CaseStudy = { slug; title; repoName; summary; facts; stack; role; tests; repoUrl; liveUrl: string | null; liveLabel: string | null; commit; thumbCaption }`
  - `CASE_STUDY_OUTLINE`, a readonly tuple of the 7 headings, and `caseStudies: CaseStudy[]`
  - `getCaseStudy(slug: string): CaseStudy | undefined`
  - `adjacentCaseStudies(slug: Slug): { prev: CaseStudy | null; next: CaseStudy | null }`
  - `withoutFeatured(projects: Project[]): Project[]`
  - `slugify(text: string): string`
  - `codeUrl(repoUrl: string, commit: string, path: string, lines?: string): string`

- [ ] **Step 1: Write the failing test** `tests/work.test.ts`

```ts
import { describe, expect, it } from "vitest";
import type { Project } from "@/lib/github";
import {
  CASE_STUDY_OUTLINE,
  adjacentCaseStudies,
  caseStudies,
  codeUrl,
  getCaseStudy,
  slugify,
  withoutFeatured,
} from "@/lib/work";

const project = (name: string): Project => ({
  name, description: "d", url: `https://github.com/gabryelvs/${name}`, homepage: null,
  language: null, topics: [], stars: 0, updatedAt: "2026-01-01T00:00:00Z",
});

describe("case-study registry", () => {
  it("lists PayLedger, Webhook Inspector and Taskboard API in that order", () => {
    expect(caseStudies.map((c) => c.slug)).toEqual(["payledger", "webhook-inspector", "taskboard-api"]);
  });

  it("has unique slugs and repo names", () => {
    expect(new Set(caseStudies.map((c) => c.slug)).size).toBe(3);
    expect(new Set(caseStudies.map((c) => c.repoName)).size).toBe(3);
  });

  it.each(caseStudies.map((c) => [c.slug, c] as const))("%s is complete and traceable", (_slug, c) => {
    expect(c.title.length).toBeGreaterThan(0);
    expect(c.summary.length).toBeGreaterThan(40);
    expect(c.facts.length).toBeGreaterThanOrEqual(2);
    expect(c.facts.length).toBeLessThanOrEqual(4);
    expect(c.stack.length).toBeGreaterThanOrEqual(3);
    expect(c.repoUrl).toBe(`https://github.com/gabryelvs/${c.repoName}`);
    expect(c.commit).toMatch(/^[0-9a-f]{40}$/);
    if (c.liveUrl !== null) {
      expect(c.liveUrl).toMatch(/^https:\/\//);
      expect(c.liveLabel).not.toBeNull();
    }
  });

  it("finds a case study by slug and rejects unknown slugs", () => {
    expect(getCaseStudy("payledger")?.title).toBe("PayLedger");
    expect(getCaseStudy("nope")).toBeUndefined();
  });

  it("links neighbours in order with open ends", () => {
    expect(adjacentCaseStudies("payledger").prev).toBeNull();
    expect(adjacentCaseStudies("payledger").next?.slug).toBe("webhook-inspector");
    expect(adjacentCaseStudies("taskboard-api").next).toBeNull();
    expect(adjacentCaseStudies("taskboard-api").prev?.slug).toBe("webhook-inspector");
  });
});

describe("helpers", () => {
  it("drops featured repos from the GitHub list", () => {
    const names = withoutFeatured([project("payledger"), project("fx-service"), project("taskboard-api")]).map((p) => p.name);
    expect(names).toEqual(["fx-service"]);
  });

  it("slugifies headings into stable anchors", () => {
    expect(CASE_STUDY_OUTLINE.map(slugify)).toEqual([
      "the-problem", "constraints", "architecture", "hard-problems", "how-its-tested", "what-id-change", "links",
    ]);
  });

  it("builds code links pinned to a commit", () => {
    const sha = "a".repeat(40);
    expect(codeUrl("https://github.com/gabryelvs/x", sha, "app/main.py")).toBe(
      `https://github.com/gabryelvs/x/blob/${sha}/app/main.py`,
    );
    expect(codeUrl("https://github.com/gabryelvs/x", sha, "app/main.py", "28-53")).toBe(
      `https://github.com/gabryelvs/x/blob/${sha}/app/main.py#L28-L53`,
    );
    expect(codeUrl("https://github.com/gabryelvs/x", sha, "app/main.py", "7")).toBe(
      `https://github.com/gabryelvs/x/blob/${sha}/app/main.py#L7`,
    );
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/work.test.ts`
Expected: FAIL, `Cannot find module '@/lib/work'`.

- [ ] **Step 3: Create `lib/work.ts`**

The facts below are verified against each repo at the pinned commit. PayLedger's entry reflects its current `main`. Task 12 updates it after the PayLedger fixes merge.

```ts
import type { Project } from "@/lib/github";

export type Slug = "payledger" | "webhook-inspector" | "taskboard-api";
export type Fact = { label: string; value: string };

export type CaseStudy = {
  slug: Slug;
  title: string;
  /** GitHub repository name; used to keep the repo out of "More work". */
  repoName: string;
  /** One line: card, page header, metadata description. */
  summary: string;
  /** 2–4 short, countable facts shown in mono on the home card. */
  facts: Fact[];
  stack: string[];
  role: string;
  /** What the test suite is, as shown in the case-study header. */
  tests: string;
  repoUrl: string;
  liveUrl: string | null;
  liveLabel: string | null;
  /** 40-char SHA every code link on the page is pinned to. */
  commit: string;
  thumbCaption: string;
};

export const CASE_STUDY_OUTLINE = [
  "The problem",
  "Constraints",
  "Architecture",
  "Hard problems",
  "How it's tested",
  "What I'd change",
  "Links",
] as const;

export const caseStudies: CaseStudy[] = [
  {
    slug: "payledger",
    title: "PayLedger",
    repoName: "payledger",
    summary: "A double-entry payments API that stays correct when transfers race and requests are retried.",
    facts: [
      { label: "Concurrency", value: "SELECT … FOR UPDATE, locked in id order" },
      { label: "Invariant", value: "Entries sum to zero per currency before any write" },
      { label: "Proof", value: "20-thread transfer test on real PostgreSQL" },
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "Alembic", "Docker"],
    role: "Solo: design, build, deploy",
    tests: "31 pytest on real PostgreSQL",
    repoUrl: "https://github.com/gabryelvs/payledger",
    liveUrl: "https://payledger-gv.fly.dev/docs",
    liveLabel: "API docs",
    commit: "48a93f4e06c97618161f01daf2f5048dbe8d844c",
    thumbCaption: "One transaction: lock, write both sides, commit.",
  },
  {
    slug: "webhook-inspector",
    title: "Webhook Inspector",
    repoName: "webhook-inspector",
    summary:
      "A public endpoint that captures any webhook sent to it and shows it live, on a 256 MB machine that must never tell the sender something went wrong.",
    facts: [
      { label: "Capture", value: "Body streamed, capped at 1 MB, always answers 200" },
      { label: "In prod", value: "Cold-start crash and wrong client IP, found live and fixed" },
      { label: "Proof", value: "27 pytest · 7 Vitest · CI on every push" },
    ],
    stack: ["FastAPI", "PostgreSQL", "React", "TypeScript", "Docker"],
    role: "Solo: design, build, deploy",
    tests: "27 pytest · 7 Vitest, run in CI",
    repoUrl: "https://github.com/gabryelvs/webhook-inspector",
    liveUrl: "https://webhook-inspector-gv.fly.dev",
    liveLabel: "Live app",
    commit: "c98d29be55d412c5a8638f8d87769fd15caa513b",
    thumbCaption: "Capture first, fail quietly, never block the sender.",
  },
  {
    slug: "taskboard-api",
    title: "Taskboard API",
    repoName: "taskboard-api",
    summary:
      "A Trello-style API where two people can drag the same card at once, and a reused refresh token signs its owner out everywhere.",
    facts: [
      { label: "Ordering", value: "Columns locked in UUID order; positions stay dense" },
      { label: "Auth", value: "Refresh rotation; reuse revokes every session" },
      { label: "Proof", value: "62 tests on real PostgreSQL (Testcontainers)" },
    ],
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "Testcontainers", "Docker"],
    role: "Solo: design, build, deploy",
    tests: "62 tests (59 integration on real PostgreSQL, 3 unit)",
    repoUrl: "https://github.com/gabryelvs/taskboard-api",
    liveUrl: "https://taskboard-gv.fly.dev/swagger-ui.html",
    liveLabel: "API docs",
    commit: "d5d852447f437738e815d2fa66cbaf287f652640",
    thumbCaption: "Lock in a fixed order; two moves never wait on each other.",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function adjacentCaseStudies(slug: Slug): { prev: CaseStudy | null; next: CaseStudy | null } {
  const i = caseStudies.findIndex((c) => c.slug === slug);
  return {
    prev: i > 0 ? caseStudies[i - 1] : null,
    next: i >= 0 && i < caseStudies.length - 1 ? caseStudies[i + 1] : null,
  };
}

const featured = new Set(caseStudies.map((c) => c.repoName));

export function withoutFeatured(projects: Project[]): Project[] {
  return projects.filter((p) => !featured.has(p.name));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function codeUrl(repoUrl: string, commit: string, path: string, lines?: string): string {
  const base = `${repoUrl}/blob/${commit}/${path}`;
  if (!lines) return base;
  const [start, end] = lines.split("-");
  return end ? `${base}#L${start}-L${end}` : `${base}#L${start}`;
}
```

- [ ] **Step 4: Run it to see it pass**

Run: `npx vitest run tests/work.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/work.ts tests/work.test.ts
git commit -m "feat(redesign): typed case-study registry with pinned commits

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Diagrams: home thumbnails and the data-driven sequence diagram

**Files:**
- Create: `components/diagrams/WorkThumb.tsx`, `components/diagrams/SequenceDiagram.tsx`, `lib/sequences.ts`, `tests/diagrams.test.tsx`
- Write: `app/styles/diagrams.css`

**Interfaces:**
- Consumes: `Slug` from `lib/work.ts`.
- Produces:
  - `WorkThumb({ slug: Slug })`
  - `type Sequence = { id: string; title: string; desc: string; caption: string; lanes: { id: string; label: string }[]; steps: SeqStep[] }`
  - `type SeqStep = { kind: "msg"; from: string; to: string; label: string; hot?: boolean } | { kind: "note"; at: string; label: string }`
  - `sequences: Record<Slug, Sequence>`
  - `SequenceDiagram({ seq: Sequence })`, which renders a `<figure className="hero-dgm">`

- [ ] **Step 1: Write the failing test** `tests/diagrams.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SequenceDiagram } from "@/components/diagrams/SequenceDiagram";
import { WorkThumb } from "@/components/diagrams/WorkThumb";
import { sequences } from "@/lib/sequences";
import { caseStudies } from "@/lib/work";

describe("WorkThumb", () => {
  it.each(caseStudies.map((c) => [c.slug] as const))("%s renders a labelled image with a drawable hot path", (slug) => {
    const { container } = render(<WorkThumb slug={slug} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAccessibleName();
    expect(img).toHaveAccessibleDescription();
    expect(container.querySelector("path.hot-draw[pathLength='1']")).not.toBeNull();
  });
});

describe("SequenceDiagram", () => {
  const seq = {
    id: "t",
    title: "Test flow",
    desc: "A test flow.",
    caption: "Caption.",
    lanes: [{ id: "a", label: "a" }, { id: "b", label: "b" }],
    steps: [
      { kind: "msg" as const, from: "a", to: "b", label: "hello", hot: true },
      { kind: "note" as const, at: "b", label: "think" },
      { kind: "msg" as const, from: "b", to: "a", label: "reply" },
    ],
  };

  it("renders a wide and a narrow variant, both labelled", () => {
    render(<SequenceDiagram seq={seq} />);
    const imgs = screen.getAllByRole("img", { name: "Test flow" });
    expect(imgs).toHaveLength(2);
    imgs.forEach((img) => expect(img).toHaveAccessibleDescription("A test flow."));
  });

  it("draws one arrow per message and marks hot steps", () => {
    const { container } = render(<SequenceDiagram seq={seq} />);
    const wide = container.querySelector("svg.dgm-wide")!;
    expect(wide.querySelectorAll("path.msg")).toHaveLength(2);
    expect(wide.querySelectorAll("path.msg.hot")).toHaveLength(1);
    expect(wide.querySelectorAll("rect.node-strong")).toHaveLength(1);
  });

  it("shows the caption", () => {
    render(<SequenceDiagram seq={seq} />);
    expect(screen.getByText("Caption.")).toBeInTheDocument();
  });

  it("has a sequence for every case study, referencing only its own lanes", () => {
    for (const c of caseStudies) {
      const s = sequences[c.slug];
      const lanes = new Set(s.lanes.map((l) => l.id));
      for (const step of s.steps) {
        if (step.kind === "msg") {
          expect(lanes.has(step.from) && lanes.has(step.to)).toBe(true);
        } else {
          expect(lanes.has(step.at)).toBe(true);
        }
      }
    }
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/diagrams.test.tsx`
Expected: FAIL, the modules don't exist.

- [ ] **Step 3: Write `app/styles/diagrams.css`**

```css
svg.dgm { display: block; width: 100%; height: auto; overflow: visible; }
.dgm text { font-family: var(--font-mono); fill: var(--fg-2); }
.dgm .t-muted { fill: var(--muted); }
.dgm .node { fill: var(--surface-2); stroke: var(--line-strong); stroke-width: 1; }
.dgm .node-strong { fill: var(--surface-3); stroke: var(--muted); stroke-width: 1; }
.dgm .link { stroke: var(--line-strong); stroke-width: 1; fill: none; }
.dgm .dot { fill: var(--muted); }
.dgm .hot { stroke: var(--fg-2); stroke-width: 1.5; fill: none; }
.dgm .hot-dot { fill: var(--fg-2); }
.dgm .hot-draw { stroke: var(--accent); stroke-width: 1.5; fill: none; stroke-dasharray: 1; stroke-dashoffset: 1; }
@media (prefers-reduced-motion: no-preference) {
  .dgm .hot-draw { transition: stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
}
.work:hover .dgm .hot-draw, .work:focus-within .dgm .hot-draw { stroke-dashoffset: 0; }
.work:hover .dgm .hot-dot, .work:focus-within .dgm .hot-dot { fill: var(--accent); transition: fill 0.3s ease-out 0.25s; }

.hero-dgm { margin: 48px 0 8px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-1); padding: 28px 28px 20px; }
.hero-dgm figcaption { font-size: 12px; color: var(--muted); margin-top: 14px; }
svg.dgm.dgm-narrow { display: none; }
@media (max-width: 700px) {
  svg.dgm.dgm-wide { display: none; }
  svg.dgm.dgm-narrow { display: block; }
  .hero-dgm { padding: 20px 14px 14px; }
}
```

- [ ] **Step 4: Write `components/diagrams/WorkThumb.tsx`**

These are ported from the approved mockup and each is drawn once per page, so the SVG ids stay static.

```tsx
import type { Slug } from "@/lib/work";

function PayLedgerThumb() {
  return (
    <svg className="dgm" viewBox="0 0 400 176" role="img" aria-labelledby="th-pl-t" aria-describedby="th-pl-d">
      <title id="th-pl-t">PayLedger transfer path</title>
      <desc id="th-pl-d">A transfer request locks both wallets in id order, writes two balancing ledger entries and commits once.</desc>
      <path className="link" d="M20 38 H380" />
      <path className="hot" d="M62 38 V88 H200 V138 H340" />
      <path className="hot-draw" pathLength={1} d="M62 38 V88 H200 V138 H340" />
      <g fontSize="11">
        <rect className="node" x="8" y="24" width="108" height="28" rx="4" />
        <text x="62" y="42" textAnchor="middle">POST /transfers</text>
        <rect className="node" x="268" y="24" width="120" height="28" rx="4" />
        <text x="328" y="42" textAnchor="middle" className="t-muted">idempotency_keys</text>
        <rect className="node-strong" x="140" y="74" width="120" height="28" rx="4" />
        <text x="200" y="92" textAnchor="middle">lock wallets ↑id</text>
        <rect className="node" x="12" y="124" width="140" height="28" rx="4" />
        <text x="82" y="142" textAnchor="middle" className="t-muted">entries −100 / +100</text>
        <rect className="node-strong" x="292" y="124" width="96" height="28" rx="4" />
        <text x="340" y="142" textAnchor="middle">COMMIT</text>
      </g>
      <circle className="hot-dot" cx="62" cy="88" r="2.5" />
      <circle className="hot-dot" cx="200" cy="138" r="2.5" />
      <circle className="dot" cx="152" cy="138" r="2" />
    </svg>
  );
}

function WebhookInspectorThumb() {
  return (
    <svg className="dgm" viewBox="0 0 400 176" role="img" aria-labelledby="th-wi-t" aria-describedby="th-wi-d">
      <title id="th-wi-t">Webhook Inspector capture path</title>
      <desc id="th-wi-d">A webhook sender reaches the Fly proxy, then the capture route, which stores at most one megabyte per request in Postgres and always answers 200. The browser polls every two seconds.</desc>
      <path className="link" d="M200 102 V138" />
      <path className="hot" d="M60 38 H200 V88 H340" />
      <path className="hot-draw" pathLength={1} d="M60 38 H200 V88 H340" />
      <g fontSize="11">
        <rect className="node" x="12" y="24" width="96" height="28" rx="4" />
        <text x="60" y="42" textAnchor="middle">sender</text>
        <rect className="node" x="152" y="24" width="96" height="28" rx="4" />
        <text x="200" y="42" textAnchor="middle" className="t-muted">Fly proxy</text>
        <rect className="node-strong" x="132" y="74" width="136" height="28" rx="4" />
        <text x="200" y="92" textAnchor="middle">/in/{"{bin}"} ≤1 MB</text>
        <rect className="node-strong" x="292" y="74" width="96" height="28" rx="4" />
        <text x="340" y="92" textAnchor="middle">200 OK</text>
        <rect className="node" x="140" y="124" width="120" height="28" rx="4" />
        <text x="200" y="142" textAnchor="middle" className="t-muted">Postgres</text>
        <rect className="node" x="292" y="124" width="96" height="28" rx="4" />
        <text x="340" y="142" textAnchor="middle" className="t-muted">UI · poll 2s</text>
      </g>
      <path className="link" d="M260 138 H292" strokeDasharray="3 3" />
      <circle className="dot" cx="200" cy="124" r="2" />
    </svg>
  );
}

function TaskboardThumb() {
  return (
    <svg className="dgm" viewBox="0 0 400 176" role="img" aria-labelledby="th-tb-t" aria-describedby="th-tb-d">
      <title id="th-tb-t">Taskboard card move path</title>
      <desc id="th-tb-d">A move request passes the JWT filter, locks the source and target columns in UUID order, shifts positions, and commits. Non-members get 404.</desc>
      <path className="hot" d="M60 38 H200 V62 H80 V138 H340" />
      <path className="hot-draw" pathLength={1} d="M60 38 H200 V62 H80 V138 H340" />
      <path className="link" d="M148 88 H176" strokeDasharray="3 3" />
      <g fontSize="11">
        <rect className="node" x="12" y="24" width="96" height="28" rx="4" />
        <text x="60" y="42" textAnchor="middle">PATCH move</text>
        <rect className="node" x="152" y="24" width="96" height="28" rx="4" />
        <text x="200" y="42" textAnchor="middle" className="t-muted">JWT filter</text>
        <rect className="node-strong" x="12" y="74" width="136" height="28" rx="4" />
        <text x="80" y="92" textAnchor="middle">lock cols ↑uuid</text>
        <rect className="node" x="176" y="74" width="136" height="28" rx="4" />
        <text x="244" y="92" textAnchor="middle" className="t-muted">404 if not member</text>
        <rect className="node" x="12" y="124" width="136" height="28" rx="4" />
        <text x="80" y="142" textAnchor="middle" className="t-muted">shift positions</text>
        <rect className="node-strong" x="292" y="124" width="96" height="28" rx="4" />
        <text x="340" y="142" textAnchor="middle">COMMIT</text>
      </g>
      <circle className="hot-dot" cx="148" cy="138" r="2.5" />
    </svg>
  );
}

export function WorkThumb({ slug }: { slug: Slug }) {
  switch (slug) {
    case "payledger":
      return <PayLedgerThumb />;
    case "webhook-inspector":
      return <WebhookInspectorThumb />;
    case "taskboard-api":
      return <TaskboardThumb />;
  }
}
```

- [ ] **Step 5: Write `lib/sequences.ts`**

PayLedger's steps describe its current `main`: the key is looked up first and stored in a separate commit. Task 12 changes this after the fix merges.

```ts
import type { Slug } from "@/lib/work";

export type SeqLane = { id: string; label: string };
export type SeqStep =
  | { kind: "msg"; from: string; to: string; label: string; hot?: boolean }
  | { kind: "note"; at: string; label: string };
export type Sequence = {
  id: string;
  title: string;
  desc: string;
  caption: string;
  lanes: SeqLane[];
  steps: SeqStep[];
};

export const sequences: Record<Slug, Sequence> = {
  payledger: {
    id: "seq-pl",
    title: "Sequence of a PayLedger transfer",
    desc: "The client sends POST /transfers with an Idempotency-Key. The API looks the key up, locks both wallet rows in ascending id order, checks the balance, inserts one transaction and two ledger entries that sum to zero, updates both balances, records an event and commits once, then stores the key and answers 201.",
    caption: "Every transfer is one database transaction. Bright lines are where correctness is decided.",
    lanes: [
      { id: "client", label: "client" },
      { id: "api", label: "api · transfer service" },
      { id: "db", label: "postgresql" },
    ],
    steps: [
      { kind: "msg", from: "client", to: "api", label: "POST /transfers  Idempotency-Key", hot: true },
      { kind: "msg", from: "api", to: "db", label: "look up key in idempotency_keys" },
      { kind: "msg", from: "api", to: "db", label: "SELECT … FOR UPDATE  both wallets, ascending id", hot: true },
      { kind: "note", at: "api", label: "balance ≥ amount" },
      { kind: "msg", from: "api", to: "db", label: "INSERT transaction + entries  −100 / +100  Σ = 0" },
      { kind: "msg", from: "api", to: "db", label: "UPDATE balances · record event" },
      { kind: "msg", from: "api", to: "db", label: "COMMIT  (all or nothing)", hot: true },
      { kind: "msg", from: "api", to: "db", label: "store key  (separate commit)" },
      { kind: "msg", from: "api", to: "client", label: "201 Created" },
    ],
  },
  "webhook-inspector": {
    id: "seq-wi",
    title: "Sequence of a Webhook Inspector capture",
    desc: "A sender posts to /in/{bin}. Fly's proxy forwards it with the client's IP in Fly-Client-IP. The capture route streams the body, keeps the first megabyte, stores the request and prunes the bin to 500, then answers 200 even if the insert failed. The browser polls for new requests every two seconds.",
    caption: "Capture first, fail quietly: the sender always gets its 200.",
    lanes: [
      { id: "sender", label: "sender" },
      { id: "proxy", label: "fly proxy" },
      { id: "app", label: "capture route" },
      { id: "db", label: "postgresql" },
      { id: "ui", label: "browser" },
    ],
    steps: [
      { kind: "msg", from: "sender", to: "proxy", label: "POST /in/{bin}", hot: true },
      { kind: "msg", from: "proxy", to: "app", label: "forward + Fly-Client-IP" },
      { kind: "note", at: "app", label: "stream body, keep 1 MB" },
      { kind: "msg", from: "app", to: "db", label: "INSERT request · prune bin to 500" },
      { kind: "msg", from: "app", to: "sender", label: "200 OK, even if the insert failed", hot: true },
      { kind: "msg", from: "ui", to: "app", label: "GET requests every 2 s" },
    ],
  },
  "taskboard-api": {
    id: "seq-tb",
    title: "Sequence of a Taskboard card move",
    desc: "The client sends PATCH to move a card with a Bearer token. The JWT filter verifies it. The card service checks membership and answers 404 to non-members, locks the source and target columns in UUID order, re-reads the card, shifts positions to keep them dense, and commits.",
    caption: "Two moves lock columns in the same order, so they queue instead of deadlocking.",
    lanes: [
      { id: "client", label: "client" },
      { id: "auth", label: "jwt filter" },
      { id: "svc", label: "card service" },
      { id: "db", label: "postgresql" },
    ],
    steps: [
      { kind: "msg", from: "client", to: "auth", label: "PATCH /cards/{id}/move  Bearer", hot: true },
      { kind: "msg", from: "auth", to: "svc", label: "verified user" },
      { kind: "msg", from: "svc", to: "db", label: "membership lookup  (404 if not a member)" },
      { kind: "msg", from: "svc", to: "db", label: "SELECT … FOR UPDATE  both columns, UUID order", hot: true },
      { kind: "msg", from: "svc", to: "db", label: "re-read card  (409 if it left the locked columns)" },
      { kind: "msg", from: "svc", to: "db", label: "park at −1 · close gap · open gap · place" },
      { kind: "msg", from: "svc", to: "db", label: "COMMIT", hot: true },
      { kind: "msg", from: "svc", to: "client", label: "200 OK" },
    ],
  },
};
```

- [ ] **Step 6: Write `components/diagrams/SequenceDiagram.tsx`**

```tsx
import type { Sequence } from "@/lib/sequences";

const WIDE_W = 1000;
const TOP = 60;
const ROW = 34;
const NARROW_ROW = 52;

export function SequenceDiagram({ seq }: { seq: Sequence }) {
  const n = seq.lanes.length;
  const laneX = (id: string) => {
    const i = seq.lanes.findIndex((l) => l.id === id);
    return 90 + (i * (WIDE_W - 180)) / Math.max(n - 1, 1);
  };
  const laneLabel = (id: string) => seq.lanes.find((l) => l.id === id)?.label ?? id;
  const wideH = TOP + seq.steps.length * ROW;
  const narrowH = 40 + seq.steps.length * NARROW_ROW;

  return (
    <figure className="hero-dgm">
      <svg className="dgm dgm-wide" viewBox={`0 0 ${WIDE_W} ${wideH}`} role="img" aria-labelledby={`${seq.id}-wt`} aria-describedby={`${seq.id}-wd`}>
        <title id={`${seq.id}-wt`}>{seq.title}</title>
        <desc id={`${seq.id}-wd`}>{seq.desc}</desc>
        <g fontSize="12">
          {seq.lanes.map((l) => (
            <text key={l.id} x={laneX(l.id)} y={20} textAnchor="middle" className="t-muted">
              {l.label}
            </text>
          ))}
        </g>
        {seq.lanes.map((l) => (
          <path key={l.id} className="link" d={`M${laneX(l.id)} 32 V${wideH - 8}`} strokeDasharray="2 4" />
        ))}
        <g fontSize="12">
          {seq.steps.map((s, i) => {
            const y = TOP + i * ROW;
            if (s.kind === "note") {
              const x = laneX(s.at);
              const w = s.label.length * 7.4 + 20;
              return (
                <g key={i}>
                  <rect className="node-strong" x={x - w / 2} y={y - 14} width={w} height={26} rx={4} />
                  <text x={x} y={y + 3} textAnchor="middle">
                    {s.label}
                  </text>
                </g>
              );
            }
            const x1 = laneX(s.from);
            const x2 = laneX(s.to);
            const end = x2 > x1 ? x2 - 6 : x2 + 6;
            return (
              <g key={i}>
                <path className={s.hot ? "msg hot" : "msg link"} d={`M${x1} ${y} H${end}`} />
                <circle className={s.hot ? "hot-dot" : "dot"} cx={x2 > x1 ? x2 - 4 : x2 + 4} cy={y} r={3} />
                <text x={Math.min(x1, x2) + 10} y={y - 8} className={s.hot ? undefined : "t-muted"}>
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <svg className="dgm dgm-narrow" viewBox={`0 0 340 ${narrowH}`} role="img" aria-labelledby={`${seq.id}-nt`} aria-describedby={`${seq.id}-nd`}>
        <title id={`${seq.id}-nt`}>{seq.title}</title>
        <desc id={`${seq.id}-nd`}>{seq.desc}</desc>
        <path className="link" d={`M20 18 V${narrowH - 12}`} />
        <g fontSize="12.5">
          {seq.steps.map((s, i) => {
            const y = 30 + i * NARROW_ROW;
            const hot = s.kind === "msg" && s.hot;
            const sub = s.kind === "msg" ? `${laneLabel(s.from)} → ${laneLabel(s.to)}` : laneLabel(s.at);
            return (
              <g key={i}>
                <circle className={hot ? "hot-dot" : "dot"} cx={20} cy={y} r={hot ? 3.5 : 3} />
                <text x={36} y={y + 4} className={hot ? undefined : "t-muted"}>
                  {s.label}
                </text>
                <text x={36} y={y + 22} className="t-muted" fontSize="11">
                  {sub}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption className="mono">{seq.caption}</figcaption>
    </figure>
  );
}
```

- [ ] **Step 7: Run it to see it pass**

Run: `npx vitest run tests/diagrams.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add components/diagrams lib/sequences.ts tests/diagrams.test.tsx app/styles/diagrams.css
git commit -m "feat(redesign): diagram thumbnails and data-driven sequence diagrams

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Selected work and Experience

**Files:**
- Create: `components/WorkEntry.tsx`, `components/SelectedWork.tsx`, `components/Experience.tsx`, `tests/SelectedWork.test.tsx`, `tests/Experience.test.tsx`
- Modify: `app/styles/home.css` (append)

**Interfaces:**
- Consumes: `caseStudies`, `CaseStudy` (Task 3), `WorkThumb` (Task 4), `LiveStatus` and `SectionHeading` (Task 2).
- Produces:
  - `WorkEntry({ cs: CaseStudy; headingLevel?: 2 | 3 })`
  - `SelectedWork()`, a `<section id="work">`
  - `Experience()`, a `<section id="experience">`

- [ ] **Step 1: Write the failing tests**

`tests/SelectedWork.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SelectedWork } from "@/components/SelectedWork";

describe("SelectedWork", () => {
  it("is the numbered Selected work section", () => {
    render(<SelectedWork />);
    expect(screen.getByRole("heading", { level: 2, name: "Selected work" })).toBeInTheDocument();
    expect(document.getElementById("work")).not.toBeNull();
  });

  it("lists the three case studies in order, each linking to its page", () => {
    render(<SelectedWork />);
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles[0]).toMatch(/^PayLedger/);
    expect(titles[1]).toMatch(/^Webhook Inspector/);
    expect(titles[2]).toMatch(/^Taskboard API/);
    expect(screen.getByRole("link", { name: "PayLedger" })).toHaveAttribute("href", "/work/payledger");
    expect(screen.getByRole("link", { name: /Read the case study about Taskboard API/ })).toHaveAttribute(
      "href",
      "/work/taskboard-api",
    );
  });

  it("shows countable facts and a live marker for deployed projects", () => {
    render(<SelectedWork />);
    const first = screen.getAllByRole("article")[0];
    expect(within(first).getByText("SELECT … FOR UPDATE, locked in id order")).toBeInTheDocument();
    expect(within(first).getByText("Live demo")).toBeInTheDocument();
    expect(within(first).getByRole("img", { name: "PayLedger transfer path" })).toBeInTheDocument();
  });
});
```

`tests/Experience.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Experience } from "@/components/Experience";

describe("Experience", () => {
  it("shows the freelance role with Auto Boutique marked pro bono", () => {
    const { container } = render(<Experience />);
    expect(screen.getByRole("heading", { level: 3, name: /Freelance Software Engineer/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Auto Boutique London" })).toHaveAttribute(
      "href",
      "https://autoboutiquelondon.co.uk",
    );
    expect(container).toHaveTextContent(/\(pro bono\)/);
  });

  it("shows the degree with its expected graduation", () => {
    const { container } = render(<Experience />);
    expect(screen.getByRole("heading", { level: 3, name: /BSc Computer Science/ })).toBeInTheDocument();
    expect(container).toHaveTextContent(/July 2027/);
  });

  it("keeps non-engineering roles on the CV only", () => {
    const { container } = render(<Experience />);
    expect(container).not.toHaveTextContent(/Ivy|Runner|Youth Leader|Cathedral/i);
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run tests/SelectedWork.test.tsx tests/Experience.test.tsx`
Expected: FAIL, the modules don't exist.

- [ ] **Step 3: Implement**

`components/WorkEntry.tsx`:
```tsx
import Link from "next/link";
import { Fragment } from "react";
import { WorkThumb } from "@/components/diagrams/WorkThumb";
import { LiveStatus } from "@/components/LiveStatus";
import type { CaseStudy } from "@/lib/work";

export function WorkEntry({ cs, headingLevel = 3 }: { cs: CaseStudy; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const href = `/work/${cs.slug}`;
  return (
    <article className="work reveal">
      <div>
        <Heading className="work-title">
          <Link href={href}>{cs.title}</Link>
          {cs.liveUrl ? <LiveStatus label="Live demo" /> : null}
        </Heading>
        <p className="problem">{cs.summary}</p>
        <dl className="facts mono">
          {cs.facts.map((f) => (
            <Fragment key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </Fragment>
          ))}
          <dt>Stack</dt>
          <dd>{cs.stack.slice(0, 4).join(" · ")}</dd>
        </dl>
        <Link className="more-link" href={href}>
          Read the case study<span className="sr-only"> about {cs.title}</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
      <figure>
        <WorkThumb slug={cs.slug} />
        <figcaption className="mono">{cs.thumbCaption}</figcaption>
      </figure>
    </article>
  );
}
```

`components/SelectedWork.tsx`:
```tsx
import { SectionHeading } from "@/components/SectionHeading";
import { WorkEntry } from "@/components/WorkEntry";
import { caseStudies } from "@/lib/work";

export function SelectedWork() {
  return (
    <section className="block" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <SectionHeading
          index="01"
          id="work-title"
          title="Selected work"
          sub="Three projects written up like design docs: the problem, the hard parts, and the tests that prove them."
        />
        {caseStudies.map((cs) => (
          <WorkEntry key={cs.slug} cs={cs} />
        ))}
      </div>
    </section>
  );
}
```

`components/Experience.tsx`:
```tsx
import { SectionHeading } from "@/components/SectionHeading";

export function Experience() {
  return (
    <section className="block" id="experience" aria-labelledby="exp-title">
      <div className="wrap">
        <SectionHeading index="02" id="exp-title" title="Experience" sub="Client work and education." />
        <div className="rows">
          <div className="row reveal">
            <div className="when mono">Sep 2026 – now</div>
            <div>
              <h3>
                Freelance Software Engineer <span className="org">· Self-employed, London</span>
              </h3>
              <p>
                <a href="https://autoboutiquelondon.co.uk">Auto Boutique London</a> (pro bono):
                designed, built and deployed the production site for a Central London car-storage
                business, replacing a WordPress install with a static Astro build, a PHP enquiry
                endpoint sending mail through Resend, and push-to-deploy from GitHub Actions.
              </p>
            </div>
          </div>
          <div className="row reveal">
            <div className="when mono">2023 – Jul 2027</div>
            <div>
              <h3>
                BSc Computer Science <span className="org">· University of Greenwich</span>
              </h3>
              <p>Final year, following a foundation year. Expected to graduate July 2027.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Append to `app/styles/home.css`:
```css
/* selected work */
.work { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 48px; padding: 40px 0; border-top: 1px solid var(--line); }
.work > * { min-width: 0; }
.sec-sub + .work { border-top: 0; padding-top: 8px; }
.work-title { margin: 0; font-size: 24px; line-height: 32px; font-weight: 600; letter-spacing: -0.02em; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; }
.work-title a:hover { color: var(--accent); }
.work .problem { margin: 10px 0 22px; color: var(--fg-2); font-size: 16px; line-height: 1.6; max-width: 56ch; }
dl.facts { display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 7px 16px; margin: 0 0 26px; font-size: 12.5px; line-height: 1.55; }
dl.facts dt { color: var(--muted); }
dl.facts dd { margin: 0; color: var(--fg-2); }
.more-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; color: var(--accent); }
.more-link .arrow { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.more-link:hover .arrow, .work:hover .more-link .arrow { transform: translateX(3px); }
.work figure { margin: 0; align-self: start; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-1); padding: 18px 16px 14px; }
.work figcaption { margin-top: 10px; font-size: 11.5px; color: var(--muted); }
@media (max-width: 900px) { .work { grid-template-columns: 1fr; gap: 24px; } .work figure { max-width: 460px; } }
@media (max-width: 560px) { .work figure { display: none; } }

/* experience */
.rows { border-top: 1px solid var(--line); }
.row { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 32px; padding: 24px 0; border-bottom: 1px solid var(--line); }
.row .when { font-size: 13px; color: var(--muted); padding-top: 3px; }
.row h3 { margin: 0; font-size: 17px; line-height: 26px; font-weight: 600; letter-spacing: -0.01em; }
.row h3 .org { color: var(--muted); font-weight: 400; }
.row p { margin: 6px 0 0; color: var(--fg-2); max-width: 66ch; font-size: 15.5px; }
.row p a { color: var(--accent); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent); text-underline-offset: 3px; text-decoration-thickness: 1px; }
.row p a:hover { text-decoration-color: var(--accent); }
@media (max-width: 640px) { .row { grid-template-columns: 1fr; gap: 6px; } }
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `npx vitest run tests/SelectedWork.test.tsx tests/Experience.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/WorkEntry.tsx components/SelectedWork.tsx components/Experience.tsx tests/SelectedWork.test.tsx tests/Experience.test.tsx app/styles/home.css
git commit -m "feat(redesign): selected work entries and experience section

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: More work (replaces project cards) and removal of GSAP/three

**Files:**
- Create: `components/MoreWork.tsx`, `tests/MoreWork.test.tsx`
- Modify: `app/styles/home.css` (append), `package.json`, `package-lock.json`
- Delete: `components/Projects.tsx`, `components/ProjectCard.tsx`, `components/Reveal.tsx`, `lib/gsap.ts`, `tests/Projects.test.tsx`, `tests/ProjectCard.test.tsx`, `tests/Reveal.test.tsx`, `tests/helpers.ts` (once nothing imports it)

**Interfaces:**
- Consumes: `Project` (lib/github), `withoutFeatured` (Task 3), `SectionHeading` (Task 2).
- Produces: `MoreWork({ projects: Project[] })`, a `<section id="more">`.

- [ ] **Step 1: Write the failing test** `tests/MoreWork.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MoreWork } from "@/components/MoreWork";
import type { Project } from "@/lib/github";

const p = (over: Partial<Project>): Project => ({
  name: "fx-service", description: "Async currency API.", url: "https://github.com/gabryelvs/fx-service",
  homepage: "https://fx-service-gv.fly.dev/docs", language: "Python", topics: [], stars: 0,
  updatedAt: "2026-01-01T00:00:00Z", ...over,
});

describe("MoreWork", () => {
  it("lists non-featured showcase repos with repo and demo links", () => {
    render(<MoreWork projects={[p({}), p({ name: "payledger" })]} />);
    expect(screen.getByRole("heading", { level: 2, name: "More work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "fx-service" })).toHaveAttribute("href", "https://github.com/gabryelvs/fx-service");
    expect(screen.getByRole("link", { name: "Live demo for fx-service" })).toHaveAttribute("href", "https://fx-service-gv.fly.dev/docs");
    expect(screen.queryByRole("link", { name: "payledger" })).toBeNull();
  });

  it("omits the demo link when a repo has no homepage", () => {
    render(<MoreWork projects={[p({ name: "webhook-dispatcher", homepage: null })]} />);
    expect(screen.queryByRole("link", { name: /Live demo/ })).toBeNull();
  });

  it("stays honest when a repo has no description or language", () => {
    render(<MoreWork projects={[p({ description: "", language: null })]} />);
    expect(screen.getByText("No description yet.")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("explains an empty list instead of rendering nothing", () => {
    render(<MoreWork projects={[p({ name: "payledger" })]} />);
    expect(screen.getByText(/Everything tagged for this site is written up above/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All repositories on GitHub" })).toHaveAttribute("href", "https://github.com/gabryelvs");
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tests/MoreWork.test.tsx`
Expected: FAIL, the module doesn't exist.

- [ ] **Step 3: Implement `components/MoreWork.tsx`**

```tsx
import { SectionHeading } from "@/components/SectionHeading";
import type { Project } from "@/lib/github";
import { LINKS } from "@/lib/site";
import { withoutFeatured } from "@/lib/work";

export function MoreWork({ projects }: { projects: Project[] }) {
  const rest = withoutFeatured(projects);
  return (
    <section className="block" id="more" aria-labelledby="more-title">
      <div className="wrap">
        <SectionHeading
          index="03"
          id="more-title"
          title="More work"
          sub="Everything else tagged showcase on GitHub, pulled in automatically each day."
        />
        {rest.length === 0 ? (
          <p className="empty">
            Everything tagged for this site is written up above.{" "}
            <a href={LINKS.github}>All repositories on GitHub</a>
          </p>
        ) : (
          <ul className="table">
            {rest.map((proj) => (
              <li key={proj.name} className="trow reveal">
                <a className="pname" href={proj.url}>
                  {proj.name}
                </a>
                <p className="pdesc">{proj.description || "No description yet."}</p>
                <span className="plang mono">{proj.language ?? "—"}</span>
                <span className="plinks">
                  <a href={proj.url} aria-label={`Repository for ${proj.name}`}>
                    Repo
                  </a>
                  {proj.homepage ? (
                    <a href={proj.homepage} aria-label={`Live demo for ${proj.name}`}>
                      Live demo
                    </a>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
```

Append to `app/styles/home.css`:
```css
/* more work */
.table { border-top: 1px solid var(--line); list-style: none; margin: 0; padding: 0; }
.trow { display: grid; grid-template-columns: 220px minmax(0, 1fr) 110px 150px; gap: 24px; align-items: baseline; padding: 16px 0; border-bottom: 1px solid var(--line); }
.trow .pname { font-weight: 500; font-size: 15px; }
.trow .pname:hover { color: var(--accent); }
.trow .pdesc { margin: 0; color: var(--fg-2); font-size: 14.5px; }
.trow .plang { font-size: 12.5px; color: var(--muted); }
.trow .plinks { display: flex; gap: 16px; justify-content: flex-end; font-size: 13.5px; }
.trow .plinks a { color: var(--accent); }
.trow .plinks a:hover { text-decoration: underline; text-underline-offset: 3px; }
.empty { color: var(--fg-2); }
.empty a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 820px) {
  .trow { grid-template-columns: 1fr auto; gap: 4px 16px; }
  .trow .pdesc { grid-column: 1 / -1; grid-row: 2; }
  .trow .plang { grid-column: 2; grid-row: 1; text-align: right; }
  .trow .plinks { grid-column: 1 / -1; justify-content: flex-start; margin-top: 4px; }
}
```

- [ ] **Step 4: Run it to see it pass**

Run: `npx vitest run tests/MoreWork.test.tsx`
Expected: PASS.

- [ ] **Step 5: Remove the old project cards and the animation stack**

1. `git rm components/Projects.tsx components/ProjectCard.tsx components/Reveal.tsx lib/gsap.ts tests/Projects.test.tsx tests/ProjectCard.test.tsx tests/Reveal.test.tsx`
2. `grep -rn "tests/helpers\|from \"./helpers\"\|@/tests/helpers" tests components app lib`. If nothing imports it, `git rm tests/helpers.ts`.
3. `grep -rn "gsap\|three" app components lib tests --include=*.ts --include=*.tsx`. Expected: no matches, except `app/page.tsx`, which still imports `Projects`. Temporarily replace that import and its `<Projects projects={projects} />` element with `MoreWork` (Task 7 rewrites the page).
4. `npm uninstall gsap three @types/three`
5. In `vitest.setup.ts`, delete the long comment block that references `lib/gsap.ts` and `Hero.tsx` above the `matchMedia` stub. Keep the stub itself with a one-line comment: `// jsdom lacks matchMedia; some components may query it.`

- [ ] **Step 6: Run everything**

Run: `npm test && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(redesign): compact More work rows; remove GSAP, three.js and project cards

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: About, Contact and the home page

**Files:**
- Modify (full rewrite): `components/About.tsx`, `components/Contact.tsx`, `app/page.tsx`, `tests/Contact.test.tsx`, `tests/copy.test.tsx` (two assertions)
- Create: `tests/Home.test.tsx`
- Modify: `app/styles/home.css` (append)

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: `About()` (`<section id="about">`), `Contact()` (`<section id="contact">`), and the default export `Home()` in `app/page.tsx`.

- [ ] **Step 1: Write the failing tests**

Replace `tests/Contact.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Contact } from "@/components/Contact";

describe("Contact", () => {
  it("states availability", () => {
    const { container } = render(<Contact />);
    expect(container).toHaveTextContent(
      "Open to graduate and junior software engineer roles in London from summer 2027.",
    );
  });

  it("links email, GitHub, LinkedIn and the CV", () => {
    render(<Contact />);
    expect(screen.getByRole("link", { name: "gabryelverissimo12@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:gabryelverissimo12@gmail.com",
    );
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/gabryelvs");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("href", "/cv.pdf");
  });
});
```

`tests/Home.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({
  getShowcaseProjects: vi.fn(async () => [
    { name: "fx-service", description: "FX.", url: "https://github.com/gabryelvs/fx-service", homepage: null, language: "Python", topics: [], stars: 0, updatedAt: "2026-01-01T00:00:00Z" },
  ]),
}));

import Home from "@/app/page";

describe("Home", () => {
  it("renders the sections in the agreed order", async () => {
    render(await Home());
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(["Selected work", "Experience", "More work", "About", "Contact"]);
  });

  it("has one h1, a main landmark for the skip link, and a footer", async () => {
    render(await Home());
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
```

In `tests/copy.test.tsx`:
1. Replace the body of `"offers graduate and junior roles from summer 2027 in contact"` with:
   ```tsx
   const { container } = render(<Contact />);
   expect(container).toHaveTextContent(/graduate and junior software engineer roles in London from summer 2027/i);
   ```
2. Replace the body of `"keeps the Backend skills group"` with:
   ```tsx
   render(<About />);
   expect(screen.getByText("Backend", { selector: "dt" })).toBeInTheDocument();
   ```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run tests/Contact.test.tsx tests/Home.test.tsx tests/copy.test.tsx`
Expected: FAIL. The Contact link names differ, the home order differs, and `dt` Backend doesn't exist yet.

- [ ] **Step 3: Implement**

`components/About.tsx`:
```tsx
import { SectionHeading } from "@/components/SectionHeading";

const skills: [string, string][] = [
  ["Languages", "Python, Java, TypeScript, SQL, C#, JavaScript"],
  ["Backend", "FastAPI, Spring Boot, PostgreSQL, Redis, REST APIs"],
  ["Front-end", "React, Next.js, Vite, Tailwind CSS"],
  ["Tools", "Docker, Git, GitHub Actions, pytest, Vitest, Testcontainers"],
];

export function About() {
  return (
    <section className="block" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHeading index="04" id="about-title" title="About" />
        <div className="about-grid">
          <div>
            <p>
              I&apos;m a software engineer in London. I build small, production-shaped services,
              tested, containerised and deployed, and I care most about the parts that fail quietly:
              concurrency, retries, and what happens when a dependency is down.
            </p>
            <p>
              I work with AI-assisted development and treat it like any other tool: I set the design,
              review every change, and don&apos;t ship what I can&apos;t explain or test.
            </p>
          </div>
          <dl className="skills">
            {skills.map(([k, v]) => (
              <div key={k} className="skill">
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
```

`components/Contact.tsx`:
```tsx
import { SectionHeading } from "@/components/SectionHeading";
import { LINKS } from "@/lib/site";

export function Contact() {
  return (
    <section className="block" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <SectionHeading index="05" id="contact-title" title="Contact" />
        <p className="contact-line">
          Open to graduate and junior software engineer roles in London{" "}
          <span className="soft">from summer 2027.</span>
        </p>
        <a className="mail" href={LINKS.email}>
          {LINKS.emailLabel}
        </a>
        <div className="contact-links">
          <a className="btn btn-line" href={LINKS.github}>GitHub</a>
          <a className="btn btn-line" href={LINKS.linkedin}>LinkedIn</a>
          <a className="btn btn-line" href={LINKS.cv}>Download CV</a>
        </div>
      </div>
    </section>
  );
}
```

`app/page.tsx`:
```tsx
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MoreWork } from "@/components/MoreWork";
import { Nav } from "@/components/Nav";
import { SelectedWork } from "@/components/SelectedWork";
import { getShowcaseProjects } from "@/lib/github";

export const revalidate = 86400;

export default async function Home() {
  const projects = await getShowcaseProjects();
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <SelectedWork />
        <Experience />
        <MoreWork projects={projects} />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

Append to `app/styles/home.css`:
```css
/* about */
.about-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; }
.about-grid p { margin: 0 0 16px; color: var(--fg-2); font-size: 16px; max-width: 60ch; }
dl.skills { display: grid; gap: 12px; margin: 0; font-size: 14.5px; }
dl.skills .skill { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 20px; }
dl.skills dt { font-size: 12.5px; color: var(--muted); padding-top: 2px; }
dl.skills dd { margin: 0; color: var(--fg-2); }
@media (max-width: 860px) { .about-grid { grid-template-columns: 1fr; gap: 32px; } }

/* contact */
.contact-line { margin: 0; font-size: clamp(1.5rem, 1rem + 2vw, 2.25rem); line-height: 1.2; letter-spacing: -0.03em; font-weight: 600; max-width: 22ch; text-wrap: balance; }
.contact-line .soft { color: var(--muted); }
.mail { display: inline-block; margin-top: 28px; font-size: 18px; color: var(--accent); border-bottom: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); padding-bottom: 2px; }
.mail:hover { border-color: var(--accent); }
.contact-links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
```

- [ ] **Step 4: Run everything**

Run: `npm test && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 5: Visual check against the mockup**

Run `npm run build && npx next start -p 3200`. Compare `http://localhost:3200` with `docs/superpowers/mockups/2026-09-23-redesign-mockup.html#home` at 1440px and 390px wide, in both themes. Fix any differences in spacing, type or colour before committing. The Browser pane can freeze animations while hidden; if screenshots come out blank, capture with Playwright + Chrome at `reducedMotion: 'reduce'`.

- [ ] **Step 6: Commit**

```bash
git add -A components app tests
git commit -m "feat(redesign): about, contact and the new home page order

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: MDX pipeline and case-study building blocks

**Files:**
- Modify: `next.config.ts`, `package.json`, `package-lock.json`
- Create: `mdx-components.tsx`, `components/case-study/Claim.tsx`, `components/case-study/Evidence.tsx`, `components/case-study/Heading.tsx`, `lib/content.ts`, `tests/caseStudyParts.test.tsx`
- Write: `app/styles/case-study.css`

**Interfaces:**
- Consumes: `slugify`, `codeUrl`, `Slug` (Task 3).
- Produces:
  - `Claim({ children })` renders `<div className="pair">`.
  - `Evidence({ path, lines?, children, repoUrl, commit })` renders `<aside className="note mono">` with a pinned link.
  - `type EvidenceInput = { path: string; lines?: string; children: ReactNode }`
  - `H2({ children })` renders `<h2 id={slugify(text)}>`.
  - `textOf(node: ReactNode): string`
  - `loadCaseStudyBody(slug: Slug): Promise<ComponentType<MDXProps>>`

- [ ] **Step 1: Install the MDX packages**

Run: `npm install @next/mdx@16.2.9 @mdx-js/loader@3 @mdx-js/react@3 && npm install -D @types/mdx`
Check: `node -p "require('./node_modules/@next/mdx/package.json').version"` prints `16.2.9`.

- [ ] **Step 2: Write the failing test** `tests/caseStudyParts.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Claim } from "@/components/case-study/Claim";
import { Evidence } from "@/components/case-study/Evidence";
import { H2, textOf } from "@/components/case-study/Heading";

const SHA = "b".repeat(40);

describe("case-study parts", () => {
  it("links evidence to a pinned file and line range", () => {
    render(
      <Evidence path="app/services/transfer_service.py" lines="28-53" repoUrl="https://github.com/gabryelvs/payledger" commit={SHA}>
        _lock_wallet() and the sorted lock order
      </Evidence>,
    );
    expect(screen.getByText("transfer_service.py")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "_lock_wallet() and the sorted lock order" })).toHaveAttribute(
      "href",
      `https://github.com/gabryelvs/payledger/blob/${SHA}/app/services/transfer_service.py#L28-L53`,
    );
    expect(screen.getByRole("complementary")).toHaveClass("note");
  });

  it("wraps a claim and its evidence in one pair", () => {
    const { container } = render(
      <Claim>
        <p>Body</p>
      </Claim>,
    );
    expect(container.firstElementChild).toHaveClass("pair");
  });

  it("gives h2 headings a stable id from their text", () => {
    render(<H2>What I&apos;d change</H2>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "what-id-change");
  });

  it("extracts text from nested nodes", () => {
    expect(textOf(<>How it&apos;s <em>tested</em></>)).toBe("How it's tested");
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run tests/caseStudyParts.test.tsx`
Expected: FAIL, the modules don't exist.

- [ ] **Step 4: Implement the parts**

`components/case-study/Heading.tsx`:
```tsx
import { Children, isValidElement, type ReactNode } from "react";
import { slugify } from "@/lib/work";

export function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return Children.toArray(node).map(textOf).join("");
}

export function H2({ children }: { children?: ReactNode }) {
  return <h2 id={slugify(textOf(children))}>{children}</h2>;
}
```

`components/case-study/Claim.tsx`:
```tsx
import type { ReactNode } from "react";

/** A block of prose with at most one <Evidence> note, which sits in the margin on wide screens. */
export function Claim({ children }: { children?: ReactNode }) {
  return <div className="pair">{children}</div>;
}
```

`components/case-study/Evidence.tsx`:
```tsx
import type { ReactNode } from "react";
import { codeUrl } from "@/lib/work";

export type EvidenceInput = { path: string; lines?: string; children: ReactNode };

export function Evidence({
  path,
  lines,
  children,
  repoUrl,
  commit,
}: EvidenceInput & { repoUrl: string; commit: string }) {
  const file = path.split("/").pop() ?? path;
  return (
    <aside className="note mono">
      <span className="k">{file}</span>
      <a href={codeUrl(repoUrl, commit, path, lines)}>{children}</a>
    </aside>
  );
}
```

`mdx-components.tsx` (repo root). Evidence is deliberately absent here: the case-study page passes a version bound to the right repo and commit. An `<Evidence>` rendered without that binding fails the build loudly instead of linking nowhere.
```tsx
import type { MDXComponents } from "mdx/types";
import { Claim } from "@/components/case-study/Claim";
import { H2 } from "@/components/case-study/Heading";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { h2: H2, Claim, ...components };
}
```

`lib/content.ts`:
```ts
import type { MDXProps } from "mdx/types";
import type { ComponentType } from "react";
import type { Slug } from "@/lib/work";

type Loaded = { default: ComponentType<MDXProps> };

const loaders: Record<Slug, () => Promise<Loaded>> = {
  payledger: () => import("@/content/work/payledger.mdx"),
  "webhook-inspector": () => import("@/content/work/webhook-inspector.mdx"),
  "taskboard-api": () => import("@/content/work/taskboard-api.mdx"),
};

export async function loadCaseStudyBody(slug: Slug): Promise<ComponentType<MDXProps>> {
  return (await loaders[slug]()).default;
}
```

`next.config.ts`:
- Add `import createMDX from "@next/mdx";` at the top.
- Set `pageExtensions: ["ts", "tsx", "md", "mdx"]` in `nextConfig`.
- Change the export to `export default createMDX({})(nextConfig);`.
- In the CSP comment, replace "(and Framer Motion sets inline style attributes)" with "(and React sets inline style attributes, e.g. the hero's animation-delay custom properties)".
- Leave the headers themselves unchanged.

`app/styles/case-study.css`:
```css
.page-head { padding: 56px 0 24px; }
.page-head h1, .cs-head h1 { margin: 0; font-size: clamp(2.25rem, 1.4rem + 3vw, 3.25rem); line-height: 1.05; letter-spacing: -0.035em; font-weight: 600; }
.page-head p { margin: 16px 0 0; font-size: 18px; color: var(--fg-2); max-width: 56ch; }

.cs-head { padding: 56px 0 40px; }
.crumbs { font-size: 13px; color: var(--muted); display: flex; gap: 8px; margin-bottom: 28px; }
.crumbs a:hover { color: var(--fg); }
.cs-head .summary { margin: 16px 0 0; font-size: 20px; line-height: 1.5; color: var(--fg-2); max-width: 54ch; text-wrap: pretty; }
.meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 40px 0 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.meta > div { padding: 16px 20px 18px 0; }
.meta > div + div { padding-left: 20px; border-left: 1px solid var(--line); }
.meta dt { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.meta dd { margin: 0; font-size: 14px; color: var(--fg-2); line-height: 1.5; }
.meta dd a { color: var(--accent); }
.meta dd a:hover { text-decoration: underline; text-underline-offset: 3px; }
.meta .how { grid-column: 1 / -1; border-left: 0; padding-left: 0; border-top: 1px solid var(--line); display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 20px; }
.meta > div.how { padding-left: 0; border-left: 0; }
.meta .how dd { max-width: 72ch; }
@media (max-width: 820px) {
  .meta { grid-template-columns: 1fr 1fr; }
  .meta > div:nth-child(3) { border-left: 0; padding-left: 0; border-top: 1px solid var(--line); }
  .meta > div:nth-child(4) { border-top: 1px solid var(--line); }
  .meta .how { grid-template-columns: 1fr; gap: 0; }
}

.cs-body { display: grid; grid-template-columns: 180px minmax(0, 680px) 220px; gap: 56px; padding: 56px 0 24px; justify-content: space-between; }
.cs-body > * { min-width: 0; }
.toc { position: sticky; top: 88px; align-self: start; font-size: 13px; }
.toc p { margin: 0 0 10px; color: var(--muted); font-size: 12px; }
.toc ol { list-style: none; margin: 0; padding: 0; border-left: 1px solid var(--line); }
.toc a { display: block; padding: 5px 0 5px 14px; margin-left: -1px; border-left: 1px solid transparent; color: var(--muted); transition: color 0.15s ease-out, border-color 0.15s ease-out; }
.toc a:hover { color: var(--fg); }
.toc a[aria-current] { color: var(--accent); border-left-color: var(--accent); }

.prose { grid-column: 2 / 4; counter-reset: sec; }
.prose h2 { font-size: 24px; line-height: 32px; letter-spacing: -0.02em; font-weight: 600; margin: 64px 0 16px; scroll-margin-top: 88px; counter-increment: sec; }
.prose h2::before { content: counter(sec); font-family: var(--font-mono); color: var(--muted); font-weight: 400; margin-right: 10px; }
.prose > h2:first-child { margin-top: 0; }
.prose h3 { font-size: 18px; line-height: 28px; font-weight: 600; letter-spacing: -0.01em; margin: 36px 0 8px; }
.prose p, .prose li { font-size: 18px; line-height: 1.65; color: var(--fg-2); }
.prose p { margin: 0 0 18px; max-width: 68ch; }
.prose strong { color: var(--fg); font-weight: 600; }
.prose ul { margin: 0 0 18px; padding-left: 20px; max-width: 68ch; list-style: disc; }
.prose li { margin-bottom: 8px; }
.prose li::marker { color: var(--muted); }
.prose a { color: var(--accent); text-decoration: underline; text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent); text-underline-offset: 3px; text-decoration-thickness: 1px; }
.prose a:hover { text-decoration-color: var(--accent); }
.prose :not(pre) > code { font-family: var(--font-mono); font-size: 0.84em; background: var(--surface-2); border: 1px solid var(--line); border-radius: 4px; padding: 1px 5px; color: var(--fg); }
.prose pre { margin: 8px 0 24px; padding: 18px 20px; background: var(--code-bg); border: 1px solid var(--line); border-radius: 8px; overflow-x: auto; font-family: var(--font-mono); font-size: 13px; line-height: 20px; color: var(--fg-2); max-width: 680px; tab-size: 4; }
.prose pre code { font: inherit; background: none; border: 0; padding: 0; color: inherit; }

.pair { display: grid; grid-template-columns: minmax(0, 680px) 220px; column-gap: 56px; align-items: start; }
.pair > * { grid-column: 1; min-width: 0; }
.pair > aside.note { grid-column: 2; grid-row: 1 / span 99; }
aside.note { font-size: 12px; line-height: 1.55; color: var(--muted); border-left: 1px solid var(--line-strong); padding: 2px 0 2px 12px; margin-top: 6px; }
aside.note .k { display: block; color: var(--fg-2); margin-bottom: 4px; }
aside.note a { color: var(--accent); word-break: break-word; }
aside.note a:hover { text-decoration: underline; text-underline-offset: 3px; }

.cs-next { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--line); margin-top: 72px; }
.cs-next a { padding: 28px 0; display: block; }
.cs-next a + a { text-align: right; border-left: 1px solid var(--line); padding-left: 24px; }
.cs-next small { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.cs-next strong { font-size: 18px; font-weight: 600; letter-spacing: -0.015em; }
.cs-next a:hover strong { color: var(--accent); }

@media (max-width: 1180px) {
  .cs-body { grid-template-columns: minmax(0, 1fr); gap: 48px; }
  .toc { display: none; }
  .prose { grid-column: 1 / -1; }
}
@media (max-width: 900px) {
  .pair { display: block; }
  .pair > aside.note { margin: -6px 0 22px; }
  .prose p, .prose li { font-size: 17px; }
}
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `npx vitest run tests/caseStudyParts.test.tsx && npm run lint`
Expected: PASS. Don't run `npm run build` yet: `lib/content.ts` imports MDX files that Task 9 creates. Build verification happens in Task 9.

- [ ] **Step 6: Commit**

```bash
git add -A next.config.ts package.json package-lock.json mdx-components.tsx components/case-study lib/content.ts tests/caseStudyParts.test.tsx app/styles/case-study.css
git commit -m "feat(redesign): MDX pipeline, evidence notes pinned to commits

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Case-study route, work index, and first-draft bodies

**Files:**
- Create: `app/work/[slug]/page.tsx`, `app/work/page.tsx`, `components/case-study/CaseStudyHeader.tsx`, `components/case-study/CaseStudyToc.tsx`, `components/case-study/CaseStudyNav.tsx`, `content/work/payledger.mdx`, `content/work/webhook-inspector.mdx`, `content/work/taskboard-api.mdx`, `tests/caseStudyRoute.test.tsx`, `tests/caseStudyContent.test.ts`

**Interfaces:**
- Consumes: Tasks 2–8.
- Produces:
  - Routes `/work` and `/work/[slug]`, with `generateStaticParams`, `generateMetadata` and `dynamicParams = false`
  - `CaseStudyHeader({ cs: CaseStudy })`, `CaseStudyToc()` (client), `CaseStudyNav({ slug: Slug })`

- [ ] **Step 1: Write the failing tests**

`tests/caseStudyRoute.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/content", () => ({
  loadCaseStudyBody: vi.fn(async () => () => <h2 id="the-problem">The problem</h2>),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import CaseStudyPage, { dynamicParams, generateMetadata, generateStaticParams } from "@/app/work/[slug]/page";
import WorkIndex from "@/app/work/page";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("/work/[slug]", () => {
  it("statically generates exactly the three case studies", () => {
    expect(generateStaticParams()).toEqual([
      { slug: "payledger" },
      { slug: "webhook-inspector" },
      { slug: "taskboard-api" },
    ]);
    expect(dynamicParams).toBe(false);
  });

  it("builds metadata from the registry", async () => {
    const meta = await generateMetadata(params("payledger"));
    expect(meta.title).toBe("PayLedger — case study · Gabryel Veríssimo");
    expect(meta.description).toMatch(/double-entry payments API/);
    expect(meta.alternates?.canonical).toBe("/work/payledger");
  });

  it("renders header, disclosure, contents and neighbours", async () => {
    render(await CaseStudyPage(params("payledger")));
    expect(screen.getByRole("heading", { level: 1, name: "PayLedger" })).toBeInTheDocument();
    expect(screen.getByText(/AI-assisted development \(Claude Code\)/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Repo" })).toHaveAttribute("href", "https://github.com/gabryelvs/payledger");
    expect(screen.getByRole("navigation", { name: "On this page" }).querySelectorAll("a")).toHaveLength(7);
    expect(screen.getByRole("link", { name: /Next case study/ })).toHaveAttribute("href", "/work/webhook-inspector");
    expect(screen.getAllByRole("img", { name: "Sequence of a PayLedger transfer" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
  });

  it("404s an unknown slug", async () => {
    await expect(CaseStudyPage(params("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("/work", () => {
  it("lists every case study under one h1", () => {
    render(<WorkIndex />);
    expect(screen.getByRole("heading", { level: 1, name: "Selected work" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      expect.stringMatching(/^PayLedger/),
      expect.stringMatching(/^Webhook Inspector/),
      expect.stringMatching(/^Taskboard API/),
    ]);
  });
});
```

`tests/caseStudyContent.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { CASE_STUDY_OUTLINE, caseStudies } from "@/lib/work";

const source = (slug: string) =>
  readFileSync(new NodeURL(`../content/work/${slug}.mdx`, import.meta.url), "utf8");

describe.each(caseStudies.map((c) => [c.slug, c] as const))("content/work/%s.mdx", (slug, cs) => {
  const mdx = source(slug);

  it("follows the fixed seven-part outline, in order", () => {
    const h2s = [...mdx.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    expect(h2s).toEqual([...CASE_STUDY_OUTLINE]);
  });

  it("contains no draft markers", () => {
    expect(mdx).not.toMatch(/\bpending\b|TODO|TBD|FIXME|lorem/i);
  });

  it("pins every GitHub code link to a full commit SHA", () => {
    for (const m of mdx.matchAll(/github\.com\/gabryelvs\/[\w.-]+\/(?:blob|tree)\/([^/\s)]+)/g)) {
      expect(m[1]).toMatch(/^[0-9a-f]{40}$/);
    }
  });

  it("uses the registry's commit for its own repo links", () => {
    for (const m of mdx.matchAll(new RegExp(`github\\.com/gabryelvs/${cs.repoName}/(?:blob|tree)/([0-9a-f]{40})`, "g"))) {
      expect(m[1]).toBe(cs.commit);
    }
  });

  it("uses Evidence with a repo path and never a raw URL", () => {
    for (const m of mdx.matchAll(/<Evidence\s+([^>]*)>/g)) {
      expect(m[1]).toMatch(/path="[^"]+"/);
      expect(m[1]).not.toMatch(/https?:/);
    }
  });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npx vitest run tests/caseStudyRoute.test.tsx tests/caseStudyContent.test.ts`
Expected: FAIL, because the routes and content don't exist.

- [ ] **Step 3: Implement the route parts**

`components/case-study/CaseStudyHeader.tsx`:
```tsx
import Link from "next/link";
import { SequenceDiagram } from "@/components/diagrams/SequenceDiagram";
import { LiveStatus } from "@/components/LiveStatus";
import { sequences } from "@/lib/sequences";
import { BUILT_WITH } from "@/lib/site";
import type { CaseStudy } from "@/lib/work";

export function CaseStudyHeader({ cs }: { cs: CaseStudy }) {
  return (
    <header className="cs-head">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/work">Work</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{cs.title}</span>
      </nav>
      <h1>{cs.title}</h1>
      <p className="summary">{cs.summary}</p>
      <dl className="meta">
        <div>
          <dt className="mono">Role</dt>
          <dd>{cs.role}</dd>
        </div>
        <div>
          <dt className="mono">Stack</dt>
          <dd>{cs.stack.join(" · ")}</dd>
        </div>
        <div>
          <dt className="mono">Status</dt>
          <dd>
            {cs.liveUrl ? (
              <>
                <LiveStatus label="Live" /> · <a href={cs.liveUrl}>{cs.liveLabel}</a> ·{" "}
              </>
            ) : (
              <>Repository only · </>
            )}
            <a href={cs.repoUrl}>Repo</a>
          </dd>
        </div>
        <div>
          <dt className="mono">Tests</dt>
          <dd>{cs.tests}</dd>
        </div>
        <div className="how">
          <dt className="mono">How it was built</dt>
          <dd>{BUILT_WITH}</dd>
        </div>
      </dl>
      <SequenceDiagram seq={sequences[cs.slug]} />
    </header>
  );
}
```

`components/case-study/CaseStudyToc.tsx`:
```tsx
"use client";
import { useEffect, useState } from "react";
import { CASE_STUDY_OUTLINE, slugify } from "@/lib/work";

const ITEMS = CASE_STUDY_OUTLINE.map((title) => ({ title, id: slugify(title) }));

export function CaseStudyToc() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const { id } of ITEMS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <nav className="toc" aria-label="On this page">
      <p className="mono">On this page</p>
      <ol>
        {ITEMS.map(({ title, id }) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? "true" : undefined}>
              {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

`components/case-study/CaseStudyNav.tsx`:
```tsx
import Link from "next/link";
import { adjacentCaseStudies, type Slug } from "@/lib/work";

export function CaseStudyNav({ slug }: { slug: Slug }) {
  const { prev, next } = adjacentCaseStudies(slug);
  return (
    <nav className="cs-next" aria-label="More case studies">
      {prev ? (
        <Link href={`/work/${prev.slug}`}>
          <small className="mono">← Previous case study</small>
          <strong>{prev.title}</strong>
        </Link>
      ) : (
        <Link href="/work">
          <small className="mono">← All work</small>
          <strong>Selected work</strong>
        </Link>
      )}
      {next ? (
        <Link href={`/work/${next.slug}`}>
          <small className="mono">Next case study →</small>
          <strong>{next.title}</strong>
        </Link>
      ) : (
        <Link href="/work">
          <small className="mono">All work →</small>
          <strong>Selected work</strong>
        </Link>
      )}
    </nav>
  );
}
```

`app/work/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyHeader } from "@/components/case-study/CaseStudyHeader";
import { CaseStudyNav } from "@/components/case-study/CaseStudyNav";
import { CaseStudyToc } from "@/components/case-study/CaseStudyToc";
import { Evidence, type EvidenceInput } from "@/components/case-study/Evidence";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { loadCaseStudyBody } from "@/lib/content";
import { SITE_NAME } from "@/lib/site";
import { caseStudies, getCaseStudy } from "@/lib/work";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return {};
  return {
    title: `${cs.title} — case study · ${SITE_NAME}`,
    description: cs.summary,
    alternates: { canonical: `/work/${cs.slug}` },
    openGraph: { title: `${cs.title} — case study`, description: cs.summary, type: "article", url: `/work/${cs.slug}` },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();
  const Body = await loadCaseStudyBody(cs.slug);
  const BoundEvidence = (p: EvidenceInput) => <Evidence {...p} repoUrl={cs.repoUrl} commit={cs.commit} />;

  return (
    <>
      <Nav current="work" />
      <main id="main">
        <div className="wrap">
          <CaseStudyHeader cs={cs} />
          <div className="cs-body">
            <CaseStudyToc />
            <article className="prose">
              <Body components={{ Evidence: BoundEvidence }} />
              <CaseStudyNav slug={cs.slug} />
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

`app/work/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { WorkEntry } from "@/components/WorkEntry";
import { SITE_NAME } from "@/lib/site";
import { caseStudies } from "@/lib/work";

export const metadata: Metadata = {
  title: `Work · ${SITE_NAME}`,
  description: "Case studies: PayLedger, Webhook Inspector and Taskboard API.",
  alternates: { canonical: "/work" },
};

export default function WorkIndex() {
  return (
    <>
      <Nav current="work" />
      <main id="main">
        <div className="wrap">
          <header className="page-head">
            <h1>Selected work</h1>
            <p>Three projects written up like design docs: the problem, the hard parts, and the tests that prove them.</p>
          </header>
          {caseStudies.map((cs) => (
            <WorkEntry key={cs.slug} cs={cs} headingLevel={2} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Write the three first-draft bodies**

**The controller writes these, not an implementer subagent.** The controller holds the verified facts gathered for each repo (research reports from 2026-09-23). Each first draft must:
- follow the seven `##` headings of `CASE_STUDY_OUTLINE` exactly;
- run 250–450 words;
- use only facts true at the registry commit;
- wrap claims that have code evidence in `<Claim>…<Evidence path="…" lines="…">…</Evidence></Claim>`, with Evidence as the last child, and verify every line range with `git -C ../<repo> show <commit>:<path> | sed -n '<range>p'`;
- in `## Links`, link the repo tree at the pinned commit (`https://github.com/gabryelvs/<repo>/tree/<commit>`) and the live URL.

Tasks 10–12 expand the drafts to full length.

- [ ] **Step 5: Run everything, including the build**

Run: `npm test && npm run lint && npm run build`
Expected: all green, and the build lists `/work/payledger`, `/work/webhook-inspector` and `/work/taskboard-api` as SSG (●).

- [ ] **Step 6: Visual check against the mockup**

Compare `/work/payledger` with `docs/superpowers/mockups/2026-09-23-redesign-mockup.html#payledger` at 1440px and 390px, in both themes. Check that:
- evidence notes sit in the right margin at 1440px and below each paragraph at 390px;
- the page doesn't scroll sideways at 390px (`document.documentElement.scrollWidth === 390`).

- [ ] **Step 7: Commit**

```bash
git add -A app/work components/case-study content tests
git commit -m "feat(redesign): case-study pages, work index and first-draft bodies

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Share images, sitemap, robots, analytics

**Files:**
- Create: `app/opengraph-image.tsx`, `app/work/[slug]/opengraph-image.tsx`, `lib/og.tsx`, `app/sitemap.ts`, `app/robots.ts`, `tests/seo.test.ts`
- Modify: `app/layout.tsx` (Analytics), `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `SITE_URL`, `SITE_NAME`, `ROLE` (Task 1); `caseStudies`, `getCaseStudy` (Task 3).
- Produces:
  - `sitemap()` and `robots()` (Next metadata routes)
  - `ogImage({ title, subtitle, kicker }): Promise<ImageResponse>` in `lib/og.tsx`

- [ ] **Step 1: Install**

Run: `npm install @vercel/analytics && npm install -D @fontsource/inter`
Check: `ls node_modules/@fontsource/inter/files/inter-latin-600-normal.woff node_modules/@fontsource/inter/files/inter-latin-400-normal.woff`. Both must exist, because ImageResponse accepts woff but not woff2.

- [ ] **Step 2: Write the failing test** `tests/seo.test.ts`

```ts
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";

describe("sitemap", () => {
  it("lists home, the work index and each case study with absolute URLs", () => {
    expect(sitemap().map((e) => e.url)).toEqual([
      SITE_URL,
      `${SITE_URL}/work`,
      `${SITE_URL}/work/payledger`,
      `${SITE_URL}/work/webhook-inspector`,
      `${SITE_URL}/work/taskboard-api`,
    ]);
  });
});

describe("robots", () => {
  it("allows crawling and points at the sitemap", () => {
    const r = robots();
    expect(r.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe("layout", () => {
  const layout = readFileSync(new NodeURL("../app/layout.tsx", import.meta.url), "utf8");
  it("mounts cookieless Vercel Analytics", () => {
    expect(layout).toContain('import { Analytics } from "@vercel/analytics/next"');
    expect(layout).toContain("<Analytics />");
  });
  it("sets metadataBase from SITE_URL", () => {
    expect(layout).toContain("metadataBase: new URL(SITE_URL)");
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run tests/seo.test.ts`
Expected: FAIL, `app/robots` and `app/sitemap` are missing.

- [ ] **Step 4: Implement**

`app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { caseStudies } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/work`, changeFrequency: "monthly", priority: 0.8 },
    ...caseStudies.map((cs) => ({
      url: `${SITE_URL}/work/${cs.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
```

`app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
```

`lib/og.tsx`:
```tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (weight: 400 | 600) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

export async function ogImage({ title, subtitle, kicker }: { title: string; subtitle: string; kicker: string }) {
  const [regular, semibold] = await Promise.all([font(400), font(600)]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 80px", background: "#08090a", color: "#f7f8f8", fontFamily: "Inter" }}>
        <div style={{ display: "flex", fontSize: 26, color: "#8a8f98" }}>{kicker}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 600, letterSpacing: -3, lineHeight: 1.02 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#b6bac1", lineHeight: 1.4, maxWidth: 980 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", height: 1, background: "#2f3137" }} />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: regular, style: "normal", weight: 400 },
        { name: "Inter", data: semibold, style: "normal", weight: 600 },
      ],
    },
  );
}
```

`app/opengraph-image.tsx`:
```tsx
import { OG_SIZE, ogImage } from "@/lib/og";
import { ROLE, SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}, ${ROLE}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    kicker: ROLE,
    title: SITE_NAME,
    subtitle: "Reliable systems for fintech: payments, ledgers and the services around them.",
  });
}
```

`app/work/[slug]/opengraph-image.tsx`:
```tsx
import { OG_SIZE, ogImage } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";
import { caseStudies, getCaseStudy } from "@/lib/work";

export const alt = "Case study";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug)!;
  return ogImage({ kicker: `Case study · ${SITE_NAME}`, title: cs.title, subtitle: cs.summary });
}
```

`app/layout.tsx`: add `import { Analytics } from "@vercel/analytics/next";` and render `<Analytics />` as the last child of `<body>`.

- [ ] **Step 5: Run everything**

Run: `npm test && npm run lint && npm run build`
Expected: green, and the build output lists `/opengraph-image`, `/work/[slug]/opengraph-image` (3 paths), `/sitemap.xml` and `/robots.txt`.

Then `npx next start -p 3200` and check:
- `curl -sI http://localhost:3200/work/payledger/opengraph-image | head -3` returns `200` with `content-type: image/png`.
- `curl -s http://localhost:3200/work/payledger | grep -o 'og:image[^>]*'` shows an absolute URL.

- [ ] **Step 6: Commit**

```bash
git add -A app lib/og.tsx tests/seo.test.ts package.json package-lock.json
git commit -m "feat(redesign): share images, sitemap, robots and cookieless analytics

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Tasks 11–13: Full case-study content (controller-authored, then edited by Gabryel)

Run these in the main session, not as implementer subagents. They need the verified research, judgement about honesty, and Gabryel's edit pass. Each task does the same five steps for one case study:

1. **Freeze the facts.**
   - Record the repo's final default-branch SHA in `lib/work.ts` (`commit`).
   - Re-verify every registry fact, the `tests` line, and the `sequences` steps against that SHA. Count tests with `grep`.
2. **Write the body** in `content/work/<slug>.mdx`: 800–1,200 words, the fixed outline, one `<Claim>`+`<Evidence>` per claim that has code behind it, and line ranges checked with `git show <sha>:<path> | sed -n`.
3. **Add a word-count check** to `tests/caseStudyContent.test.ts`. Strip fenced code, JSX tags and link targets before counting, and require 800 to 1,300 words. Add it in Task 11 and apply it to all three files once all three are complete (Task 13).
4. **Probe the live URL** with a 30-second timeout. If it doesn't answer a real route, set `liveUrl: null` and say so on the page.
5. **Hand the draft to Gabryel.** He edits anything he couldn't explain in an interview. Then commit.

- **Task 11: Webhook Inspector.** Commit `c98d29be55d412c5a8638f8d87769fd15caa513b`, final: PR #1 merged.
- **Task 12: PayLedger.** Blocked until the PayLedger fixes PR merges.
  - Update the summary, facts, `tests` line and `sequences.payledger`: the key is claimed inside the transfer transaction, and there's no separate commit.
  - Add the ownership-audit story to Hard problems.
- **Task 13: Taskboard API.** Commit `d5d852447f437738e815d2fa66cbaf287f652640`, final: PR #1 merged. Then enable the word-count range for all three files.

---

### Task 14: Collateral corrections, PRODUCT.md and README

**Files:**
- Modify: `cv/cv-data.json`, `public/cv.pdf` (rebuilt), `cv/LINKEDIN-content.md`, `cv/Cover-Letter-General-Template.md`, `README.md`, `PRODUCT.md` (add to git)
- Modify: `/Users/gabs/Project/gabryelvs/README.md` in a separate repo and PR

- [ ] **Step 1: Correct claims so they match the merged fixes**
  - PayLedger: remove Redis from its tech line and descriptions everywhere. Update the test count and describe the ownership checks and atomic idempotency only as merged.
  - Webhook Inspector: "per-client rate limiting (Fly-Client-IP)" and the new test counts, 27 + 7, with CI.
  - Taskboard: "reusing a rotated refresh token revokes every session for the user". Replace every "family revocation", and keep the test count at 62.

- [ ] **Step 2: Rebuild the CV and check the page count**
  - Rebuild both CV files: `node cv/build_cv.js` and `python cv/build_cv_pdf.py`, run in a venv with `cv/requirements.txt`. `cv/cv-contact.json` must exist locally.
  - Check it's still exactly 2 pages.

- [ ] **Step 3: Rewrite PRODUCT.md**
  - Change the audience to graduate and junior software engineer roles; freelance clients are no longer a target.
  - Remove the GSAP, three.js and WebGL lines, and the hero counters from Evidence on Hand. Add the case studies.
  - Keep the principles. Change principle 4 to "Evidence outranks decoration: motion never stands between the visitor and proof of work."
  - Record the accessibility standard: WCAG 2.2 AA.

- [ ] **Step 4: Update README.md**
  - Stack: no GSAP or three.js, and MDX added.
  - Case studies: explain how to edit `content/work/*.mdx`, the `<Claim>`/`<Evidence>` pattern, and pinning `commit` in `lib/work.ts`.

- [ ] **Step 5: Run the checks and commit**
  - `npm test` (the copy guards) and `npm run build`.
  - Commit to `redesign`. Open the `gabryelvs/gabryelvs` README change as its own PR.

---

### Task 15: Verification, finish review, DESIGN.md, PR

- [ ] **Step 1: Run the checks**
  - `npm test && npm run lint && npm run build`, all green. Paste the summary lines into the PR body.
- [ ] **Step 2: Check the site in a browser** against a local production build (`npx next start -p 3200`, Playwright + Chrome):
  - **Screens:** Home, `/work` and each case study at 1440px and 390px, in dark and light, captured into `.impeccable/review/`.
  - **Overflow:** no sideways scrolling at 390px, checked with `scrollWidth === clientWidth` on every page.
  - **Keyboard:** Tab through Home and one case study. The skip link appears first, focus rings are visible everywhere, the theme toggle works, and focusing a work entry draws its hot path.
  - **Motion:** with reduced motion on, nothing animates and all content is visible.
- [ ] **Step 3: Run Lighthouse** (mobile and desktop) on `/` and `/work/payledger`: `npx lighthouse http://localhost:3200/ --preset=desktop --quiet --chrome-flags="--headless"`, plus the mobile default. Every category must be ≥95. Fix, then re-run once.
- [ ] **Step 4: Check that links resolve**
  - Every `liveUrl` answers a real route (30s timeout, one retry for Fly cold starts).
  - Every pinned GitHub URL on the three case studies returns 200: extract them from the built HTML and run `curl -sI`.
- [ ] **Step 5: Design finish review**
  - Run `impeccable detect --json` on the changed UI files once.
  - Spawn `impeccable-finish-reviewer` with the spec, the approved mockup, the screenshots and the detector output.
  - Apply its fixes, then spawn `impeccable-documenter` to write `DESIGN.md` and `.impeccable/design.json` from the built site.
- [ ] **Step 6: Open the PR.** Push `redesign` and open a PR to `main` with screenshots, the Lighthouse scores and the test counts. **Do not merge**; Gabryel reviews the Vercel preview and merges.
- [ ] **Step 7: Domain follow-up (after merge, when Gabryel has bought `gabryelverissimo.dev`).** In order:
  1. Point DNS at Vercel.
  2. Redirect `portfolio-gabryelverissimo.vercel.app` to the new domain.
  3. Change `SITE_URL` in `lib/site.ts`.
  4. Verify `hello@` forwarding, then swap `LINKS.email` and the CV contact line.
  5. Enable Web Analytics in the Vercel dashboard.
