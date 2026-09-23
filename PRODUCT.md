# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: hiring managers and engineers evaluating Gabryel Verissimo for a graduate
or junior software engineering role in London (roles from summer 2027). They arrive
from an application, CV, or message, usually with a CV already in hand, and skim
briefly to decide whether the candidate is worth a conversation.

Freelance clients are no longer a target audience for this site. Client work (Auto
Boutique London) appears only as factual experience — in the CV and the Experience
section — not as a service pitch.

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

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, MDX.
- Motion is CSS only; no GSAP, no three.js, no WebGL.
- Vitest + React Testing Library. Deployed on Vercel.
- Projects come from the GitHub API filtered to the `showcase` topic; the topic is
  stripped from display. `GITHUB_TOKEN` is optional and only raises the rate limit.
- `data/projects.fallback.json` backs the list when the API errors or is rate
  limited. The interface must stay correct when the API returns nothing, returns
  fewer projects than expected, or returns a repo with no description.
- Three of the showcased repos (PayLedger, Webhook Inspector, Taskboard API) also
  get a full case-study page instead of just a GitHub card.
- Sections: Hero, Selected work (3 case studies), Experience, More work (GitHub
  showcase), About, Contact, plus Nav and a theme toggle.

## Brand Commitments

Name: Gabryel Verissimo. The site is dark-mode-first with a theme toggle already
implemented.

## Evidence on Hand

- Real, deployed projects surfaced from GitHub via the `showcase` topic.
- Three full case studies at `/work/<slug>` (PayLedger, Webhook Inspector, Taskboard
  API), each pinned to a commit SHA, with `<Evidence>` links straight to the lines
  of code a claim describes.
- A CV lives in the repo (`cv/`).

Must not be fabricated: testimonials, client names, employers, user counts,
benchmarks, revenue, or any metric not traceable to a real repository or
deployment.

## Product Principles

1. **The skim is the design constraint.** A visitor deciding in well under a minute
   must reach evidence without scrolling hunting for it.
2. **Claims are traceable.** Every project shown maps to a real repository; every
   number maps to something countable. No invented proof.
3. **Degrade honestly.** The GitHub API is a runtime dependency outside our
   control. Empty, partial, and error states are core states, not edge cases.
4. **Evidence outranks decoration**: motion never stands between the visitor and
   proof of work.

## Accessibility & Inclusion

WCAG 2.2 AA is the target. Reduced motion is honoured throughout, and focus states
are keyboard-first.
