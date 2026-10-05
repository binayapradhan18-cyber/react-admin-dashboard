import { http } from '@/shared/lib/apiClient';
import type { Paginated } from '@/shared/lib/pagination';
import type { Order, OrderListParams, OrderSummary } from '../types';

export const ordersApi = {
  list: (params: OrderListParams, signal?: AbortSignal) =>
    http.get<Paginated<OrderSummary>>('/orders', { params: { ...params }, signal }),
  get: (id: string, signal?: AbortSignal) => http.get<Order>(`/orders/${id}`, { signal }),
  advance: (id: string) => http.post<Order>(`/orders/${id}/advance`),
};
