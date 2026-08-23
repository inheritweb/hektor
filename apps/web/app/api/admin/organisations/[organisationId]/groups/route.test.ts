import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole, SortDirection } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createGroupMock, createServiceMock, getUserMock, listGroupsMock } =
  vi.hoisted(() => ({
    createGroupMock: vi.fn(),
    createServiceMock: vi.fn(),
    getUserMock: vi.fn(),
    listGroupsMock: vi.fn(),
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

import { GET, POST } from './route';

describe('GET /api/admin/organisations/:organisationId/groups', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      createOrganisationGroup: createGroupMock,
      listOrganisationGroups: listGroupsMock,
    });
    getUserMock.mockReset();
    createGroupMock.mockReset();
    listGroupsMock.mockReset();
  });

  it('lists groups for a platform admin', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const responseData = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'name', dir: SortDirection.Ascending },
      },
      data: [],
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    listGroupsMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/organisations/${organisationId}/groups`,
      params: { organisationId },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseData);
    expect(listGroupsMock).toHaveBeenCalledWith(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'name',
        dir: SortDirection.Ascending,
      },
    );
  });

  it('creates a Hektor-managed group for a platform admin', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const responseData = {
      data: {
        id: '03d946de-8938-46d8-93a4-e3917df0928e',
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
    createGroupMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(POST, {
      body: { name: 'Biology tutors' },
      method: 'POST',
      path: `/api/admin/organisations/${organisationId}/groups`,
      params: { organisationId },
    });

    expect(response.status).toBe(200);
    expect(createGroupMock).toHaveBeenCalledWith(
      { organisationId },
      { name: 'Biology tutors' },
    );
  });
});
