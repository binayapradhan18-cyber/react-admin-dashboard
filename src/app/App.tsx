import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary, ErrorFallback } from '@/shared/ui';
import { AppProviders } from './providers/AppProviders';
import { createQueryClient } from './queryClient';
import { createAppRouter } from './router';

export function App() {
  const [queryClient] = useState(createQueryClient);
  const [router] = useState(createAppRouter);

  return (
    <ErrorBoundary
      fallback={(props) => <ErrorFallback title="The app failed to load" {...props} />}
    >
      <AppProviders queryClient={queryClient}>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </AppProviders>
    </ErrorBoundary>
  );
}
