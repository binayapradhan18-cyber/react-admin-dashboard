import { z } from 'zod';
import { ROLES, type Role } from '@/features/auth/types';
import type { SortOrder } from '@/shared/lib/pagination';

export const USER_STATUSES = ['active', 'invited', 'suspended'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Support',
  'Finance',
  'Operations',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  department: Department;
  createdAt: string;
  lastActiveAt: string | null;
}

export const USER_SORT_FIELDS = [
  'name',
  'email',
  'role',
  'status',
  'createdAt',
  'lastActiveAt',
] as const;
export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export type UserListParams = {
  page: number;
  pageSize: number;
  sort: UserSortField;
  order: SortOrder;
  q: string;
  role: Role | '';
  status: UserStatus | '';
};

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be 80 characters or fewer'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  role: z.enum(ROLES, { errorMap: () => ({ message: 'Select a role' }) }),
  status: z.enum(USER_STATUSES, { errorMap: () => ({ message: 'Select a status' }) }),
  department: z.enum(DEPARTMENTS, { errorMap: () => ({ message: 'Select a department' }) }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
