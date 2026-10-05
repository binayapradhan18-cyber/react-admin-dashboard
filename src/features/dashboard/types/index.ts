import type { ProductCategory } from '@/features/orders/types';

export interface KpiMetric {
  value: number;
  previous: number;
}

export interface Kpis {
  revenue: KpiMetric;
  orders: KpiMetric;
  activeUsers: KpiMetric;
  churnRate: KpiMetric;
}

export const REVENUE_RANGES = ['7d', '30d', '90d'] as const;
export type RevenueRange = (typeof REVENUE_RANGES)[number];

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: ProductCategory;
  revenue: number;
  orders: number;
}

export type ActivityType = 'order_created' | 'order_shipped' | 'order_refunded' | 'user_joined';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  at: string;
  href: string;
}
