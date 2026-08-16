import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationGroupsPage } from './AdminOrganisationGroupsPage.component';

describe('AdminOrganisationGroupsPage', () => {
  it('renders local and externally managed groups', () => {
    render(
      <AdminOrganisationGroupsPage
        groups={[
          { id: 'local', name: 'Teaching Staff', status: 'active' },
          {
            id: 'external',
            name: 'Clinical Practice A',
            status: 'active',
            provisioningMethod: 'scim',
            sourceExternalId: 'entra-group-123',
          },
        ]}
        onPageChange={() => undefined}
        organisationName="Northbridge University"
        page={1}
        pageSize={20}
        totalRecords={2}
      />,
    );

    expect(screen.getByText('Teaching Staff')).toBeTruthy();
    expect(screen.getByText('Hektor')).toBeTruthy();
    expect(screen.getByText('Clinical Practice A')).toBeTruthy();
    expect(screen.getByText('scim')).toBeTruthy();
    expect(screen.getByText('entra-group-123')).toBeTruthy();
  });
});
