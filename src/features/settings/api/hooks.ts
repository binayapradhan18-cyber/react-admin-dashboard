import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { normalizeError } from '@/shared/lib/apiClient';
import { toast } from '@/shared/ui';
import { settingsApi } from './api';

const all = ['settings'] as const;

export const settingsKeys = {
  all,
  profile: () => [...all, 'profile'] as const,
  preferences: () => [...all, 'preferences'] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: ({ signal }) => settingsApi.profile(signal),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  return useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(settingsKeys.profile(), profile);
      updateUser({ name: profile.name, email: profile.email });
      toast.success('Profile saved');
    },
    onError: (error) => toast.error('Could not save profile', normalizeError(error).message),
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: settingsKeys.preferences(),
    queryFn: ({ signal }) => settingsApi.preferences(signal),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.updatePreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(settingsKeys.preferences(), preferences);
      toast.success('Preferences saved');
    },
    onError: (error) => toast.error('Could not save preferences', normalizeError(error).message),
  });
}
