import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { getCohortsMock, getOrganisationMock } = vi.hoisted(() => ({
  getCohortsMock: vi.fn(),
  getOrganisationMock: vi.fn(),
}));

vi.mock('@hektor/query/organisations', () => ({
  useGetOrganisationCohorts: getCohortsMock,
  useGetTenantOrganisationContext: getOrganisationMock,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/cohorts',
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { OrganisationCohortsScreen } from './OrganisationCohortsScreen';

describe('OrganisationCohortsScreen', () => {
  it('presents cohorts from the selected tenant without creation controls', () => {
    getOrganisationMock.mockReturnValue({
      data: { data: { organisation: { name: 'Northbridge University' } } },
      isPending: false,
    });
    getCohortsMock.mockReturnValue({
      data: {
        context: { totalRecords: 1 },
        data: [
          {
            id: '289eb836-9965-4f32-8ea2-238077d18de9',
            name: 'September 2026',
            startsOn: '2026-09-01',
            endsOn: '2029-08-31',
            status: 'active',
          },
        ],
      },
      isPending: false,
    });

    render(<OrganisationCohortsScreen />);

    expect(screen.getByText('September 2026')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Add cohort' })).toBeNull();
  });
});
