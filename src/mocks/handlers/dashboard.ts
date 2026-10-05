import { http, HttpResponse } from 'msw';
import { REVENUE_RANGES, type RevenueRange } from '@/features/dashboard/types';
import {
  computeActivity,
  computeKpis,
  computeRevenueSeries,
  computeSalesByCategory,
} from '../db/analytics';
import { getDb } from '../db/db';
import { api, requirePermission, simulateNetwork } from './utils';

export const dashboardHandlers = [
  http.get(api('/dashboard/kpis'), async ({ request }) => {
    requirePermission(request, 'dashboard:view');
    await simulateNetwork();
    const db = getDb();
    return HttpResponse.json(computeKpis(db.orders, db.now));
  }),

  http.get(api('/dashboard/revenue'), async ({ request }) => {
    requirePermission(request, 'dashboard:view');
    await simulateNetwork();
    const param = new URL(request.url).searchParams.get('range') as RevenueRange | null;
    const range = param && REVENUE_RANGES.includes(param) ? param : '30d';
    const db = getDb();
    return HttpResponse.json(computeRevenueSeries(db.orders, db.now, range));
  }),

  http.get(api('/dashboard/sales-by-category'), async ({ request }) => {
    requirePermission(request, 'dashboard:view');
    await simulateNetwork();
    const db = getDb();
    return HttpResponse.json(computeSalesByCategory(db.orders, db.now));
  }),

  http.get(api('/dashboard/activity'), async ({ request }) => {
    requirePermission(request, 'dashboard:view');
    await simulateNetwork();
    const db = getDb();
    return HttpResponse.json(computeActivity(db.orders, db.users));
  }),
];
