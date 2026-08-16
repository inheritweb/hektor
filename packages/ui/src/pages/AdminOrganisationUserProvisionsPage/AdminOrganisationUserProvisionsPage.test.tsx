import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationUserProvisionsPage } from './AdminOrganisationUserProvisionsPage.component';

describe('AdminOrganisationUserProvisionsPage', () => {
  it('renders provisioned identity data separately from users', () => {
    render(
      <AdminOrganisationUserProvisionsPage
        onPageChange={() => undefined}
        organisationName="Northbridge University"
        page={1}
        pageSize={20}
        provisions={[
          {
            id: '1',
            provisionedDisplayName: 'Maya Patel',
            provisionedUserName: 'maya@example.com',
            provisionedRole: 'org_admin',
            provisioningMethod: 'scim',
            status: 'pending',
          },
        ]}
        totalRecords={1}
      />,
    );

    expect(screen.getByText('Maya Patel')).toBeTruthy();
    expect(screen.getByText('maya@example.com')).toBeTruthy();
    expect(screen.getByText('scim')).toBeTruthy();
    expect(screen.getByText('pending')).toBeTruthy();
  });
});
