import { LayoutDashboard, type LucideIcon, Receipt, Settings, UsersRound } from 'lucide-react';
import type { Permission } from '@/features/auth';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view', end: true },
  { to: '/users', label: 'Users', icon: UsersRound, permission: 'users:view' },
  { to: '/orders', label: 'Orders', icon: Receipt, permission: 'orders:view' },
  { to: '/settings', label: 'Settings', icon: Settings },
];
