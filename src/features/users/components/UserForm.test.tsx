import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/lib/apiClient';
import type { UserFormValues } from '../types';
import { UserForm } from './UserForm';

function setup(onSubmit: (values: UserFormValues) => Promise<unknown> = () => Promise.resolve()) {
  const handler = vi.fn(onSubmit);
  const user = userEvent.setup();
  render(
    <>
      <UserForm id="user-form" onSubmit={handler} />
      <button type="submit" form="user-form">
        Save
      </button>
    </>,
  );
  return { user, handler };
}

describe('UserForm validation', () => {
  it('reports required fields and does not submit', async () => {
    const { user, handler } = setup();
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(handler).not.toHaveBeenCalled();
  });

  it('rejects a malformed email', async () => {
    const { user, handler } = setup();
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(handler).not.toHaveBeenCalled();
  });

  it('submits trimmed, typed values when valid', async () => {
    const { user, handler } = setup();
    await user.type(screen.getByLabelText('Full name'), '  Ada Lovelace ');
    await user.type(screen.getByLabelText('Email'), 'ada@northwind.io');
    await user.selectOptions(screen.getByLabelText('Role'), 'manager');
    await user.selectOptions(screen.getByLabelText('Status'), 'active');
    await user.selectOptions(screen.getByLabelText('Department'), 'Finance');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(handler).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@northwind.io',
      role: 'manager',
      status: 'active',
      department: 'Finance',
    });
  });

  it('maps server-side field errors back onto the form', async () => {
    const { user } = setup(() =>
      Promise.reject(
        new ApiError(409, 'EMAIL_TAKEN', 'A user with this email already exists.', {
          email: 'This email is already in use',
        }),
      ),
    );
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'taken@northwind.io');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('This email is already in use')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('shows a form-level error when the server returns no field details', async () => {
    const { user } = setup(() => Promise.reject(new ApiError(500, 'HTTP_500', 'Server exploded')));
    await user.type(screen.getByLabelText('Full name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@northwind.io');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Server exploded');
  });
});
