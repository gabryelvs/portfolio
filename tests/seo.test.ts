import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { describe, expect, it } from "vitest";
import { metadata as homeMetadata } from "@/app/page";
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

describe("home metadata", () => {
  it("sets the canonical to the site root", () => {
    expect(homeMetadata.alternates?.canonical).toBe("/");
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
