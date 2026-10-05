import { useAuthStore } from '../model/authStore';
import { checkPermissions, type PermissionCheck, type PermissionMode } from '../model/permissions';

export function usePermission(required: PermissionCheck, mode: PermissionMode = 'all'): boolean {
  const role = useAuthStore((state) => state.user?.role);
  return checkPermissions(role, required, mode);
}
