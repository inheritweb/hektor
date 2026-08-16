import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole, SortDirection } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createOrganisationsServiceMock,
  getUserMock,
  listOrganisationCohortsMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationsServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  listOrganisationCohortsMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: createAdminSupabaseClientMock,
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createOrganisationsServiceMock,
}));

import { GET } from './route';

describe('GET /api/admin/organisations/:organisationId/cohorts', () => {
  beforeEach(() => {
    createOrganisationsServiceMock.mockReturnValue({
      listOrganisationCohorts: listOrganisationCohortsMock,
    });
    getUserMock.mockReset();
    listOrganisationCohortsMock.mockReset();
  });

  it('lists cohorts through the privileged service client', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const adminClient = { auth: { admin: {} } };
    const responseData = {
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'startsOn', dir: SortDirection.Ascending },
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
    listOrganisationCohortsMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/organisations/${organisationId}/cohorts`,
      params: { organisationId },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseData);
    expect(createOrganisationsServiceMock).toHaveBeenCalledWith(adminClient);
    expect(listOrganisationCohortsMock).toHaveBeenCalledWith(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'startsOn',
        dir: SortDirection.Ascending,
      },
    );
  });
});
