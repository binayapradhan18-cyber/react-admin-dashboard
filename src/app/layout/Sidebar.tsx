import { clsx } from 'clsx';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { checkPermissions, useAuthStore } from '@/features/auth';
import { useUiStore } from '@/shared/lib/uiStore';
import { NAV_ITEMS } from './navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  /** Drawer mode on small screens: always expanded, no collapse toggle. */
  variant?: 'rail' | 'drawer';
  onNavigate?: () => void;
}

export function Sidebar({ variant = 'rail', onNavigate }: SidebarProps) {
  const role = useAuthStore((state) => state.user?.role);
  const storedCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const collapsed = variant === 'rail' && storedCollapsed;
  const items = NAV_ITEMS.filter(
    (item) => !item.permission || checkPermissions(role, item.permission),
  );

  return (
    <div className={clsx(styles.sidebar, collapsed && styles.collapsed, styles[variant])}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          N
        </span>
        {!collapsed && <span className={styles.brandName}>Northwind</span>}
      </div>

      <nav aria-label="Main" className={styles.nav}>
        <ul>
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end ?? false}
                className={({ isActive }) => clsx(styles.link, isActive && styles.active)}
                title={collapsed ? label : undefined}
                onClick={onNavigate}
              >
                <Icon size={18} aria-hidden="true" />
                <span className={clsx(collapsed && 'visually-hidden')}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {variant === 'rail' && (
        <button
          type="button"
          className={styles.collapseButton}
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      )}
    </div>
  );
}
