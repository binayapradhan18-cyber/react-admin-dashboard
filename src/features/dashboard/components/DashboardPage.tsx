import { useCurrentUser } from '@/features/auth';
import { PageHeader } from '@/shared/ui';
import { ActivityWidget } from './ActivityFeed';
import { CategoryWidget } from './CategoryChart';
import { KpiCards, KpiCardsSkeleton } from './KpiCards';
import { RevenueWidget } from './RevenueChart';
import { Widget } from './Widget';
import styles from './Dashboard.module.css';

export function DashboardPage() {
  const user = useCurrentUser();
  const firstName = user?.name.split(' ')[0];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          firstName ? `Welcome back, ${firstName}. Here's how the business is doing.` : undefined
        }
      />
      <div className={styles.grid}>
        <Widget className={styles.full} skeleton={<KpiCardsSkeleton />}>
          <KpiCards />
        </Widget>
        <RevenueWidget className={styles.wide} />
        <ActivityWidget className={styles.narrow} />
        <CategoryWidget className={styles.wide} />
      </div>
    </>
  );
}
