import { Plus, UsersRound } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Can } from '@/features/auth';
import { ROLES, type Role } from '@/features/auth/types';
import { capitalize } from '@/shared/lib/format';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorFallback,
  PageHeader,
  Pagination,
  SearchInput,
  SelectField,
  TableContainer,
} from '@/shared/ui';
import { useDeleteUser, useUsers } from '../api/hooks';
import { useUserListParams } from '../hooks/useUserListParams';
import { type User, USER_STATUSES, type UserSortField, type UserStatus } from '../types';
import { type UserDrawerState, UserFormDrawer } from './UserFormDrawer';
import { UsersTable } from './UsersTable';
import styles from './UsersPage.module.css';

const ROLE_FILTER = [
  { value: '', label: 'All roles' },
  ...ROLES.map((role) => ({ value: role, label: capitalize(role) })),
];
const STATUS_FILTER = [
  { value: '', label: 'All statuses' },
  ...USER_STATUSES.map((status) => ({ value: status, label: capitalize(status) })),
];

export function UsersPage() {
  const { params, update, reset } = useUserListParams();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useUsers(params);
  const deleteUser = useDeleteUser();
  const [drawer, setDrawer] = useState<UserDrawerState>(null);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);

  const onSearch = useCallback((q: string) => update({ q }, { replace: true }), [update]);

  const onSort = (field: UserSortField) =>
    update({
      sort: field,
      order: params.sort === field && params.order === 'asc' ? 'desc' : 'asc',
    });

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteUser.mutate(pendingDelete);
    setPendingDelete(null);
  };

  const hasFilters = params.q !== '' || params.role !== '' || params.status !== '';

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage teammates, their roles and access."
        actions={
          <Can permission="users:create">
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setDrawer({ mode: 'create' })}
            >
              New user
            </Button>
          </Can>
        }
      />

      <Card padded={false}>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <SearchInput
              label="Search users"
              placeholder="Search by name or email"
              value={params.q}
              onChange={onSearch}
            />
          </div>
          <SelectField
            label="Role"
            hideLabel
            options={ROLE_FILTER}
            value={params.role}
            onChange={(event) => update({ role: event.target.value as Role | '' })}
          />
          <SelectField
            label="Status"
            hideLabel
            options={STATUS_FILTER}
            value={params.status}
            onChange={(event) => update({ status: event.target.value as UserStatus | '' })}
          />
          {hasFilters && (
            <Button variant="ghost" onClick={reset}>
              Clear filters
            </Button>
          )}
        </div>

        {isError && !data ? (
          <ErrorFallback
            compact
            title="Couldn't load users"
            error={error}
            reset={() => void refetch()}
          />
        ) : data?.total === 0 ? (
          <EmptyState
            icon={<UsersRound size={22} />}
            title="No users found"
            description={
              hasFilters ? 'Try adjusting your search or filters.' : 'Invite your first teammate.'
            }
            action={hasFilters && <Button onClick={reset}>Clear filters</Button>}
          />
        ) : (
          <TableContainer busy={isPlaceholderData}>
            <UsersTable
              users={isPending ? undefined : data.data}
              sort={params.sort}
              order={params.order}
              pageSize={params.pageSize}
              onSort={onSort}
              onEdit={(user) => setDrawer({ mode: 'edit', user })}
              onDelete={setPendingDelete}
            />
          </TableContainer>
        )}

        {data && data.total > 0 && (
          <Pagination
            page={data.page}
            pageSize={params.pageSize}
            total={data.total}
            disabled={isPlaceholderData}
            onPageChange={(page) => update({ page })}
            onPageSizeChange={(pageSize) => update({ pageSize })}
          />
        )}
      </Card>

      <UserFormDrawer state={drawer} onClose={() => setDrawer(null)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        tone="danger"
        title="Delete user?"
        description={
          <>
            <strong>{pendingDelete?.name}</strong> will lose access immediately. This can’t be
            undone.
          </>
        }
        confirmLabel="Delete user"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
