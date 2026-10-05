import { useOrder } from '../api/hooks';

/** Breadcrumb label for an order route; shows the human-readable number once loaded. */
export function OrderCrumb({ orderId }: { orderId: string }) {
  const { data } = useOrder(orderId);
  return <>{data?.number ?? 'Order'}</>;
}
