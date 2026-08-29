import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { fromMock, getUserMock, rpcMock, serviceMock, updateMembershipMock } =
  vi.hoisted(() => ({
    fromMock: vi.fn(),
    getUserMock: vi.fn(),
    rpcMock: vi.fn(),
    serviceMock: vi.fn(),
    updateMembershipMock: vi.fn(),
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

describe('POST /api/organisation/groups/:groupId/memberships', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({
      updateOrganisationGroupMembership: updateMembershipMock,
    });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-user', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: true, error: null });
    allowRole(OrganisationRole.OrganisationAdmin);
    updateMembershipMock.mockResolvedValue({ data: groupFixture() });
  });

  it('scopes membership changes to the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const groupId = '03d946de-8938-46d8-93a4-e3917df0928e';
    const body = {
      addProvisionIds: [],
      addUserIds: ['67d00b58-7f49-4cea-89a2-979e8fcf3b7e'],
      removeProvisionIds: [],
      removeUserIds: [],
    };

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
      params: { groupId },
    });

    expect(response.status).toBe(200);
    expect(updateMembershipMock).toHaveBeenCalledWith(
      { organisationId, groupId },
      body,
    );
  });

  it('rejects organisation members who are not administrators', async () => {
    allowRole(OrganisationRole.Tutor);

    const response = await callApiEndpoint(POST, {
      body: {
        addProvisionIds: [],
        addUserIds: [],
        removeProvisionIds: [],
        removeUserIds: [],
      },
      method: 'POST',
      headers: {
        [HEKTOR_ORGANISATION_HEADER]: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      },
      params: { groupId: '03d946de-8938-46d8-93a4-e3917df0928e' },
    });

    expect(response.status).toBe(403);
    expect(updateMembershipMock).not.toHaveBeenCalled();
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

function groupFixture() {
  return {
    id: '03d946de-8938-46d8-93a4-e3917df0928e',
    name: 'Biology tutors',
    status: 'active',
    organisation: {
      id: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      name: 'Northbridge University',
      slug: 'northbridge-university',
      status: 'active',
    },
    users: [],
    provisionedUsers: [],
    createdAt: '2026-08-23T10:00:00.000Z',
    updatedAt: '2026-08-23T10:00:00.000Z',
  };
}
