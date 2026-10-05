import type { UserListParams } from '../types';

const all = ['users'] as const;

export const userKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  list: (params: UserListParams) => [...all, 'list', params] as const,
  details: () => [...all, 'detail'] as const,
  detail: (id: string) => [...all, 'detail', id] as const,
};
