# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: hiring managers and technical recruiters evaluating Gabryel Veríssimo for
backend software engineering roles in London. They arrive from an application, CV,
or message, usually with a CV already in hand, and skim briefly to decide whether
the candidate is worth a conversation.

Secondary (present but not optimized for): prospective freelance clients looking at
the site as evidence of frontend craft. The README currently advertises "fintech
services" alongside engineering work; that second audience is acknowledged, not
designed for.

## Product Purpose

A personal portfolio that converts a skim into a reply. It exists to make a
candidate's shipped work legible and verifiable fast enough to survive a short
evaluation, and to serve as the single URL worth pasting into applications.

Success is an interview or recruiter reply, and — before that — surviving the skim:
someone who already has the CV opens the site, believes the projects are real and
deployed, and does not bounce.

## Positioning

Project listings are not hand-maintained marketing copy. They are generated from
the GitHub account itself: repositories tagged with the `showcase` topic, ranked by
stars then recency, refreshed daily via ISR. What a visitor reads is downstream of
what was actually pushed, which is a claim a hand-written portfolio cannot honestly
make.

## Operating Context

Visitors are short on time and often mid-triage across many candidates. Arrival is
typically from an application, CV link, or direct message rather than search. The
site is read on both desktop and phone, and frequently alongside the CV rather than
instead of it.

## Capabilities and Constraints

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
- GSAP (ScrollTrigger) for scroll-driven animation; three.js WebGL hero.
- Vitest + React Testing Library. Deployed on Vercel.
- Projects come from the GitHub API filtered to the `showcase` topic; the topic is
  stripped from display. `GITHUB_TOKEN` is optional and only raises the rate limit.
- `data/projects.fallback.json` backs the list when the API errors or is rate
  limited. The interface must stay correct when the API returns nothing, returns
  fewer projects than expected, or returns a repo with no description.
- Sections: Hero, About, Projects, Contact, plus Nav and a theme toggle.

Undecided: whether the freelance/fintech offer stays on this site or moves
elsewhere. The README asserts both; only the hiring audience is confirmed as primary.

## Brand Commitments

Name: Gabryel Veríssimo. The site is dark-mode-first with a theme toggle already
implemented.

## Evidence on Hand

- Real, deployed projects surfaced from GitHub via the `showcase` topic.
- Hero counters for shipped projects, automated tests, and live deployments, drawn
  from actual work.
- A CV lives in the repo (`cv/`).

Must not be fabricated: testimonials, client names, employers, user counts,
benchmarks, revenue, or any metric not traceable to a real repository or
deployment. The hero's numbers are real and must stay real — if a number cannot be
substantiated, remove it rather than estimate it.

## Product Principles

1. **The skim is the design constraint.** A visitor deciding in well under a minute
   must reach evidence without scrolling hunting for it.
2. **Claims are traceable.** Every project shown maps to a real repository; every
   number maps to something countable. No invented proof.
3. **Degrade honestly.** The GitHub API is a runtime dependency outside our
   control. Empty, partial, and error states are core states, not edge cases.
4. **Evidence outranks decoration.** Animation and the WebGL hero earn attention;
   they never stand between the visitor and proof of work.

## Accessibility & Inclusion

No product-specific standard was established. Noted from the implementation, not as
a confirmed commitment: the hero already honours `prefers-reduced-motion`.
