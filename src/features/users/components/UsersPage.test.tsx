import { screen, waitFor, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { getDb } from '@/mocks/db/db';
import { server } from '@/mocks/server';
import { renderWithProviders, signInAs } from '@/test/utils';
import type { User } from '../types';
import { UsersPage } from './UsersPage';

const TOTAL = getDb().users.length;

function renderUsersPage(initialEntry = '/users') {
  return renderWithProviders(<UsersPage />, { path: '/users', initialEntry });
}

/** Data rows only; skeleton rows are aria-hidden while loading. */
async function findDataRows() {
  const table = await screen.findByRole('table', { name: 'Users' });
  await waitFor(() => expect(within(table).queryAllByRole('row').length).toBeGreaterThan(1));
  return within(table).getAllByRole('row').slice(1);
}

const location = () => screen.getByTestId('location').textContent;

function matching(term: string): User[] {
  return getDb().users.filter(
    (user) => user.name.toLowerCase().includes(term) || user.email.includes(term),
  );
}

describe('UsersPage', () => {
  it('loads the first page from the API', async () => {
    signInAs('admin');
    renderUsersPage();

    expect(await findDataRows()).toHaveLength(10);
    expect(screen.getByText(`1–10 of ${TOTAL}`)).toBeInTheDocument();
  });

  it('debounces search, syncs it to the URL and shows server-filtered results', async () => {
    signInAs('admin');
    const { user } = renderUsersPage();
    await findDataRows();

    await user.type(screen.getByRole('searchbox', { name: 'Search users' }), 'olivia');
    expect(location()).toBe('/users');

    const expected = matching('olivia');
    await waitFor(() => expect(location()).toBe('/users?q=olivia'));
    await waitFor(() =>
      expect(
        screen.getByText(`1–${Math.min(10, expected.length)} of ${expected.length}`),
      ).toBeInTheDocument(),
    );
    for (const row of await findDataRows()) {
      expect(row).toHaveTextContent(/olivia/i);
    }
  });

  it('paginates through the server and keeps the page in the URL', async () => {
    signInAs('admin');
    const { user } = renderUsersPage();
    await findDataRows();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => expect(location()).toBe('/users?page=2'));
    expect(await screen.findByText(`11–20 of ${TOTAL}`)).toBeInTheDocument();
  });

  it('restores list state from the URL on load', async () => {
    signInAs('admin');
    renderUsersPage('/users?page=2&sort=name&order=asc&role=manager');
    await findDataRows();

    const managers = getDb().users.filter((u) => u.role === 'manager').length;
    expect(screen.getByText(`11–20 of ${managers}`)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveValue('manager');
    expect(screen.getByRole('columnheader', { name: /^Name/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });

  it('resets to the first page when a filter changes', async () => {
    signInAs('admin');
    const { user } = renderUsersPage('/users?page=3');
    await findDataRows();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'suspended');

    await waitFor(() => expect(location()).toBe('/users?status=suspended'));
    const suspended = getDb().users.filter((u) => u.status === 'suspended').length;
    expect(await screen.findByText(`1–10 of ${suspended}`)).toBeInTheDocument();
  });

  it('removes a deleted user optimistically and restores it if the server fails', async () => {
    signInAs('admin');
    server.use(
      http.delete('/api/users/:id', async () => {
        await delay(80);
        return HttpResponse.json({ message: 'Database is read-only' }, { status: 500 });
      }),
    );
    const { user } = renderUsersPage();
    const [firstRow] = await findDataRows();
    const email = within(firstRow!).getByText(/@northwind\.io$/).textContent!;

    await user.click(within(firstRow!).getByRole('button', { name: /^Delete / }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete user?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete user' }));

    await waitFor(() => expect(screen.queryByText(email)).not.toBeInTheDocument());
    expect(await screen.findByText('Database is read-only')).toBeInTheDocument();
    expect(await screen.findByText(email)).toBeInTheDocument();
  });

  it('hides write actions from viewers', async () => {
    signInAs('viewer');
    renderUsersPage();
    await findDataRows();

    expect(screen.queryByRole('button', { name: 'New user' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Edit / })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Delete / })).not.toBeInTheDocument();
  });
});
