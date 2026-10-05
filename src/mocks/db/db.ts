import type { Preferences, Profile } from '@/features/settings/types';
import { generateSeed, type SeedData } from './seed';

export interface MockDb extends SeedData {
  now: Date;
  profiles: Map<string, Profile>;
  preferences: Map<string, Preferences>;
}

/** Tests get a fixed clock; the browser anchors data to the current hour so dates feel live. */
function anchorDate(): Date {
  if (import.meta.env.MODE === 'test') return new Date('2026-06-15T12:00:00.000Z');
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now;
}

function createDb(): MockDb {
  const now = anchorDate();
  return { now, ...generateSeed(now), profiles: new Map(), preferences: new Map() };
}

let instance: MockDb | null = null;

export function getDb(): MockDb {
  instance ??= createDb();
  return instance;
}

export function resetDb(): void {
  instance = null;
}
