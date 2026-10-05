import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { normalizeError } from '@/shared/lib/apiClient';
import { Button, TextField } from '@/shared/ui';
import { useLogin } from '../api/hooks';
import { useIsAuthenticated } from '../model/authStore';
import { type LoginCredentials, loginSchema, type Role } from '../types';
import type { LoginRedirectState } from './RequireAuth';
import styles from './LoginPage.module.css';

const DEMO_ACCOUNTS: { role: Role; email: string }[] = [
  { role: 'admin', email: 'admin@northwind.io' },
  { role: 'manager', email: 'manager@northwind.io' },
  { role: 'viewer', email: 'viewer@northwind.io' },
];

export function LoginPage() {
  useDocumentTitle('Sign in');
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const from = (location.state as LoginRedirectState | null)?.from;
  const redirectTo = from ? `${from.pathname}${from.search}` : '/';

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const onSubmit = handleSubmit((values) => login.mutate(values));

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password', { shouldValidate: true });
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            N
          </span>
          <span>Northwind Admin</span>
        </div>
        <h1 className={styles.title}>Sign in to your account</h1>
        <p className={styles.subtitle}>
          Any email and a password of at least 6 characters will work.
        </p>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {login.isError && (
            <p className={styles.formError} role="alert">
              {normalizeError(login.error).message}
            </p>
          )}
          <Button type="submit" variant="primary" loading={login.isPending}>
            Sign in
          </Button>
        </form>

        <div className={styles.demo}>
          <p>Try a demo role</p>
          <div className={styles.demoButtons}>
            {DEMO_ACCOUNTS.map((account) => (
              <Button key={account.role} size="sm" onClick={() => fillDemo(account.email)}>
                {account.role}
              </Button>
            ))}
          </div>
          <p className={styles.hint}>
            Role is derived from the email: it contains “manager” or “viewer”, otherwise admin.
          </p>
        </div>
      </div>
    </main>
  );
}
