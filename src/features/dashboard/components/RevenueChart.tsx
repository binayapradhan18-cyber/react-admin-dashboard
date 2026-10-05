import { clsx } from 'clsx';
import { useId, useState, useTransition } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompact, formatCurrency, formatNumber, formatShortDate } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';
import { useRevenue } from '../api/hooks';
import { REVENUE_RANGES, type RevenuePoint, type RevenueRange } from '../types';
import { useChartTheme } from './chartTheme';
import { Widget } from './Widget';
import styles from './Dashboard.module.css';

const RANGE_LABELS: Record<RevenueRange, string> = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
};

function RangeSelector({
  value,
  onChange,
}: {
  value: RevenueRange;
  onChange: (range: RevenueRange) => void;
}) {
  return (
    <div className={styles.segmented} role="group" aria-label="Revenue range">
      {REVENUE_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          aria-pressed={value === range}
          className={clsx(styles.segment, value === range && styles.segmentActive)}
          onClick={() => onChange(range)}
          title={RANGE_LABELS[range]}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: RevenuePoint }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{formatShortDate(point.date)}</p>
      <p>{formatCurrency(point.revenue)}</p>
      <p className={styles.tooltipMuted}>{formatNumber(point.orders)} orders</p>
    </div>
  );
}

function RevenueChartBody({ range }: { range: RevenueRange }) {
  const { data } = useRevenue(range);
  const theme = useChartTheme();
  const gradientId = useId();
  const total = data.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <>
      <p className={styles.chartSummary}>
        <span className={styles.chartTotal}>{formatCurrency(total)}</span> in the last{' '}
        {RANGE_LABELS[range]}
      </p>
      <div
        className={styles.chart}
        role="img"
        aria-label={`Revenue over the last ${RANGE_LABELS[range]}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.series[0]} stopOpacity={0.28} />
                <stop offset="100%" stopColor={theme.series[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              stroke={theme.axis}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
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
            <Tooltip
              content={<RevenueTooltip />}
              cursor={{ stroke: theme.axis, strokeDasharray: 4 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={theme.series[0]}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export function RevenueWidget({ className }: { className?: string }) {
  const [range, setRange] = useState<RevenueRange>('30d');
  const [isPending, startTransition] = useTransition();

  return (
    <Widget
      title="Revenue"
      className={className}
      actions={
        <RangeSelector value={range} onChange={(next) => startTransition(() => setRange(next))} />
      }
      skeleton={
        <>
          <Skeleton width={200} height={16} />
          <div className={styles.chart}>
            <Skeleton height="100%" radius={8} />
          </div>
        </>
      }
    >
      {/* Transition keeps the previous range on screen while the next one loads. */}
      <div className={clsx(isPending && styles.stale)}>
        <RevenueChartBody range={range} />
      </div>
    </Widget>
  );
}
