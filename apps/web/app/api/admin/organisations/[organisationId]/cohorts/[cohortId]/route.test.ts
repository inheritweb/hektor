import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createOrganisationsServiceMock,
  getOrganisationCohortMock,
  getUserMock,
  updateOrganisationCohortMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationsServiceMock: vi.fn(),
  getOrganisationCohortMock: vi.fn(),
  getUserMock: vi.fn(),
  updateOrganisationCohortMock: vi.fn(),
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

import { GET, PATCH } from './route';

describe('GET /api/admin/organisations/:organisationId/cohorts/:cohortId', () => {
  beforeEach(() => {
    createOrganisationsServiceMock.mockReturnValue({
      getOrganisationCohort: getOrganisationCohortMock,
      updateOrganisationCohort: updateOrganisationCohortMock,
    });
    getOrganisationCohortMock.mockReset();
    getUserMock.mockReset();
    updateOrganisationCohortMock.mockReset();
  });

  it('gets a cohort through the privileged service client', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const cohortId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const adminClient = { auth: { admin: {} } };
    const responseData = {
      data: {
        id: cohortId,
        name: 'September 2026',
        startsOn: '2026-09-01',
        endsOn: '2029-08-31',
        status: 'active',
        organisation: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
        },
        groups: [],
        learners: [],
        createdAt: '2026-08-16T10:00:00.000Z',
        updatedAt: '2026-08-16T10:00:00.000Z',
      },
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createAdminSupabaseClientMock.mockReturnValue(adminClient);
    getOrganisationCohortMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/organisations/${organisationId}/cohorts/${cohortId}`,
      params: { cohortId, organisationId },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseData);
    expect(getOrganisationCohortMock).toHaveBeenCalledWith({
      cohortId,
      organisationId,
    });
  });

  it('updates a cohort for a platform admin', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const cohortId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const body = {
      name: 'September 2027',
      startsOn: '2027-09-01',
      endsOn: '2028-08-31',
      status: 'archived',
      expectedUpdatedAt: '2026-08-23T10:00:00.000Z',
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    updateOrganisationCohortMock.mockResolvedValue({
      data: {
        id: cohortId,
        ...body,
        organisation: {
          id: organisationId,
          name: 'Northbridge University',
          slug: 'northbridge-university',
          status: 'active',
        },
        groups: [],
        learners: [],
        createdAt: body.expectedUpdatedAt,
        updatedAt: '2026-08-23T11:00:00.000Z',
      },
    });

    const response = await callApiEndpoint(PATCH, {
      body,
      method: 'PATCH',
      path: `/api/admin/organisations/${organisationId}/cohorts/${cohortId}`,
      params: { cohortId, organisationId },
    });

    expect(response.status).toBe(200);
    expect(updateOrganisationCohortMock).toHaveBeenCalledWith(
      { cohortId, organisationId },
      body,
    );
  });
});
