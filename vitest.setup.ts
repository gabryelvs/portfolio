import "@testing-library/jest-dom/vitest";

// jsdom provides localStorage - use it if available, otherwise use a simple polyfill
if (!global.localStorage) {
  const store: Record<string, string> = {};
  global.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
    length: 0,
  } as Storage;
}

// jsdom does not implement matchMedia. Without a default stub, any component
// that calls it without first going through a per-test stub throws under
// jsdom. `lib/gsap.ts` registering ScrollTrigger at import time does NOT
// itself call matchMedia — verified against node_modules/gsap/ScrollTrigger.js,
// which contains no `window.matchMedia` call at all (it exposes its own,
// unrelated `ScrollTrigger.matchMedia()` API that isn't used here and isn't
// this). The real need: `components/Hero.tsx` calls
// `subscribeReducedMotion()` (`lib/gsap.ts`, which does call
// `window.matchMedia`) on every mount, including in test files that never
// call `stubReducedMotion` — e.g. tests/copy.test.tsx renders <Hero />
// relying on exactly this default. Individual tests override this via
// vi.stubGlobal — see tests/helpers.ts.
if (!global.matchMedia) {
  global.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  })) as unknown as typeof window.matchMedia;
}

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;
