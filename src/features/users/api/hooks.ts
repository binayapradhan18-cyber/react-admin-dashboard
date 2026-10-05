import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { normalizeError } from '@/shared/lib/apiClient';
import type { Paginated } from '@/shared/lib/pagination';
import { toast } from '@/shared/ui';
import type { User, UserFormValues, UserListParams } from '../types';
import { usersApi } from './api';
import { userKeys } from './keys';

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => usersApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);
      return queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UserFormValues }) =>
      usersApi.update(id, values),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);
      queryClient.setQueriesData<Paginated<User>>({ queryKey: userKeys.lists() }, (page) =>
        page ? { ...page, data: page.data.map((u) => (u.id === user.id ? user : u)) } : page,
      );
      return queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

function withoutUser(page: Paginated<User>, id: string): Paginated<User> {
  const data = page.data.filter((user) => user.id !== id);
  if (data.length === page.data.length) return page;
  const total = page.total - 1;
  return { ...page, data, total, totalPages: Math.max(1, Math.ceil(total / page.pageSize)) };
}

/**
 * Removes the user from every cached list immediately, then reconciles with the
 * server. On failure all list snapshots are restored.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => usersApi.remove(user.id),
    onMutate: async (user) => {
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });
      const snapshot = queryClient.getQueriesData<Paginated<User>>({ queryKey: userKeys.lists() });
      queryClient.setQueriesData<Paginated<User>>({ queryKey: userKeys.lists() }, (page) =>
        page ? withoutUser(page, user.id) : page,
      );
      return { snapshot };
    },
    onError: (error, user, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(`Could not delete ${user.name}`, normalizeError(error).message);
    },
    onSuccess: (_data, user) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(user.id) });
      toast.success('User deleted', `${user.name} has been removed.`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  });
}
