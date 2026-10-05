import { clsx } from 'clsx';
import { Check, CircleDashed, X } from 'lucide-react';
import { capitalize, formatDateTime } from '@/shared/lib/format';
import type { Order, OrderStatus } from '../types';
import styles from './StatusTimeline.module.css';

const HAPPY_PATH: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered'];

interface Step {
  status: OrderStatus;
  at: string | null;
  note: string;
  state: 'done' | 'current' | 'upcoming' | 'terminated';
}

/**
 * Merges recorded events with the remaining happy-path steps so the user sees
 * both history and what comes next.
 */
function buildSteps(order: Pick<Order, 'status' | 'timeline'>): Step[] {
  const steps: Step[] = order.timeline.map((event, index) => {
    const isLast = index === order.timeline.length - 1;
    const terminated = event.status === 'cancelled' || event.status === 'refunded';
    return {
      status: event.status,
      at: event.at,
      note: event.note,
      state: terminated
        ? 'terminated'
        : isLast && event.status !== 'delivered'
          ? 'current'
          : 'done',
    };
  });

  if (order.status === 'cancelled' || order.status === 'refunded') return steps;

  const reached = new Set(order.timeline.map((event) => event.status));
  for (const status of HAPPY_PATH) {
    if (!reached.has(status)) steps.push({ status, at: null, note: '', state: 'upcoming' });
  }
  return steps;
}

export function StatusTimeline({ order }: { order: Pick<Order, 'status' | 'timeline'> }) {
  const steps = buildSteps(order);
  return (
    <ol className={styles.timeline} aria-label="Order status history">
      {steps.map((step) => (
        <li
          key={`${step.status}-${step.at ?? 'next'}`}
          className={clsx(styles.step, styles[step.state])}
          aria-current={step.state === 'current' ? 'step' : undefined}
        >
          <span className={styles.marker} aria-hidden="true">
            {step.state === 'terminated' ? (
              <X size={12} />
            ) : step.state === 'upcoming' ? (
              <CircleDashed size={12} />
            ) : (
              <Check size={12} />
            )}
          </span>
          <div className={styles.content}>
            <p className={styles.status}>{capitalize(step.status)}</p>
            <p className={styles.meta}>
              {step.at ? <time dateTime={step.at}>{formatDateTime(step.at)}</time> : 'Upcoming'}
              {step.note && ` · ${step.note}`}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
