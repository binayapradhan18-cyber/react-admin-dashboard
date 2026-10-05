import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { RequireAuth, RequirePermission } from '@/features/auth';
import { OrderCrumb } from '@/features/orders/components/OrderCrumb';
import { FullPageSpinner } from '@/shared/ui';
import { AppShell } from './layout/AppShell';
import { ROUTER_FUTURE_FLAGS } from './routes/futureFlags';
import type { RouteHandle } from './routes/handle';
import { NotFoundPage } from './routes/NotFoundPage';
import { RouteErrorPage } from './routes/RouteErrorPage';

const crumb = (value: RouteHandle['crumb']): RouteHandle => ({ crumb: value });

export const routes: RouteObject[] = [
  {
    path: '/login',
    lazy: () =>
      import('@/features/auth/components/LoginPage').then((m) => ({ Component: m.LoginPage })),
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <FullPageSpinner />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <FullPageSpinner />,
    children: [
      {
        // Pathless boundary so route errors render inside the shell, keeping navigation usable.
        errorElement: <RouteErrorPage />,
        children: [
          {
            handle: crumb('Dashboard'),
            element: <RequirePermission permission="dashboard:view" />,
            children: [
              {
                index: true,
                lazy: () =>
                  import('@/features/dashboard/components/DashboardPage').then((m) => ({
                    Component: m.DashboardPage,
                  })),
              },
            ],
          },
          {
            path: 'users',
            handle: crumb('Users'),
            element: <RequirePermission permission="users:view" />,
            children: [
              {
                index: true,
                lazy: () =>
                  import('@/features/users/components/UsersPage').then((m) => ({
                    Component: m.UsersPage,
                  })),
              },
            ],
          },
          {
            path: 'orders',
            handle: crumb('Orders'),
            element: <RequirePermission permission="orders:view" />,
            children: [
              {
                index: true,
                lazy: () =>
                  import('@/features/orders/components/OrdersPage').then((m) => ({
                    Component: m.OrdersPage,
                  })),
              },
              {
                path: ':orderId',
                handle: crumb((params) => <OrderCrumb orderId={params.orderId ?? ''} />),
                lazy: () =>
                  import('@/features/orders/components/OrderDetailPage').then((m) => ({
                    Component: m.OrderDetailPage,
                  })),
              },
            ],
          },
          {
            path: 'settings',
            handle: crumb('Settings'),
            lazy: () =>
              import('@/features/settings/components/SettingsPage').then((m) => ({
                Component: m.SettingsPage,
              })),
          },
          { path: '*', handle: crumb('Not found'), element: <NotFoundPage /> },
        ],
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes, { future: ROUTER_FUTURE_FLAGS });
}
