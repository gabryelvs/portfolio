import { vi } from "vitest";

/**
 * Stubs `window.matchMedia` so `(prefers-reduced-motion: reduce)` reports `reduce`,
 * and — when `width` is given — stubs `window.innerWidth` too. Shared by Reveal's
 * reduced-motion tests (Task 3) and the WebGL hero's viewport + motion gating tests
 * (Task 5). Callers must reset with `vi.unstubAllGlobals()` (e.g. in `afterEach`).
 */
export function stubReducedMotion(reduce: boolean, width?: number): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: reduce,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }),
  );

  if (width !== undefined) {
    vi.stubGlobal("innerWidth", width);
  }
}
