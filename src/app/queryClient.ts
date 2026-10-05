import { QueryCache, QueryClient, type QueryClientConfig } from '@tanstack/react-query';
import { normalizeError } from '@/shared/lib/apiClient';
import { toast } from '@/shared/ui';

const MAX_RETRIES = 2;

export function createQueryClient(overrides: QueryClientConfig['defaultOptions'] = {}) {
  return new QueryClient({
    queryCache: new QueryCache({
      // Initial-load failures are rendered inline by the owning component; only
      // background refetch failures (stale data still on screen) get a toast.
      onError: (error, query) => {
        if (query.state.data !== undefined) {
          toast.error('Background refresh failed', normalizeError(error).message);
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const { status } = normalizeError(error);
          if (status >= 400 && status < 500) return false;
          return failureCount < MAX_RETRIES;
        },
        ...overrides.queries,
      },
      mutations: { retry: false, ...overrides.mutations },
    },
  });
}
