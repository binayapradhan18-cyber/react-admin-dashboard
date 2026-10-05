import { clsx } from 'clsx';
import { Receipt, Search, User } from 'lucide-react';
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { formatCurrency } from '@/shared/lib/format';
import { Spinner } from '@/shared/ui';
import { MIN_QUERY_LENGTH, useGlobalSearch } from '../api/hooks';
import styles from './GlobalSearch.module.css';

interface Option {
  id: string;
  group: 'Users' | 'Orders';
  label: string;
  detail: string;
  href: string;
}

/**
 * ARIA 1.2 combobox: focus stays in the input while arrow keys move
 * `aria-activedescendant` through the listbox options.
 */
export function GlobalSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounced = useDebouncedValue(query, 250);
  const { data, isFetching } = useGlobalSearch(debounced);

  const options = useMemo<Option[]>(() => {
    if (!data || debounced.trim().length < MIN_QUERY_LENGTH) return [];
    return [
      ...data.users.map((user) => ({
        id: `user-${user.id}`,
        group: 'Users' as const,
        label: user.name,
        detail: user.email,
        href: `/users?q=${encodeURIComponent(user.email)}`,
      })),
      ...data.orders.map((order) => ({
        id: `order-${order.id}`,
        group: 'Orders' as const,
        label: order.number,
        detail: `${order.customerName} · ${formatCurrency(order.total)}`,
        href: `/orders/${order.id}`,
      })),
    ];
  }, [data, debounced]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const select = (option: Option) => {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    navigate(option.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        setActiveIndex((index) => (options.length ? (index + 1) % options.length : -1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) =>
          options.length ? (index - 1 + options.length) % options.length : -1,
        );
        break;
      case 'Enter': {
        const option = options[activeIndex] ?? options[0];
        if (option) {
          event.preventDefault();
          select(option);
        }
        break;
      }
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
        } else {
          setQuery('');
        }
        break;
    }
  };

  const showPanel = open && query.trim().length >= MIN_QUERY_LENGTH;
  const activeOption = options[activeIndex];

  return (
    <div className={styles.root}>
      <Search size={16} className={styles.icon} aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label="Search users and orders"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && activeOption ? activeOption.id : undefined}
        className={styles.input}
        placeholder="Search users, orders…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <kbd className={styles.shortcut} aria-hidden="true">
        Ctrl K
      </kbd>

      {showPanel && (
        <div className={styles.panel}>
          <ul id={listboxId} role="listbox" aria-label="Search results" className={styles.listbox}>
            {options.map((option, index) => {
              const Icon = option.group === 'Users' ? User : Receipt;
              const startsGroup = options[index - 1]?.group !== option.group;
              return (
                <li
                  key={option.id}
                  id={option.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={clsx(styles.option, index === activeIndex && styles.active)}
                  data-group={startsGroup ? option.group : undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => select(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <Icon size={16} aria-hidden="true" className={styles.optionIcon} />
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDetail}>{option.detail}</span>
                </li>
              );
            })}
          </ul>
          {options.length === 0 && (
            <p className={styles.status} role="status">
              {isFetching || debounced !== query ? (
                <Spinner size={14} label="Searching" />
              ) : (
                'No matches'
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
