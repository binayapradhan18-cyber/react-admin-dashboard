import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompact, formatCurrency, formatNumber } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';
import { useSalesByCategory } from '../api/hooks';
import type { CategorySales } from '../types';
import { useChartTheme } from './chartTheme';
import { Widget } from './Widget';
import styles from './Dashboard.module.css';

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: CategorySales }[];
}) {
  const entry = payload?.[0]?.payload;
  if (!active || !entry) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{entry.category}</p>
      <p>{formatCurrency(entry.revenue)}</p>
      <p className={styles.tooltipMuted}>{formatNumber(entry.orders)} orders</p>
    </div>
  );
}

function CategoryChartBody() {
  const { data } = useSalesByCategory();
  const theme = useChartTheme();

  return (
    <div className={styles.chart} role="img" aria-label="Sales by category, last 30 days">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={theme.grid} vertical={false} />
          <XAxis
            dataKey="category"
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis
            tickFormatter={(value: number) => `$${formatCompact(value)}`}
            stroke={theme.axis}
            tickLine={false}
            axisLine={false}
            width={56}
            fontSize={12}
          />
          <Tooltip content={<CategoryTooltip />} cursor={{ fill: theme.grid, opacity: 0.5 }} />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={theme.series[index % theme.series.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryWidget({ className }: { className?: string }) {
  return (
    <Widget
      title="Sales by category"
      className={className}
      actions={<span className={styles.widgetHint}>Last 30 days</span>}
      skeleton={
        <div className={styles.chart}>
          <Skeleton height="100%" radius={8} />
        </div>
      }
    >
      <CategoryChartBody />
    </Widget>
  );
}
