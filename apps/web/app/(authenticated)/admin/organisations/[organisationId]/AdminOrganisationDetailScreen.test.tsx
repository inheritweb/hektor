import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { useAdminGetOrganisationMock } = vi.hoisted(() => ({
  useAdminGetOrganisationMock: vi.fn(),
}));

vi.mock('@hektor/query/organisations', () => ({
  useAdminGetOrganisation: useAdminGetOrganisationMock,
}));

import { AdminOrganisationDetailScreen } from './AdminOrganisationDetailScreen';

describe('AdminOrganisationDetailScreen', () => {
  it('loads and presents the requested organisation', () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    useAdminGetOrganisationMock.mockReturnValue({
      data: {
        data: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
          contractPeriods: [],
          cohorts: [],
          groups: [],
          usersSummary: {
            total: 0,
            linked: 0,
            awaitingAccountLinking: 0,
            learners: 0,
            tutors: 0,
            organisationAdmins: 0,
            suspended: 0,
          },
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-15T10:00:00.000Z',
        },
      },
      isPending: false,
      isError: false,
      error: null,
    });

    render(<AdminOrganisationDetailScreen organisationId={organisationId} />);

    expect(useAdminGetOrganisationMock).toHaveBeenCalledWith({
      params: { organisationId },
    });
    expect(
      screen.getByRole('heading', { name: 'Northbridge University' }),
    ).toBeTruthy();
  });
});
