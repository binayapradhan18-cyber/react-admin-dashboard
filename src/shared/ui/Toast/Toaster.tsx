import { clsx } from 'clsx';
import { CircleAlert, CircleCheck, Info, type LucideIcon, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type Toast, type ToastTone, useToastStore } from './toastStore';
import styles from './Toast.module.css';

const ICONS: Record<ToastTone, LucideIcon> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const Icon = ICONS[toast.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), toast.durationMs);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast.id, toast.durationMs]);

  return (
    <li
      className={clsx(styles.toast, styles[toast.tone])}
      role={toast.tone === 'error' ? 'alert' : 'status'}
    >
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.description && <p className={styles.description}>{toast.description}</p>}
      </div>
      <button
        type="button"
        className={styles.close}
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </li>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return createPortal(
    <ol className={styles.viewport} aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </ol>,
    document.body,
  );
}
