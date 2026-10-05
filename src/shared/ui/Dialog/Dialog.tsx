import { clsx } from 'clsx';
import { X } from 'lucide-react';
import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { IconButton } from '../Button/Button';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  variant?: 'modal' | 'drawer' | 'drawer-left';
  size?: 'sm' | 'md' | 'lg';
  role?: 'dialog' | 'alertdialog';
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnBackdrop?: boolean;
  hideHeader?: boolean;
}

let openDialogs = 0;

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    openDialogs += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      openDialogs -= 1;
      if (openDialogs === 0) document.body.style.overflow = '';
    };
  }, [active]);
}

export function Dialog(props: DialogProps) {
  if (!props.open) return null;
  return createPortal(<DialogPanel {...props} />, document.body);
}

function DialogPanel({
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'modal',
  size = 'md',
  role = 'dialog',
  initialFocusRef,
  closeOnBackdrop = true,
  hideHeader = false,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useFocusTrap(panelRef, true, initialFocusRef);
  useScrollLock(true);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
    }
  };

  return (
    <div className={clsx(styles.root, styles[variant])}>
      <div
        className={styles.backdrop}
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={clsx(styles.panel, styles[size])}
        onKeyDown={onKeyDown}
      >
        <header className={clsx(styles.header, hideHeader && 'visually-hidden')}>
          <div>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          <IconButton aria-label="Close" size="sm" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </header>
        {children !== undefined && <div className={styles.body}>{children}</div>}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
}
