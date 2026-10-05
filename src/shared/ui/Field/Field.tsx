import { clsx } from 'clsx';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useId,
} from 'react';
import styles from './Field.module.css';

interface FieldShellProps {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  hideLabel?: boolean;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, hideLabel, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={clsx(styles.label, hideLabel && 'visually-hidden')}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface CommonProps {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  hideLabel?: boolean;
}

export type TextFieldProps = CommonProps & InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, hideLabel, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldShell id={inputId} label={label} error={error} hint={hint} hideLabel={hideLabel}>
      <input
        ref={ref}
        id={inputId}
        className={clsx(styles.control, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, error, hint)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
}

export type SelectFieldProps = CommonProps &
  SelectHTMLAttributes<HTMLSelectElement> & { options: readonly SelectOption[] };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, hideLabel, id, className, options, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <FieldShell id={selectId} label={label} error={error} hint={hint} hideLabel={hideLabel}>
      <select
        ref={ref}
        id={selectId}
        className={clsx(styles.control, styles.select, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(selectId, error, hint)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});

export type TextAreaFieldProps = CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, error, hint, hideLabel, id, className, ...rest }, ref) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    return (
      <FieldShell id={textareaId} label={label} error={error} hint={hint} hideLabel={hideLabel}>
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(styles.control, styles.textarea, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(textareaId, error, hint)}
          {...rest}
        />
      </FieldShell>
    );
  },
);

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  description?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, id, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className={clsx(styles.checkboxRow, className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className={styles.checkbox}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        {...rest}
      />
      <div>
        <label htmlFor={inputId} className={styles.checkboxLabel}>
          {label}
        </label>
        {description && (
          <p id={`${inputId}-desc`} className={styles.hint}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
});
