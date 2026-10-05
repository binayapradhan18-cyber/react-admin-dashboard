import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Checkbox, SelectField } from '@/shared/ui';
import { useUpdatePreferences } from '../api/hooks';
import { type Preferences, preferencesSchema, TIMEZONES } from '../types';
import styles from './Settings.module.css';

const TIMEZONE_OPTIONS = TIMEZONES.map((zone) => ({ value: zone, label: zone.replace('_', ' ') }));

export function PreferencesForm({ preferences }: { preferences: Preferences }) {
  const updatePreferences = useUpdatePreferences();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<Preferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferences,
  });

  const onSubmit = handleSubmit((values) =>
    updatePreferences.mutate(values, { onSuccess: (saved) => reset(saved) }),
  );

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <SelectField label="Timezone" options={TIMEZONE_OPTIONS} {...register('timezone')} />
      <fieldset className={styles.fieldset}>
        <legend>Email notifications</legend>
        <Checkbox
          label="Order alerts"
          description="Large orders, refunds and failed payments."
          {...register('orderAlerts')}
        />
        <Checkbox
          label="Weekly digest"
          description="A Monday summary of revenue and activity."
          {...register('weeklyDigest')}
        />
        <Checkbox
          label="Product updates"
          description="New features and improvements."
          {...register('productUpdates')}
        />
      </fieldset>
      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          disabled={!isDirty}
          loading={updatePreferences.isPending}
        >
          Save preferences
        </Button>
      </div>
    </form>
  );
}
