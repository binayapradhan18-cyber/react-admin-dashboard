import type {
  ActivityItem,
  CategorySales,
  Kpis,
  RevenuePoint,
  RevenueRange,
} from '@/features/dashboard/types';
import { type Order, PRODUCT_CATEGORIES } from '@/features/orders/types';
import type { User } from '@/features/users/types';

const DAY = 24 * 3600_000;
const RANGE_DAYS: Record<RevenueRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

const countsTowardsRevenue = (order: Order) =>
  order.status !== 'cancelled' && order.status !== 'refunded';

function inWindow(order: Order, from: number, to: number): boolean {
  const created = new Date(order.createdAt).getTime();
  return created > from && created <= to;
}

function windowStats(orders: Order[], from: number, to: number) {
  const windowed = orders.filter((order) => inWindow(order, from, to));
  return {
    revenue: windowed.filter(countsTowardsRevenue).reduce((sum, order) => sum + order.total, 0),
    orders: windowed.length,
    customers: new Set(windowed.map((order) => order.customer.id)),
  };
}

function churn(previous: Set<string>, current: Set<string>): number {
  if (previous.size === 0) return 0;
  let lost = 0;
  for (const id of previous) if (!current.has(id)) lost++;
  return lost / previous.size;
}

/** Compares the trailing 30 days with the 30 days before that. */
export function computeKpis(orders: Order[], now: Date): Kpis {
  const t = now.getTime();
  const current = windowStats(orders, t - 30 * DAY, t);
  const previous = windowStats(orders, t - 60 * DAY, t - 30 * DAY);
  const beforePrevious = windowStats(orders, t - 90 * DAY, t - 60 * DAY);

  return {
    revenue: { value: current.revenue, previous: previous.revenue },
    orders: { value: current.orders, previous: previous.orders },
    activeUsers: { value: current.customers.size, previous: previous.customers.size },
    churnRate: {
      value: churn(previous.customers, current.customers),
      previous: churn(beforePrevious.customers, previous.customers),
    },
  };
}

export function computeRevenueSeries(
  orders: Order[],
  now: Date,
  range: RevenueRange,
): RevenuePoint[] {
  const days = RANGE_DAYS[range];
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  const start = end.getTime() - (days - 1) * DAY;

  const buckets = Array.from({ length: days }, (_, index) => ({
    date: new Date(start + index * DAY).toISOString(),
    revenue: 0,
    orders: 0,
  }));

  for (const order of orders) {
    const index = Math.floor((new Date(order.createdAt).getTime() - start) / DAY);
    const bucket = buckets[index];
    if (!bucket) continue;
    bucket.orders += 1;
    if (countsTowardsRevenue(order)) bucket.revenue += order.total;
  }
  return buckets;
}

export function computeSalesByCategory(orders: Order[], now: Date): CategorySales[] {
  const from = now.getTime() - 30 * DAY;
  const totals = new Map(
    PRODUCT_CATEGORIES.map((category) => [category, { revenue: 0, orders: 0 }]),
  );

  for (const order of orders) {
    if (!inWindow(order, from, now.getTime()) || !countsTowardsRevenue(order)) continue;
    const seen = new Set<string>();
    for (const item of order.items) {
      const entry = totals.get(item.category);
      if (!entry) continue;
      entry.revenue += item.quantity * item.unitPrice;
      if (!seen.has(item.category)) {
        entry.orders += 1;
        seen.add(item.category);
      }
    }
  }

  return [...totals.entries()]
    .map(([category, entry]) => ({ category, ...entry }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeActivity(orders: Order[], users: User[], limit = 8): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const order of orders.slice(-60)) {
    for (const event of order.timeline) {
      const base = { at: event.at, href: `/orders/${order.id}` };
      if (event.status === 'pending') {
        items.push({
          ...base,
          id: `${order.id}-created`,
          type: 'order_created',
          title: `New order ${order.number}`,
          description: `${order.customer.name} placed an order`,
        });
      } else if (event.status === 'shipped') {
        items.push({
          ...base,
          id: `${order.id}-shipped`,
          type: 'order_shipped',
          title: `Order ${order.number} shipped`,
          description: event.note,
        });
      } else if (event.status === 'refunded') {
        items.push({
          ...base,
          id: `${order.id}-refunded`,
          type: 'order_refunded',
          title: `Order ${order.number} refunded`,
          description: `Refund issued to ${order.customer.name}`,
        });
      }
    }
  }

  for (const user of users) {
    items.push({
      id: `${user.id}-joined`,
      type: 'user_joined',
      title: `${user.name} joined`,
      description: `Added to ${user.department} as ${user.role}`,
      at: user.createdAt,
      href: `/users?q=${encodeURIComponent(user.email)}`,
    });
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
