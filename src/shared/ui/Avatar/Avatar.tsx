import { initials } from '@/shared/lib/format';
import styles from './Avatar.module.css';

const PALETTE = ['#4f46e5', '#0891b2', '#c2410c', '#15803d', '#be185d', '#7c3aed', '#0369a1'];

function colorFor(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length] ?? '#4f46e5';
}

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.38, background: colorFor(name) }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
