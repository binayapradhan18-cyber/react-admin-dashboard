import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, TextAreaField, TextField } from '@/shared/ui';
import { useUpdateProfile } from '../api/hooks';
import { type Profile, profileSchema } from '../types';
import styles from './Settings.module.css';

export function ProfileForm({ profile }: { profile: Profile }) {
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Profile>({ resolver: zodResolver(profileSchema), defaultValues: profile });

  const onSubmit = handleSubmit((values) =>
    updateProfile.mutate(values, { onSuccess: (saved) => reset(saved) }),
  );

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <TextField label="Full name" error={errors.name?.message} {...register('name')} />
        <TextField
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <TextField
        label="Job title"
        placeholder="e.g. Operations Lead"
        error={errors.title?.message}
        {...register('title')}
      />
      <TextAreaField
        label="Bio"
        hint="Up to 280 characters. Shown to teammates."
        error={errors.bio?.message}
        {...register('bio')}
      />
      <div className={styles.actions}>
        <Button onClick={() => reset()} disabled={!isDirty || updateProfile.isPending}>
          Discard
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isDirty}
          loading={updateProfile.isPending}
        >
          Save profile
        </Button>
      </div>
    </form>
  );
}
