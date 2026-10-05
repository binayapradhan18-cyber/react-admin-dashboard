import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import type { PermissionCheck, PermissionMode } from '../model/permissions';
import { ForbiddenPage } from './ForbiddenPage';

interface RequirePermissionProps {
  permission: PermissionCheck;
  mode?: PermissionMode;
  children?: ReactNode;
}

export function RequirePermission({ permission, mode = 'all', children }: RequirePermissionProps) {
  const allowed = usePermission(permission, mode);
  if (!allowed) return <ForbiddenPage />;
  return children ?? <Outlet />;
}
