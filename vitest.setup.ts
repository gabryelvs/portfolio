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

// jsdom does not implement matchMedia. Without a default stub, any module that
// calls it at import time (e.g. lib/gsap.ts registering ScrollTrigger, which reads
// matchMedia to wire up its media-query handling) throws before a single test can
// stub it. Individual tests override this via vi.stubGlobal — see tests/helpers.ts.
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
