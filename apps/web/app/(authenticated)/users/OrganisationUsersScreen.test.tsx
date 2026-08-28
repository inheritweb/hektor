import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrganisationRole } from '@hektor/types';

const { useGetOrganisationUsersMock, useGetTenantOrganisationContextMock } =
  vi.hoisted(() => ({
    useGetOrganisationUsersMock: vi.fn(),
    useGetTenantOrganisationContextMock: vi.fn(),
  }));

vi.mock('@hektor/query/organisations', () => ({
  useGetOrganisationUsers: useGetOrganisationUsersMock,
  useGetTenantOrganisationContext: useGetTenantOrganisationContextMock,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/users',
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { OrganisationUsersScreen } from './OrganisationUsersScreen';

describe('OrganisationUsersScreen', () => {
  it('presents users from the currently selected tenant', () => {
    useGetTenantOrganisationContextMock.mockReturnValue({
      data: { data: { organisation: { name: 'Northbridge University' } } },
      isPending: false,
    });
    useGetOrganisationUsersMock.mockReturnValue({
      data: {
        context: { totalRecords: 1 },
        data: [
          {
            id: 'membership-id',
            role: OrganisationRole.Tutor,
            status: 'active',
            user: {
              displayName: 'Alice Morgan',
              email: 'alice.morgan@northbridge.example',
            },
          },
        ],
      },
      isPending: false,
    });

    render(<OrganisationUsersScreen />);

    expect(screen.getByText('Alice Morgan')).toBeTruthy();
    expect(screen.getByText('alice.morgan@northbridge.example')).toBeTruthy();
    expect(
      screen.getByText('Users in Northbridge University', {
        selector: 'caption',
      }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add user' })).toBeNull();
  });
});
