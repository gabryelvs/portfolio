# General Cover Letter — Template

> **How to use:** Fill every `[BRACKETED]` part for each application — including the contact
> line, which is kept out of this public repo (see `cv-contact.json` next to this file). The bits to *always*
> change are the company name, the role title, and the one "why this company" sentence —
> recruiters spot a generic letter instantly, so that one tailored sentence matters most.
> Keep it to one page. Tuned for junior / placement **backend / software developer** roles;
> for IT-support roles use the separate West Ham-style version.

---

**Gabryel Veríssimo**
[CONTACT LINE — paste the `contact` value from `cv-contact.json`, the gitignored file
beside this one: address · phone · email]
GitHub: github.com/gabryelvs · LinkedIn: linkedin.com/in/gabryel-veríssimo

[Date]

Dear [Hiring Manager / Hiring Team / specific name if known],

I am writing to apply for the **[Role title]** position at **[Company]**. I am a final-year
Computer Science student at the University of Greenwich, based in London, focused on building a
career as a backend software engineer — and [one tailored sentence on why THIS company/role:
e.g. "I was drawn to [Company] because of your work in fintech payments" / "your focus on
building reliable, large-scale systems is exactly the kind of work I want to grow in"].

Beyond my degree, I learn by building. I have designed, built, tested, and deployed several
production-shaped projects; the two most relevant to this role:

- **PayLedger** — a double-entry payments API (FastAPI, PostgreSQL). It stores money as integer
  units to avoid rounding errors, records every transfer as a balanced, append-only ledger
  entry, makes concurrent transfers race-safe with database row locking, and uses idempotency
  keys to prevent double-charges. *(github.com/gabryelvs/payledger — live demo available)*
- **FX-Service** — an asynchronous currency-exchange API (FastAPI, httpx, Redis). It caches
  exchange rates, refreshes them on a background schedule, and keeps serving last-known rates
  when the upstream provider is down. *(github.com/gabryelvs/fx-service — live demo available)*

> **Swap-in bullets** — replace one of the two above when the ad points that way:
>
> - **Taskboard API** *(use for Java / Spring Boot ads — most London backend roles screen for
>   this)* — a Trello-like task manager API (Java 21, Spring Boot, PostgreSQL). JWT authentication
>   with refresh-token rotation and family revocation, so a stolen token invalidates the whole
>   chain rather than granting quiet access; role-based membership that returns 404 rather than
>   403 so an unauthorised user cannot confirm a resource exists; and transactional card ordering
>   under pessimistic locking, proven by 62 Testcontainers integration tests against a real
>   database. *(github.com/gabryelvs/taskboard-api — live demo available)*
>
> - **SECTOR—9** *(use for fullstack or front-end-leaning ads)* — an animated demo storefront
>   (Next.js, TypeScript, GSAP). The cart is a pure reducer with totals derived in integer pence
>   and stored state validated on the way back in, so a stale basket cannot render a wrong total;
>   every overlay traps focus, hides background content from screen readers, and stands down for
>   users who ask for reduced motion. It scores 99–100 on Lighthouse performance and accessibility.
>   *(github.com/gabryelvs/store-demo — live at store-demo-gv.fly.dev)*

Both projects are test-driven, run in continuous integration (GitHub Actions), are containerised
with Docker, and are deployed live. They reflect how I work: I set a demanding goal, teach myself
what I do not yet know, pay close attention to correctness, and see the work through to a
finished, working result.

I would bring genuine enthusiasm, a solid and growing technical foundation
([Python, FastAPI, PostgreSQL, Redis, SQL, Docker, Git — trim/expand to match the job ad]), and
the soft skills that make a good teammate: clear communication, reliability, and a real
eagerness to learn from experienced engineers. [Optional tailoring sentence: mention one specific
requirement from the job ad and how you meet it — mirror their wording.]

I would welcome the chance to contribute to [Company] and to keep developing as an engineer on
your team. Thank you for considering my application; I would be happy to discuss my projects or
how I can add value in this role.

Yours sincerely,
**Gabryel Veríssimo**

---

### Quick-tailoring checklist (before sending)
- [ ] Replaced `[Company]`, `[Role title]`, `[Date]`, and the greeting name.
- [ ] Wrote one genuine "why this company" sentence (research one fact about them).
- [ ] Chose the two project bullets that match the ad (Taskboard for Java/Spring, SECTOR—9 for
      fullstack/front-end), and deleted the swap-in block itself.
- [ ] Trimmed the skills list to match the job ad's keywords.
- [ ] Added one sentence echoing a specific requirement from the ad.
- [ ] Re-read once for the company name appearing correctly everywhere.
