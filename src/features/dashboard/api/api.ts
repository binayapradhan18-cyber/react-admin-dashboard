import { http } from '@/shared/lib/apiClient';
import type { ActivityItem, CategorySales, Kpis, RevenuePoint, RevenueRange } from '../types';

export const dashboardApi = {
  kpis: (signal?: AbortSignal) => http.get<Kpis>('/dashboard/kpis', { signal }),
  revenue: (range: RevenueRange, signal?: AbortSignal) =>
    http.get<RevenuePoint[]>('/dashboard/revenue', { params: { range }, signal }),
  salesByCategory: (signal?: AbortSignal) =>
    http.get<CategorySales[]>('/dashboard/sales-by-category', { signal }),
  activity: (signal?: AbortSignal) => http.get<ActivityItem[]>('/dashboard/activity', { signal }),
};
