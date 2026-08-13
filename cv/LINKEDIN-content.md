# LinkedIn — ready-to-paste content

Copy each block into the matching LinkedIn section. Links: paste them as-is (LinkedIn
auto-links URLs).

---

## 1. Headline (the line under your name — max 220 characters)

```
Computer Science Student @ University of Greenwich | Aspiring Backend Software Engineer | Python · FastAPI · Java · Spring Boot · PostgreSQL | Building & deploying fintech APIs
```

---

## 2. About section

```
Final-year Computer Science student at the University of Greenwich, focused on becoming a backend software engineer in London.

I build small, production-shaped backend services in Python and FastAPI — each one tested, run in continuous integration, containerised with Docker, and deployed live with interactive documentation you can try in the browser. I'm especially drawn to fintech problems: handling money correctly, keeping systems consistent under load, and staying reliable when things go wrong.

Recent projects:

• PayLedger — a double-entry payments and ledger API. Money is stored as integer minor units (no floating-point errors), transfers write balanced append-only entries, concurrent transfers are race-safe under row locking, and writes are idempotent.
Code: https://github.com/gabryelvs/payledger  |  Live demo: https://payledger-gv.fly.dev/docs

• FX-Service — an async currency-exchange API. It caches European Central Bank rates in Redis, refreshes them on a background schedule, and keeps serving last-known rates when the upstream is down.
Code: https://github.com/gabryelvs/fx-service  |  Live demo: https://fx-service-gv.fly.dev/docs

• Webhook-Dispatcher — reliable webhook delivery via a Redis queue and a separate worker. Requests are signed (HMAC-SHA256), failures retry with exponential backoff, and exhausted deliveries are dead-lettered and replayable.
Code: https://github.com/gabryelvs/webhook-dispatcher

• Taskboard API — a Trello-like task manager API in Java and Spring Boot. JWT auth with refresh-token rotation and family revocation on reuse, 404-no-leak authorization, and transactional card ordering under pessimistic locking — 62 Testcontainers tests.
Code: https://github.com/gabryelvs/taskboard-api  |  Live demo: https://taskboard-gv.fly.dev/swagger-ui.html

• OWASP Security Lab — an intentionally-vulnerable FastAPI app covering six OWASP Top 10 issues, each with a working exploit, a hardened fix, and tests proving both — a hands-on study in secure coding.
Code: https://github.com/gabryelvs/owasp-security-lab

• SECTOR—9 — an animated demo storefront, built as a sales asset for freelance work: a reducer-driven cart with 30 tests, focus-trapping overlays that respect reduced-motion, and Lighthouse 99–100.
Code: https://github.com/gabryelvs/store-demo  |  Live demo: https://store-demo-gv.fly.dev

I'm looking for a junior or placement backend developer role where I can keep learning from experienced engineers and contribute to real systems.

Portfolio: https://portfolio-gabryelverissimo.vercel.app
GitHub: https://github.com/gabryelvs
```

---

## 3. Featured section (add each as a "Link")

LinkedIn → your profile → Featured → "+" → Add a link. Add these (lead with the portfolio site):

**Link 1 (feature this first)**
- URL: `https://portfolio-gabryelverissimo.vercel.app`
- Title: `Portfolio — backend projects, live demos & CV (Next.js)`

**Link 2**
- URL: `https://github.com/gabryelvs/payledger`
- Title: `PayLedger — Double-entry payments API (Python/FastAPI/PostgreSQL)`

**Link 3**
- URL: `https://payledger-gv.fly.dev/docs`
- Title: `PayLedger — Live API demo (Swagger)`

**Link 4**
- URL: `https://github.com/gabryelvs/fx-service`
- Title: `FX-Service — Async currency-exchange API (FastAPI/Redis)`

**Link 5**
- URL: `https://fx-service-gv.fly.dev/docs`
- Title: `FX-Service — Live API demo (Swagger)`

**Link 6**
- URL: `https://github.com/gabryelvs/webhook-dispatcher`
- Title: `Webhook-Dispatcher — Reliable webhook delivery (queue + worker, FastAPI/Redis)`

**Link 7**
- URL: `https://github.com/gabryelvs/owasp-security-lab`
- Title: `OWASP Security Lab — 6 OWASP Top 10 vulns, each with exploit + fix + tests (FastAPI)`

**Link 8**
- URL: `https://store-demo-gv.fly.dev`
- Title: `SECTOR—9 — Animated storefront demo, live (Next.js/TypeScript/GSAP)`

**Link 9**
- URL: `https://github.com/gabryelvs/store-demo`
- Title: `SECTOR—9 — Storefront demo source: accessible overlays, tested cart, Lighthouse 99–100`

**Link 10**
- URL: `https://webhook-inspector-gv.fly.dev`
- Title: `Webhook Inspector — Live fullstack tool (FastAPI + React/TypeScript)`

**Link 11**
- URL: `https://github.com/gabryelvs/webhook-inspector`
- Title: `Webhook Inspector — Disposable URLs, live request viewer, 32 tests across the stack`

**Link 12**
- URL: `https://taskboard-gv.fly.dev/swagger-ui.html`
- Title: `Taskboard API — Live API demo (Java 21 / Spring Boot, Swagger)`

**Link 13**
- URL: `https://github.com/gabryelvs/taskboard-api`
- Title: `Taskboard API — JWT refresh-token rotation, transactional card ordering, 62 Testcontainers tests`

*If you only pin a handful: portfolio first, then Webhook Inspector (fullstack), Taskboard
(Java/Spring — the one most London backend roles screen for), and PayLedger (fintech).*

---

## 4. Projects section (optional, richer than Featured)

LinkedIn → Add profile section → Recommended → Add projects.

**Project 1**
- Name: `PayLedger — Double-entry payments & ledger API`
- Description:
```
A backend payments API built on an immutable double-entry ledger. Money is stored as integer minor units to avoid floating-point errors; every transfer writes balanced, append-only ledger entries; concurrent transfers are serialised with database row locking (verified by a test that fires 20 parallel transfers); and write endpoints are idempotent to prevent double-charges. Test-driven (31 tests), GitHub Actions CI, Dockerised, and deployed on Fly.io.
Stack: Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Docker.
```
- Link: `https://github.com/gabryelvs/payledger`

**Project 2**
- Name: `FX-Service — Async currency-exchange API`
- Description:
```
An asynchronous currency-rate and conversion API. It fetches ECB rates from Frankfurter, caches them in Redis, and refreshes them on an in-process background schedule, so requests are served fast from cache. If the upstream provider is down, a failed refresh never clears the cache, so the service keeps serving last-known rates (stale fallback) — proven by an automated outage test. Conversions use exact Decimal rounding. Test-driven (31 tests, 90% coverage), CI, Dockerised, deployed on Fly.io.
Stack: Python, FastAPI, httpx, Redis, Docker.
```
- Link: `https://github.com/gabryelvs/fx-service`

**Project 3**
- Name: `Webhook-Dispatcher — Reliable webhook delivery`
- Description:
```
A service that reliably delivers webhooks. An API accepts events and a separate worker process delivers them from a Redis queue, signing each request with HMAC-SHA256 so receivers can verify authenticity. Failed deliveries are retried with exponential backoff and jitter; exhausted ones are dead-lettered and can be replayed. At-least-once delivery with de-duplication via a stable request id. Test-driven (28 tests, 92% coverage), GitHub Actions CI, Dockerised.
Stack: Python, FastAPI, Redis, httpx, Docker.
```
- Link: `https://github.com/gabryelvs/webhook-dispatcher`

**Project 4**
- Name: `SECTOR—9 — Animated demo storefront`
- Description:
```
A storefront demo built as a client-facing sales asset for freelance web work — the thing a prospect clicks through instead of reading a proposal. A 20-product catalogue sits behind a single data seam, so a real backend replaces the mock data without touching any page. The cart is a pure reducer with totals derived in integer pence and localStorage rehydration that validates what it reads, so a stale or hand-edited bag can never render a wrong total (30 Vitest tests). Scroll-driven GSAP reveals and a parallax band carry the motion; the quick-view, cart and mobile-nav overlays each trap focus, mark the background inert for screen readers, restore focus on close, and stand down entirely under prefers-reduced-motion. 26 statically prerendered routes shipped as a standalone container on Fly.io, scoring 99–100 on Lighthouse performance, accessibility, best practices and SEO with zero layout shift.
Stack: TypeScript, Next.js 16, React 19, Tailwind 4, GSAP, Docker, Vitest.
```
- Link: `https://store-demo-gv.fly.dev`

**Project 5**
- Name: `Webhook Inspector — Fullstack webhook debugging tool`
- Description:
```
A fullstack tool for debugging webhooks: you create a disposable URL, point any provider at it, and watch requests arrive live in a React interface showing headers, pretty-printed body, and query parameters. Hardened for public deployment — per-IP rate limiting, request bodies streamed and capped at 1 MB so a large payload cannot exhaust memory, per-bin retention limits, and a capture endpoint that always answers 200 so a database fault never breaks the sender's webhook. Test-driven across the stack (25 backend pytest + 7 frontend Vitest tests), single-container Docker build serving the API and the compiled React app, deployed on Fly.io with PostgreSQL.
Stack: Python, FastAPI, PostgreSQL, React, TypeScript, Tailwind, Docker.
```
- Link: `https://webhook-inspector-gv.fly.dev`

**Project 6**
- Name: `Taskboard API — Trello-like task manager API`
- Description:
```
A Trello-like task manager REST API in Java and Spring Boot. Authentication uses JWT with refresh-token rotation and family revocation on reuse detection, so a stolen refresh token invalidates the whole chain rather than granting quiet access. Project membership is role-based (OWNER/MEMBER) with 404-no-leak authorization, so an unauthorised user cannot even confirm a resource exists. Drag-and-drop card ordering is transactional with pessimistic column locking in a deterministic lock order, proven under concurrent-move integration tests; errors are RFC 7807 problem+json. Test-driven with 62 Testcontainers integration tests against a real PostgreSQL, OpenAPI/Swagger docs, GitHub Actions CI, deployed on Fly.io.
Stack: Java 21, Spring Boot, Spring Security, PostgreSQL, Testcontainers, Docker.
```
- Link: `https://taskboard-gv.fly.dev/swagger-ui.html`

---

## 5. Skills to add

LinkedIn → Skills → add these (and mark the top 3 as "pinned"):

Python · FastAPI · PostgreSQL · Redis · SQLAlchemy · REST APIs · Docker · Git · GitHub Actions (CI/CD) · Test-Driven Development · Backend Development · SQL · Asynchronous Programming · Message Queues · Distributed Systems · Application Security · OWASP · Secure Coding · TypeScript · React · Next.js · Web Accessibility

---

*Tip: after adding the About and Featured links, set your profile to "Open to work →
Backend Developer / Software Engineer, London" so recruiters find you.*
