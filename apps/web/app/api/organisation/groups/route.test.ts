import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HEKTOR_ORGANISATION_HEADER } from '@hektor/api-client';
import { OrganisationRole } from '@hektor/types';

import { callApiEndpoint } from '@/tests/api/api-test-client';

const { createGroupMock, fromMock, getUserMock, rpcMock, serviceMock } =
  vi.hoisted(() => ({
    createGroupMock: vi.fn(),
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

describe('POST /api/organisation/groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.mockReturnValue({ createOrganisationGroup: createGroupMock });
    getUserMock.mockResolvedValue({
      data: { user: { id: 'actor-user', app_metadata: {} } },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: true, error: null });
    allowRole(OrganisationRole.OrganisationAdmin);
  });

  it('creates the group inside the verified tenant', async () => {
    const organisationId = 'ab720a62-06df-408d-9e8c-0201ac69269a';
    const body = { name: 'Clinical Practice A' };
    createGroupMock.mockResolvedValue({ data: groupFixture() });

    const response = await callApiEndpoint(POST, {
      body,
      method: 'POST',
      headers: { [HEKTOR_ORGANISATION_HEADER]: organisationId },
    });

    expect(response.status).toBe(200);
    expect(createGroupMock).toHaveBeenCalledWith({ organisationId }, body);
  });

  it('rejects an empty group name at the contract boundary', async () => {
    const response = await callApiEndpoint(POST, {
      body: { name: '  ' },
      method: 'POST',
      headers: {
        [HEKTOR_ORGANISATION_HEADER]: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      },
    });

    expect(response.status).toBe(422);
    expect(createGroupMock).not.toHaveBeenCalled();
  });

  it('rejects organisation members who are not administrators', async () => {
    allowRole(OrganisationRole.Tutor);

    const response = await callApiEndpoint(POST, {
      body: { name: 'Clinical Practice A' },
      method: 'POST',
      headers: {
        [HEKTOR_ORGANISATION_HEADER]: 'ab720a62-06df-408d-9e8c-0201ac69269a',
      },
    });

    expect(response.status).toBe(403);
    expect(createGroupMock).not.toHaveBeenCalled();
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
