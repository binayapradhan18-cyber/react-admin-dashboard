import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  /** Committed value (e.g. from the URL). External changes overwrite the draft. */
  value: string;
  /** Called with the draft once typing pauses for `delayMs`. */
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  delayMs?: number;
}

export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
  delayMs = 300,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);

  if (value !== committed) {
    setCommitted(value);
    setDraft(value);
  }

  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => onChange(draft), delayMs);
    return () => window.clearTimeout(timer);
  }, [draft, value, delayMs, onChange]);

  return (
    <div className={styles.wrapper}>
      <Search size={16} className={styles.icon} aria-hidden="true" />
      <input
        type="search"
        className={styles.input}
        aria-label={label}
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onChange(draft);
        }}
      />
      {draft && (
        <button
          type="button"
          className={styles.clear}
          aria-label="Clear search"
          onClick={() => {
            setDraft('');
            onChange('');
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
