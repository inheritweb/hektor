import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganisationRole, PlatformRole, SortDirection } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createOrganisationsServiceMock,
  getUserMock,
  listOrganisationUsersMock,
  createOrganisationMembershipsMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationsServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  listOrganisationUsersMock: vi.fn(),
  createOrganisationMembershipsMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createOrganisationsServiceMock,
}));

import { GET, POST } from './route';

describe('GET /api/admin/organisations/:organisationId/users', () => {
  beforeEach(() => {
    createAdminSupabaseClientMock.mockReset();
    createOrganisationsServiceMock.mockReturnValue({
      createOrganisationMemberships: createOrganisationMembershipsMock,
      listOrganisationUsers: listOrganisationUsersMock,
    });
    getUserMock.mockReset();
    listOrganisationUsersMock.mockReset();
    createOrganisationMembershipsMock.mockReset();
  });

  it('lists organisation users through the privileged service client', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const adminClient = { auth: { admin: {} } };
    const responseData = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'displayName', dir: SortDirection.Ascending },
      },
      data: [],
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createAdminSupabaseClientMock.mockReturnValue(adminClient);
    listOrganisationUsersMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/organisations/${organisationId}/users`,
      params: { organisationId },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseData);
    expect(createOrganisationsServiceMock).toHaveBeenCalledWith(adminClient);
    expect(listOrganisationUsersMock).toHaveBeenCalledWith(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'displayName',
        dir: SortDirection.Ascending,
      },
    );
  });

  it('creates memberships through the privileged service client', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const body = {
      role: OrganisationRole.Tutor,
      userIds: ['03d946de-8938-46d8-93a4-e3917df0928e'],
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createOrganisationMembershipsMock.mockResolvedValue({
      data: {
        membershipIds: ['68e65682-544f-47d0-8bf1-5d5472748bf1'],
        reconciledProvisionIds: [],
      },
    });

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      path: `/api/admin/organisations/${organisationId}/users`,
      params: { organisationId },
    });

    expect(response.status).toBe(200);
    expect(createOrganisationMembershipsMock).toHaveBeenCalledWith(
      { organisationId },
      body,
    );
  });
});
