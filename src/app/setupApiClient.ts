import { useAuthStore } from '@/features/auth';
import { configureApiClient } from '@/shared/lib/apiClient';
import { toast } from '@/shared/ui';

/** Wires the framework-agnostic HTTP client to the auth store. */
export function setupApiClient(): void {
  configureApiClient({
    getToken: () => useAuthStore.getState().token,
    onUnauthorized: () => {
      const { token, clear } = useAuthStore.getState();
      if (!token) return;
      clear();
      toast.info('Session expired', 'Please sign in again.');
    },
  });
}
