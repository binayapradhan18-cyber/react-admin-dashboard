import { CircleAlert, RotateCw } from 'lucide-react';
import { normalizeError } from '@/shared/lib/apiClient';
import { Button } from '../Button/Button';
import type { FallbackProps } from './ErrorBoundary';
import styles from './ErrorFallback.module.css';

interface ErrorFallbackProps extends FallbackProps {
  title?: string;
  compact?: boolean;
}

export function ErrorFallback({
  error,
  reset,
  title = 'Something went wrong',
  compact = false,
}: ErrorFallbackProps) {
  const { message } = normalizeError(error);
  return (
    <div className={compact ? styles.compact : styles.full} role="alert">
      <CircleAlert size={compact ? 20 : 32} className={styles.icon} aria-hidden="true" />
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
      </div>
      <Button size="sm" icon={<RotateCw size={14} />} onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
