import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId } from 'react';
import { formatNumber } from '@/shared/lib/format';
import { PAGE_SIZE_OPTIONS } from '@/shared/lib/pagination';
import { IconButton } from '../Button/Button';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  disabled?: boolean;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: PaginationProps) {
  const sizeId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <p className={styles.summary} aria-live="polite">
        {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
      </p>
      <div className={styles.controls}>
        {onPageSizeChange && (
          <div className={styles.size}>
            <label htmlFor={sizeId}>Rows</label>
            <select
              id={sizeId}
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
        <span className={styles.pageInfo}>
          Page {page} of {totalPages}
        </span>
        <IconButton
          aria-label="Previous page"
          size="sm"
          variant="secondary"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </IconButton>
        <IconButton
          aria-label="Next page"
          size="sm"
          variant="secondary"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </IconButton>
      </div>
    </nav>
  );
}
