import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminUsersPage } from './AdminUsersPage.component';

describe('AdminUsersPage', () => {
  it('renders user directory fields', () => {
    render(
      <AdminUsersPage
        getUserHref={(user) => `/admin/users/${user.id}`}
        onPageChange={() => undefined}
        page={1}
        pageSize={20}
        totalRecords={1}
        users={[
          {
            id: '1',
            displayName: 'Alex Morgan',
            email: 'alex@example.com',
            platformRole: 'admin',
            createdAt: '2026-08-01T10:00:00.000Z',
            identityProviders: ['email'],
            membershipCount: 2,
            status: 'active',
          },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Users' })).toBeTruthy();
    expect(screen.getByText('Alex Morgan')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'View' }).getAttribute('href'),
    ).toBe('/admin/users/1');
  });
});
