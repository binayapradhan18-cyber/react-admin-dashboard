import { http } from '@/shared/lib/apiClient';
import type { Paginated } from '@/shared/lib/pagination';
import type { User, UserFormValues, UserListParams } from '../types';

export const usersApi = {
  list: (params: UserListParams, signal?: AbortSignal) =>
    http.get<Paginated<User>>('/users', { params: { ...params }, signal }),
  get: (id: string, signal?: AbortSignal) => http.get<User>(`/users/${id}`, { signal }),
  create: (values: UserFormValues) => http.post<User>('/users', values),
  update: (id: string, values: UserFormValues) => http.put<User>(`/users/${id}`, values),
  remove: (id: string) => http.delete(`/users/${id}`),
};
