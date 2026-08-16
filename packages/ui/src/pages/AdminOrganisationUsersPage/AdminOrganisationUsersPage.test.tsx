import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationUsersPage } from './AdminOrganisationUsersPage.component';

describe('AdminOrganisationUsersPage', () => {
  it('renders canonical organisation users', () => {
    render(
      <AdminOrganisationUsersPage
        onPageChange={() => undefined}
        organisationName="Northbridge University"
        page={1}
        pageSize={20}
        totalRecords={2}
        users={[
          {
            id: '1',
            user: { displayName: 'Maya Patel', email: 'maya@example.com' },
            role: 'org_admin',
            status: 'active',
          },
          {
            id: '2',
            user: { displayName: 'Sam Rivera', email: 'sam@example.com' },
            role: 'learner',
            status: 'active',
          },
        ]}
      />,
    );

    expect(screen.getByText('Maya Patel')).toBeTruthy();
    expect(screen.getByText('Sam Rivera')).toBeTruthy();
    expect(screen.getByText('maya@example.com')).toBeTruthy();
  });
});
