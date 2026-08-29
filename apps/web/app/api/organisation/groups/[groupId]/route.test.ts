import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const {
  fromMock,
  getGroupMock,
  getUserMock,
  rpcMock,
  serviceMock,
  updateGroupMock,
} = vi.hoisted(() => ({
  fromMock: vi.fn(),
  getGroupMock: vi.fn(),
  getUserMock: vi.fn(),
  rpcMock: vi.fn(),
  serviceMock: vi.fn(),
  updateGroupMock: vi.fn(),
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

import { GET, PATCH } from './route';

describe('/api/organisation/groups/:groupId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      getOrganisationGroup: getGroupMock,
      updateOrganisationGroup: updateGroupMock,
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

  it('scopes group retrieval to the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const groupId = '3a2e42a4-a854-4ef1-8382-af463b05a6b5';
    getGroupMock.mockResolvedValue({ data: groupFixture() });

    const response = await callApiEndpoint(GET, {
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      params: { groupId },
    });

    expect(response.status).toBe(200);
    expect(getGroupMock).toHaveBeenCalledWith({ organisationId, groupId });
  });

  it('scopes group updates to the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const groupId = '3a2e42a4-a854-4ef1-8382-af463b05a6b5';
    const body = {
      expectedUpdatedAt: '2026-08-28T12:00:00.000Z',
      name: 'Clinical Practice A',
      status: 'active',
    };
    updateGroupMock.mockResolvedValue({ data: groupFixture() });

    const response = await callApiEndpoint(PATCH, {
      body,
      method: 'PATCH',
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      params: { groupId },
    });

    expect(response.status).toBe(200);
    expect(updateGroupMock).toHaveBeenCalledWith(
      { organisationId, groupId },
      body,
    );
  });
});

function groupFixture() {
  return {
    id: '3a2e42a4-a854-4ef1-8382-af463b05a6b5',
    name: 'Clinical Practice A',
    status: 'active',
    organisation: {
      id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: 'active',
    },
    users: [],
    provisionedUsers: [],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-28T12:00:00.000Z',
  };
}
