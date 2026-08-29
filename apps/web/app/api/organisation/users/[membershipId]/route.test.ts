import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  createOrganisationsServiceMock,
  getOrganisationMembershipMock,
  updateOrganisationMembershipMock,
  getUserMock,
  rpcMock,
  fromMock,
} = vi.hoisted(() => ({
  createOrganisationsServiceMock: vi.fn(),
  getOrganisationMembershipMock: vi.fn(),
  updateOrganisationMembershipMock: vi.fn(),
  getUserMock: vi.fn(),
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
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
  createOrganisationsService: createOrganisationsServiceMock,
}));

import { GET, PATCH } from './route';

describe('/api/organisation/users/:membershipId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createOrganisationsServiceMock.mockReturnValue({
      getOrganisationMembership: getOrganisationMembershipMock,
      updateOrganisationMembershipAsOrganisationAdmin:
        updateOrganisationMembershipMock,
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

  it('scopes detail retrieval to the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const membershipId = '68e65682-544f-47d0-8bf1-5d5472748bf1';
    getOrganisationMembershipMock.mockResolvedValue({
      data: membershipFixture(membershipId),
    });

    const response = await callApiEndpoint(GET, {
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      params: { membershipId },
    });

    expect(response.status).toBe(200);
    expect(getOrganisationMembershipMock).toHaveBeenCalledWith({
      organisationId,
      membershipId,
    });
  });

  it('passes the authenticated actor into protected membership updates', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const membershipId = '68e65682-544f-47d0-8bf1-5d5472748bf1';
    const body = {
      expectedUpdatedAt: '2026-08-28T12:00:00.000Z',
      role: OrganisationRole.Tutor,
      status: 'active',
    };
    updateOrganisationMembershipMock.mockResolvedValue({
      data: membershipFixture(membershipId),
    });

    const response = await callApiEndpoint(PATCH, {
      body,
      method: 'PATCH',
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      params: { membershipId },
    });

    expect(response.status).toBe(200);
    expect(updateOrganisationMembershipMock).toHaveBeenCalledWith(
      { organisationId, membershipId },
      body,
      'actor-user',
    );
  });
});

function membershipFixture(id: string) {
  return {
    id,
    role: 'tutor',
    status: 'active',
    platformStatus: 'active',
    user: {
      id: '03d946de-8938-46d8-93a4-e3917df0928e',
      displayName: 'Alice Morgan',
    },
    organisation: {
      id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: 'active',
    },
    groups: [],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-28T12:00:00.000Z',
  };
}
