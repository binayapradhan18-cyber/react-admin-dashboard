/** Deterministic PRNG (mulberry32) so every run produces the same dataset. */
export function createRandom(seed: number) {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => Math.floor(next() * (max - min + 1)) + min;

  const pick = <T>(items: readonly T[]): T => {
    const item = items[Math.floor(next() * items.length)];
    if (item === undefined) throw new Error('pick() called with an empty list');
    return item;
  };

  /** Picks a key according to relative weights, e.g. `{ a: 3, b: 1 }`. */
  const weighted = <K extends string>(weights: Record<K, number>): K => {
    const entries = Object.entries(weights) as [K, number][];
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = next() * total;
    for (const [key, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return key;
    }
    const last = entries[entries.length - 1];
    if (!last) throw new Error('weighted() called with no entries');
    return last[0];
  };

  const chance = (probability: number): boolean => next() < probability;

  return { next, int, pick, weighted, chance };
}

export type Random = ReturnType<typeof createRandom>;
