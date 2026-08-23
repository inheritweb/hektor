import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createOrganisationsServiceMock,
  getOrganisationContractPeriodMock,
  getUserMock,
  updateOrganisationContractPeriodMock,
} = vi.hoisted(() => ({
  createOrganisationsServiceMock: vi.fn(),
  getOrganisationContractPeriodMock: vi.fn(),
  getUserMock: vi.fn(),
  updateOrganisationContractPeriodMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({ auth: { getUser: getUserMock } }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: createOrganisationsServiceMock,
}));

import { GET, PATCH } from './route';

const params = {
  organisationId: 'ab720a62-06df-408d-9e8c-0201ac69269a',
  contractPeriodId: 'b7234776-87f7-480f-a710-1ce16b4a151d',
};

const data = {
  id: params.contractPeriodId,
  startsOn: '2027-09-01',
  endsOn: '2028-09-01',
  seats: { allowed: 300, activated: 0, remaining: 300 },
  createdAt: '2026-08-23T10:00:00.000Z',
  updatedAt: '2026-08-23T10:00:00.000Z',
};

describe('admin organisation contract period endpoint', () => {
  beforeEach(() => {
    createOrganisationsServiceMock.mockReturnValue({
      getOrganisationContractPeriod: getOrganisationContractPeriodMock,
      updateOrganisationContractPeriod: updateOrganisationContractPeriodMock,
    });
    getOrganisationContractPeriodMock.mockReset();
    updateOrganisationContractPeriodMock.mockReset();
    getUserMock.mockResolvedValue({
      data: {
        user: { id: 'admin-id', app_metadata: { role: PlatformRole.Admin } },
      },
      error: null,
    });
  });

  it('gets a contract period', async () => {
    getOrganisationContractPeriodMock.mockResolvedValue({ data });

    const response = await callApiEndpoint(GET, {
      path: `/api/admin/organisations/${params.organisationId}/contract-periods/${params.contractPeriodId}`,
      params,
    });

    expect(response.status).toBe(200);
    expect(getOrganisationContractPeriodMock).toHaveBeenCalledWith(params);
  });

  it('updates a contract period', async () => {
    const body = {
      startsOn: data.startsOn,
      endsOn: data.endsOn,
      learnerSeatAllowance: 350,
      expectedUpdatedAt: data.updatedAt,
    };
    updateOrganisationContractPeriodMock.mockResolvedValue({
      data: { ...data, seats: { allowed: 350, activated: 0, remaining: 350 } },
    });

    const response = await callApiEndpoint(PATCH, {
      body,
      method: 'PATCH',
      path: `/api/admin/organisations/${params.organisationId}/contract-periods/${params.contractPeriodId}`,
      params,
    });

    expect(response.status).toBe(200);
    expect(updateOrganisationContractPeriodMock).toHaveBeenCalledWith(
      params,
      body,
    );
  });
});
