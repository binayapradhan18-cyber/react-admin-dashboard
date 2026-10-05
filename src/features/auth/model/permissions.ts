import type { Role } from '../types';

export const PERMISSIONS = [
  'dashboard:view',
  'users:view',
  'users:create',
  'users:update',
  'users:delete',
  'orders:view',
  'orders:update',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
export type PermissionCheck = Permission | readonly Permission[];
export type PermissionMode = 'all' | 'any';

/** Single source of truth for RBAC; the mock API enforces the same matrix server-side. */
export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  admin: new Set(PERMISSIONS),
  manager: new Set<Permission>([
    'dashboard:view',
    'users:view',
    'users:create',
    'users:update',
    'orders:view',
    'orders:update',
  ]),
  viewer: new Set<Permission>(['dashboard:view', 'users:view', 'orders:view']),
};

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  return role ? ROLE_PERMISSIONS[role].has(permission) : false;
}

export function checkPermissions(
  role: Role | null | undefined,
  required: PermissionCheck,
  mode: PermissionMode = 'all',
): boolean {
  const list: readonly Permission[] = typeof required === 'string' ? [required] : required;
  if (list.length === 0) return true;
  return mode === 'all'
    ? list.every((permission) => hasPermission(role, permission))
    : list.some((permission) => hasPermission(role, permission));
}
