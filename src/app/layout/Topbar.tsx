import { Menu, Moon, Sun } from 'lucide-react';
import { GlobalSearch } from '@/features/search/components/GlobalSearch';
import { useUiStore } from '@/shared/lib/uiStore';
import { IconButton } from '@/shared/ui';
import styles from './Topbar.module.css';
import { UserMenu } from './UserMenu';

export function Topbar({ isMobile }: { isMobile: boolean }) {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <header className={styles.topbar}>
      {isMobile && (
        <IconButton aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
          <Menu size={20} />
        </IconButton>
      )}
      <GlobalSearch />
      <div className={styles.end}>
        <IconButton
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
        <UserMenu />
      </div>
    </header>
  );
}
