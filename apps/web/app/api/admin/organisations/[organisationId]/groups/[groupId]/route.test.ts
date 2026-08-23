import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupStatus, PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createServiceMock, getUserMock, updateGroupMock } = vi.hoisted(() => ({
  createServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  updateGroupMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ auth: { admin: {} } }),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createServiceMock,
}));

import { PATCH } from './route';

describe('PATCH /api/admin/organisations/:organisationId/groups/:groupId', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      updateOrganisationGroup: updateGroupMock,
    });
    getUserMock.mockReset();
    updateGroupMock.mockReset();
  });

  it('updates a group for a platform admin', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const groupId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const body = {
      expectedUpdatedAt: '2026-08-23T10:00:00.000Z',
      name: 'Biology tutors',
      status: GroupStatus.Archived,
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    updateGroupMock.mockResolvedValue({
      data: {
        id: groupId,
        name: body.name,
        status: body.status,
        organisation: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
        },
        users: [],
        provisionedUsers: [],
        createdAt: body.expectedUpdatedAt,
        updatedAt: body.expectedUpdatedAt,
      },
    });

    const response = await callApiEndpoint(PATCH, {
      body,
      method: 'PATCH',
      path: `/api/admin/organisations/${organisationId}/groups/${groupId}`,
      params: { groupId, organisationId },
    });

    expect(response.status).toBe(200);
    expect(updateGroupMock).toHaveBeenCalledWith(
      { groupId, organisationId },
      body,
    );
  });
});
