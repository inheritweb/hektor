import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createServiceMock, getUserMock, updateMembershipMock } = vi.hoisted(
  () => ({
    createServiceMock: vi.fn(),
    getUserMock: vi.fn(),
    updateMembershipMock: vi.fn(),
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ auth: { admin: {} } }),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createServiceMock,
}));

import { POST } from './route';

describe('POST organisation group membership', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      updateOrganisationGroupMembership: updateMembershipMock,
    });
    getUserMock.mockReset();
    updateMembershipMock.mockReset();
  });

  it('requires and passes through platform-admin membership changes', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const groupId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const memberId = '67d00b58-7f49-4cea-89a2-979e8fcf3b7e';
    const body = {
      addProvisionIds: [],
      addUserIds: [memberId],
      removeProvisionIds: [],
      removeUserIds: [],
    };
    const responseData = {
      data: {
        id: groupId,
        name: 'Biology tutors',
        status: 'active',
        organisation: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
        },
        users: [],
        provisionedUsers: [],
        createdAt: '2026-08-23T10:00:00.000Z',
        updatedAt: '2026-08-23T10:00:00.000Z',
      },
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    updateMembershipMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      path: `/api/admin/organisations/${organisationId}/groups/${groupId}/memberships`,
      params: { groupId, organisationId },
    });

    expect(response.status).toBe(200);
    expect(updateMembershipMock).toHaveBeenCalledWith(
      { groupId, organisationId },
      body,
    );
  });
});
