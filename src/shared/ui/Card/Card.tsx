import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
}

export function Card({ title, actions, padded = true, className, children, ...rest }: CardProps) {
  return (
    <section className={clsx(styles.card, className)} {...rest}>
      {(title ?? actions) && (
        <header className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={clsx(padded && styles.body)}>{children}</div>
    </section>
  );
}
