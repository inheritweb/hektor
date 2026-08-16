import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminOrganisationsPage } from './AdminOrganisationsPage.component';

describe('AdminOrganisationsPage', () => {
  it('renders organisation directory fields', () => {
    render(
      <AdminOrganisationsPage
        getOrganisationHref={(organisation) =>
          `/admin/organisations/${organisation.id}`
        }
        onPageChange={() => undefined}
        organisations={[
          {
            id: '1',
            name: 'Northbridge University',
            slug: 'northbridge-university',
            status: 'active',
          },
        ]}
        page={1}
        pageSize={20}
        totalRecords={1}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Organisations' })).toBeTruthy();
    expect(screen.getByText('Northbridge University')).toBeTruthy();
    expect(screen.getByText('northbridge-university')).toBeTruthy();
    expect(screen.getByText('active')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'View' }).getAttribute('href'),
    ).toBe('/admin/organisations/1');
  });
});
