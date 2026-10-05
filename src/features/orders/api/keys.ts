import type { OrderListParams } from '../types';

const all = ['orders'] as const;

export const orderKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  list: (params: OrderListParams) => [...all, 'list', params] as const,
  details: () => [...all, 'detail'] as const,
  detail: (id: string) => [...all, 'detail', id] as const,
};
