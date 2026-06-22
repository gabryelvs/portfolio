import "@testing-library/jest-dom/vitest";

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

interface LocalStorageData {
  [key: string]: string;
}

const localStorageData: LocalStorageData = {};

const localStorageMock: Storage = {
  getItem: (key: string) => {
    return localStorageData[key] ?? null;
  },
  setItem: (key: string, value: string) => {
    localStorageData[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageData[key];
  },
  clear: () => {
    for (const key in localStorageData) {
      delete localStorageData[key];
    }
  },
  length: 0,
  key: () => null,
};

global.localStorage = localStorageMock;
