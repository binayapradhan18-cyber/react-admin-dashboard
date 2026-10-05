export interface MockConfig {
  /** Base latency per request; actual delay is jittered between 0.5x and 1.5x. */
  latencyMs: number;
  /** Probability (0..1) that a data request fails with a simulated 500. */
  errorRate: number;
}

const STORAGE_KEY = 'rad.mock-api';
const isTest = import.meta.env.MODE === 'test';

export const DEFAULT_MOCK_CONFIG: MockConfig = isTest
  ? { latencyMs: 0, errorRate: 0 }
  : { latencyMs: 450, errorRate: 0 };

export const SIMULATED_ERROR_RATE = 0.2;

export function getMockConfig(): MockConfig {
  if (isTest) return DEFAULT_MOCK_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? { ...DEFAULT_MOCK_CONFIG, ...(JSON.parse(raw) as Partial<MockConfig>) }
      : DEFAULT_MOCK_CONFIG;
  } catch {
    return DEFAULT_MOCK_CONFIG;
  }
}

export function setMockConfig(patch: Partial<MockConfig>): MockConfig {
  const next = { ...getMockConfig(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode); the change simply won't persist.
  }
  return next;
}
