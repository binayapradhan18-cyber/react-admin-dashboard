import type { ReactNode } from 'react';
import { useCurrentUser } from '@/features/auth';
import { Badge, Card, ErrorFallback, PageHeader, Skeleton } from '@/shared/ui';
import { usePreferences, useProfile } from '../api/hooks';
import { AppearanceSettings } from './AppearanceSettings';
import { MockApiSettings } from './MockApiSettings';
import { PreferencesForm } from './PreferencesForm';
import { ProfileForm } from './ProfileForm';
import styles from './Settings.module.css';

const mocksEnabled = import.meta.env.VITE_ENABLE_MOCKS !== 'false';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionIntro}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      <Card className={styles.sectionCard}>{children}</Card>
    </div>
  );
}

function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className={styles.form} aria-busy="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height={56} />
      ))}
    </div>
  );
}

export function SettingsPage() {
  const user = useCurrentUser();
  const profile = useProfile();
  const preferences = usePreferences();

  return (
    <>
      <PageHeader
        title="Settings"
        description={
          user && (
            <>
              Signed in as {user.email} · <Badge tone="primary">{user.role}</Badge>
            </>
          )
        }
      />

      <Section title="Profile" description="How you appear to teammates across the workspace.">
        {profile.isPending ? (
          <FormSkeleton rows={3} />
        ) : profile.isError ? (
          <ErrorFallback compact error={profile.error} reset={() => void profile.refetch()} />
        ) : (
          <ProfileForm profile={profile.data} />
        )}
      </Section>

      <Section title="Appearance" description="Theme is stored on this device.">
        <AppearanceSettings />
      </Section>

      <Section title="Preferences" description="Regional settings and notifications.">
        {preferences.isPending ? (
          <FormSkeleton rows={4} />
        ) : preferences.isError ? (
          <ErrorFallback
            compact
            error={preferences.error}
            reset={() => void preferences.refetch()}
          />
        ) : (
          <PreferencesForm preferences={preferences.data} />
        )}
      </Section>

      {mocksEnabled && (
        <Section
          title="Mock API"
          description="Tune the in-browser mock backend to see loading and error states."
        >
          <MockApiSettings />
        </Section>
      )}
    </>
  );
}
