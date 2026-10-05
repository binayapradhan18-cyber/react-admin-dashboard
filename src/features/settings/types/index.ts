import { z } from 'zod';

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Australia/Sydney',
] as const;

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  title: z.string().trim().max(80, 'Title must be 80 characters or fewer'),
  bio: z.string().trim().max(280, 'Bio must be 280 characters or fewer'),
});

export type Profile = z.infer<typeof profileSchema>;

export const preferencesSchema = z.object({
  timezone: z.enum(TIMEZONES),
  weeklyDigest: z.boolean(),
  orderAlerts: z.boolean(),
  productUpdates: z.boolean(),
});

export type Preferences = z.infer<typeof preferencesSchema>;
