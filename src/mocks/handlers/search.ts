import { http, HttpResponse } from 'msw';
import { hasPermission } from '@/features/auth/model/permissions';
import type { SearchResults } from '@/features/search/types';
import { getDb } from '../db/db';
import { api, requireUser, simulateNetwork } from './utils';

const LIMIT = 5;

export const searchHandlers = [
  http.get(api('/search'), async ({ request }) => {
    const user = requireUser(request);
    await simulateNetwork({ failable: false });

    const q = (new URL(request.url).searchParams.get('q') ?? '').trim().toLowerCase();
    if (q.length < 2) return HttpResponse.json<SearchResults>({ users: [], orders: [] });

    const db = getDb();
    const users = hasPermission(user.role, 'users:view')
      ? db.users
          .filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q))
          .slice(0, LIMIT)
          .map(({ id, name, email }) => ({ id, name, email }))
      : [];
    const orders = hasPermission(user.role, 'orders:view')
      ? db.orders
          .filter(
            (o) => o.number.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q),
          )
          .slice(-LIMIT)
          .reverse()
          .map(({ id, number, customer, total }) => ({
            id,
            number,
            customerName: customer.name,
            total,
          }))
      : [];

    return HttpResponse.json<SearchResults>({ users, orders });
  }),
];
