import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/features/dashboard/api/keys';
import { normalizeError } from '@/shared/lib/apiClient';
import { toast } from '@/shared/ui';
import type { OrderListParams } from '../types';
import { ordersApi } from './api';
import { orderKeys } from './keys';

export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: ({ signal }) => ordersApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: ({ signal }) => ordersApi.get(id, signal),
  });
}

export function useAdvanceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.advance,
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      toast.success(`Order ${order.number} is now ${order.status}`);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: (error) => toast.error('Could not update order', normalizeError(error).message),
  });
}
