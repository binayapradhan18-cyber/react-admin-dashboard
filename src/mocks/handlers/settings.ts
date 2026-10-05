import { http, HttpResponse } from 'msw';
import type { SessionUser } from '@/features/auth/types';
import {
  type Preferences,
  preferencesSchema,
  type Profile,
  profileSchema,
} from '@/features/settings/types';
import { getDb } from '../db/db';
import { api, errorResponse, requireUser, simulateNetwork } from './utils';

const DEFAULT_PREFERENCES: Preferences = {
  timezone: 'UTC',
  weeklyDigest: true,
  orderAlerts: true,
  productUpdates: false,
};

function profileFor(user: SessionUser): Profile {
  return (
    getDb().profiles.get(user.id) ?? { name: user.name, email: user.email, title: '', bio: '' }
  );
}

export const settingsHandlers = [
  http.get(api('/me/profile'), async ({ request }) => {
    const user = requireUser(request);
    await simulateNetwork();
    return HttpResponse.json(profileFor(user));
  }),

  http.put(api('/me/profile'), async ({ request }) => {
    const user = requireUser(request);
    await simulateNetwork();
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(422, 'Some fields are invalid.');
    getDb().profiles.set(user.id, parsed.data);
    return HttpResponse.json(parsed.data);
  }),

  http.get(api('/me/preferences'), async ({ request }) => {
    const user = requireUser(request);
    await simulateNetwork();
    return HttpResponse.json(getDb().preferences.get(user.id) ?? DEFAULT_PREFERENCES);
  }),

  http.put(api('/me/preferences'), async ({ request }) => {
    const user = requireUser(request);
    await simulateNetwork();
    const parsed = preferencesSchema.safeParse(await request.json());
    if (!parsed.success) return errorResponse(422, 'Some fields are invalid.');
    getDb().preferences.set(user.id, parsed.data);
    return HttpResponse.json(parsed.data);
  }),
];
