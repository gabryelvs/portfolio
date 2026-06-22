import { describe, expect, it, vi } from "vitest";
import { getShowcaseProjects, mapRepo, selectShowcase } from "@/lib/github";

const raw = (over: Record<string, unknown> = {}) => ({
  name: "demo",
  description: "d",
  html_url: "https://github.com/gabryelvs/demo",
  homepage: "https://demo.dev",
  language: "Python",
  topics: ["showcase", "fastapi"],
  stargazers_count: 3,
  updated_at: "2026-01-01T00:00:00Z",
  fork: false,
  archived: false,
  ...over,
});

describe("mapRepo", () => {
  it("maps fields and strips the showcase topic", () => {
    const p = mapRepo(raw());
    expect(p.url).toBe("https://github.com/gabryelvs/demo");
    expect(p.homepage).toBe("https://demo.dev");
    expect(p.topics).toEqual(["fastapi"]);
    expect(p.stars).toBe(3);
  });
  it("treats empty homepage as null", () => {
    expect(mapRepo(raw({ homepage: "" })).homepage).toBeNull();
  });
});

describe("selectShowcase", () => {
  it("keeps only showcase, non-fork, non-archived repos", () => {
    const repos = [
      raw({ name: "a" }),
      raw({ name: "b", topics: ["fastapi"] }), // no showcase
      raw({ name: "c", fork: true }),
      raw({ name: "d", archived: true }),
    ];
    expect(selectShowcase(repos).map((p) => p.name)).toEqual(["a"]);
  });
  it("sorts by stars desc then updated desc", () => {
    const repos = [
      raw({ name: "low", stargazers_count: 1 }),
      raw({ name: "high", stargazers_count: 9 }),
    ];
    expect(selectShowcase(repos).map((p) => p.name)).toEqual(["high", "low"]);
  });
});

describe("getShowcaseProjects", () => {
  it("returns mapped projects on success", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [raw({ name: "live" })],
    });
    const out = await getShowcaseProjects(fakeFetch as unknown as typeof fetch);
    expect(out.map((p) => p.name)).toEqual(["live"]);
  });
  it("falls back on non-200", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({}) });
    const out = await getShowcaseProjects(fakeFetch as unknown as typeof fetch);
    expect(out.length).toBeGreaterThan(0); // fallback snapshot
    expect(out.some((p) => p.name === "payledger")).toBe(true);
  });
  it("falls back on thrown error", async () => {
    const fakeFetch = vi.fn().mockRejectedValue(new Error("network"));
    const out = await getShowcaseProjects(fakeFetch as unknown as typeof fetch);
    expect(out.some((p) => p.name === "fx-service")).toBe(true);
  });
});
