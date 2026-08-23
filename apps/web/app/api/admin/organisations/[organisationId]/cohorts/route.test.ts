import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole, SortDirection } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createOrganisationCohortMock,
  createOrganisationsServiceMock,
  getUserMock,
  listOrganisationCohortsMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationCohortMock: vi.fn(),
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

import { GET, POST } from './route';

describe('GET /api/admin/organisations/:organisationId/cohorts', () => {
  beforeEach(() => {
    createOrganisationsServiceMock.mockReturnValue({
      createOrganisationCohort: createOrganisationCohortMock,
      listOrganisationCohorts: listOrganisationCohortsMock,
    });
    getUserMock.mockReset();
    createOrganisationCohortMock.mockReset();
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

  it('creates a cohort for a platform admin', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const body = {
      name: 'September 2027',
      startsOn: '2027-09-01',
      endsOn: '2028-08-31',
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createOrganisationCohortMock.mockResolvedValue({
      data: {
        id: '03d946de-8938-46d8-93a4-e3917df0928e',
        ...body,
        status: 'active',
        organisation: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
        },
        groups: [],
        learners: [],
        createdAt: '2026-08-23T10:00:00.000Z',
        updatedAt: '2026-08-23T10:00:00.000Z',
      },
    });

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      path: `/api/admin/organisations/${organisationId}/cohorts`,
      params: { organisationId },
    });

    expect(response.status).toBe(200);
    expect(createOrganisationCohortMock).toHaveBeenCalledWith(
      { organisationId },
      body,
    );
  });
});
