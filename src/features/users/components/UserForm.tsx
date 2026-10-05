import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ROLES } from '@/features/auth/types';
import { normalizeError } from '@/shared/lib/apiClient';
import { capitalize } from '@/shared/lib/format';
import { SelectField, TextField } from '@/shared/ui';
import { DEPARTMENTS, USER_STATUSES, type UserFormValues, userFormSchema } from '../types';
import styles from './UserForm.module.css';

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: capitalize(value) }));

const ROLE_OPTIONS = toOptions(ROLES);
const STATUS_OPTIONS = toOptions(USER_STATUSES);
const DEPARTMENT_OPTIONS = toOptions(DEPARTMENTS);

const EMPTY_USER_FORM: UserFormValues = {
  name: '',
  email: '',
  role: 'viewer',
  status: 'invited',
  department: 'Engineering',
};

const FIELDS = Object.keys(EMPTY_USER_FORM) as (keyof UserFormValues)[];
const isFormField = (key: string): key is keyof UserFormValues =>
  (FIELDS as string[]).includes(key);

interface UserFormProps {
  id: string;
  defaultValues?: UserFormValues;
  /** Rejecting with an ApiError maps server-side field errors back onto the form. */
  onSubmit: (values: UserFormValues) => Promise<unknown>;
}

export function UserForm({ id, defaultValues = EMPTY_USER_FORM, onSubmit }: UserFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      const apiError = normalizeError(error);
      const fieldEntries = Object.entries(apiError.fieldErrors).filter(([key]) => isFormField(key));
      for (const [field, message] of fieldEntries) {
        if (isFormField(field)) setError(field, { message }, { shouldFocus: true });
      }
      if (fieldEntries.length === 0) setError('root.server', { message: apiError.message });
    }
  });

  return (
    <form id={id} className={styles.form} onSubmit={submit} noValidate>
      {errors.root?.server && (
        <p className={styles.formError} role="alert">
          {errors.root.server.message}
        </p>
      )}
      <TextField
        label="Full name"
        autoComplete="off"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="off"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className={styles.row}>
        <SelectField
          label="Role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register('role')}
        />
        <SelectField
          label="Status"
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>
      <SelectField
        label="Department"
        options={DEPARTMENT_OPTIONS}
        error={errors.department?.message}
        {...register('department')}
      />
    </form>
  );
}
