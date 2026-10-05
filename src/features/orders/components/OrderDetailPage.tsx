import { ArrowLeft, ArrowRight, PackageX } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Can } from '@/features/auth';
import { normalizeError } from '@/shared/lib/apiClient';
import { formatCurrency, formatDateTime } from '@/shared/lib/format';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorFallback,
  PageHeader,
  Skeleton,
  Table,
  tableStyles,
} from '@/shared/ui';
import { useAdvanceOrder, useOrder } from '../api/hooks';
import { NEXT_STATUS, type Order } from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { StatusTimeline } from './StatusTimeline';
import styles from './Orders.module.css';

export function OrderDetailPage() {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const { data: order, isPending, isError, error, refetch } = useOrder(orderId);

  if (isPending) return <OrderDetailSkeleton />;

  if (isError) {
    if (normalizeError(error).isNotFound) {
      return (
        <EmptyState
          icon={<PackageX size={22} />}
          title="Order not found"
          description="It may have been removed, or the link is incorrect."
          action={<Link to="/orders">Back to orders</Link>}
        />
      );
    }
    return (
      <ErrorFallback title="Couldn't load this order" error={error} reset={() => void refetch()} />
    );
  }

  return <OrderDetail order={order} />;
}

function OrderDetail({ order }: { order: Order }) {
  const advance = useAdvanceOrder();
  const next = NEXT_STATUS[order.status];
  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <>
      <Link to="/orders" className={styles.back}>
        <ArrowLeft size={14} aria-hidden="true" /> All orders
      </Link>
      <PageHeader
        title={`Order ${order.number}`}
        description={
          <span className={styles.headerMeta}>
            <OrderStatusBadge status={order.status} /> Placed {formatDateTime(order.createdAt)}
          </span>
        }
        actions={
          next && (
            <Can permission="orders:update">
              <Button
                variant="primary"
                icon={<ArrowRight size={16} />}
                loading={advance.isPending}
                onClick={() => advance.mutate(order.id)}
              >
                Mark as {next}
              </Button>
            </Can>
          )
        }
      />

      <div className={styles.detailGrid}>
        <div className={styles.mainColumn}>
          <Card title="Items" padded={false}>
            <div className={styles.itemsTable}>
              <Table aria-label="Order items">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">SKU</th>
                    <th scope="col" className={tableStyles.numeric}>
                      Qty
                    </th>
                    <th scope="col" className={tableStyles.numeric}>
                      Unit price
                    </th>
                    <th scope="col" className={tableStyles.numeric}>
                      Line total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.sku}>
                      <td>
                        <div>{item.name}</div>
                        <div className={styles.muted}>{item.category}</div>
                      </td>
                      <td className={styles.mono}>{item.sku}</td>
                      <td className={tableStyles.numeric}>{item.quantity}</td>
                      <td className={tableStyles.numeric}>
                        {formatCurrency(item.unitPrice, true)}
                      </td>
                      <td className={tableStyles.numeric}>
                        {formatCurrency(item.quantity * item.unitPrice, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <dl className={styles.totals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(subtotal, true)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>Free</dd>
              </div>
              <div className={styles.grandTotal}>
                <dt>Total</dt>
                <dd>{formatCurrency(order.total, true)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className={styles.sideColumn}>
          <Card title="Status">
            <StatusTimeline order={order} />
          </Card>
          <Card title="Customer">
            <div className={styles.customer}>
              <Avatar name={order.customer.name} size={40} />
              <div>
                <div className={styles.customerName}>{order.customer.name}</div>
                <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
              </div>
            </div>
          </Card>
          <Card title="Shipping address">
            <address className={styles.address}>
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.city}
              <br />
              {order.shippingAddress.country}
            </address>
          </Card>
        </div>
      </div>
    </>
  );
}

function OrderDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading order">
      <Skeleton width={90} height={14} />
      <div className={styles.skeletonHeader}>
        <Skeleton width={260} height={28} />
        <Skeleton width={180} height={14} />
      </div>
      <div className={styles.detailGrid}>
        <div className={styles.mainColumn}>
          <Skeleton height={320} radius={12} />
        </div>
        <div className={styles.sideColumn}>
          <Skeleton height={220} radius={12} />
          <Skeleton height={100} radius={12} />
        </div>
      </div>
    </div>
  );
}
