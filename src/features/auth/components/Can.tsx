import type { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';
import type { PermissionCheck, PermissionMode } from '../model/permissions';

interface CanProps {
  permission: PermissionCheck;
  mode?: PermissionMode;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, mode = 'all', fallback = null, children }: CanProps) {
  const allowed = usePermission(permission, mode);
  return <>{allowed ? children : fallback}</>;
}
