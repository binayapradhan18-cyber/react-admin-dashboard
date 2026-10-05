import '@testing-library/jest-dom/vitest';
import { transferableAbortController } from 'node:util';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { setupApiClient } from '@/app/setupApiClient';
import { useAuthStore } from '@/features/auth';
import { resetDb } from '@/mocks/db/db';
import { server } from '@/mocks/server';
import { useToastStore } from '@/shared/ui/Toast/toastStore';

// jsdom replaces AbortController with its own implementation, which Node's
// native fetch (used by MSW in tests) rejects. Restore Node's classes so
// TanStack Query's cancellation signals work end to end.
const nodeController = transferableAbortController();
globalThis.AbortController = nodeController.constructor as typeof AbortController;
globalThis.AbortSignal = nodeController.signal.constructor as typeof AbortSignal;

// jsdom does not implement matchMedia; default to a desktop viewport.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.scrollTo = vi.fn();

setupApiClient();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetDb();
  localStorage.clear();
  useAuthStore.getState().clear();
  useToastStore.getState().clear();
});

afterAll(() => server.close());
