import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole, ScimGroupTargetType } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { fromMock, getUserMock, rpcMock, serviceMock, updateMock } = vi.hoisted(
  () => ({
    fromMock: vi.fn(),
    getUserMock: vi.fn(),
    rpcMock: vi.fn(),
    serviceMock: vi.fn(),
    updateMock: vi.fn(),
  }),
);

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

vi.mock('@hektor/services/scim', () => ({
  createScimConfigurationService: serviceMock,
}));

import { PATCH } from './route';

describe('PATCH /api/organisation/scim/groups/:mappingId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({ updateGroupMapping: updateMock });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-user', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: true, error: null });
    allowRole();
  });

  it('updates a mapping only inside the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const mappingId = '4b671cbb-e885-45e1-ae36-f7aca34dceaa';
    const targetId = '201d0426-1cb1-49d7-aac5-d707319cfd42';
    updateMock.mockResolvedValue({
      data: {
        displayName: 'Clinical Year 1',
        id: mappingId,
        lastSynchronizedAt: '2026-08-30T00:00:00.000Z',
        memberCount: 1,
        target: {
          id: targetId,
          name: 'September 2026',
          type: ScimGroupTargetType.Cohort,
        },
      },
    });
    const body = {
      targetId,
      targetType: ScimGroupTargetType.Cohort,
    };
    const response = await callApiEndpoint(PATCH, {
      body,
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      method: 'PATCH',
      params: { mappingId },
    });

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(organisationId, mappingId, body);
  });
});

function allowRole() {
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
}
