import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { CASE_STUDY_OUTLINE, caseStudies } from "@/lib/work";

const source = (slug: string) =>
  readFileSync(new NodeURL(`../content/work/${slug}.mdx`, import.meta.url), "utf8");

// Case studies that have been expanded from first draft to full length.
// Each one is held to the 800–1,200-word target (1,300 allows for editing).
const FULL_LENGTH: string[] = ["webhook-inspector", "payledger"];

/** Prose words only: fenced code, JSX tags and link targets are not counted. */
function proseWords(mdx: string): number {
  const text = mdx
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\]\([^)]*\)/g, "]");
  return (text.match(/[A-Za-z0-9][\w'’.-]*/g) ?? []).length;
}

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

  it("links the live demo the registry declares, or none", () => {
    const live = [...mdx.matchAll(/\[Live [^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]);
    expect(live).toEqual(cs.liveUrl ? [cs.liveUrl] : []);
  });

  it.runIf(FULL_LENGTH.includes(slug))("runs 800 to 1,300 words once expanded", () => {
    const words = proseWords(mdx);
    expect(words).toBeGreaterThanOrEqual(800);
    expect(words).toBeLessThanOrEqual(1300);
  });

  it("uses Evidence with a repo path and never a raw URL", () => {
    for (const m of mdx.matchAll(/<Evidence\s+([^>]*)>/g)) {
      expect(m[1]).toMatch(/path="[^"]+"/);
      expect(m[1]).not.toMatch(/https?:/);
    }
  });
});
