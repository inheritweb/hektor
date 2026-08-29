import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACTIVE_ORGANISATION_STORAGE_KEY } from '@hektor/query';
import { OrganisationRole, PlatformRole } from '@hektor/types';

const {
  currentUserMock,
  organisationContextMock,
  organisationStatisticsMock,
  platformStatisticsMock,
} = vi.hoisted(() => ({
  currentUserMock: vi.fn(),
  organisationContextMock: vi.fn(),
  organisationStatisticsMock: vi.fn(),
  platformStatisticsMock: vi.fn(),
}));

vi.mock('@hektor/query/users', () => ({
  useGetCurrentUser: currentUserMock,
}));

vi.mock('@hektor/query/organisations', () => ({
  useGetTenantOrganisationContext: organisationContextMock,
}));

vi.mock('@hektor/query/statistics', () => ({
  useGetOrganisationStatistics: organisationStatisticsMock,
  useGetPlatformStatistics: platformStatisticsMock,
}));

import HomePage from './page';

describe('HomePage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    currentUserMock.mockReturnValue({
      data: { data: { platformRole: PlatformRole.Admin } },
      isPending: false,
    });
    organisationContextMock.mockReturnValue({ isPending: false });
    organisationStatisticsMock.mockReturnValue({ isPending: false });
    platformStatisticsMock.mockReturnValue({
      data: { data: { organisationCount: 4, userCount: 53 } },
      isPending: false,
    });
  });

  it('shows platform statistics in a platform administrator personal context', () => {
    render(<HomePage />);

    expect(screen.getByText('Platform administration')).toBeTruthy();
    expect(screen.getByText('53')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Organisations/ }).getAttribute('href'),
    ).toBe('/admin/organisations');
  });

  it('shows tenant statistics in an organisation administrator context', () => {
    window.localStorage.setItem(
      ACTIVE_ORGANISATION_STORAGE_KEY,
      'ab720a62-06df-408d-9e8c-0201ac69269a',
    );
    organisationContextMock.mockReturnValue({
      data: {
        data: {
          accessMode: 'membership',
          organisation: { name: 'Northbridge University' },
          role: OrganisationRole.OrganisationAdmin,
        },
      },
      isPending: false,
    });
    organisationStatisticsMock.mockReturnValue({
      data: {
        data: {
          cohortCount: 3,
          groupCount: 7,
          provisionCount: 5,
          userCount: 18,
        },
      },
      isPending: false,
    });

    render(<HomePage />);

    expect(screen.getByText('Northbridge University')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /View groups/i }).getAttribute('href'),
    ).toBe('/groups');
  });
});
