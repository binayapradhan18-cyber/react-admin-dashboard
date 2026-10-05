import { http, HttpResponse } from 'msw';
import { ROLES } from '@/features/auth/types';
import { USER_SORT_FIELDS, USER_STATUSES, type User, userFormSchema } from '@/features/users/types';
import { getDb } from '../db/db';
import {
  api,
  errorResponse,
  paginate,
  parseListQuery,
  requirePermission,
  simulateNetwork,
  sortBy,
} from './utils';

function fieldErrorsFrom(issues: { path: (string | number)[]; message: string }[]) {
  return Object.fromEntries(issues.map((issue) => [issue.path.join('.'), issue.message]));
}

function emailTaken(email: string, exceptId?: string): boolean {
  return getDb().users.some((user) => user.email === email.toLowerCase() && user.id !== exceptId);
}

let sequence = 0;

export const userHandlers = [
  http.get(api('/users'), async ({ request }) => {
    requirePermission(request, 'users:view');
    await simulateNetwork();

    const { page, pageSize, sort, order, q, searchParams } = parseListQuery(
      request,
      USER_SORT_FIELDS,
      'createdAt',
    );
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const filtered = getDb().users.filter(
      (user) =>
        (!q || user.name.toLowerCase().includes(q) || user.email.includes(q)) &&
        (!role || !ROLES.includes(role as User['role']) || user.role === role) &&
        (!status || !USER_STATUSES.includes(status as User['status']) || user.status === status),
    );

    return HttpResponse.json(paginate(sortBy(filtered, sort, order), page, pageSize));
  }),

  http.get(api('/users/:id'), async ({ request, params }) => {
    requirePermission(request, 'users:view');
    await simulateNetwork();
    const user = getDb().users.find((candidate) => candidate.id === params.id);
    return user ? HttpResponse.json(user) : errorResponse(404, 'User not found.');
  }),

  http.post(api('/users'), async ({ request }) => {
    requirePermission(request, 'users:create');
    await simulateNetwork();

    const parsed = userFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        422,
        'Some fields are invalid.',
        'VALIDATION',
        fieldErrorsFrom(parsed.error.issues),
      );
    }
    if (emailTaken(parsed.data.email)) {
      return errorResponse(409, 'A user with this email already exists.', 'EMAIL_TAKEN', {
        email: 'This email is already in use',
      });
    }

    const db = getDb();
    sequence += 1;
    const user: User = {
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
      id: `usr_new_${Date.now().toString(36)}${sequence}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: null,
    };
    db.users.unshift(user);
    return HttpResponse.json(user, { status: 201 });
  }),

  http.put(api('/users/:id'), async ({ request, params }) => {
    requirePermission(request, 'users:update');
    await simulateNetwork();

    const db = getDb();
    const index = db.users.findIndex((user) => user.id === params.id);
    const existing = db.users[index];
    if (!existing) return errorResponse(404, 'User not found.');

    const parsed = userFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(
        422,
        'Some fields are invalid.',
        'VALIDATION',
        fieldErrorsFrom(parsed.error.issues),
      );
    }
    if (emailTaken(parsed.data.email, existing.id)) {
      return errorResponse(409, 'A user with this email already exists.', 'EMAIL_TAKEN', {
        email: 'This email is already in use',
      });
    }

    const updated: User = { ...existing, ...parsed.data, email: parsed.data.email.toLowerCase() };
    db.users[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete(api('/users/:id'), async ({ request, params }) => {
    const actor = requirePermission(request, 'users:delete');
    await simulateNetwork();

    if (params.id === actor.id) return errorResponse(409, 'You cannot delete your own account.');
    const db = getDb();
    const index = db.users.findIndex((user) => user.id === params.id);
    if (index === -1) return errorResponse(404, 'User not found.');
    db.users.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
