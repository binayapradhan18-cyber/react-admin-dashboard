import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '@/features/auth';
import { Avatar } from '@/shared/ui';
import styles from './Topbar.module.css';

/** Menu button pattern: roving focus across items, Esc/outside click closes and restores focus. */
export function UserMenu() {
  const user = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (!user) return null;

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      list[(index + 1) % list.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className={styles.userMenu} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.userButton}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar name={user.name} size={30} />
        <span className={styles.userName}>{user.name}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label="Account"
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          <div className={styles.menuHeader}>
            <p className={styles.menuName}>{user.name}</p>
            <p className={styles.menuEmail}>{user.email}</p>
            <p className={styles.menuRole}>{user.role}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              navigate('/settings');
            }}
          >
            <Settings size={16} aria-hidden="true" /> Settings
          </button>
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={styles.menuItem}
            onClick={() => logout.mutate()}
          >
            <LogOut size={16} aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
