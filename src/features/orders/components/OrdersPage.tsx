import { PackageSearch } from 'lucide-react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { capitalize, formatCurrency, formatDateTime } from '@/shared/lib/format';
import {
  Button,
  Card,
  EmptyState,
  ErrorFallback,
  PageHeader,
  Pagination,
  SearchInput,
  SelectField,
  Skeleton,
  SortableHeader,
  Table,
  TableContainer,
  tableStyles,
} from '@/shared/ui';
import { useOrders } from '../api/hooks';
import { useOrderListParams } from '../hooks/useOrderListParams';
import { ORDER_STATUSES, type OrderSortField, type OrderStatus } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import styles from './Orders.module.css';

const STATUS_FILTER = [
  { value: '', label: 'All statuses' },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: capitalize(status) })),
];

export function OrdersPage() {
  const { params, update, reset } = useOrderListParams();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useOrders(params);

  const onSearch = useCallback((q: string) => update({ q }, { replace: true }), [update]);
  const onSort = (field: OrderSortField) =>
    update({
      sort: field,
      order: params.sort === field && params.order === 'desc' ? 'asc' : 'desc',
    });
  const header = { activeField: params.sort, order: params.order, onSort };
  const hasFilters = params.q !== '' || params.status !== '';

  return (
    <>
      <PageHeader title="Orders" description="Track fulfilment across every channel." />
      <Card padded={false}>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <SearchInput
              label="Search orders"
              placeholder="Order number or customer"
              value={params.q}
              onChange={onSearch}
            />
          </div>
          <SelectField
            label="Status"
            hideLabel
            options={STATUS_FILTER}
            value={params.status}
            onChange={(event) => update({ status: event.target.value as OrderStatus | '' })}
          />
          {hasFilters && (
            <Button variant="ghost" onClick={reset}>
              Clear filters
            </Button>
          )}
        </div>

        {isError && !data ? (
          <ErrorFallback
            compact
            title="Couldn't load orders"
            error={error}
            reset={() => void refetch()}
          />
        ) : data?.total === 0 ? (
          <EmptyState
            icon={<PackageSearch size={22} />}
            title="No orders match"
            description="Try a different search term or status."
            action={<Button onClick={reset}>Clear filters</Button>}
          />
        ) : (
          <TableContainer busy={isPlaceholderData}>
            <Table aria-label="Orders">
              <thead>
                <tr>
                  <SortableHeader field="number" {...header}>
                    Order
                  </SortableHeader>
                  <th scope="col">Customer</th>
                  <SortableHeader field="status" {...header}>
                    Status
                  </SortableHeader>
                  <th scope="col" className={tableStyles.numeric}>
                    Items
                  </th>
                  <SortableHeader field="total" className={tableStyles.numeric} {...header}>
                    Total
                  </SortableHeader>
                  <SortableHeader field="createdAt" {...header}>
                    Placed
                  </SortableHeader>
                </tr>
              </thead>
              <tbody>
                {isPending
                  ? Array.from({ length: 10 }, (_, index) => (
                      <tr key={index} aria-hidden="true">
                        {Array.from({ length: 6 }, (_, cell) => (
                          <td key={cell}>
                            <Skeleton width={cell === 1 ? 160 : 80} height={12} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : data.data.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link to={`/orders/${order.id}`} className={styles.orderLink}>
                            {order.number}
                          </Link>
                        </td>
                        <td>
                          <div>{order.customer.name}</div>
                          <div className={styles.muted}>{order.customer.email}</div>
                        </td>
                        <td>
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className={tableStyles.numeric}>{order.itemCount}</td>
                        <td className={tableStyles.numeric}>{formatCurrency(order.total, true)}</td>
                        <td>{formatDateTime(order.createdAt)}</td>
                      </tr>
                    ))}
              </tbody>
            </Table>
          </TableContainer>
        )}

        {data && data.total > 0 && (
          <Pagination
            page={data.page}
            pageSize={params.pageSize}
            total={data.total}
            disabled={isPlaceholderData}
            onPageChange={(page) => update({ page })}
            onPageSizeChange={(pageSize) => update({ pageSize })}
          />
        )}
      </Card>
    </>
  );
}
