import { http, HttpResponse } from 'msw';
import { loginSchema, type Session, type SessionUser } from '@/features/auth/types';
import { getDb } from '../db/db';
import {
  api,
  encodeToken,
  errorResponse,
  requireUser,
  roleForEmail,
  simulateNetwork,
} from './utils';

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function idFromEmail(email: string): string {
  let hash = 0;
  for (const char of email) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return `ses_${hash.toString(36)}`;
}

export const authHandlers = [
  http.post(api('/auth/login'), async ({ request }) => {
    await simulateNetwork({ failable: false });
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(422, 'Enter a valid email and a password of at least 6 characters.');
    }

    const email = parsed.data.email.toLowerCase();
    const existing = getDb().users.find((user) => user.email === email);
    const user: SessionUser = {
      id: existing?.id ?? idFromEmail(email),
      name: existing?.name ?? (nameFromEmail(email) || 'New User'),
      email,
      role: roleForEmail(email),
    };
    return HttpResponse.json<Session>({ token: encodeToken(user), user });
  }),

  http.post(api('/auth/logout'), () => new HttpResponse(null, { status: 204 })),

  http.get(api('/auth/me'), async ({ request }) => {
    await simulateNetwork({ failable: false });
    return HttpResponse.json(requireUser(request));
  }),
];
