import { useSuspenseQuery } from '@tanstack/react-query';
import type { RevenueRange } from '../types';
import { dashboardApi } from './api';
import { dashboardKeys } from './keys';

/*
 * Dashboard widgets use suspense queries: loading is handled by each widget's
 * <Suspense> skeleton and failures by its error boundary, so the components
 * only ever render the success state.
 */

export function useKpis() {
  return useSuspenseQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: ({ signal }) => dashboardApi.kpis(signal),
  });
}

export function useRevenue(range: RevenueRange) {
  return useSuspenseQuery({
    queryKey: dashboardKeys.revenue(range),
    queryFn: ({ signal }) => dashboardApi.revenue(range, signal),
  });
}

export function useSalesByCategory() {
  return useSuspenseQuery({
    queryKey: dashboardKeys.salesByCategory(),
    queryFn: ({ signal }) => dashboardApi.salesByCategory(signal),
  });
}

export function useActivity() {
  return useSuspenseQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: ({ signal }) => dashboardApi.activity(signal),
    refetchInterval: 60_000,
  });
}
