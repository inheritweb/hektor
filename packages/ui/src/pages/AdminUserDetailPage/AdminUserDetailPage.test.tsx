import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminUserDetailPage } from './AdminUserDetailPage.component';

describe('AdminUserDetailPage', () => {
  it('presents a personal account with admin access and memberships', () => {
    render(
      <AdminUserDetailPage
        backHref="/admin/users"
        user={{
          id: 'user-1',
          displayName: 'Alex Morgan',
          email: 'alex@example.com',
          platformRole: 'admin',
          status: 'active',
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T10:00:00.000Z',
          identities: [
            {
              id: 'identity-1',
              provider: 'email',
              email: 'alex@example.com',
            },
          ],
          memberships: [
            {
              id: 'membership-1',
              organisation: {
                id: 'organisation-1',
                name: 'Northbridge College',
                status: 'active',
              },
              role: 'organisation_admin',
              status: 'active',
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Alex Morgan' })).toBeTruthy();
    expect(screen.getByText('Personal account')).toBeTruthy();
    expect(screen.getByText('Platform admin')).toBeTruthy();
    expect(screen.getByText('Northbridge College')).toBeTruthy();
  });
});
