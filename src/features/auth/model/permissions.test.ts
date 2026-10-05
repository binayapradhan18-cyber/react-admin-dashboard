import { describe, expect, it } from 'vitest';
import { ROLES } from '../types';
import { checkPermissions, hasPermission, PERMISSIONS, ROLE_PERMISSIONS } from './permissions';

describe('hasPermission', () => {
  it('grants admins every permission', () => {
    for (const permission of PERMISSIONS) {
      expect(hasPermission('admin', permission)).toBe(true);
    }
  });

  it('lets managers edit but not delete users', () => {
    expect(hasPermission('manager', 'users:create')).toBe(true);
    expect(hasPermission('manager', 'users:update')).toBe(true);
    expect(hasPermission('manager', 'users:delete')).toBe(false);
    expect(hasPermission('manager', 'orders:update')).toBe(true);
  });

  it('restricts viewers to read-only access', () => {
    const granted = PERMISSIONS.filter((permission) => hasPermission('viewer', permission));
    expect(granted).toEqual(['dashboard:view', 'users:view', 'orders:view']);
  });

  it('denies everything without a role', () => {
    expect(hasPermission(null, 'dashboard:view')).toBe(false);
    expect(hasPermission(undefined, 'dashboard:view')).toBe(false);
  });

  it('keeps role grants strictly nested (viewer ⊂ manager ⊂ admin)', () => {
    const [admin, manager, viewer] = ROLES.map((role) => ROLE_PERMISSIONS[role]);
    for (const permission of viewer ?? []) expect(manager?.has(permission)).toBe(true);
    for (const permission of manager ?? []) expect(admin?.has(permission)).toBe(true);
  });
});

describe('checkPermissions', () => {
  it('accepts a single permission', () => {
    expect(checkPermissions('viewer', 'users:view')).toBe(true);
  });

  it('requires every permission in "all" mode', () => {
    expect(checkPermissions('manager', ['users:update', 'users:delete'], 'all')).toBe(false);
    expect(checkPermissions('admin', ['users:update', 'users:delete'], 'all')).toBe(true);
  });

  it('requires at least one permission in "any" mode', () => {
    expect(checkPermissions('manager', ['users:update', 'users:delete'], 'any')).toBe(true);
    expect(checkPermissions('viewer', ['users:update', 'users:delete'], 'any')).toBe(false);
  });

  it('treats an empty requirement as satisfied', () => {
    expect(checkPermissions('viewer', [])).toBe(true);
  });
});
