import { clsx } from 'clsx';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';
import { useKpis } from '../api/hooks';
import type { KpiMetric, Kpis } from '../types';
import styles from './Dashboard.module.css';

interface KpiDefinition {
  key: keyof Kpis;
  label: string;
  format: (value: number) => string;
  /** For metrics like churn, a decrease is good news. */
  lowerIsBetter?: boolean;
}

const KPI_DEFINITIONS: KpiDefinition[] = [
  { key: 'revenue', label: 'Revenue', format: (value) => formatCurrency(value) },
  { key: 'orders', label: 'Orders', format: formatNumber },
  { key: 'activeUsers', label: 'Active customers', format: formatNumber },
  { key: 'churnRate', label: 'Churn rate', format: formatPercent, lowerIsBetter: true },
];

function relativeChange({ value, previous }: KpiMetric): number {
  if (previous === 0) return value === 0 ? 0 : 1;
  return (value - previous) / previous;
}

function KpiCard({ definition, metric }: { definition: KpiDefinition; metric: KpiMetric }) {
  const change = relativeChange(metric);
  const isUp = change >= 0;
  const isGood = definition.lowerIsBetter ? !isUp : isUp;
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <article className={styles.kpi} aria-label={definition.label}>
      <p className={styles.kpiLabel}>{definition.label}</p>
      <p className={styles.kpiValue}>{definition.format(metric.value)}</p>
      <p className={clsx(styles.kpiDelta, isGood ? styles.good : styles.bad)}>
        <Icon size={14} aria-hidden="true" />
        <span>
          {isUp ? '+' : ''}
          {formatPercent(change)}
        </span>
        <span className={styles.kpiPeriod}>vs previous 30 days</span>
      </p>
    </article>
  );
}

export function KpiCards() {
  const { data } = useKpis();
  return (
    <div className={styles.kpiGrid}>
      {KPI_DEFINITIONS.map((definition) => (
        <KpiCard key={definition.key} definition={definition} metric={data[definition.key]} />
      ))}
    </div>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className={styles.kpiGrid} aria-busy="true" aria-label="Loading metrics">
      {KPI_DEFINITIONS.map((definition) => (
        <div key={definition.key} className={styles.kpi}>
          <Skeleton width={90} height={12} />
          <Skeleton width={140} height={28} />
          <Skeleton width={160} height={12} />
        </div>
      ))}
    </div>
  );
}
