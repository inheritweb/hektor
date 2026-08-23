import { beforeEach, describe, expect, it, vi } from 'vitest';

import { OrganisationStatus, PlatformRole } from '@hektor/types';

import {
  callApiEndpoint,
  expectApiResponse,
} from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createOrganisationsServiceMock,
  getOrganisationMock,
  updateOrganisationMock,
  getUserMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationsServiceMock: vi.fn(),
  getOrganisationMock: vi.fn(),
  updateOrganisationMock: vi.fn(),
  getUserMock: vi.fn(),
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

import { GET, PATCH } from './route';

describe('GET /api/admin/organisations/:organisationId', () => {
  beforeEach(() => {
    createAdminSupabaseClientMock.mockReset();
    createOrganisationsServiceMock.mockReturnValue({
      getOrganisation: getOrganisationMock,
      updateOrganisation: updateOrganisationMock,
    });
    getOrganisationMock.mockReset();
    getUserMock.mockReset();
  });

  it('updates an organisation through the platform-admin contract', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const body = {
      expectedStatus: OrganisationStatus.Active,
      name: 'Northbridge Updated',
      slug: 'northbridge-updated',
      status: OrganisationStatus.Suspended,
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    updateOrganisationMock.mockResolvedValue({
      data: { id: organisationId, ...body },
    });

    const response = await callApiEndpoint(PATCH, {
      body,
      method: 'PATCH',
      params: { organisationId },
      path: `/api/admin/organisations/${organisationId}`,
    });

    expect(response.status).toBe(200);
    expect(updateOrganisationMock).toHaveBeenCalledWith(organisationId, body);
  });

  it('gets an organisation through the privileged service client', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const adminClient = { auth: { admin: {} } };
    const responseData = {
      id: organisationId,
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: OrganisationStatus.Active,
      contractPeriods: [],
      cohorts: [],
      groups: [],
      usersSummary: {
        total: 0,
        learners: 0,
        tutors: 0,
        organisationAdmins: 0,
        suspended: 0,
      },
      userProvisionsSummary: {
        total: 0,
        pending: 0,
        inactive: 0,
        failed: 0,
      },
      createdAt: '2026-08-15T10:00:00.000Z',
      updatedAt: '2026-08-15T11:00:00.000Z',
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createAdminSupabaseClientMock.mockReturnValue(adminClient);
    getOrganisationMock.mockResolvedValue({ data: responseData });

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/organisations/${organisationId}`,
      params: { organisationId },
    });

    await expectApiResponse(response, responseData);
    expect(createOrganisationsServiceMock).toHaveBeenCalledWith(adminClient);
    expect(getOrganisationMock).toHaveBeenCalledWith({
      organisationId,
    });
  });
});
