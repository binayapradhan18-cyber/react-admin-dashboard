import { delay, HttpResponse } from 'msw';
import { hasPermission, type Permission } from '@/features/auth/model/permissions';
import { ROLES, type Role, type SessionUser } from '@/features/auth/types';
import type { FieldErrors } from '@/shared/lib/apiClient';
import type { Paginated, SortOrder } from '@/shared/lib/pagination';
import { getMockConfig } from '../config';

export const api = (path: string) => `/api${path}`;

export function errorResponse(
  status: number,
  message: string,
  code = `HTTP_${status}`,
  fieldErrors?: FieldErrors,
) {
  return HttpResponse.json({ message, code, fieldErrors }, { status });
}

/** Applies configured latency and, for failable requests, the simulated error rate. */
export async function simulateNetwork({ failable = true }: { failable?: boolean } = {}) {
  const { latencyMs, errorRate } = getMockConfig();
  if (latencyMs > 0) await delay(Math.round(latencyMs * (0.5 + Math.random())));
  if (failable && errorRate > 0 && Math.random() < errorRate) {
    throw errorResponse(500, 'Simulated server error. Please retry.', 'SIMULATED_FAILURE');
  }
}

export function roleForEmail(email: string): Role {
  const local = email.toLowerCase();
  if (local.includes('viewer')) return 'viewer';
  if (local.includes('manager')) return 'manager';
  return 'admin';
}

export function encodeToken(user: SessionUser): string {
  return `mock.${btoa(encodeURIComponent(JSON.stringify(user)))}`;
}

function decodeToken(token: string): SessionUser | null {
  if (!token.startsWith('mock.')) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(token.slice(5)))) as Partial<SessionUser>;
    const { id, name, email, role } = parsed;
    if (!id || !name || !email || !role || !ROLES.includes(role)) return null;
    return { id, name, email, role };
  } catch {
    return null;
  }
}

export function requireUser(request: Request): SessionUser {
  const header = request.headers.get('Authorization') ?? '';
  const user = header.startsWith('Bearer ') ? decodeToken(header.slice(7)) : null;
  if (!user) throw errorResponse(401, 'Authentication required.', 'UNAUTHENTICATED');
  return user;
}

export function requirePermission(request: Request, permission: Permission): SessionUser {
  const user = requireUser(request);
  if (!hasPermission(user.role, permission)) {
    throw errorResponse(403, 'You do not have permission to perform this action.', 'FORBIDDEN');
  }
  return user;
}

export interface ListQuery<S extends string> {
  page: number;
  pageSize: number;
  sort: S;
  order: SortOrder;
  q: string;
}

export function parseListQuery<S extends string>(
  request: Request,
  sortFields: readonly S[],
  defaultSort: S,
): ListQuery<S> & { searchParams: URLSearchParams } {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 10));
  const sortParam = searchParams.get('sort') as S | null;
  const sort = sortParam && sortFields.includes(sortParam) ? sortParam : defaultSort;
  const order: SortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  return { page, pageSize, sort, order, q, searchParams };
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true });
  }
  return 0;
}

export function sortBy<T>(items: readonly T[], key: keyof T, order: SortOrder): T[] {
  const direction = order === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const result = compareValues(a[key], b[key]);
    // Keep nulls last regardless of direction.
    if (a[key] === null || b[key] === null) return result;
    return result * direction;
  });
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}
