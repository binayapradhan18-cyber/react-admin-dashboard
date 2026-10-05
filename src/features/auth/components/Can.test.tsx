import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, signInAs } from '@/test/utils';
import { usePermission } from '../hooks/usePermission';
import { Can } from './Can';
import { RequirePermission } from './RequirePermission';

describe('<Can>', () => {
  const ui = (
    <Can permission="users:delete" fallback={<span>read only</span>}>
      <button type="button">Delete</button>
    </Can>
  );

  it('renders children when the role has the permission', () => {
    signInAs('admin');
    render(ui);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('renders the fallback when the role lacks the permission', () => {
    signInAs('manager');
    render(ui);
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.getByText('read only')).toBeInTheDocument();
  });

  it('renders nothing for anonymous users', () => {
    const { container } = render(
      <Can permission="dashboard:view">
        <span>secret</span>
      </Can>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('usePermission', () => {
  it('evaluates "all" and "any" modes against the current role', () => {
    signInAs('manager');
    const all = renderHook(() => usePermission(['users:create', 'users:delete'], 'all'));
    const any = renderHook(() => usePermission(['users:create', 'users:delete'], 'any'));
    expect(all.result.current).toBe(false);
    expect(any.result.current).toBe(true);
  });

  it('re-evaluates when the signed-in role changes', () => {
    signInAs('viewer');
    const { result, rerender } = renderHook(() => usePermission('orders:update'));
    expect(result.current).toBe(false);

    signInAs('admin');
    rerender();
    expect(result.current).toBe(true);
  });
});

describe('<RequirePermission>', () => {
  it('shows the access denied page when the permission is missing', async () => {
    signInAs('viewer');
    renderWithProviders(
      <RequirePermission permission="users:delete">
        <h1>Danger zone</h1>
      </RequirePermission>,
    );
    expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    expect(screen.queryByText('Danger zone')).not.toBeInTheDocument();
  });

  it('renders the protected content when allowed', async () => {
    signInAs('admin');
    renderWithProviders(
      <RequirePermission permission="users:delete">
        <h1>Danger zone</h1>
      </RequirePermission>,
    );
    expect(await screen.findByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
  });
});
