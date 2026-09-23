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
    summary:
      "A double-entry payments API that stays correct when transfers race, requests are retried, and callers try wallets that aren't theirs.",
    facts: [
      { label: "Concurrency", value: "SELECT … FOR UPDATE, locked in id order" },
      { label: "Retries", value: "Idempotency-Key claimed inside the transfer's transaction" },
      { label: "Proof", value: "Parallel-retry and 20-thread tests on real PostgreSQL" },
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "Alembic", "Docker"],
    role: "Solo: design, build, deploy",
    tests: "67 pytest on real PostgreSQL",
    repoUrl: "https://github.com/gabryelvs/payledger",
    liveUrl: "https://payledger-gv.vercel.app/docs",
    liveLabel: "API docs",
    commit: "ebb1a8a16770513562010f2ec9de9031bf22037f",
    thumbCaption: "One transaction: lock, write both sides, commit.",
  },
  {
    slug: "webhook-inspector",
    title: "Webhook Inspector",
    repoName: "webhook-inspector",
    summary:
      "A public endpoint that captures any webhook sent to it and shows it live, and never tells the sender that something went wrong on its side.",
    facts: [
      { label: "Capture", value: "Body streamed, capped at 1 MB, always answers 200" },
      { label: "In prod", value: "Cold-start crash and wrong client IP, found live and fixed" },
      { label: "Proof", value: "47 pytest · 7 Vitest · CI on every PR" },
    ],
    stack: ["FastAPI", "PostgreSQL", "React", "TypeScript", "Docker"],
    role: "Solo: design, build, deploy",
    tests: "47 pytest · 7 Vitest, run in CI",
    repoUrl: "https://github.com/gabryelvs/webhook-inspector",
    liveUrl: "https://webhook-inspector-gv.vercel.app",
    liveLabel: "Live app",
    commit: "48e5aec92726cce021ae3b46225bf1f1d8dfb087",
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
      { label: "Proof", value: "62 tests, 59 on real PostgreSQL (Testcontainers)" },
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
