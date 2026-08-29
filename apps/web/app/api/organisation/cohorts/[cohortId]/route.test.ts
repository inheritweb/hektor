import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { fromMock, getCohortMock, getUserMock, rpcMock, serviceMock } =
  vi.hoisted(() => ({
    fromMock: vi.fn(),
    getCohortMock: vi.fn(),
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

vi.mock('@hektor/services/organisations', () => ({
  createOrganisationsService: serviceMock,
}));

import { GET } from './route';

describe('GET /api/organisation/cohorts/:cohortId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({ getOrganisationCohort: getCohortMock });
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
  });

  it('scopes cohort retrieval to the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const cohortId = '289eb836-9965-4f32-8ea2-238077d18de9';
    getCohortMock.mockResolvedValue({ data: cohortFixture(cohortId) });

    const response = await callApiEndpoint(GET, {
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      params: { cohortId },
    });

    expect(response.status).toBe(200);
    expect(getCohortMock).toHaveBeenCalledWith({ organisationId, cohortId });
  });
});

function cohortFixture(id: string) {
  return {
    id,
    name: 'September 2026',
    startsOn: '2026-09-01',
    endsOn: '2029-08-31',
    status: 'active',
    organisation: {
      id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: 'active',
    },
    groups: [],
    learners: [],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-28T12:00:00.000Z',
  };
}
