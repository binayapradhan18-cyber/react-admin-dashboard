import { http } from '@/shared/lib/apiClient';
import type { Preferences, Profile } from '../types';

export const settingsApi = {
  profile: (signal?: AbortSignal) => http.get<Profile>('/me/profile', { signal }),
  updateProfile: (profile: Profile) => http.put<Profile>('/me/profile', profile),
  preferences: (signal?: AbortSignal) => http.get<Preferences>('/me/preferences', { signal }),
  updatePreferences: (preferences: Preferences) =>
    http.put<Preferences>('/me/preferences', preferences),
};
