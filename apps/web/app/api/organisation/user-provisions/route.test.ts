import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole, ProvisioningStatus } from '@hektor/types';
import { SortDirection } from '@hektor/types/contracts';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { fromMock, getUserMock, listProvisionsMock, rpcMock, serviceMock } =
  vi.hoisted(() => ({
    fromMock: vi.fn(),
    getUserMock: vi.fn(),
    listProvisionsMock: vi.fn(),
    rpcMock: vi.fn(),
    serviceMock: vi.fn(),
  }));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
    rpc: rpcMock,
  }),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminSupabaseClient: () => ({ privileged: true }),
}));

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: serviceMock,
}));

import { GET } from './route';

describe('GET /api/organisation/user-provisions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      listOrganisationUserProvisions: listProvisionsMock,
    });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-user', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: true, error: null });
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { role: OrganisationRole.OrganisationAdmin },
      error: null,
    });
    const thirdEq = vi.fn().mockReturnValue({ maybeSingle });
    const secondEq = vi.fn().mockReturnValue({ eq: thirdEq });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: firstEq }),
    });
    listProvisionsMock.mockResolvedValue({
      context: {
        page: 1,
        pageSize: 20,
        totalRecords: 0,
        sort: { order: 'displayName', dir: SortDirection.Ascending },
      },
      data: [],
    });
  });

  it('lists only provisions from the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const query = {
      page: 1,
      pageSize: 20,
      order: 'displayName',
      dir: SortDirection.Ascending,
      status: ProvisioningStatus.Pending,
    };

    const response = await callApiEndpoint(GET, {
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      query,
    });

    expect(response.status).toBe(200);
    expect(listProvisionsMock).toHaveBeenCalledWith({ organisationId }, query);
  });
});
