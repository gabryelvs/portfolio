import { vi } from "vitest";

/** Minimal MediaQueryList stand-in returned by `stubReducedMotion`, typed
 *  loosely (`vi.fn()` for the listener methods) so tests can both assert on
 *  and drive it. */
export type ReducedMotionMediaMock = {
  matches: boolean;
  media: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
  onchange: null;
};

/**
 * Stubs `window.matchMedia` so `(prefers-reduced-motion: reduce)` reports `reduce`,
 * and — when `width` is given — stubs `window.innerWidth` too. Shared by Reveal's
 * reduced-motion tests (Task 3) and the WebGL hero's viewport + motion gating tests
 * (Task 5). Callers must reset with `vi.unstubAllGlobals()` (e.g. in `afterEach`).
 *
 * Returns the mocked MediaQueryList so a test can also drive a live "change"
 * (see `fireReducedMotionChange`) — `lib/gsap.ts`'s `subscribeReducedMotion`
 * registers its listener against this same object, since `matchMedia` always
 * returns it.
 */
export function stubReducedMotion(reduce: boolean, width?: number): ReducedMotionMediaMock {
  const media: ReducedMotionMediaMock = {
    matches: reduce,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
  };
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(media));

  if (width !== undefined) {
    vi.stubGlobal("innerWidth", width);
  }

  return media;
}

/**
 * Simulates a live OS reduced-motion toggle against the mock returned by
 * `stubReducedMotion`: updates `matches` first (matching a real
 * MediaQueryListEvent, where the list already reflects the new state by the
 * time listeners run), then invokes whichever "change" listener the
 * component under test registered via `addEventListener`.
 */
export function fireReducedMotionChange(media: ReducedMotionMediaMock, matches: boolean): void {
  media.matches = matches;
  const call = media.addEventListener.mock.calls.find(([type]) => type === "change");
  const handler = call?.[1] as (() => void) | undefined;
  handler?.();
}
