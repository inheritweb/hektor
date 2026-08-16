import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationUsersPage } from './AdminOrganisationUsersPage.component';

describe('AdminOrganisationUsersPage', () => {
  it('renders linked and awaiting organisation users', () => {
    render(
      <AdminOrganisationUsersPage
        onPageChange={() => undefined}
        organisation={{
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T11:00:00.000Z',
        }}
        page={1}
        pageSize={20}
        totalRecords={2}
        users={[
          {
            id: '1',
            displayName: 'Maya Patel',
            userName: 'maya@example.com',
            role: 'org_admin',
            status: 'active',
            scimStatus: 'active',
            linked: true,
          },
          {
            id: '2',
            displayName: 'Sam Rivera',
            userName: 'sam@example.com',
            role: 'learner',
            status: 'active',
            scimStatus: 'active',
            linked: false,
          },
        ]}
      />,
    );

    expect(screen.getByText('Maya Patel')).toBeTruthy();
    expect(screen.getByText('Sam Rivera')).toBeTruthy();
    expect(screen.getByText('Linked')).toBeTruthy();
    expect(screen.getByText('Awaiting account linking')).toBeTruthy();
  });
});
