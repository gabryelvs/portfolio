/** Pure geometry and gating maths for the node-mesh visuals.
 *  No DOM, no three.js, no React — so it is unit-testable under jsdom
 *  and shared by the 2D background canvas and the 3D hero scene. */

export type Point = { x: number; y: number; z?: number };
export type Link = { a: number; b: number; distance: number };

/** Viewport width at or above which the 3D hero mesh is allowed to mount. */
export const MESH_BREAKPOINT = 768;
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
