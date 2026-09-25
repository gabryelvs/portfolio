# LinkedIn — ready-to-paste content

The source for every section of the LinkedIn profile, kept in step with the CV, the
site and the GitHub README. Profile address: **https://www.linkedin.com/in/gabryel-verissimo**
(claimed 2026-09-23; changing it breaks every link to the profile, so update
`lib/site.ts`, `cv/cv-data.json`, the cover letter and the GitHub README in the same change).

When adding or editing a position, education or project, turn **Notify network** off
unless you mean to announce it.

---

## 1. Headline (the line under your name — max 220 characters)

```
Software Engineer | Python · Java · TypeScript | Fintech & reliable systems | BSc CS, Greenwich '27
```

---

## 2. About section

```
Software engineer in London, focused on fintech and reliable systems.

I build backend services in Python and Java, with TypeScript on the front end. Each one is tested, runs in CI, and is deployed live so you can try it in the browser. I'm drawn to the hard parts of fintech: handling money correctly, staying consistent when requests race, and failing safely when something goes wrong.

Case studies, written up like design docs with links to the exact code and tests:

• PayLedger: a double-entry payments API that stays correct when transfers race, requests are retried, and callers try wallets that aren't theirs. Python, FastAPI, PostgreSQL; 67 tests.
https://gabryelverissimo.dev/work/payledger

• Webhook Inspector: a public endpoint that captures any webhook sent to it and shows it live, and never tells the sender that something went wrong on its side. FastAPI, PostgreSQL, React, TypeScript; 54 tests.
https://gabryelverissimo.dev/work/webhook-inspector

• Taskboard API: a Trello-style API where two people can drag the same card at once, and a reused refresh token signs its owner out everywhere. Java 21, Spring Boot, PostgreSQL; 72 tests, 59 against a real database.
https://gabryelverissimo.dev/work/taskboard-api

More: FX-Service (an async FX-rate API that keeps serving last-known rates when its upstream is down), Webhook-Dispatcher (queued webhook delivery with signing, backoff and replay), OWASP Security Lab (six OWASP Top 10 issues, each with an exploit, a fix and tests) and SECTOR—9 (an animated storefront demo).

I use AI-assisted development (Claude Code): I set the design, review every change, and don't ship what I can't explain or test.

Open to graduate and junior software engineer roles in London from summer 2027.

Portfolio: https://gabryelverissimo.dev
GitHub: https://github.com/gabryelvs
Email: hello@gabryelverissimo.dev
```

**Top skills** (the five shown under About): Python · Java · Spring Boot · FastAPI · PostgreSQL

---

## 3. Featured section (add each as a "Link", in this order)

Four links, the same evidence the site leads with. More than this and the case studies
get lost.

LinkedIn shows the newest link first, so add them in reverse (4 → 1). Each description is
the case study's one-line summary.

1. `https://gabryelverissimo.dev` — Title: `Portfolio: case studies, live demos and CV` — Description: `Three case studies written up like design docs, with links to the exact code and tests, plus live demos and my CV.`
2. `https://gabryelverissimo.dev/work/payledger` — Title: `PayLedger: a payments API that stays correct under races and retries` — Description: the PayLedger line from the About, plus `Python, FastAPI, PostgreSQL; 67 tests.`
3. `https://gabryelverissimo.dev/work/webhook-inspector` — Title: `Webhook Inspector: capture any webhook and watch it arrive live` — Description: the Webhook Inspector line, plus `FastAPI, PostgreSQL, React, TypeScript; 54 tests.`
4. `https://gabryelverissimo.dev/work/taskboard-api` — Title: `Taskboard API: concurrent card moves and refresh-token reuse in Spring Boot` — Description: the Taskboard line, plus `Java 21, Spring Boot, PostgreSQL; 72 tests.`

---

## 4. Projects section

Case studies first, each linked to its write-up (which links on to the code and the live demo).
The numbering is priority, not display order: LinkedIn sorts the projects alphabetically, so
FX-Service shows first on the profile. Each description ends with a line naming the write-up or
live demo, and each link is added as media with the title given here.

**Project 1**
- Name: `PayLedger — Double-entry payments & ledger API`
- Description:
```
A backend payments API built on an immutable double-entry ledger. Money is stored as integer minor units to avoid floating-point errors; every transfer writes balanced, append-only ledger entries; concurrent transfers are serialised with database row locking (verified by a test that fires 20 parallel transfers); and write endpoints are idempotent to prevent double-charges. Only a wallet's owner can move or read its money. Test-driven (67 tests against real PostgreSQL, incl. concurrency tests), GitHub Actions CI, Dockerised, and deployed on Vercel.
Stack: Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Docker.
Case study: https://gabryelverissimo.dev/work/payledger
```
- Link: `https://gabryelverissimo.dev/work/payledger` — media title: `PayLedger — case study`

**Project 2**
- Name: `Webhook Inspector — Fullstack webhook debugging tool`
- Description:
```
A fullstack tool for debugging webhooks: you create a disposable URL, point any provider at it, and watch requests arrive live in a React interface showing headers, pretty-printed body, and query parameters. Hardened for public deployment — per-client rate limiting keyed on the real client IP behind the proxy, request bodies streamed and capped at 1 MB so a large payload cannot exhaust memory, per-bin retention limits, and a capture endpoint that always answers 200 so a database fault never breaks the sender's webhook. Test-driven across the stack (47 backend pytest + 7 frontend Vitest tests), the React app built and served alongside the API, deployed on Vercel with Neon PostgreSQL.
Stack: Python, FastAPI, PostgreSQL, React, TypeScript, Tailwind, Docker.
Case study: https://gabryelverissimo.dev/work/webhook-inspector
```
- Link: `https://gabryelverissimo.dev/work/webhook-inspector` — media title: `Webhook Inspector — case study`

**Project 3**
- Name: `Taskboard API — Trello-like task manager API`
- Description:
```
A Trello-like task manager REST API in Java and Spring Boot. Authentication uses JWT with refresh-token rotation: reusing a rotated refresh token revokes every session for that user, so a stolen refresh token is useless once the real client has rotated it, and every session is signed out. Project membership is role-based (OWNER/MEMBER) with 404-no-leak authorization, so an unauthorised user cannot even confirm a resource exists. Drag-and-drop card ordering is transactional with pessimistic column locking in a deterministic lock order, proven under concurrent-move integration tests; errors are RFC 7807 problem+json. Test-driven with 72 tests, 59 of them Testcontainers integration tests against a real PostgreSQL, OpenAPI/Swagger docs, GitHub Actions CI, deployed on Render with Neon PostgreSQL.
Stack: Java 21, Spring Boot, Spring Security, PostgreSQL, Testcontainers, Docker.
Case study: https://gabryelverissimo.dev/work/taskboard-api
```
- Link: `https://gabryelverissimo.dev/work/taskboard-api` — media title: `Taskboard API — case study`

**Project 4**
- Name: `FX-Service — Async currency-exchange API`
- Description:
```
An asynchronous currency-rate and conversion API. It fetches ECB rates from Frankfurter, caches them in Redis, and refreshes them on an in-process background schedule, so requests are served fast from cache. If the upstream provider is down, a failed refresh never clears the cache, so the service keeps serving last-known rates (stale fallback) — proven by an automated outage test. Conversions use exact Decimal rounding. Test-driven (31 tests, 90% coverage), CI, Dockerised, deployed on Fly.io.
Stack: Python, FastAPI, httpx, Redis, Docker.
```
- Link: `https://github.com/gabryelvs/fx-service` — media title: `FX-Service — Async currency-exchange API (FastAPI/Redis)`

**Project 5**
- Name: `Webhook-Dispatcher — Reliable webhook delivery`
- Description:
```
A service that reliably delivers webhooks. An API accepts events and a separate worker process delivers them from a Redis queue, signing each request with HMAC-SHA256 so receivers can verify authenticity. Failed deliveries are retried with exponential backoff and jitter; exhausted ones are dead-lettered and can be replayed. At-least-once delivery with de-duplication via a stable request id. Test-driven (28 tests, 92% coverage), GitHub Actions CI, Dockerised.
Stack: Python, FastAPI, Redis, httpx, Docker.
```
- Link: `https://github.com/gabryelvs/webhook-dispatcher` — media title: `Webhook-Dispatcher — Reliable webhook delivery`

**Project 6**
- Name: `SECTOR—9 — Animated demo storefront`
- Description:
```
A storefront demo built as a client-facing sales asset for freelance web work — the thing a prospect clicks through instead of reading a proposal. A 20-product catalogue sits behind a single data seam, so a real backend replaces the mock data without touching any page. The cart is a pure reducer with totals derived in integer pence and localStorage rehydration that validates what it reads, so a stale or hand-edited bag can never render a wrong total (30 Vitest tests). Scroll-driven GSAP reveals and a parallax band carry the motion; the quick-view, cart and mobile-nav overlays each trap focus, mark the background inert for screen readers, restore focus on close, and stand down entirely under prefers-reduced-motion. 26 statically prerendered routes served as plain files from Cloudflare Pages, scoring 100 on Lighthouse (desktop) for performance, accessibility, best practices and SEO, with zero layout shift.
Stack: TypeScript, Next.js 16, React 19, Tailwind 4, GSAP, Vitest.
Live: https://demo.gabryelverissimo.dev
```
- Link: `https://demo.gabryelverissimo.dev` — media title: `SECTOR—9 — live demo`

---

## 5. Experience (newest first)

Volunteering stays in Experience, marked "(Volunteer)", as on the CV. Leave employment
type blank where the CV doesn't state one.

**Freelance Software Engineer** · Self-employed · London, England, United Kingdom · Sep 2026 – Present
```
Auto Boutique London (pro bono): designed, built and deployed the production website for a Central London car-storage business, replacing its WordPress site with a static Astro build and a PHP enquiry endpoint that sends mail through Resend.
Set up push-to-deploy from GitHub Actions to SiteGround over SSH, archived the old WordPress install with verified backups, and completed a UK consumer-law pass: legal pages, consent-gated enquiry form, and no unverified reviews on the site.
```
*Add further clients here only once their site is live and they have agreed to be named;
mark unpaid work "(pro bono)".*

**Runner** · The Ivy Market Grill, Covent Garden · London · Jun 2026 – Sep 2026 (left 4 Sep)
```
Front-of-house runner in a restaurant serving 400–600 covers a day: ran food to section, handled allergen and dietary requirements, and kept pace and accuracy through peak service.
Trained new starters on section layout, allergen handling and service flow.
```

**Youth Leader (Volunteer)** · Cathedral International, West Norwood · Jun 2023 – Present
```
Lead a weekly session for 10–15 teenagers as part of the youth leadership team, covering mentoring, pastoral support, and planning session content.
Co-organised two youth events for 100–150 attendees, owning the technical side: live projection, visual design and art direction.
Serve on the projection team (2024 – Present), operating live visuals across weekly services — cueing lyrics, media and slides in real time with no pre-built running order (ProPresenter).
```

**Web Designer** · Impact Brixton · Jan 2021 (1 month)
```
One-month project with the team building the organisation's new website: assisted with page layout, visual content and user experience, and supported its social media with content creation.
```

**Hardware Technician** · Self-employed · London · Nov 2019 – Sep 2023
```
Built, repaired and upgraded desktop computers for private clients: custom builds to a budget, operating-system reinstalls and reformatting, and performance tuning.
```

---

## 6. Education (as on the CV)

- **University of Greenwich** · Bachelor of Science - BS, Computer Science · 2023 – Jul 2027 (expected) · Description: `Following a foundation year.`
- **City of Westminster College** · BTEC Level 2, Information and Communication Technology · 2022 – 2023 · Grade: `Double Distinction` · Description: `BTEC Level 2 ICT · GCSE English`
- **Lambeth College** · Level 1 Diploma, Information and Communication Technology · 2021 – 2022 · Grade: `Double Distinction` · Description: `Level 1 Diploma in ICT · GCSE Maths · Functional Skills Maths & English`
- **SESI-SENAI** · Diploma, Microsoft Applications · 2019 – 2020

A BTEC is a vocational qualification, not a degree: never use LinkedIn's
"Bachelor of Technology - BTech" option for it.

---

## 7. Skills

**Add:** Java · Spring Boot · Spring Security · TypeScript · React.js · Next.js · pytest · JSON Web Token (JWT) · Application Security · OWASP
(LinkedIn has no "GitHub Actions" skill; GitHub and CI/CD cover it.)

**Keep:** Python · FastAPI · PostgreSQL · Redis · SQLAlchemy · REST APIs · Docker · Git · GitHub · CI/CD · Test-Driven Development · Back-End Development · SQL · Asynchronous Programming

**Remove** (they dilute a software profile): Editing · Continuous Improvement · Security System Design · Information and Communications Technology (ICT) · Information Technology · Front-End Design · Computer Literacy · Construction · Microsoft Project · Microsoft Office · Visual Design

---

## 8. Open to work

- Job titles: `Software Engineer` · `Graduate Software Engineer` · `Back End Developer`
- Location types: On-site · Hybrid · Remote — Location: Greater London
- Start date: Immediately, I am actively applying
- Employment types: Full-time · Part-time
- Visibility: Recruiters only

"Back End Developer" belongs here, as a search term recruiters use, and not in the headline.

---

## 9. Languages

- Portuguese — Native or bilingual proficiency
- English — Full professional proficiency

---

## 10. Services

Web Development · Custom Software Development · Application Development
(no "Computer Repair": it pulls the profile away from software engineering).

Services description (max 500):
```
I design, build and deploy websites and web applications for small businesses: fast, accessible sites with a working enquiry flow, and backend services in Python or Java when a site needs more than pages. Recent work: the production website for Auto Boutique London (Astro, deployed through GitHub Actions). Portfolio: https://gabryelverissimo.dev
```

---

## 11. Contact info and intro

- Website: `https://gabryelverissimo.dev` — type: Portfolio
- Industry (Edit intro, not shown on the profile but used by recruiter search): `Software Development`

---

## 12. Background image

`linkedin-banner.png` (1584×396), from `assets/linkedin-banner.svg` in the gabryelvs repo,
which `scripts/make_banner.py` generates alongside the GitHub banner so the two match.
Screenshot the SVG at 1584×396 to get the PNG. The left third stays empty because the
profile photo covers it.
