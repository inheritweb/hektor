import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { getGroupMock, getProvisionsMock, getUsersMock, updateMembershipMock } =
  vi.hoisted(() => ({
    getGroupMock: vi.fn(),
    getProvisionsMock: vi.fn(),
    getUsersMock: vi.fn(),
    updateMembershipMock: vi.fn(),
  }));

vi.mock('@hektor/query/organisations', () => ({
  useGetOrganisationGroup: getGroupMock,
  useGetOrganisationUserProvisions: getProvisionsMock,
  useGetOrganisationUsers: getUsersMock,
  useUpdateOrganisationGroupMembership: updateMembershipMock,
}));

import { OrganisationGroupDetailScreen } from './OrganisationGroupDetailScreen';

describe('OrganisationGroupDetailScreen', () => {
  it('offers only tenant-connected users and tenant provisions for membership', () => {
    getGroupMock.mockReturnValue({
      data: {
        data: {
          name: 'Biology tutors',
          status: 'active',
          users: [],
          provisionedUsers: [],
        },
      },
      isPending: false,
    });
    getUsersMock.mockReturnValue({
      data: {
        context: { totalRecords: 1 },
        data: [
          {
            id: 'membership-id',
            role: 'tutor',
            status: 'active',
            user: {
              displayName: 'Alice Morgan',
              email: 'alice@northbridge.example',
            },
          },
        ],
      },
      isPending: false,
    });
    getProvisionsMock.mockReturnValue({
      data: { context: { totalRecords: 0 }, data: [] },
      isPending: false,
    });
    updateMembershipMock.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });

    render(<OrganisationGroupDetailScreen groupId="group-id" />);
    fireEvent.click(screen.getByRole('button', { name: 'Manage users' }));

    expect(screen.getByText('Alice Morgan')).toBeTruthy();
    expect(screen.getByText('alice@northbridge.example')).toBeTruthy();
    expect(getUsersMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ order: 'displayName' }),
      }),
      { enabled: true },
    );
  });
});
