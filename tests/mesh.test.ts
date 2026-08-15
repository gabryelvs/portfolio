import { describe, expect, it } from "vitest";
import {
  clampDpr,
  HERO_LINK_DISTANCE,
  HERO_NODE_COUNT,
  heroScrollState,
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

describe("heroScrollState", () => {
  // Progress 0: resting state. Camera at its closest, nodes at their tightest
  // (rig baseline) spread, links and nodes at full opacity, background fully
  // hidden behind the mesh.
  it("returns the resting state at progress 0", () => {
    expect(heroScrollState(0)).toEqual({
      cameraZ: 14,
      spread: 1,
      linkOpacity: 0.28,
      nodeOpacity: 0.95,
      backgroundOpacity: 0,
    });
  });

  // Phase boundary: the dolly-only phase (0.0-0.3) ends here. Dispersion and
  // handoff have not started, but the camera has moved.
  it("has dollied but not yet dispersed or handed off at progress 0.3", () => {
    const result = heroScrollState(0.3);
    expect(result.cameraZ).toBeCloseTo(15.8);
    expect(result.spread).toBeCloseTo(1);
    expect(result.linkOpacity).toBeCloseTo(0.28);
    expect(result.nodeOpacity).toBeCloseTo(0.95);
    expect(result.backgroundOpacity).toBeCloseTo(0);
  });

  // Phase boundary: the disperse phase (0.3-0.7) ends here. Nodes are at
  // maximum spread and links are fully faded, but the background handoff
  // (0.7-1.0) has not started yet.
  it("has fully dispersed but not yet handed off at progress 0.7", () => {
    const result = heroScrollState(0.7);
    expect(result.cameraZ).toBeCloseTo(18.2);
    expect(result.spread).toBeCloseTo(2.8);
    expect(result.linkOpacity).toBeCloseTo(0);
    expect(result.nodeOpacity).toBeCloseTo(0.95);
    expect(result.backgroundOpacity).toBeCloseTo(0);
  });

  // Progress 1: the hero has fully scrolled away. The background canvas must
  // land on exactly 1 here — this is the value BackgroundFX's opacity reads,
  // so anything short of exactly 1 leaves it visibly translucent forever.
  it("reaches the fully handed-off end state at progress 1", () => {
    expect(heroScrollState(1)).toEqual({
      cameraZ: 20,
      spread: 2.8,
      linkOpacity: 0,
      nodeOpacity: 0,
      backgroundOpacity: 1,
    });
  });

  // Out-of-range input: a caller passing a value below 0 (or one that
  // overshoots above 1) must not extrapolate past the choreography's
  // intended bounds — it should read exactly as progress 0 (or 1) would.
  it("clamps progress below 0 to the resting state", () => {
    expect(heroScrollState(-0.5)).toEqual(heroScrollState(0));
  });

  it("clamps progress above 1 to the fully handed-off state", () => {
    expect(heroScrollState(1.5)).toEqual(heroScrollState(1));
  });
});
