import type { SortOrder } from '@/shared/lib/pagination';

export const ORDER_STATUSES = [
  'pending',
  'paid',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PRODUCT_CATEGORIES = ['Electronics', 'Apparel', 'Home', 'Sports', 'Books'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface OrderItem {
  sku: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
  note: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Address {
  line1: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  number: string;
  customer: Customer;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  timeline: OrderEvent[];
  shippingAddress: Address;
}

export type OrderSummary = Omit<Order, 'items' | 'timeline' | 'shippingAddress'> & {
  itemCount: number;
};

export const ORDER_SORT_FIELDS = ['number', 'createdAt', 'total', 'status'] as const;
export type OrderSortField = (typeof ORDER_SORT_FIELDS)[number];

export type OrderListParams = {
  page: number;
  pageSize: number;
  sort: OrderSortField;
  order: SortOrder;
  q: string;
  status: OrderStatus | '';
};

/** Forward-only fulfilment path; cancelled/refunded are terminal side branches. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'paid',
  paid: 'shipped',
  shipped: 'delivered',
};
