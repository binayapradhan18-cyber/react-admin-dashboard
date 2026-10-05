import { http, HttpResponse } from 'msw';
import {
  NEXT_STATUS,
  ORDER_SORT_FIELDS,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
  type OrderSummary,
} from '@/features/orders/types';
import { getDb } from '../db/db';
import {
  api,
  errorResponse,
  paginate,
  parseListQuery,
  requirePermission,
  simulateNetwork,
  sortBy,
} from './utils';

export function toSummary({
  items,
  timeline: _t,
  shippingAddress: _s,
  ...rest
}: Order): OrderSummary {
  return { ...rest, itemCount: items.reduce((sum, item) => sum + item.quantity, 0) };
}

const STATUS_NOTES: Partial<Record<OrderStatus, string>> = {
  paid: 'Payment captured',
  shipped: 'Handed to carrier',
  delivered: 'Delivered',
};

export const orderHandlers = [
  http.get(api('/orders'), async ({ request }) => {
    requirePermission(request, 'orders:view');
    await simulateNetwork();

    const { page, pageSize, sort, order, q, searchParams } = parseListQuery(
      request,
      ORDER_SORT_FIELDS,
      'createdAt',
    );
    const status = searchParams.get('status') as OrderStatus | null;
    const validStatus = status && ORDER_STATUSES.includes(status) ? status : null;

    const filtered = getDb().orders.filter(
      (candidate) =>
        (!validStatus || candidate.status === validStatus) &&
        (!q ||
          candidate.number.toLowerCase().includes(q) ||
          candidate.customer.name.toLowerCase().includes(q) ||
          candidate.customer.email.includes(q)),
    );

    const sorted = sortBy(filtered.map(toSummary), sort, order);
    return HttpResponse.json(paginate(sorted, page, pageSize));
  }),

  http.get(api('/orders/:id'), async ({ request, params }) => {
    requirePermission(request, 'orders:view');
    await simulateNetwork();
    const found = getDb().orders.find((candidate) => candidate.id === params.id);
    return found ? HttpResponse.json(found) : errorResponse(404, 'Order not found.');
  }),

  http.post(api('/orders/:id/advance'), async ({ request, params }) => {
    requirePermission(request, 'orders:update');
    await simulateNetwork();

    const db = getDb();
    const index = db.orders.findIndex((candidate) => candidate.id === params.id);
    const existing = db.orders[index];
    if (!existing) return errorResponse(404, 'Order not found.');

    const next = NEXT_STATUS[existing.status];
    if (!next) {
      return errorResponse(
        409,
        `Order is ${existing.status} and cannot be advanced.`,
        'INVALID_TRANSITION',
      );
    }

    const at = new Date().toISOString();
    const updated: Order = {
      ...existing,
      status: next,
      updatedAt: at,
      timeline: [...existing.timeline, { status: next, at, note: STATUS_NOTES[next] ?? '' }],
    };
    db.orders[index] = updated;
    return HttpResponse.json(updated);
  }),
];
