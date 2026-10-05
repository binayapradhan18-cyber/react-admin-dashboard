import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom';
import { useIsMobile } from '@/shared/hooks/useMediaQuery';
import { useUiStore } from '@/shared/lib/uiStore';
import { Dialog } from '@/shared/ui';
import styles from './AppShell.module.css';
import { Breadcrumbs } from './Breadcrumbs';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const isMobile = useIsMobile();
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const navigation = useNavigation();

  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false);
  }, [isMobile, setMobileNavOpen]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      {navigation.state === 'loading' && (
        <div className={styles.progress} role="progressbar" aria-label="Loading page" />
      )}

      {isMobile ? (
        <Dialog
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          variant="drawer-left"
          title="Navigation"
          hideHeader
        >
          <Sidebar variant="drawer" onNavigate={() => setMobileNavOpen(false)} />
        </Dialog>
      ) : (
        <aside className={styles.aside}>
          <Sidebar />
        </aside>
      )}

      <ScrollRestoration />
      <div className={styles.main}>
        <Topbar isMobile={isMobile} />
        <main id="main" className={styles.content} tabIndex={-1}>
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
