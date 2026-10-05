import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DEFAULT_USER_LIST_PARAMS, useUserListParams } from './useUserListParams';

function setup(initialEntry: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {children}
    </MemoryRouter>
  );
  return renderHook(() => ({ list: useUserListParams(), location: useLocation() }), { wrapper });
}

describe('useUserListParams', () => {
  it('parses valid params from the URL', () => {
    const { result } = setup('/users?page=3&pageSize=20&sort=name&order=asc&q=lee&role=manager');
    expect(result.current.list.params).toEqual({
      page: 3,
      pageSize: 20,
      sort: 'name',
      order: 'asc',
      q: 'lee',
      role: 'manager',
      status: '',
    });
  });

  it('falls back to defaults for invalid or tampered values', () => {
    const { result } = setup('/users?page=-4&pageSize=999&sort=password&order=sideways&role=root');
    expect(result.current.list.params).toEqual(DEFAULT_USER_LIST_PARAMS);
  });

  it('resets to page 1 when a filter changes and omits defaults from the URL', () => {
    const { result } = setup('/users?page=4');
    act(() => result.current.list.update({ status: 'suspended' }));
    expect(result.current.list.params.page).toBe(1);
    expect(result.current.location.search).toBe('?status=suspended');
  });

  it('keeps filters when only the page changes', () => {
    const { result } = setup('/users?q=kim');
    act(() => result.current.list.update({ page: 2 }));
    expect(result.current.location.search).toBe('?page=2&q=kim');
  });
});
