import { clsx } from 'clsx';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { HTMLAttributes, ReactNode, TableHTMLAttributes } from 'react';
import type { SortOrder } from '@/shared/lib/pagination';
import styles from './Table.module.css';

export function TableContainer({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <div className={clsx(styles.container, busy && styles.busy)} aria-busy={busy || undefined}>
      {children}
    </div>
  );
}

export function Table({ className, ...rest }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={clsx(styles.table, className)} {...rest} />;
}

interface SortableHeaderProps<F extends string> extends HTMLAttributes<HTMLTableCellElement> {
  field: F;
  activeField: F;
  order: SortOrder;
  onSort: (field: F) => void;
  children: ReactNode;
}

export function SortableHeader<F extends string>({
  field,
  activeField,
  order,
  onSort,
  children,
  className,
  ...rest
}: SortableHeaderProps<F>) {
  const active = field === activeField;
  const Icon = active ? (order === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={className}
      {...rest}
    >
      <button
        type="button"
        className={clsx(styles.sortButton, active && styles.sortActive)}
        onClick={() => onSort(field)}
      >
        {children}
        <Icon size={14} aria-hidden="true" />
      </button>
    </th>
  );
}
