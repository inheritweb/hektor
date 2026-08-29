import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createCohortMock, fromMock, getUserMock, rpcMock, serviceMock } =
  vi.hoisted(() => ({
    createCohortMock: vi.fn(),
    fromMock: vi.fn(),
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

import { POST } from './route';

describe('POST /api/organisation/cohorts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      createOrganisationCohort: createCohortMock,
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
  });

  it('creates the cohort inside the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const cohortId = '289eb836-9965-4f32-8ea2-238077d18de9';
    const body = {
      endsOn: '2029-08-31',
      name: 'September 2026',
      startsOn: '2026-09-01',
    };
    createCohortMock.mockResolvedValue({ data: cohortFixture(cohortId) });

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
    });

    expect(response.status).toBe(200);
    expect(createCohortMock).toHaveBeenCalledWith({ organisationId }, body);
  });

  it('rejects a cohort whose end date is not after its start date', async () => {
    const response = await callApiEndpoint(POST, {
      body: {
        endsOn: '2026-09-01',
        name: 'Invalid cohort',
        startsOn: '2026-09-01',
      },
      method: 'POST',
      headers: {
        [HEKTOR_ORGANISATION_HEADER]: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      },
    });

    expect(response.status).toBe(422);
    expect(createCohortMock).not.toHaveBeenCalled();
  });

  it('rejects organisation members who are not administrators', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { role: OrganisationRole.Learner },
      error: null,
    });
    const thirdEq = vi.fn().mockReturnValue({ maybeSingle });
    const secondEq = vi.fn().mockReturnValue({ eq: thirdEq });
    const firstEq = vi.fn().mockReturnValue({ eq: secondEq });
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: firstEq }),
    });

    const response = await callApiEndpoint(POST, {
      body: {
        endsOn: '2029-08-31',
        name: 'September 2026',
        startsOn: '2026-09-01',
      },
      method: 'POST',
      headers: {
        [HEKTOR_ORGANISATION_HEADER]: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      },
    });

    expect(response.status).toBe(403);
    expect(createCohortMock).not.toHaveBeenCalled();
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
