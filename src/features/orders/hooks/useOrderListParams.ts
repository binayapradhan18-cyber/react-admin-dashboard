import { z } from 'zod';
import { useListSearchParams } from '@/shared/hooks/useListSearchParams';
import { PAGE_SIZE_OPTIONS } from '@/shared/lib/pagination';
import { ORDER_SORT_FIELDS, ORDER_STATUSES, type OrderListParams } from '../types';

export const DEFAULT_ORDER_LIST_PARAMS: OrderListParams = {
  page: 1,
  pageSize: 20,
  sort: 'createdAt',
  order: 'desc',
  q: '',
  status: '',
};

const d = DEFAULT_ORDER_LIST_PARAMS;

const orderListParamsSchema: z.ZodType<OrderListParams, z.ZodTypeDef, unknown> = z.object({
  page: z.coerce.number().int().min(1).catch(d.page),
  pageSize: z.coerce
    .number()
    .refine((value) => (PAGE_SIZE_OPTIONS as readonly number[]).includes(value))
    .catch(d.pageSize),
  sort: z.enum(ORDER_SORT_FIELDS).catch(d.sort),
  order: z.enum(['asc', 'desc']).catch(d.order),
  q: z.string().trim().catch(d.q),
  status: z.enum(ORDER_STATUSES).or(z.literal('')).catch(d.status),
});

export function useOrderListParams() {
  return useListSearchParams(orderListParamsSchema, DEFAULT_ORDER_LIST_PARAMS);
}
