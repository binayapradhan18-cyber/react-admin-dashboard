import { Pencil, Trash2 } from 'lucide-react';
import { Can } from '@/features/auth';
import { formatDate, formatRelative } from '@/shared/lib/format';
import type { SortOrder } from '@/shared/lib/pagination';
import { Avatar, IconButton, Skeleton, SortableHeader, Table, tableStyles } from '@/shared/ui';
import type { User, UserSortField } from '../types';
import { RoleBadge, UserStatusBadge } from './UserBadges';
import styles from './UsersPage.module.css';

interface UsersTableProps {
  users: User[] | undefined;
  sort: UserSortField;
  order: SortOrder;
  pageSize: number;
  onSort: (field: UserSortField) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTable({
  users,
  sort,
  order,
  pageSize,
  onSort,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const header = { activeField: sort, order, onSort };

  return (
    <Table aria-label="Users">
      <thead>
        <tr>
          <SortableHeader field="name" {...header}>
            Name
          </SortableHeader>
          <SortableHeader field="role" {...header}>
            Role
          </SortableHeader>
          <SortableHeader field="status" {...header}>
            Status
          </SortableHeader>
          <th scope="col">Department</th>
          <SortableHeader field="createdAt" {...header}>
            Joined
          </SortableHeader>
          <SortableHeader field="lastActiveAt" {...header}>
            Last active
          </SortableHeader>
          <th scope="col" className={tableStyles.actions}>
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {users
          ? users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.identity}>
                    <Avatar name={user.name} />
                    <div>
                      <div className={styles.name}>{user.name}</div>
                      <div className={styles.email}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <RoleBadge role={user.role} />
                </td>
                <td>
                  <UserStatusBadge status={user.status} />
                </td>
                <td>{user.department}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{user.lastActiveAt ? formatRelative(user.lastActiveAt) : '—'}</td>
                <td className={tableStyles.actions}>
                  <div className={styles.rowActions}>
                    <Can permission="users:update">
                      <IconButton
                        aria-label={`Edit ${user.name}`}
                        size="sm"
                        onClick={() => onEdit(user)}
                      >
                        <Pencil size={15} />
                      </IconButton>
                    </Can>
                    <Can permission="users:delete">
                      <IconButton
                        aria-label={`Delete ${user.name}`}
                        size="sm"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </Can>
                  </div>
                </td>
              </tr>
            ))
          : Array.from({ length: pageSize }, (_, index) => (
              <tr key={index} aria-hidden="true">
                <td>
                  <div className={styles.identity}>
                    <Skeleton width={32} height={32} radius="50%" />
                    <div className={styles.skeletonText}>
                      <Skeleton width={140} height={12} />
                      <Skeleton width={180} height={10} />
                    </div>
                  </div>
                </td>
                {Array.from({ length: 6 }, (_, cell) => (
                  <td key={cell}>
                    <Skeleton width={cell === 5 ? 24 : 72} height={12} />
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </Table>
  );
}
