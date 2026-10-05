import type { Role } from '@/features/auth/types';
import { Badge, type BadgeTone } from '@/shared/ui';
import type { UserStatus } from '../types';

const ROLE_TONES: Record<Role, BadgeTone> = {
  admin: 'primary',
  manager: 'info',
  viewer: 'neutral',
};

const STATUS_TONES: Record<UserStatus, BadgeTone> = {
  active: 'success',
  invited: 'warning',
  suspended: 'danger',
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={ROLE_TONES[role]}>{role}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{status}</Badge>;
}
