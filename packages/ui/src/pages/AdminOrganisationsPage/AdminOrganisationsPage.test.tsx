import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminOrganisationsPage } from './AdminOrganisationsPage.component';

afterEach(cleanup);

describe('AdminOrganisationsPage', () => {
  it('renders organisation directory fields', () => {
    render(
      <AdminOrganisationsPage
        archived={false}
        getOrganisationHref={(organisation) =>
          `/admin/organisations/${organisation.id}`
        }
        onPageChange={() => undefined}
        onArchivedChange={() => undefined}
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

  it('switches to the archived-only directory', () => {
    const onArchivedChange = vi.fn();

    render(
      <AdminOrganisationsPage
        archived={false}
        onArchivedChange={onArchivedChange}
        onPageChange={() => undefined}
        organisations={[]}
        page={1}
        pageSize={20}
        totalRecords={0}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show archived' }));

    expect(onArchivedChange).toHaveBeenCalledWith(true);
  });
});
