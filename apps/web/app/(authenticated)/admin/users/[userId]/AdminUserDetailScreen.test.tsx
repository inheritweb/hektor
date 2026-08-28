import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { useAdminGetUserMock, useAdminUpdateUserMock } = vi.hoisted(() => ({
  useAdminGetUserMock: vi.fn(),
  useAdminUpdateUserMock: vi.fn(),
}));

vi.mock('@hektor/query/users', () => ({
  useAdminGetUser: useAdminGetUserMock,
  useAdminUpdateUser: useAdminUpdateUserMock,
}));

import { AdminUserDetailScreen } from './AdminUserDetailScreen';

describe('AdminUserDetailScreen', () => {
  it('loads and presents the requested user', () => {
    useAdminUpdateUserMock.mockReturnValue({
      error: null,
      isPending: false,
      mutate: vi.fn(),
    });
    useAdminGetUserMock.mockReturnValue({
      data: {
        data: {
          id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
          displayName: 'Alex Morgan',
          firstName: 'Alex',
          lastName: 'Morgan',
          status: 'active',
          email: 'alex@example.com',
          identities: [],
          memberships: [],
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T10:00:00.000Z',
        },
      },
      isPending: false,
      isError: false,
      error: null,
    });

    render(
      <AdminUserDetailScreen userId="ab720a62-06df-408d-9e8c-0201ac69269a" />,
    );

    expect(useAdminGetUserMock).toHaveBeenCalledWith({
      params: { userId: 'ab720a62-06df-408d-9e8c-0201ac69269a' },
    });
    expect(screen.getByRole('heading', { name: 'Alex Morgan' })).toBeTruthy();
  });
});
