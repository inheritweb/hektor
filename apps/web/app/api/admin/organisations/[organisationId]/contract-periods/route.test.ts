import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole, SortDirection } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createAdminSupabaseClientMock,
  createOrganisationContractPeriodMock,
  createOrganisationsServiceMock,
  getUserMock,
  listOrganisationContractPeriodsMock,
} = vi.hoisted(() => ({
  createAdminSupabaseClientMock: vi.fn(),
  createOrganisationContractPeriodMock: vi.fn(),
  createOrganisationsServiceMock: vi.fn(),
  getUserMock: vi.fn(),
  listOrganisationContractPeriodsMock: vi.fn(),
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

describe('GET /api/admin/organisations/:organisationId/contract-periods', () => {
  beforeEach(() => {
    createOrganisationsServiceMock.mockReturnValue({
      createOrganisationContractPeriod: createOrganisationContractPeriodMock,
      listOrganisationContractPeriods: listOrganisationContractPeriodsMock,
    });
    getUserMock.mockReset();
    listOrganisationContractPeriodsMock.mockReset();
    createOrganisationContractPeriodMock.mockReset();
  });

  it('lists contract periods through the privileged service client', async () => {
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
    listOrganisationContractPeriodsMock.mockResolvedValue(responseData);

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/organisations/${organisationId}/contract-periods`,
      params: { organisationId },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(responseData);
    expect(createOrganisationsServiceMock).toHaveBeenCalledWith(adminClient);
    expect(listOrganisationContractPeriodsMock).toHaveBeenCalledWith(
      { organisationId },
      {
        page: 1,
        pageSize: 20,
        order: 'startsOn',
        dir: SortDirection.Ascending,
      },
    );
  });

  it('creates a validated contract period for a platform admin', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const body = {
      startsOn: '2027-09-01',
      endsOn: '2028-09-01',
      learnerSeatAllowance: 300,
    };
    const data = {
      id: 'b7234776-87f7-480f-a710-1ce16b4a151d',
      startsOn: body.startsOn,
      endsOn: body.endsOn,
      seats: { allowed: 300, activated: 0, remaining: 300 },
      createdAt: '2026-08-23T10:00:00.000Z',
      updatedAt: '2026-08-23T10:00:00.000Z',
    };
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
    createOrganisationContractPeriodMock.mockResolvedValue({ data });

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      path: `/api/admin/organisations/${organisationId}/contract-periods`,
      params: { organisationId },
    });

    expect(response.status).toBe(200);
    expect(createOrganisationContractPeriodMock).toHaveBeenCalledWith(
      { organisationId },
      body,
    );
  });
});
