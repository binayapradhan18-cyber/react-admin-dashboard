import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useLayoutEffect } from 'react';
import { useUiStore } from '@/shared/lib/uiStore';
import { Toaster } from '@/shared/ui';

function ThemeSync() {
  const theme = useUiStore((state) => state.theme);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}

interface AppProvidersProps {
  queryClient: QueryClient;
  children: ReactNode;
}

export function AppProviders({ queryClient, children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
