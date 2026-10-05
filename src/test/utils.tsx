import { QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { createQueryClient } from '@/app/queryClient';
import { ROUTER_FUTURE_FLAGS } from '@/app/routes/futureFlags';
import { useAuthStore } from '@/features/auth';
import type { Role } from '@/features/auth/types';
import { encodeToken } from '@/mocks/handlers/utils';
import { Toaster } from '@/shared/ui';

export function signInAs(role: Role, overrides: { id?: string; name?: string } = {}) {
  const user = {
    id: overrides.id ?? `test_${role}`,
    name: overrides.name ?? `Test ${role}`,
    email: `${role}@northwind.io`,
    role,
  };
  useAuthStore.getState().setSession({ token: encodeToken(user), user });
  return user;
}

export function createTestQueryClient() {
  return createQueryClient({ queries: { retry: false, staleTime: Infinity, gcTime: Infinity } });
}

/** Exposes the current location so tests can assert on URL-synced state. */
function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location" hidden>
      {location.pathname + location.search}
    </output>
  );
}

interface RenderRouteOptions extends Omit<RenderOptions, 'wrapper'> {
  path?: string;
  initialEntry?: string;
}

/** Renders `ui` inside a memory router + fresh QueryClient, mirroring the real app providers. */
export function renderWithProviders(
  ui: ReactElement,
  { path = '/', initialEntry = path, ...options }: RenderRouteOptions = {},
) {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(
    [
      {
        path,
        element: (
          <>
            {ui}
            <LocationProbe />
          </>
        ),
      },
      { path: '*', element: <LocationProbe /> },
    ],
    { initialEntries: [initialEntry], future: ROUTER_FUTURE_FLAGS },
  );

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );

  return {
    user: userEvent.setup(),
    queryClient,
    router,
    ...render(<RouterProvider router={router} future={{ v7_startTransition: true }} />, {
      wrapper: Wrapper,
      ...options,
    }),
  };
}
