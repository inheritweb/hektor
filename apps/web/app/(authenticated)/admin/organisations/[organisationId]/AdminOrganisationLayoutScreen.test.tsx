import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { useAdminGetOrganisationMock } = vi.hoisted(() => ({
  useAdminGetOrganisationMock: vi.fn(),
}));

vi.mock('@hektor/query/organisations', () => ({
  useAdminGetOrganisation: useAdminGetOrganisationMock,
}));

import { AdminOrganisationLayoutScreen } from './AdminOrganisationLayoutScreen';

describe('AdminOrganisationLayoutScreen', () => {
  it('retains organisation context while route content changes', () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    useAdminGetOrganisationMock.mockReturnValue({
      data: {
        data: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T10:00:00.000Z',
        },
      },
      isError: false,
    });

    const view = render(
      <AdminOrganisationLayoutScreen organisationId={organisationId}>
        <div>Overview content</div>
      </AdminOrganisationLayoutScreen>,
    );
    const organisationHeading = screen.getByRole('heading', {
      name: 'Northbridge University',
    });

    view.rerender(
      <AdminOrganisationLayoutScreen organisationId={organisationId}>
        <div>Users content</div>
      </AdminOrganisationLayoutScreen>,
    );

    expect(screen.getByText('Users content')).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Northbridge University' }),
    ).toBe(organisationHeading);
  });
});
