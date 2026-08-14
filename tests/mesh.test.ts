import { describe, expect, it } from "vitest";
import {
  clampDpr,
  HERO_LINK_DISTANCE,
  HERO_NODE_COUNT,
  linkPairs,
  MESH_BREAKPOINT,
  nodeCount,
  parseAccent,
  shouldRenderMesh,
} from "@/lib/mesh";

describe("parseAccent", () => {
  it("parses a six-digit hex with a hash", () => {
    expect(parseAccent("#6366f1")).toEqual([99, 102, 241]);
  });
  it("parses a six-digit hex without a hash and with surrounding space", () => {
    expect(parseAccent("  4f46e5 ")).toEqual([79, 70, 229]);
  });
  it("falls back to indigo-500 for malformed input", () => {
    expect(parseAccent("rgb(1,2,3)")).toEqual([99, 102, 241]);
    expect(parseAccent("")).toEqual([99, 102, 241]);
  });
});

describe("clampDpr", () => {
  it("caps at 2", () => {
    expect(clampDpr(3)).toBe(2);
  });
  it("passes through values between 1 and 2", () => {
    expect(clampDpr(1.5)).toBe(1.5);
  });
  it("floors at 1 for zero, negative, or non-finite input", () => {
    expect(clampDpr(0)).toBe(1);
    expect(clampDpr(-4)).toBe(1);
    expect(clampDpr(Number.NaN)).toBe(1);
  });
});

describe("nodeCount", () => {
  it("floors at 30 for tiny viewports", () => {
    expect(nodeCount(320, 480)).toBe(30);
  });
  it("caps at 90 for large viewports", () => {
    expect(nodeCount(2560, 1440)).toBe(90);
  });
  it("scales with area in between", () => {
    expect(nodeCount(1000, 800)).toBe(50);
  });
});

describe("linkPairs", () => {
  it("links points within the distance", () => {
    const links = linkPairs([{ x: 0, y: 0 }, { x: 3, y: 4 }], 10);
    expect(links).toEqual([{ a: 0, b: 1, distance: 5 }]);
  });
  it("excludes points beyond the distance", () => {
    expect(linkPairs([{ x: 0, y: 0 }, { x: 30, y: 40 }], 10)).toEqual([]);
  });
  it("includes points exactly at the distance", () => {
    expect(linkPairs([{ x: 0, y: 0 }, { x: 3, y: 4 }], 5)).toHaveLength(1);
  });
  it("uses z when present", () => {
    expect(linkPairs([{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 6 }], 5)).toEqual([]);
  });
  it("never links a point to itself and never repeats a pair", () => {
    const links = linkPairs([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], 10);
    expect(links).toHaveLength(3);
  });
});

describe("shouldRenderMesh", () => {
  it("renders at the breakpoint with motion allowed", () => {
    expect(shouldRenderMesh({ width: MESH_BREAKPOINT, reducedMotion: false })).toBe(true);
  });
  it("does not render one pixel below the breakpoint", () => {
    expect(shouldRenderMesh({ width: MESH_BREAKPOINT - 1, reducedMotion: false })).toBe(false);
  });
  it("does not render under reduced motion at any width", () => {
    expect(shouldRenderMesh({ width: 1920, reducedMotion: true })).toBe(false);
  });
});

describe("constants", () => {
  it("exposes the hero mesh sizing", () => {
    expect(HERO_NODE_COUNT).toBe(120);
    expect(HERO_LINK_DISTANCE).toBeGreaterThan(0);
  });
});
