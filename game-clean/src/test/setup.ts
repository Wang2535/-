import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock import.meta.env
vi.mock('import.meta.env', () => ({
  DEV: true,
  PROD: false,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage with in-memory storage
const localStorageStore = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => localStorageStore.set(key, value)),
  removeItem: vi.fn((key: string) => localStorageStore.delete(key)),
  clear: vi.fn(() => localStorageStore.clear()),
  get length() { return localStorageStore.size; },
  key: vi.fn((index: number) => Array.from(localStorageStore.keys())[index] ?? null),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console methods in test environment
(globalThis as typeof globalThis & { console: typeof console }).console = {
  ...console,
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
