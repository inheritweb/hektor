import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole, SortDirection } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createServiceMock, getUserMock, listGroupsMock } = vi.hoisted(() => ({
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

import { GET } from './route';

describe('GET /api/admin/organisations/:organisationId/groups', () => {
  beforeEach(() => {
    createServiceMock.mockReturnValue({
      listOrganisationGroups: listGroupsMock,
    });
    getUserMock.mockReset();
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
});
