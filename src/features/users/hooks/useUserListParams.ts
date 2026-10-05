import { z } from 'zod';
import { ROLES } from '@/features/auth/types';
import { useListSearchParams } from '@/shared/hooks/useListSearchParams';
import { PAGE_SIZE_OPTIONS } from '@/shared/lib/pagination';
import { USER_SORT_FIELDS, USER_STATUSES, type UserListParams } from '../types';

export const DEFAULT_USER_LIST_PARAMS: UserListParams = {
  page: 1,
  pageSize: 10,
  sort: 'createdAt',
  order: 'desc',
  q: '',
  role: '',
  status: '',
};

const d = DEFAULT_USER_LIST_PARAMS;

const userListParamsSchema: z.ZodType<UserListParams, z.ZodTypeDef, unknown> = z.object({
  page: z.coerce.number().int().min(1).catch(d.page),
  pageSize: z.coerce
    .number()
    .refine((value) => (PAGE_SIZE_OPTIONS as readonly number[]).includes(value))
    .catch(d.pageSize),
  sort: z.enum(USER_SORT_FIELDS).catch(d.sort),
  order: z.enum(['asc', 'desc']).catch(d.order),
  q: z.string().trim().catch(d.q),
  role: z.enum(ROLES).or(z.literal('')).catch(d.role),
  status: z.enum(USER_STATUSES).or(z.literal('')).catch(d.status),
});

export function useUserListParams() {
  return useListSearchParams(userListParamsSchema, DEFAULT_USER_LIST_PARAMS);
}
