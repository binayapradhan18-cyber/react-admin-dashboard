import { z } from 'zod';

export const ROLES = ['admin', 'manager', 'viewer'] as const;
export type Role = (typeof ROLES)[number];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Session {
  token: string;
  user: SessionUser;
}

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
