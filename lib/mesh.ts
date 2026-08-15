/** Pure geometry and gating maths for the node-mesh visuals.
 *  No DOM, no three.js, no React — so it is unit-testable under jsdom
 *  and shared by the 2D background canvas and the 3D hero scene. */

export type Point = { x: number; y: number; z?: number };
export type Link = { a: number; b: number; distance: number };

/** Viewport width at or above which the 3D hero mesh is allowed to mount. */
export const MESH_BREAKPOINT = 768;
/** CSS custom property that hands the screen off between the 3D hero mesh and
 *  the 2D `BackgroundFX` canvas: `0` while the mesh owns the screen, `1` once
 *  it hands off (see `heroScrollState`'s `backgroundOpacity`). Exported so
 *  `components/Hero.tsx`, `components/HeroMesh.tsx` and
 *  `components/BackgroundFX.tsx` share one literal instead of each repeating
 *  the string — `app/globals.css` necessarily keeps its own copy, since it is
 *  plain CSS and cannot import a TS constant. */
export const BG_FX_OPACITY_PROPERTY = "--bg-fx-opacity";
/** Link radius in CSS pixels for the 2D background canvas. */
export const LINK_DISTANCE_2D = 155;
/** Node count for the 3D hero scene (fixed — the scene is a fixed-size object). */
export const HERO_NODE_COUNT = 120;
/** Link radius in world units for the 3D hero scene. */
export const HERO_LINK_DISTANCE = 3.2;

const ACCENT_FALLBACK: [number, number, number] = [99, 102, 241]; // indigo-500

/** Reads a `#rrggbb` CSS custom property value into an RGB triplet. */
export function parseAccent(value: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return ACCENT_FALLBACK;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Caps device pixel ratio at 2 so retina displays do not quadruple fill cost. */
export function clampDpr(dpr: number): number {
  if (!Number.isFinite(dpr) || dpr < 1) return 1;
  return Math.min(dpr, 2);
}

/** Viewport-area-derived node count for the 2D background canvas. */
export function nodeCount(width: number, height: number): number {
  return Math.min(90, Math.max(30, Math.floor((width * height) / 16000)));
}

/** Every unordered pair of points within `maxDistance`, inclusive of the boundary. */
export function linkPairs(points: Point[], maxDistance: number): Link[] {
  const links: Link[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dz = (points[i].z ?? 0) - (points[j].z ?? 0);
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (distance <= maxDistance) links.push({ a: i, b: j, distance });
    }
  }
  return links;
}

/** The 3D hero mesh mounts only on wide viewports with motion allowed. */
export function shouldRenderMesh({
  width,
  reducedMotion,
}: {
  width: number;
  reducedMotion: boolean;
}): boolean {
  return width >= MESH_BREAKPOINT && !reducedMotion;
}

/** Values the hero mesh's scroll rig derives from progress through the hero
 *  section, applied every frame to the three.js scene and the `--bg-fx-opacity`
 *  handoff to the 2D `BackgroundFX` canvas. */
export type HeroScrollDerived = {
  /** Camera distance along Z: dollies back as the user scrolls. */
  cameraZ: number;
  /** Multiplier applied to each node's home position: nodes disperse outward. */
  spread: number;
  /** Opacity of the link line segments. */
  linkOpacity: number;
  /** Opacity of the node points. */
  nodeOpacity: number;
  /** Opacity the 2D background canvas should have (`--bg-fx-opacity`); 0 while
   *  the 3D mesh owns the screen, 1 once the hero has fully scrolled away. */
  backgroundOpacity: number;
};

const HERO_CAMERA_Z_HOME = 14;
const HERO_CAMERA_Z_RANGE = 6;
const HERO_SPREAD_HOME = 1;
const HERO_SPREAD_RANGE = 1.8;
const HERO_LINK_OPACITY_HOME = 0.28;
const HERO_NODE_OPACITY_HOME = 0.95;

/** Derives the hero mesh's scroll-driven visual state from progress through
 *  the hero section (0 = top of page, 1 = hero fully scrolled past). Pure —
 *  no DOM, no three.js, no React — so `HeroMesh` can call it every rendered
 *  frame with a smoothed/eased progress value and this stays unit-testable
 *  under jsdom.
 *
 *  Three overlapping phases (matches the choreography comment in
 *  `HeroMesh.tsx`):
 *    0.0-0.3  camera dollies back (spread and opacities untouched)
 *    0.3-0.7  nodes disperse, links fade out
 *    0.7-1.0  nodes fade out, the 2D background canvas fades in
 *
 *  `progress` is clamped to [0, 1] before anything is derived from it, so
 *  out-of-range input (a caller passing an unclamped or momentarily
 *  overshooting value) still returns a well-defined, in-range result instead
 *  of extrapolating past the choreography's intended bounds. */
export function heroScrollState(progress: number): HeroScrollDerived {
  const p = Math.min(Math.max(progress, 0), 1);
  const disperse = Math.min(Math.max((p - 0.3) / 0.4, 0), 1);
  const handoff = Math.min(Math.max((p - 0.7) / 0.3, 0), 1);
  return {
    cameraZ: HERO_CAMERA_Z_HOME + HERO_CAMERA_Z_RANGE * p,
    spread: HERO_SPREAD_HOME + HERO_SPREAD_RANGE * disperse,
    linkOpacity: HERO_LINK_OPACITY_HOME * (1 - disperse),
    nodeOpacity: HERO_NODE_OPACITY_HOME * (1 - handoff),
    backgroundOpacity: handoff,
  };
}
