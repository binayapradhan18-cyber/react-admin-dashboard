import { clsx } from 'clsx';
import { Moon, Sun } from 'lucide-react';
import { type Theme, useUiStore } from '@/shared/lib/uiStore';
import styles from './Settings.module.css';

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

export function AppearanceSettings() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  return (
    <div role="radiogroup" aria-label="Theme" className={styles.themeOptions}>
      {OPTIONS.map(({ value, label, Icon }) => (
        <label
          key={value}
          className={clsx(styles.themeOption, theme === value && styles.themeSelected)}
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={theme === value}
            onChange={() => setTheme(value)}
            className="visually-hidden"
          />
          <Icon size={18} aria-hidden="true" />
          {label}
        </label>
      ))}
    </div>
  );
}
