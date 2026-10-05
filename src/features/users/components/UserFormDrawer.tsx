import { useId } from 'react';
import { Button, Dialog, toast } from '@/shared/ui';
import { useCreateUser, useUpdateUser } from '../api/hooks';
import type { User, UserFormValues } from '../types';
import { UserForm } from './UserForm';

export type UserDrawerState = { mode: 'create' } | { mode: 'edit'; user: User } | null;

interface UserFormDrawerProps {
  state: UserDrawerState;
  onClose: () => void;
}

function toFormValues({ name, email, role, status, department }: User): UserFormValues {
  return { name, email, role, status, department };
}

export function UserFormDrawer({ state, onClose }: UserFormDrawerProps) {
  const formId = useId();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isEdit = state?.mode === 'edit';
  const pending = createUser.isPending || updateUser.isPending;

  const handleSubmit = async (values: UserFormValues) => {
    if (state?.mode === 'edit') {
      const user = await updateUser.mutateAsync({ id: state.user.id, values });
      toast.success('User updated', `${user.name}'s details were saved.`);
    } else {
      const user = await createUser.mutateAsync(values);
      toast.success('User created', `${user.name} was added.`);
    }
    onClose();
  };

  return (
    <Dialog
      open={state !== null}
      onClose={onClose}
      variant="drawer"
      title={isEdit ? 'Edit user' : 'New user'}
      description={
        isEdit ? 'Update profile, role and access.' : 'Invite a teammate to the workspace.'
      }
      closeOnBackdrop={!pending}
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="primary" loading={pending}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      {state && (
        <UserForm
          key={isEdit ? state.user.id : 'new'}
          id={formId}
          defaultValues={isEdit ? toFormValues(state.user) : undefined}
          onSubmit={handleSubmit}
        />
      )}
    </Dialog>
  );
}
