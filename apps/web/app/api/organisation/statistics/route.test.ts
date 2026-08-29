import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { fromMock, getStatisticsMock, getUserMock, rpcMock, serviceMock } =
  vi.hoisted(() => ({
    fromMock: vi.fn(),
    getStatisticsMock: vi.fn(),
    getUserMock: vi.fn(),
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

vi.mock('@hektor/services/statistics', () => ({
  createStatisticsService: serviceMock,
}));

import { GET } from './route';

describe('GET /api/organisation/statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      getOrganisationStatistics: getStatisticsMock,
    });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-user', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: true, error: null });
    allowRole(OrganisationRole.OrganisationAdmin);
    getStatisticsMock.mockResolvedValue({
      cohortCount: 3,
      groupCount: 7,
      userCount: 18,
    });
  });

  it('scopes statistics to the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';

    const response = await callApiEndpoint(GET, {
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
    });

    expect(response.status).toBe(200);
    expect(getStatisticsMock).toHaveBeenCalledWith(organisationId);
  });

  it('rejects organisation members who are not administrators', async () => {
    allowRole(OrganisationRole.Tutor);

    const response = await callApiEndpoint(GET, {
      headers: {
        [HEKTOR_ORGANISATION_HEADER]: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      },
    });

    expect(response.status).toBe(403);
    expect(getStatisticsMock).not.toHaveBeenCalled();
  });
});

function allowRole(role: OrganisationRole) {
  const maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: { role }, error: null });
  const thirdEq = vi.fn().mockReturnValue({ maybeSingle });
  const secondEq = vi.fn().mockReturnValue({ eq: thirdEq });
  const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
  fromMock.mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: firstEq }),
  });
}
