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

  it("strips curly apostrophes too", () => {
    expect(slugify("What I’d change")).toBe("what-id-change");
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
