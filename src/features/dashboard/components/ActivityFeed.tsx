import { clsx } from 'clsx';
import { type LucideIcon, ReceiptText, Truck, Undo2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRelative } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';
import { useActivity } from '../api/hooks';
import type { ActivityType } from '../types';
import { Widget } from './Widget';
import styles from './Dashboard.module.css';

const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  order_created: ReceiptText,
  order_shipped: Truck,
  order_refunded: Undo2,
  user_joined: UserPlus,
};

function ActivityList() {
  const { data } = useActivity();
  if (data.length === 0) return <p className={styles.widgetHint}>No recent activity.</p>;

  return (
    <ul className={styles.activity}>
      {data.map((item) => {
        const Icon = ACTIVITY_ICONS[item.type];
        return (
          <li key={item.id} className={styles.activityItem}>
            <span className={clsx(styles.activityIcon, styles[item.type])} aria-hidden="true">
              <Icon size={16} />
            </span>
            <div className={styles.activityBody}>
              <Link to={item.href} className={styles.activityTitle}>
                {item.title}
              </Link>
              <p className={styles.activityDescription}>{item.description}</p>
            </div>
            <time className={styles.activityTime} dateTime={item.at}>
              {formatRelative(item.at)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}

export function ActivityWidget({ className }: { className?: string }) {
  return (
    <Widget
      title="Recent activity"
      className={className}
      skeleton={
        <div className={styles.activity} aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={styles.activityItem}>
              <Skeleton width={32} height={32} radius="50%" />
              <div className={styles.activityBody}>
                <Skeleton width="60%" height={12} />
                <Skeleton width="40%" height={10} />
              </div>
            </div>
          ))}
        </div>
      }
    >
      <ActivityList />
    </Widget>
  );
}
