import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsAuthenticated } from '../model/authStore';

export interface LoginRedirectState {
  from?: { pathname: string; search: string };
}

export function RequireAuth({ children }: { children?: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    const state: LoginRedirectState = {
      from: { pathname: location.pathname, search: location.search },
    };
    return <Navigate to="/login" replace state={state} />;
  }
  return children ?? <Outlet />;
}
