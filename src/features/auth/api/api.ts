import { http } from '@/shared/lib/apiClient';
import type { LoginCredentials, Session, SessionUser } from '../types';

export const authApi = {
  login: (credentials: LoginCredentials) => http.post<Session>('/auth/login', credentials),
  logout: () => http.post<undefined>('/auth/logout'),
  me: (signal?: AbortSignal) => http.get<SessionUser>('/auth/me', signal ? { signal } : {}),
};
