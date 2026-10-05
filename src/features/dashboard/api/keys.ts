import type { RevenueRange } from '../types';

const all = ['dashboard'] as const;

export const dashboardKeys = {
  all,
  kpis: () => [...all, 'kpis'] as const,
  revenue: (range: RevenueRange) => [...all, 'revenue', range] as const,
  salesByCategory: () => [...all, 'sales-by-category'] as const,
  activity: () => [...all, 'activity'] as const,
};
