"use client";

import { useEffect, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once at module scope. Every animating component imports gsap from
// here rather than registering plugins itself, so a second registration cannot
// happen during React Strict Mode's double-invoked effects in development.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** useLayoutEffect in the browser, useEffect on the server — animation setup must
 *  run before paint, but useLayoutEffect warns during server rendering. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** The single source of the reduced-motion media query, guarded for SSR and
 *  for environments without `matchMedia` at all. `null` means "treat as no
 *  preference" — both callers below fall back to that reading. */
function reducedMotionMedia(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY);
}

/** True when the user has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  return reducedMotionMedia()?.matches ?? false;
}

/** Subscribes to the OS reduced-motion preference so a caller can react to it
 *  changing live, not just read it once. Invokes `callback` synchronously with
 *  the current value immediately (so callers don't also need `prefersReducedMotion()`
 *  for the initial read), then again on every change. Returns an unsubscribe
 *  function.
 *
 *  Prefers `addEventListener`/`removeEventListener`; falls back to the
 *  deprecated `addListener`/`removeListener` pair for browsers that lack the
 *  former (older Safari). No-ops (after one synchronous `false` callback) when
 *  `matchMedia` itself is unavailable. */
export function subscribeReducedMotion(callback: (reduced: boolean) => void): () => void {
  const media = reducedMotionMedia();
  if (!media) {
    callback(false);
    return () => {};
  }

  const handler = () => callback(media.matches);
  callback(media.matches);

  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }
  media.addListener(handler);
  return () => media.removeListener(handler);
}

export { gsap, ScrollTrigger };
