import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { type ReactNode, Suspense } from 'react';
import { Card, ErrorBoundary, ErrorFallback } from '@/shared/ui';

interface WidgetProps {
  title?: string;
  actions?: ReactNode;
  skeleton: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Isolates a dashboard tile: its own loading skeleton and its own error
 * boundary wired to TanStack Query's reset, so one failing endpoint never
 * takes down the whole page and "Try again" refetches just that query.
 */
export function Widget({ title, actions, skeleton, className, children }: WidgetProps) {
  const boundary = (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={(props) => (
            <ErrorFallback
              compact
              title={`Couldn't load ${title?.toLowerCase() ?? 'data'}`}
              {...props}
            />
          )}
        >
          <Suspense fallback={skeleton}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );

  if (!title) return <div className={className}>{boundary}</div>;
  return (
    <Card title={title} actions={actions} className={className}>
      {boundary}
    </Card>
  );
}
